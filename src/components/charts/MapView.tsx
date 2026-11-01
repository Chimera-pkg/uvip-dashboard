import { useMemo, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Spin, Select, Popover } from "antd";
import { EnvironmentOutlined, FolderOutlined } from "@ant-design/icons";
import { mapCenters, mapPoiLabels, mapLayers } from "../../data/mapData";
import type { StreetPhotoLocation } from "../../api/street-photos.service";

export type MapLayerKey = (typeof mapLayers)[number]["key"];

export const PVI_LEVELS = [
  {
    level: 1,
    category: "Sangat rendah",
    range: "Tidak terjangkau / < 0.0000",
    color: "#C62828",
  },
  {
    level: 2,
    category: "Rendah",
    range: "0.0000 - < 0.0492",
    color: "#E53935",
  },
  {
    level: 3,
    category: "Cenderung rendah",
    range: "0.0492 - < 0.1704",
    color: "#FF7043",
  },
  {
    level: 4,
    category: "Sedang",
    range: "0.1704 - < 0.2917",
    color: "#FFA000",
  },
  {
    level: 5,
    category: "Cenderung tinggi",
    range: "0.2917 - < 0.4130",
    color: "#4CAF50",
  },
  {
    level: 6,
    category: "Tinggi",
    range: "0.4130 - < 0.5343",
    color: "#00BFA5",
  },
  {
    level: 7,
    category: "Sangat tinggi",
    range: "0.5343 - 1.0000",
    color: "#02BDDB",
  },
] as const;

export interface UviEvaluation {
  level: number;
  category: string;
  color: string;
}

export function evaluateUviScore(
  uviScore: number | null | undefined,
  rawScore?: number | null | undefined,
): UviEvaluation {
  if (
    rawScore === null ||
    uviScore === null ||
    uviScore === undefined ||
    isNaN(uviScore) ||
    uviScore < 0.0
  ) {
    return {
      level: 1,
      category: "Sangat rendah",
      color: "#C62828",
    };
  }
  if (uviScore < 0.0492) {
    return {
      level: 2,
      category: "Rendah",
      color: "#E53935",
    };
  }
  if (uviScore < 0.1704) {
    return {
      level: 3,
      category: "Cenderung rendah",
      color: "#FF7043",
    };
  }
  if (uviScore < 0.2917) {
    return {
      level: 4,
      category: "Sedang",
      color: "#FFA000",
    };
  }
  if (uviScore < 0.413) {
    return {
      level: 5,
      category: "Cenderung tinggi",
      color: "#4CAF50",
    };
  }
  if (uviScore < 0.5343) {
    return {
      level: 6,
      category: "Tinggi",
      color: "#00BFA5",
    };
  }
  return {
    level: 7,
    category: "Sangat tinggi",
    color: "#02BDDB",
  };
}

function hexToRgba(hex: string, alpha: number = 0.3): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function calculateOffset(
  index: number,
  total: number,
  spacing: number = 22,
): { dx: number; dy: number } {
  if (total <= 1) return { dx: 0, dy: 0 };

  // For up to 7 items, line them up side-by-side in a single row (jejer)
  if (total <= 7) {
    const dx = (index - (total - 1) / 2) * spacing;
    return { dx, dy: 0 };
  }

  // For more than 7 items, arrange them in multiple horizontal rows (grid of jejer)
  const cols = Math.min(8, Math.max(4, Math.ceil(Math.sqrt(total * 1.5))));
  const rows = Math.ceil(total / cols);

  const row = Math.floor(index / cols);
  const col = index % cols;

  const itemsInThisRow = row === rows - 1 ? total - row * cols : cols;

  const dx = (col - (itemsInThisRow - 1) / 2) * spacing;
  const dy = (row - (rows - 1) / 2) * spacing;

  return { dx, dy };
}

const markerIconCache = new Map<string, L.DivIcon>();

