import { useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Spin, Select } from "antd";
import {
  EnvironmentOutlined,
  PictureOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import { mapCenters, mapPoiLabels, mapLayers } from "../../data/mapData";
import type { StreetPhotoLocation } from "../../api/street-photos.service";

export type MapLayerKey = (typeof mapLayers)[number]["key"];

interface MapViewProps {
  centerName?: string;
  height?: number | string;
  onLayerChange?: (key: MapLayerKey) => void;
  /** when set, only this layer's visualization is shown */
  initialLayer?: MapLayerKey;
  showStats?: boolean;
  locations?: StreetPhotoLocation[];
  loading?: boolean;
  projects?: Array<{ id: string; name: string }>;
  selectedProjectId?: string | null;
  onProjectChange?: (projectId: string | null) => void;
  loadingProjects?: boolean;
}

function PoiLabel({
  name,
  lat,
  lng,
}: {
  name: string;
  lat: number;
  lng: number;
}) {
  // divIcon html is static; render text via a dedicated small divIcon per label
  const icon = L.divIcon({
    className: "uvip-poi-label",
    html: `<div style="font:500 10px/1.2 Inter,system-ui,sans-serif;color:#475569;white-space:nowrap;padding:1px 4px;background:rgba(255,255,255,0.78);border-radius:3px;box-shadow:0 1px 2px rgba(0,0,0,0.06);transform:translate(8px,-6px)">${name}</div>`,
    iconSize: [0, 0],
  });
  return <Marker position={[lat, lng]} icon={icon} />;
}

const photoMarkerIcon = L.divIcon({
  className: "uvip-photo-marker",
  html: `
    <div style="position:relative; width:28px; height:28px; display:flex; align-items:center; justify-content:center; cursor:pointer;">
      <div style="position:absolute; width:28px; height:28px; background:rgba(37,99,235,0.3); border-radius:50%; animation:uvip-marker-ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
      <div style="position:relative; width:22px; height:22px; background:#2563eb; border:2px solid #ffffff; border-radius:50%; box-shadow:0 2px 5px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; color:#ffffff;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
      </div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

function MapBoundsUpdater({
  locations,
}: {
  locations: { lat: number; lng: number }[];
}) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (!locations || locations.length === 0) return;

    if (locations.length === 1) {
      map.setView([locations[0].lat, locations[0].lng], 15);
    } else {
      const bounds = L.latLngBounds(locations.map((loc) => [loc.lat, loc.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [locations, map]);

  return null;
}

export default function MapView({
  centerName = "Kota Malang",
  height = 420,
  locations = [],
  loading = false,
  projects = [],
  selectedProjectId = null,
  onProjectChange,
  loadingProjects = false,
}: MapViewProps) {
  const center = mapCenters.find((c) => c.name === centerName) ?? mapCenters[0];

  const parsedLocations = useMemo(() => {
    if (!locations || !Array.isArray(locations)) return [];
    return locations
      .map((item) => {
        const rawLat = item.lattitude ?? item.latitude;
        const rawLng = item.longtitude ?? item.longitude;
        const lat =
          typeof rawLat === "number" ? rawLat : parseFloat(String(rawLat));
        const lng =
          typeof rawLng === "number" ? rawLng : parseFloat(String(rawLng));
        return {
          id: item.id,
          filename: item.original_filename || "Photo",
          lat,
          lng,
        };
      })
      .filter(
        (loc) =>
          !isNaN(loc.lat) &&
          !isNaN(loc.lng) &&
          loc.lat !== 0 &&
          loc.lng !== 0
      );
  }, [locations]);

  const initialCenter: [number, number] =
    parsedLocations.length > 0
      ? [parsedLocations[0].lat, parsedLocations[0].lng]
      : [center.lat, center.lng];

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-gray-200 bg-[#eef2f6]"
      style={{ height }}
    >
      {loading && (
        <div className="absolute inset-0 z-[1000] bg-white/60 backdrop-blur-xs flex items-center justify-center">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 text-xs text-gray-600">
            <Spin size="small" />
            <span>Memuat lokasi foto...</span>
          </div>
        </div>
      )}

      <MapContainer
        center={initialCenter}
        zoom={center.zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsUpdater locations={parsedLocations} />

        {/* POI name labels if no street photos */}
        {parsedLocations.length === 0 &&
          mapPoiLabels.map((poi) => <PoiLabel key={poi.name} {...poi} />)}

        {/* Street photo location markers */}
        {parsedLocations.map((loc) => (
          <Marker
            key={loc.id}
            position={[loc.lat, loc.lng]}
            icon={photoMarkerIcon}
          >
            <Popup className="uvip-map-popup">
              <div className="p-3 min-w-[210px]">
                <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-xs mb-1.5">
                  <PictureOutlined />
                  <span>Street Photo</span>
                </div>
                <div
                  className="text-xs font-bold text-gray-800 break-words mb-2 leading-tight"
                  title={loc.filename}
                >
                  {loc.filename}
                </div>
                <div className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 mb-1.5 space-y-0.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lat:</span>
                    <span>{loc.lat.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lng:</span>
                    <span>{loc.lng.toFixed(6)}</span>
                  </div>
                </div>
                <div className="text-[10px] text-gray-400 truncate flex items-center gap-1">
                  <EnvironmentOutlined className="text-gray-400" />
                  <span>ID: {loc.id}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Location count badge on map */}
      {parsedLocations.length > 0 && (
        <div className="absolute bottom-3 right-3 z-[1000] bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm border border-gray-200/80 text-[11px] text-gray-700 font-medium flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span>{parsedLocations.length} Titik Lokasi</span>
        </div>
      )}

      {/* Project filter overlay (top-right) */}
      {projects && projects.length > 0 && (
        <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-md px-2.5 py-1.5 border border-gray-200/80 flex items-center gap-1.5">
          <FolderOutlined className="text-blue-500 text-xs flex-shrink-0" />
          <Select
            size="small"
            placeholder="Semua Project"
            allowClear
            value={selectedProjectId || undefined}
            onChange={(val) => onProjectChange?.(val ?? null)}
            options={[
              { label: "Semua Project", value: "" },
              ...projects.map((p) => ({ label: p.name, value: p.id })),
            ]}
            loading={loadingProjects}
            className="w-40 text-xs"
            popupMatchSelectWidth={false}
          />
        </div>
      )}

      {/* Empty state when selected project has no photo locations */}
      {!loading && parsedLocations.length === 0 && selectedProjectId && (
        <div className="absolute inset-0 z-[999] pointer-events-none flex items-center justify-center">
          <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md border border-gray-200 text-xs text-gray-600 font-medium flex items-center gap-2">
            <EnvironmentOutlined className="text-gray-400" />
            <span>Tidak ada foto lokasi untuk project ini</span>
          </div>
        </div>
      )}

      {/* Active layer control (top-right) */}
      {/* <div className="absolute top-3 right-3 z-[1000] bg-white rounded-lg shadow-md p-2.5 w-64">
        <Divider titlePlacement="left" style={{ margin: "0 0 6px" }}>
          <span className="text-xs font-semibold text-gray-500">
            Active Layer
          </span>
        </Divider>
        <Select
          size="small"
          variant="borderless"
          value={layer}
          onChange={handleLayer}
          options={mapLayers.map((l) => ({ value: l.key, label: l.label }))}
          className="!p-0"
        />
      </div> */}

      {/* Stat chips (top-left) */}
      {/* {showStats && (
        <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
          {mapStats.map((s) => (
            <div
              key={s.label}
              className="bg-white/95 rounded-lg shadow-md px-3 py-2 border-l-4 border-blue-500 min-w-[130px]"
            >
              <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                {s.label}
              </div>
              <div className="text-base font-bold text-gray-800 leading-tight">
                {s.value}
                {s.unit && (
                  <span className="text-xs font-medium text-gray-400 ml-0.5">
                    {s.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )} */}

      {/* UVI legend (bottom-left) */}
      {/* {layer === "uvi" && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 rounded-lg shadow-md px-4 py-3">
          <div className="text-[11px] font-semibold text-gray-700 mb-2">
            Urban Visual Index (UVI)
          </div>
          <div
            className="h-2.5 rounded-full w-48"
            style={{
              background:
                "linear-gradient(90deg, #16a34a 0%, #84cc16 35%, #f59e0b 65%, #ef4444 100%)",
            }}
          />
          <div className="flex justify-between text-[10px] text-gray-500 mt-1">
            {uviHeatLegend.map((l) => (
              <span key={l.label} className="inline-flex items-center gap-1">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: l.color }}
                />
                {l.label}
              </span>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
}
