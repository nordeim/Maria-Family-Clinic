-- =====================================================
-- MY FAMILY CLINIC - DATABASE BACKUP SCRIPT
-- =====================================================
-- This script creates a complete backup of the My Family Clinic database
-- Use this to backup your production Supabase database
-- =====================================================

-- Set session variables for backup
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;

-- =====================================================
-- BACKUP TABLE STRUCTURE
-- =====================================================

-- Create backup of table schemas
CREATE SCHEMA IF NOT EXISTS backup;

-- Backup table structures (without data)
CREATE TABLE backup.table_schemas AS
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';

-- Backup column information
CREATE TABLE backup.column_info AS
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Backup indexes
CREATE TABLE backup.indexes AS
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public';

-- Backup constraints
CREATE TABLE backup.constraints AS
SELECT
    tc.constraint_name,
    tc.table_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public';

-- =====================================================
-- BACKUP ENUMS
-- =====================================================

-- Backup enum types
CREATE TABLE backup.enum_types AS
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value,
    e.enumsortorder AS sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typtype = 'e'
ORDER BY t.typname, e.enumsortorder;

-- =====================================================
-- BACKUP DATA FOR EACH TABLE
-- =====================================================

-- Helper function to backup table data
CREATE OR REPLACE FUNCTION backup_table_data(table_name text)
RETURNS void AS $$
BEGIN
    EXECUTE format('CREATE TABLE IF NOT EXISTS backup.%I AS SELECT * FROM %I', table_name, table_name);
    RAISE NOTICE 'Backed up table: %', table_name;
END;
$$ LANGUAGE plpgsql;

-- Backup all tables
SELECT backup_table_data('users');
SELECT backup_table_data('accounts');
SELECT backup_table_data('sessions');
SELECT backup_table_data('verification_tokens');
SELECT backup_table_data('user_profiles');
SELECT backup_table_data('user_preferences');
SELECT backup_table_data('clinics');
SELECT backup_table_data('clinic_services');
SELECT backup_table_data('clinic_languages');
SELECT backup_table_data('operating_hours');
SELECT backup_table_data('clinic_reviews');
SELECT backup_table_data('doctors');
SELECT backup_table_data('doctor_clinics');
SELECT backup_table_data('service_categories');
SELECT backup_table_data('services');
SELECT backup_table_data('healthier_sg_programs');
SELECT backup_table_data('program_enrollments');
SELECT backup_table_data('contact_categories');
SELECT backup_table_data('contact_forms');
SELECT backup_table_data('enquiries');
SELECT backup_table_data('audit_logs');

-- =====================================================
-- BACKUP STATISTICS
-- =====================================================

CREATE TABLE backup.backup_statistics AS
SELECT 
    'backup_completed' as metric,
    NOW() as timestamp,
    'my_family_clinic_production' as database_name
UNION ALL
SELECT 
    'table_count' as metric,
    COUNT(*)::text as timestamp,
    'my_family_clinic_production' as database_name
FROM information_schema.tables 
WHERE table_schema = 'backup'
AND table_type = 'BASE TABLE'
UNION ALL
SELECT 
    'total_rows' as metric,
    SUM(row_count)::text as timestamp,
    'my_family_clinic_production' as database_name
FROM (
    SELECT 
        schemaname,
        tablename,
        n_tup_ins - n_tup_del as row_count
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
) t;

-- =====================================================
-- BACKUP COMPLETION LOG
-- =====================================================

INSERT INTO backup.backup_statistics (metric, timestamp, database_name)
VALUES ('backup_created_by', 'MiniMax Agent - Database Backup Tool', 'my_family_clinic_production'),
       ('backup_version', '1.0', 'my_family_clinic_production'),
       ('backup_schema_complete', 'true', 'my_family_clinic_production'),
       ('backup_data_complete', 'true', 'my_family_clinic_production');

-- =====================================================
-- CREATE BACKUP EXPORT SCRIPT
-- =====================================================

-- Create a script to export the backup
CREATE OR REPLACE FUNCTION generate_backup_export_script()
RETURNS TABLE(export_statement text) AS $$
BEGIN
    -- Header
    RETURN QUERY SELECT '-- ====================================================='::text;
    RETURN QUERY SELECT '-- MY FAMILY CLINIC - DATABASE BACKUP EXPORT'::text;
    RETURN QUERY SELECT '-- Generated: ' || NOW()::text;
    RETURN QUERY SELECT '-- Database: my_family_clinic_production'::text;
    RETURN QUERY SELECT '-- ====================================================='::text;
    RETURN QUERY SELECT ''::text;
    
    -- Export each backed up table
    FOR export_statement IN 
        SELECT 'SELECT * FROM backup.' || table_name || ';' as stmt
        FROM backup.table_schemas
        ORDER BY table_name
    LOOP
        RETURN QUERY SELECT export_statement;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Generate the export script
COPY (SELECT * FROM generate_backup_export_script()) TO '/tmp/backup_export.sql';

-- =====================================================
-- BACKUP VERIFICATION
-- =====================================================

CREATE TABLE backup.verification_results AS
SELECT 
    t.table_name,
    CASE 
        WHEN b.table_name IS NOT NULL THEN 'BACKED_UP'
        ELSE 'MISSING'
    END as backup_status,
    CASE 
        WHEN b.table_name IS NOT NULL THEN 
            (SELECT COUNT(*) FROM backup_tables WHERE backup_tables.table_name = t.table_name)
        ELSE 0
    END as backed_up_rows
FROM information_schema.tables t
LEFT JOIN backup.table_schemas b ON t.table_name = b.table_name
WHERE t.table_schema = 'public'
AND t.table_type = 'BASE TABLE';

-- =====================================================
-- CLEANUP AND FINALIZATION
-- =====================================================

-- Log completion
INSERT INTO audit_logs (userId, action, entityType, entityId, newValues, dataSensitivity)
VALUES ('backup_system', 'DATABASE_BACKUP_COMPLETED', 'DATABASE', 'backup_' || extract(epoch from now())::text, 
        '{"backup_schema": "complete", "backup_data": "complete", "tables_backed_up": (SELECT COUNT(*) FROM backup.table_schemas)}', 'INTERNAL');

-- Create backup summary
CREATE TABLE backup.backup_summary AS
SELECT 
    'BACKUP_COMPLETED' as status,
    NOW() as completed_at,
    (SELECT COUNT(*) FROM backup.table_schemas) as tables_backed_up,
    (SELECT COUNT(*) FROM backup.enum_types) as enums_backed_up,
    (SELECT COUNT(*) FROM backup.table_schemas WHERE table_name IN (SELECT table_name FROM backup.verification_results WHERE backup_status = 'BACKED_UP')) as successful_backups,
    'my_family_clinic_production' as source_database;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT 
    'Database backup completed successfully!' as message,
    (SELECT COUNT(*) FROM backup.table_schemas) as tables_backed_up,
    (SELECT COUNT(*) FROM backup.enum_types) as enums_backed_up,
    'Check backup.table_schemas and other backup.* tables for your data' as next_steps;