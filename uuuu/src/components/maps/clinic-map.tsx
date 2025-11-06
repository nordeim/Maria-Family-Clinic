"use client";

import { useState, useMemo } from "react";
import { APIProvider, Map, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";
import { MapPin, Navigation, Layers, Search, Star, Phone, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { calculateDistance, formatDistance, type LocationCoordinates } from "@/lib/utils/geolocation";

// Singapore coordinates
const SINGAPORE_CENTER = { lat: 1.3521, lng: 103.8198 };
const DEFAULT_ZOOM = 12;

// Clinic type colors
const CLINIC_COLORS = {
  POLYCLINIC: "#3B82F6", // Blue
  PRIVATE: "#10B981", // Green
  HOSPITAL: "#EF4444", // Red
  SPECIALIST: "#F59E0B", // Amber
  DENTAL: "#8B5CF6", // Purple
} as const;

export interface ClinicMapData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: keyof typeof CLINIC_COLORS;
  rating: number;
  totalReviews: number;
  phoneNumber: string | null;
  services: string[];
  address: string;
  isOpen?: boolean;
  distance?: number;
}

interface ClinicMapProps {
  clinics: ClinicMapData[];
  userLocation?: LocationCoordinates | null;
  onClinicSelect?: (clinicId: string) => void;
  onBoundsChange?: (bounds: google.maps.LatLngBounds) => void;
  className?: string;
  height?: string;
}

interface MarkerCluster {
  position: google.maps.LatLngLiteral;
  clinics: ClinicMapData[];
}

// Custom Marker Component
function ClinicMarker({
  clinic,
  selected,
  onClick,
}: {
  clinic: ClinicMapData;
  selected: boolean;
  onClick: () => void;
}) {
  const color = CLINIC_COLORS[clinic.type] || CLINIC_COLORS.PRIVATE;

  return (
    <AdvancedMarker
      position={{ lat: clinic.latitude, lng: clinic.longitude }}
      onClick={onClick}
      title={clinic.name}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full border-2 border-white shadow-lg transition-all hover:scale-110",
          selected && "scale-125 ring-2 ring-offset-2",
        )}
        style={{
          backgroundColor: color,
          width: selected ? "40px" : "32px",
          height: selected ? "40px" : "32px",
        }}
      >
        <MapPin className="h-5 w-5 text-white" />
      </div>
    </AdvancedMarker>
  );
}

// Cluster Marker Component
function ClusterMarker({
  cluster,
  onClick,
}: {
  cluster: MarkerCluster;
  onClick: () => void;
}) {
  const count = cluster.clinics.length;
  const size = Math.min(50, 30 + count * 2);

  return (
    <AdvancedMarker position={cluster.position} onClick={onClick}>
      <div
        className="flex items-center justify-center rounded-full border-2 border-white bg-blue-600 font-semibold text-white shadow-lg transition-transform hover:scale-110"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {count}
      </div>
    </AdvancedMarker>
  );
}

