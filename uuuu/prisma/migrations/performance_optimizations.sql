-- Database optimizations for clinic search performance

-- Create indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_clinic_search_text ON "Clinic" USING gin(to_tsvector('english', name || ' ' || description || ' ' || address));
CREATE INDEX IF NOT EXISTS idx_clinic_location ON "Clinic"(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_clinic_active ON "Clinic"(isActive, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_clinic_services ON "Clinic"("services", name);
CREATE INDEX IF NOT EXISTS idx_clinic_languages ON "Clinic"(languages);
CREATE INDEX IF NOT EXISTS idx_clinic_verified ON "Clinic"(isHealthierSgPartner);
CREATE INDEX IF NOT EXISTS idx_clinic_location_active ON "Clinic"(latitude, longitude, isActive);
CREATE INDEX IF NOT EXISTS idx_clinic_name_trgm ON "Clinic" USING gin(name gin_trgm_ops);

-- Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_clinic_search_active ON "Clinic"(isActive, createdAt DESC) WHERE isActive = true;
CREATE INDEX IF NOT EXISTS idx_clinic_location_active_radius ON "Clinic"(isActive, latitude, longitude) WHERE isActive = true;

-- Add full-text search function
CREATE OR REPLACE FUNCTION search_clinics(
  search_term TEXT DEFAULT '',
  location_lat DOUBLE PRECISION DEFAULT NULL,
  location_lng DOUBLE PRECISION DEFAULT NULL,
  search_radius_km DOUBLE PRECISION DEFAULT 10,
  max_results INTEGER DEFAULT 50,
  offset_results INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  operating_hours JSONB,
  facilities TEXT[],
  languages TEXT[],
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_active BOOLEAN,
  is_healthier_sg_partner BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  distance_km DOUBLE PRECISION,
  search_rank REAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH search_results AS (
    SELECT 
      c.*,
      -- Calculate distance if location provided
      CASE 
        WHEN location_lat IS NOT NULL AND location_lng IS NOT NULL AND c.latitude IS NOT NULL AND c.longitude IS NOT NULL
        THEN (
          6371 * acos(
            cos(radians(location_lat)) * 
            cos(radians(c.latitude)) * 
            cos(radians(c.longitude) - radians(location_lng)) + 
            sin(radians(location_lat)) * 
            sin(radians(c.latitude))
          )
        )
        ELSE NULL
      END as distance_km,
      -- Full-text search rank
      CASE 
        WHEN search_term IS NOT NULL AND length(trim(search_term)) > 0
        THEN ts_rank(
          to_tsvector('english', c.name || ' ' || c.description || ' ' || c.address),
          plainto_tsquery('english', search_term)
        )
        ELSE 0
      END as search_rank
    FROM "Clinic" c
    WHERE 
      c.is_active = true
      AND (
        search_term IS NULL OR 
        length(trim(search_term)) = 0 OR
        to_tsvector('english', c.name || ' ' || c.description || ' ' || c.address) @@ 
        plainto_tsquery('english', search_term)
      )
      AND (
        location_lat IS NULL OR 
        location_lng IS NULL OR
        c.latitude IS NULL OR 
        c.longitude IS NULL OR
        -- Filter by radius if location and distance provided
        (6371 * acos(
          cos(radians(location_lat)) * 
          cos(radians(c.latitude)) * 
          cos(radians(c.longitude) - radians(location_lng)) + 
          sin(radians(location_lat)) * 
          sin(radians(c.latitude))
        )) <= search_radius_km
      )
  )
  SELECT 
    sr.id,
    sr.name,
    sr.description,
    sr.address,
    sr.phone,
    sr.email,
    sr.website,
    sr.operating_hours,
    sr.facilities,
    sr.languages,
    sr.latitude,
    sr.longitude,
    sr.is_active,
    sr.is_healthier_sg_partner,
    sr.created_at,
    sr.updated_at,
    sr.distance_km,
    sr.search_rank
  FROM search_results sr
  ORDER BY 
    -- Prioritize exact name matches and proximity for location searches
    CASE 
      WHEN search_term IS NOT NULL AND length(trim(search_term)) > 0 
      THEN sr.search_rank 
      ELSE 0 
    END DESC,
    CASE 
      WHEN sr.distance_km IS NOT NULL 
      THEN sr.distance_km 
      ELSE 999999 
    END ASC,
    sr.name ASC
  LIMIT max_results
  OFFSET offset_results;
END;
$$;

-- Create optimized clinic list function with pagination
CREATE OR REPLACE FUNCTION get_clinics_optimized(
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 20,
  search_term TEXT DEFAULT '',
  location_lat DOUBLE PRECISION DEFAULT NULL,
  location_lng DOUBLE PRECISION DEFAULT NULL,
  search_radius_km DOUBLE PRECISION DEFAULT 10,
  order_by TEXT DEFAULT 'name',
  order_direction TEXT DEFAULT 'asc',
  is_active_filter BOOLEAN DEFAULT true,
  is_healthier_sg_partner_filter BOOLEAN DEFAULT NULL,
  languages_filter TEXT[] DEFAULT NULL,
  services_filter TEXT[] DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
  total_count INTEGER;
  total_pages INTEGER;
  clinic_data JSON;
BEGIN
  -- Get total count first (for pagination)
  SELECT COUNT(*) INTO total_count
  FROM "Clinic" c
  WHERE 
    c.is_active = is_active_filter
    AND (is_healthier_sg_partner_filter IS NULL OR c.is_healthier_sg_partner = is_healthier_sg_partner_filter)
    AND (
      languages_filter IS NULL OR 
      array_length(languages_filter, 1) IS NULL OR 
      c.languages && languages_filter
    )
    AND (
      services_filter IS NULL OR
      services_filter::TEXT[] = ARRAY[]::TEXT[] OR
      EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(c.facilities) AS facility
        WHERE facility = ANY(services_filter)
      )
    )
    AND (
      search_term IS NULL OR 
      length(trim(search_term)) = 0 OR
      to_tsvector('english', c.name || ' ' || c.description || ' ' || c.address) @@ 
      plainto_tsquery('english', search_term)
    )
    AND (
      location_lat IS NULL OR 
      location_lng IS NULL OR
      c.latitude IS NULL OR 
      c.longitude IS NULL OR
      (6371 * acos(
        cos(radians(location_lat)) * 
        cos(radians(c.latitude)) * 
        cos(radians(c.longitude) - radians(location_lng)) + 
        sin(radians(location_lat)) * 
        sin(radians(c.latitude))
      )) <= search_radius_km
    );

  -- Calculate pagination
  total_pages := CEIL(total_count::FLOAT / page_size::FLOAT);
  
  -- Build the main query with ordering
  EXECUTE format('
    SELECT jsonb_agg(
      jsonb_build_object(
        ''id'', c.id,
        ''name'', c.name,
        ''description'', c.description,
        ''address'', c.address,
        ''phone'', c.phone,
        ''email'', c.email,
        ''website'', c.website,
        ''operating_hours'', c.operating_hours,
        ''facilities'', c.facilities,
        ''languages'', c.languages,
        ''latitude'', c.latitude,
        ''longitude'', c.longitude,
        ''is_active'', c.is_active,
        ''is_healthier_sg_partner'', c.is_healthier_sg_partner,
        ''created_at'', c.created_at,
        ''updated_at'', c.updated_at,
        ''distance'', CASE 
          WHEN $1 IS NOT NULL AND $2 IS NOT NULL AND c.latitude IS NOT NULL AND c.longitude IS NOT NULL
          THEN (6371 * acos(
            cos(radians($1)) * 
            cos(radians(c.latitude)) * 
            cos(radians(c.longitude) - radians($2)) + 
            sin(radians($1)) * 
            sin(radians(c.latitude))
          ))
          ELSE NULL
        END,
        ''services'', (
          SELECT jsonb_agg(
            jsonb_build_object(
              ''id'', s.id,
              ''name'', s.name,
              ''description'', s.description,
              ''category'', s.category,
              ''price'', s.price
            )
          )
          FROM "Service" s
          WHERE s."clinicId" = c.id
        ),
        ''doctors'', (
          SELECT jsonb_agg(
            jsonb_build_object(
              ''id'', d.id,
              ''first_name'', d."firstName",
              ''last_name'', d."lastName",
              ''specialties'', d.specialties,
              ''languages'', d.languages,
              ''profile'', d.profile
            )
          )
          FROM "Doctor" d
          WHERE d."clinicId" = c.id
        ),
        ''search_rank'', CASE 
          WHEN $3 IS NOT NULL AND length(trim($3)) > 0
          THEN ts_rank(
            to_tsvector(''english'', c.name || '' '' || c.description || '' '' || c.address),
            plainto_tsquery(''english'', $3)
          )
          ELSE 0
        END
      )
    )
    FROM "Clinic" c
    WHERE 
      c.is_active = $4
      AND ($5 IS NULL OR c.is_healthier_sg_partner = $5)
      AND (
        $6 IS NULL OR 
        array_length($6, 1) IS NULL OR 
        c.languages && $6
      )
      AND (
        $7 IS NULL OR
        $7::TEXT[] = ARRAY[]::TEXT[] OR
        EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(c.facilities) AS facility
          WHERE facility = ANY($7)
        )
      )
      AND (
        $3 IS NULL OR 
        length(trim($3)) = 0 OR
        to_tsvector(''english'', c.name || '' '' || c.description || '' '' || c.address) @@ 
        plainto_tsquery(''english'', $3)
      )
      AND (
        $1 IS NULL OR 
        $2 IS NULL OR
        c.latitude IS NULL OR 
        c.longitude IS NULL OR
        (6371 * acos(
          cos(radians($1)) * 
          cos(radians(c.latitude)) * 
          cos(radians(c.longitude) - radians($2)) + 
          sin(radians($1)) * 
          sin(radians(c.latitude))
        )) <= $8
      )
    ORDER BY 
      CASE 
        WHEN $9 = ''distance'' AND $1 IS NOT NULL AND $2 IS NOT NULL
        THEN (
          6371 * acos(
            cos(radians($1)) * 
            cos(radians(c.latitude)) * 
            cos(radians(c.longitude) - radians($2)) + 
            sin(radians($1)) * 
            sin(radians(c.latitude))
          )
        )
        ELSE NULL
      END ' || CASE WHEN order_direction = 'desc' THEN 'DESC' ELSE 'ASC' END || ',
      CASE 
        WHEN $9 = ''name''
        THEN c.name
        ELSE NULL
      END ' || CASE WHEN order_direction = 'desc' THEN 'DESC' ELSE 'ASC' END || ',
      CASE 
        WHEN $9 = ''created_at''
        THEN c.created_at
        ELSE NULL
      END ' || CASE WHEN order_direction = 'desc' THEN 'DESC' ELSE 'ASC' END || ',
      c.name ASC
    LIMIT $10
    OFFSET $11
  ', order_by) INTO clinic_data
  USING location_lat, location_lng, search_term, is_active_filter, is_healthier_sg_partner_filter, 
        languages_filter, services_filter, search_radius_km, order_by, page_size, (page_number - 1) * page_size;

  -- Build result JSON
  result := jsonb_build_object(
    'data', COALESCE(clinic_data, '[]'::jsonb),
    'pagination', jsonb_build_object(
      'page', page_number,
      'limit', page_size,
      'total', total_count,
      'totalPages', total_pages,
      'hasNext', page_number < total_pages,
      'hasPrev', page_number > 1
    )
  );

  RETURN result;
END;
$$;

-- Create performance monitoring view
CREATE VIEW clinic_performance_stats AS
SELECT 
  COUNT(*) as total_clinics,
  COUNT(*) FILTER (WHERE is_active = true) as active_clinics,
  COUNT(*) FILTER (WHERE is_healthier_sg_partner = true) as healthier_sg_partners,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_clinics_30_days,
  AVG(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 ELSE 0 END) as clinics_with_location,
  string_agg(DISTINCT unnest(languages), ', ') as all_languages,
  string_agg(DISTINCT unnest(facilities), ', ') as all_facilities
FROM "Clinic";

-- Create function to get performance statistics
CREATE OR REPLACE FUNCTION get_clinic_performance_stats()
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  stats RECORD;
  result JSON;
BEGIN
  SELECT 
    COUNT(*) as total_clinics,
    COUNT(*) FILTER (WHERE is_active = true) as active_clinics,
    COUNT(*) FILTER (WHERE is_healthier_sg_partner = true) as healthier_sg_partners,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_clinics_30_days,
    ROUND(AVG(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 ELSE 0 END) * 100, 2) as clinics_with_location_percentage,
    COUNT(*) FILTER (WHERE facilities IS NOT NULL AND jsonb_array_length(facilities::jsonb) > 0) as clinics_with_facilities
  INTO stats
  FROM "Clinic";

  result := jsonb_build_object(
    'totalClinics', stats.total_clinics,
    'activeClinics', stats.active_clinics,
    'healthierSgPartners', stats.healthier_sg_partners,
    'newClinics30Days', stats.new_clinics_30_days,
    'clinicsWithLocationPercentage', stats.clinics_with_location_percentage,
    'clinicsWithFacilities', stats.clinics_with_facilities,
    'generatedAt', CURRENT_TIMESTAMP
  );

  RETURN result;
END;
$$;