export function getPhotoMarkerIcon(
  color: string,
  dx: number = 0,
  dy: number = 0,
): L.DivIcon {
  const cacheKey = `${color}_${dx}_${dy}`;
  const cached = markerIconCache.get(cacheKey);
  if (cached) return cached;

  const bgRgba = hexToRgba(color, 0.6);
  const icon = L.divIcon({
    className: "uvip-photo-marker",
    html: `
      <div style="width:20px; height:20px; display:flex; align-items:center; justify-content:center; cursor:pointer;">
        <div style="width:16px; height:16px; background:${bgRgba}; border:2px solid ${color}; border-radius:50%; box-shadow:0 0 0 1.5px rgba(255,255,255,0.9), 0 2px 5px rgba(0,0,0,0.25); transition:transform 0.15s ease, box-shadow 0.15s ease;"
             onmouseover="this.style.transform='scale(1.35)'; this.style.boxShadow='0 0 0 2px #ffffff, 0 3px 8px rgba(0,0,0,0.4)';"
             onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 0 0 1.5px rgba(255,255,255,0.9), 0 2px 4px rgba(0,0,0,0.25)';">
        </div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10 - dx, 10 - dy],
    popupAnchor: [0, -12],
  });

  markerIconCache.set(cacheKey, icon);
  return icon;
}

const clusterIconCache = new Map<string, L.DivIcon>();

export function getClusterMarkerIcon(color: string, count: number): L.DivIcon {
  const cacheKey = `${color}_${count}`;
  const cached = clusterIconCache.get(cacheKey);
  if (cached) return cached;

  const bgRgba = hexToRgba(color, 0.65);
  const size = count > 99 ? 34 : count > 9 ? 30 : 26;
  const half = Math.round(size / 2);

  const icon = L.divIcon({
    className: "uvip-photo-marker uvip-photo-cluster-marker",
    html: `
      <div style="width:${size}px; height:${size}px; display:flex; align-items:center; justify-content:center; cursor:pointer;">
        <div style="width:${size - 2}px; height:${size - 2}px; background:${bgRgba}; border:2.5px solid ${color}; border-radius:50%; box-shadow:0 0 0 2px rgba(255,255,255,0.95), 0 3px 8px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; font-family:Inter,system-ui,sans-serif; font-size:${size > 28 ? 11 : 12}px; font-weight:700; color:#ffffff; text-shadow:0 1px 2px rgba(0,0,0,0.6); transition:transform 0.15s ease;"
             onmouseover="this.style.transform='scale(1.2)';"
             onmouseout="this.style.transform='scale(1)';">
          ${count}
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [half, half],
    popupAnchor: [0, -half],
  });

  clusterIconCache.set(cacheKey, icon);
  return icon;
}

export interface ParsedLocationItem {
  id: string;
  filename: string;
  lat: number;
  lng: number;
  uviScore: number | null;
  uviInfo: UviEvaluation;
  [key: string]: any;
}

export interface PositionedLocationItem extends ParsedLocationItem {
  anchorLat: number;
  anchorLng: number;
  dx: number;
  dy: number;
  groupTotal: number;
  groupIndex: number;
}

export interface LocationGroup {
  id: string;
  anchorLat: number;
  anchorLng: number;
  items: PositionedLocationItem[];
  total: number;
  avgUviScore: number | null;
  groupUviInfo: UviEvaluation;
}

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

function PhotoPopupContent({ loc }: { loc: PositionedLocationItem }) {
  return (
    <div className="p-3 min-w-[210px]">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div
          className="flex items-center gap-1.5 font-semibold text-xs truncate"
          style={{ color: loc.uviInfo.color }}
        >
          <span
            className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
            style={{ backgroundColor: loc.uviInfo.color }}
          />
          <span>Street Photo</span>
          {loc.groupTotal > 1 && (
            <span className="text-[10px] text-gray-400 font-normal">
              ({loc.groupIndex + 1}/{loc.groupTotal})
            </span>
          )}
        </div>
        <span
          className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white flex-shrink-0"
          style={{ backgroundColor: loc.uviInfo.color }}
        >
          {loc.uviInfo.category}
        </span>
      </div>
      <div
        className="text-xs font-bold text-gray-800 break-words mb-2 leading-tight"
        title={loc.filename}
      >
        {loc.filename}
      </div>
      <div className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 mb-1.5 space-y-1 font-mono">
        <div className="flex justify-between items-center font-sans">
          <span className="text-gray-400 font-mono text-[10px]">
            PVI Score:
          </span>
          <span
            className="font-bold text-xs"
            style={{ color: loc.uviInfo.color }}
          >
            {loc.uviScore !== null && !isNaN(loc.uviScore)
              ? loc.uviScore.toFixed(4)
              : "-"}
          </span>
        </div>
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
  );
}