// Info Window Component
function ClinicInfoWindow({
  clinic,
  onClose,
  onGetDirections,
  onViewDetails,
}: {
  clinic: ClinicMapData;
  onClose: () => void;
  onGetDirections: () => void;
  onViewDetails: () => void;
}) {
  return (
    <InfoWindow
      position={{ lat: clinic.latitude, lng: clinic.longitude }}
      onCloseClick={onClose}
      maxWidth={320}
    >
      <Card className="border-0 p-4 shadow-none">
        <div className="space-y-3">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-900">{clinic.name}</h3>
              <Badge variant={clinic.isOpen ? "default" : "secondary"} className="shrink-0">
                {clinic.isOpen ? "Open" : "Closed"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-gray-600">{clinic.address}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-gray-900">{clinic.rating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-gray-500">({clinic.totalReviews} reviews)</span>
          </div>

          {/* Distance */}
          {clinic.distance !== undefined && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Navigation className="h-4 w-4" />
              <span>{formatDistance(clinic.distance)}</span>
            </div>
          )}

          {/* Services */}
          {clinic.services.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {clinic.services.slice(0, 3).map((service) => (
                <Badge key={service} variant="outline" className="text-xs">
                  {service}
                </Badge>
              ))}
              {clinic.services.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{clinic.services.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Phone */}
          {clinic.phoneNumber && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <a href={`tel:${clinic.phoneNumber}`} className="hover:text-blue-600">
                {clinic.phoneNumber}
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={onGetDirections} className="flex-1">
              <Navigation className="mr-2 h-4 w-4" />
              Directions
            </Button>
            <Button size="sm" onClick={onViewDetails} className="flex-1">
              View Details
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </InfoWindow>
  );
}

// Map Controls Component
function MapControls({
  mapType,
  onMapTypeChange,
  onRecenter,
  onSearchArea,
  showSearchArea,
}: {
  mapType: "roadmap" | "satellite";
  onMapTypeChange: (type: "roadmap" | "satellite") => void;
  onRecenter: () => void;
  onSearchArea: () => void;
  showSearchArea: boolean;
}) {
  return (
    <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 gap-2">
      {showSearchArea && (
        <Button
          onClick={onSearchArea}
          size="sm"
          className="shadow-lg"
          variant="default"
        >
          <Search className="mr-2 h-4 w-4" />
          Search This Area
        </Button>
      )}

      <div className="flex gap-2 rounded-lg bg-white p-1 shadow-lg">
        <Button
          onClick={onRecenter}
          size="sm"
          variant="ghost"
          title="Return to current location"
        >
          <Navigation className="h-4 w-4" />
        </Button>

        <Button
          onClick={() => onMapTypeChange(mapType === "roadmap" ? "satellite" : "roadmap")}
          size="sm"
          variant="ghost"
          title="Toggle map type"
        >
          <Layers className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Clustering algorithm
function clusterMarkers(
  clinics: ClinicMapData[],
  zoom: number,
  bounds: google.maps.LatLngBounds | null,
): { clusters: MarkerCluster[]; singles: ClinicMapData[] } {
  if (!bounds || zoom >= 15) {
    return { clusters: [], singles: clinics };
  }

  const CLUSTER_RADIUS = 50 / Math.pow(2, zoom - 10); // Adjust radius based on zoom
  const clusters: MarkerCluster[] = [];
  const singles: ClinicMapData[] = [];
  const processed = new Set<string>();

  clinics.forEach((clinic) => {
    if (processed.has(clinic.id)) return;

    const nearbyClinicIds = clinics
      .filter((other) => {
        if (processed.has(other.id) || clinic.id === other.id) return false;
        const distance = calculateDistance(
          clinic.latitude,
          clinic.longitude,
          other.latitude,
          other.longitude,
        );
        return distance < CLUSTER_RADIUS;
      })
      .map((c) => c.id);

    if (nearbyClinicIds.length > 0) {
      const clusterClinics = [
        clinic,
        ...clinics.filter((c) => nearbyClinicIds.includes(c.id)),
      ];

      const avgLat =
        clusterClinics.reduce((sum, c) => sum + c.latitude, 0) / clusterClinics.length;
      const avgLng =
        clusterClinics.reduce((sum, c) => sum + c.longitude, 0) / clusterClinics.length;

      clusters.push({
        position: { lat: avgLat, lng: avgLng },
        clinics: clusterClinics,
      });

      clusterClinics.forEach((c) => processed.add(c.id));
    } else {
      singles.push(clinic);
      processed.add(clinic.id);
    }
  });

  return { clusters, singles };
}

export function ClinicMap({
  clinics,
  userLocation,
  onClinicSelect,
  onBoundsChange,
  className,
  height = "600px",
}: ClinicMapProps) {
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");
  const [currentZoom, setCurrentZoom] = useState(DEFAULT_ZOOM);
  const [currentBounds, setCurrentBounds] = useState<google.maps.LatLngBounds | null>(null);
  const [showSearchAreaButton, setShowSearchAreaButton] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border bg-gray-50", className)} style={{ height }}>
        <div className="text-center">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">Google Maps API key not configured</p>
        </div>
      </div>
    );
  }

  // Calculate center point
  const center = useMemo(() => {
    if (userLocation) {
      return { lat: userLocation.latitude, lng: userLocation.longitude };
    }
    return SINGAPORE_CENTER;
  }, [userLocation]);

  // Add distance to clinics
  const clinicsWithDistance = useMemo(() => {
    if (!userLocation) return clinics;

    return clinics.map((clinic) => ({
      ...clinic,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        clinic.latitude,
        clinic.longitude,
      ),
    }));
  }, [clinics, userLocation]);

  // Cluster markers
  const { clusters, singles } = useMemo(() => {
    return clusterMarkers(clinicsWithDistance, currentZoom, currentBounds);
  }, [clinicsWithDistance, currentZoom, currentBounds]);

  const selectedClinic = clinicsWithDistance.find((c) => c.id === selectedClinicId);

  const handleMarkerClick = (clinicId: string) => {
    setSelectedClinicId(clinicId);
    onClinicSelect?.(clinicId);
  };

  const handleClusterClick = (_cluster: MarkerCluster) => {
    // Zoom in on cluster
    setCurrentZoom((prev) => Math.min(prev + 2, 18));
  };

  const handleRecenter = () => {
    setCurrentZoom(DEFAULT_ZOOM);
    setShowSearchAreaButton(false);
  };

  const handleSearchArea = () => {
    if (currentBounds) {
      onBoundsChange?.(currentBounds);
      setShowSearchAreaButton(false);
    }
  };

  const handleGetDirections = () => {
    if (!selectedClinic) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedClinic.latitude},${selectedClinic.longitude}`;
    window.open(url, "_blank");
  };

  const handleViewDetails = () => {
    if (!selectedClinic) return;
    // Navigate to clinic details page
    window.location.href = `/clinics/${selectedClinic.id}`;
  };

  return (
    <APIProvider apiKey={apiKey} region="SG">
      <div className={cn("relative overflow-hidden rounded-lg", className)} style={{ height }}>
        <Map
          defaultCenter={center}
          defaultZoom={DEFAULT_ZOOM}
          mapId="clinic-map"
          mapTypeId={mapType}
          gestureHandling="greedy"
          disableDefaultUI={true}
          onZoomChanged={(e) => {
            const map = e.map;
            const zoom = map.getZoom();
            if (zoom !== undefined) setCurrentZoom(zoom);
          }}
          onBoundsChanged={(e) => {
            const map = e.map;
            const bounds = map.getBounds();
            if (bounds) {
              setCurrentBounds(bounds);
              setShowSearchAreaButton(true);
            }
          }}
          style={{ width: "100%", height: "100%" }}
        >
          {/* User location marker */}
          {userLocation && (
            <AdvancedMarker
              position={{ lat: userLocation.latitude, lng: userLocation.longitude }}
            >
              <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-blue-500 shadow-lg">
                <div className="h-2 w-2 rounded-full bg-white"></div>
              </div>
            </AdvancedMarker>
          )}

          {/* Cluster markers */}
          {clusters.map((cluster, idx) => (
            <ClusterMarker
              key={`cluster-${idx}`}
              cluster={cluster}
              onClick={() => handleClusterClick(cluster)}
            />
          ))}

          {/* Individual clinic markers */}
          {singles.map((clinic) => (
            <ClinicMarker
              key={clinic.id}
              clinic={clinic}
              selected={clinic.id === selectedClinicId}
              onClick={() => handleMarkerClick(clinic.id)}
            />
          ))}

          {/* Info window */}
          {selectedClinic && (
            <ClinicInfoWindow
              clinic={selectedClinic}
              onClose={() => setSelectedClinicId(null)}
              onGetDirections={handleGetDirections}
              onViewDetails={handleViewDetails}
            />
          )}
        </Map>

        {/* Map controls */}
        <MapControls
          mapType={mapType}
          onMapTypeChange={setMapType}
          onRecenter={handleRecenter}
          onSearchArea={handleSearchArea}
          showSearchArea={showSearchAreaButton}
        />

        {/* Legend */}
        <div className="absolute bottom-4 right-4 rounded-lg bg-white p-3 shadow-lg">
          <h4 className="mb-2 text-xs font-semibold text-gray-700">Clinic Types</h4>
          <div className="space-y-1">
            {Object.entries(CLINIC_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-600">
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </APIProvider>
  );
}