function StreetPhotoMarkers({ groups }: { groups: LocationGroup[] }) {
  const map = useMap();
  const [currentZoom, setCurrentZoom] = useState<number>(() => map.getZoom());

  useEffect(() => {
    setCurrentZoom(map.getZoom());
    const onZoom = () => {
      setCurrentZoom(map.getZoom());
    };
    map.on("zoomend", onZoom);
    map.on("moveend", onZoom);
    return () => {
      map.off("zoomend", onZoom);
      map.off("moveend", onZoom);
    };
  }, [map]);

  // Zoom >= 14 is neighborhood/street level where markers are expanded "berjejer"
  const isZoomedIn = currentZoom >= 14;

  if (!isZoomedIn) {
    // Zoom out view: overlapping markers stay as ONE ("tetap jadi satu")
    return (
      <>
        {groups.map((group) => {
          if (group.total === 1) {
            const loc = group.items[0];
            return (
              <Marker
                key={loc.id}
                position={[loc.anchorLat, loc.anchorLng]}
                icon={getPhotoMarkerIcon(loc.uviInfo.color, 0, 0)}
              >
                <Popup className="uvip-map-popup">
                  <PhotoPopupContent loc={loc} />
                </Popup>
              </Marker>
            );
          }

          // Clustered marker (tetap jadi satu)
          return (
            <Marker
              key={group.id}
              position={[group.anchorLat, group.anchorLng]}
              icon={getClusterMarkerIcon(group.groupUviInfo.color, group.total)}
              eventHandlers={{
                click: () => {
                  map.flyTo([group.anchorLat, group.anchorLng], 15, {
                    duration: 0.5,
                  });
                },
              }}
            >
              <Popup className="uvip-map-popup">
                <div className="p-3 min-w-[210px]">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div
                      className="flex items-center gap-1.5 font-semibold text-xs truncate"
                      style={{ color: group.groupUviInfo.color }}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                        style={{ backgroundColor: group.groupUviInfo.color }}
                      />
                      <span>Cluster Lokasi</span>
                    </div>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white flex-shrink-0"
                      style={{ backgroundColor: group.groupUviInfo.color }}
                    >
                      {group.groupUviInfo.category}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-gray-800 mb-2">
                    {group.total} Foto Menumpuk di Lokasi Ini
                  </div>
                  <div className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 mb-2.5 space-y-1 font-mono">
                    <div className="flex justify-between items-center font-sans">
                      <span className="text-gray-400 font-mono text-[10px]">
                        Rata-rata PVI:
                      </span>
                      <span
                        className="font-bold text-xs"
                        style={{ color: group.groupUviInfo.color }}
                      >
                        {group.avgUviScore !== null
                          ? group.avgUviScore.toFixed(4)
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Lat:</span>
                      <span>{group.anchorLat.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Lng:</span>
                      <span>{group.anchorLng.toFixed(6)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-full py-1.5 px-2.5 text-xs font-semibold text-white rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    onClick={() =>
                      map.flyTo([group.anchorLat, group.anchorLng], 15, {
                        duration: 0.5,
                      })
                    }
                  >
                    <span>Perbesar & Lihat Jejeran ({group.total} Foto)</span>
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </>
    );
  }

  // Zoomed in view (zoom >= 14): render all individual markers berjejer side-by-side!
  return (
    <>
      {groups.flatMap((group) =>
        group.items.map((loc) => (
          <Marker
            key={loc.id}
            position={[loc.anchorLat, loc.anchorLng]}
            icon={getPhotoMarkerIcon(loc.uviInfo.color, loc.dx, loc.dy)}
          >
            <Popup className="uvip-map-popup">
              <PhotoPopupContent loc={loc} />
            </Popup>
          </Marker>
        )),
      )}
    </>
  );
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

  const { locationGroups, allValidLocations } = useMemo(() => {
    if (!locations || !Array.isArray(locations))
      return { locationGroups: [], allValidLocations: [] };

    // 1. Parse raw valid locations
    const valid: ParsedLocationItem[] = locations
      .map((item) => {
        const rawLat = item.lattitude ?? item.latitude;
        const rawLng = item.longtitude ?? item.longitude;
        const lat =
          typeof rawLat === "number" ? rawLat : parseFloat(String(rawLat));
        const lng =
          typeof rawLng === "number" ? rawLng : parseFloat(String(rawLng));

        const rawUvi = item.uvi_score ?? item.uviScore ?? item.uvi;
        const uviScore =
          rawUvi !== undefined && rawUvi !== null && rawUvi !== ""
            ? typeof rawUvi === "number"
              ? rawUvi
              : parseFloat(String(rawUvi))
            : null;

        const rawScoreVal = item.raw_score ?? item.rawScore;
        const rawScore =
          rawScoreVal !== undefined &&
          rawScoreVal !== null &&
          rawScoreVal !== ""
            ? typeof rawScoreVal === "number"
              ? rawScoreVal
              : parseFloat(String(rawScoreVal))
            : rawScoreVal === null
              ? null
              : undefined;

        const uviInfo = evaluateUviScore(uviScore, rawScore);

        return {
          ...item,
          id: item.id,
          filename: item.original_filename || "Photo",
          lat,
          lng,
          uviScore,
          uviInfo,
        };
      })
      .filter(
        (loc) =>
          !isNaN(loc.lat) && !isNaN(loc.lng) && loc.lat !== 0 && loc.lng !== 0,
      );

    // 2. Group locations that share the same or almost identical coordinate (~25m)
    const PROXIMITY_THRESHOLD = 0.00025;
    interface RawGroup {
      anchorLat: number;
      anchorLng: number;
      rawItems: ParsedLocationItem[];
    }

    const rawGroups: RawGroup[] = [];
    for (const item of valid) {
      const matched = rawGroups.find(
        (g) =>
          Math.abs(g.anchorLat - item.lat) < PROXIMITY_THRESHOLD &&
          Math.abs(g.anchorLng - item.lng) < PROXIMITY_THRESHOLD,
      );
      if (matched) {
        matched.rawItems.push(item);
      } else {
        rawGroups.push({
          anchorLat: item.lat,
          anchorLng: item.lng,
          rawItems: [item],
        });
      }
    }

    // 3. For each group, calculate average UVI score and offsets
    const groups: LocationGroup[] = rawGroups.map((rg, gIdx) => {
      const total = rg.rawItems.length;
      const validScores = rg.rawItems
        .map((i) => i.uviScore)
        .filter((s): s is number => s !== null && s !== undefined && !isNaN(s));

      const avgUviScore =
        validScores.length > 0
          ? validScores.reduce((a, b) => a + b, 0) / validScores.length
          : null;

      const groupUviInfo = evaluateUviScore(avgUviScore);

      const items: PositionedLocationItem[] = rg.rawItems.map((item, index) => {
        const { dx, dy } = calculateOffset(index, total, 22);
        return {
          ...item,
          anchorLat: rg.anchorLat,
          anchorLng: rg.anchorLng,
          dx,
          dy,
          groupTotal: total,
          groupIndex: index,
        };
      });

      return {
        id: `group-${gIdx}-${rg.anchorLat.toFixed(5)}_${rg.anchorLng.toFixed(5)}`,
        anchorLat: rg.anchorLat,
        anchorLng: rg.anchorLng,
        items,
        total,
        avgUviScore,
        groupUviInfo,
      };
    });

    return { locationGroups: groups, allValidLocations: valid };
  }, [locations]);

  const initialCenter: [number, number] =
    allValidLocations.length > 0
      ? [allValidLocations[0].lat, allValidLocations[0].lng]
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

        <MapBoundsUpdater locations={allValidLocations} />

        {/* POI name labels if no street photos */}
        {allValidLocations.length === 0 &&
          mapPoiLabels.map((poi) => <PoiLabel key={poi.name} {...poi} />)}

        {/* Street photo markers (clustered when zoomed out, berjejer when zoomed in) */}
        <StreetPhotoMarkers groups={locationGroups} />
      </MapContainer>

      {/* PVI Legend Popover (bottom-left) */}
      <div className="absolute bottom-3 left-3 z-[1000]">
        <Popover
          content={
            <div className="text-xs p-1 space-y-2 w-60">
              <div className="font-semibold text-gray-800 pb-1.5 border-b border-gray-100 flex items-center justify-between">
                <span>Batas Level PVI</span>
              </div>
              <div className="space-y-1">
                {PVI_LEVELS.map((item) => (
                  <div
                    key={item.level}
                    className="flex items-center justify-between text-[11px] py-0.5"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-700 font-medium">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-gray-400 font-mono text-[10px]">
                      {item.range}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          }
          title={null}
          trigger="click"
          placement="topLeft"
        >
          <button
            type="button"
            className="bg-white/90 hover:bg-white backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm border border-gray-200/80 text-[11px] text-gray-700 font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <div className="flex items-center -space-x-1">
              <span
                className="w-2 h-2 rounded-full border border-white"
                style={{ backgroundColor: "#C62828" }}
              />
              <span
                className="w-2 h-2 rounded-full border border-white"
                style={{ backgroundColor: "#FFA000" }}
              />
              <span
                className="w-2 h-2 rounded-full border border-white"
                style={{ backgroundColor: "#4CAF50" }}
              />
              <span
                className="w-2 h-2 rounded-full border border-white"
                style={{ backgroundColor: "#02BDDB" }}
              />
            </div>
            <span>Legenda PVI</span>
          </button>
        </Popover>
      </div>

      {/* Location count badge on map */}
      {allValidLocations.length > 0 && (
        <div className="absolute bottom-3 right-3 z-[1000] bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm border border-gray-200/80 text-[11px] text-gray-700 font-medium flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span>{allValidLocations.length} Titik Lokasi</span>
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
      {!loading && allValidLocations.length === 0 && selectedProjectId && (
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
