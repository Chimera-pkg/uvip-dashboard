import { useMemo, useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Spin } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import { mapCenters } from "../../data/mapData";
import type { StreetPhotoLocation } from "../../api/street-photos.service";
import {
  evaluateUviScore,
  calculateOffset,
  getPhotoMarkerIcon,
  getClusterMarkerIcon,
  type PositionedLocationItem,
  type LocationGroup,
} from "./MapView";

export interface UviHeatmapMapProps {
  centerName?: string;
  height?: number | string;
  locations?: StreetPhotoLocation[];
  loading?: boolean;
  showHeatmap?: boolean;
  showPoints?: boolean;
  resetTrigger?: number;
  onViewportChange?: (visibleLocations: PositionedLocationItem[]) => void;
}

/**
 * Calculates RGB color interpolated across the UVI spectrum (0.0 to 1.0)
 * 0.00: Red (#ef4444)
 * 0.25: Orange (#f97316)
 * 0.50: Yellow (#eab308)
 * 0.75: Lime (#84cc16)
 * 1.00: Green (#16a34a)
 */
export function getUviSpectrumRgb(
  score: number | null | undefined,
): [number, number, number] {
  if (score === null || score === undefined || isNaN(score)) {
    return [234, 179, 8]; // fallback yellow
  }
  const s = Math.max(0, Math.min(1, score));

  if (s <= 0.25) {
    const t = s / 0.25;
    return [
      Math.round(239 + t * (249 - 239)),
      Math.round(68 + t * (115 - 68)),
      Math.round(68 + t * (22 - 68)),
    ];
  } else if (s <= 0.5) {
    const t = (s - 0.25) / 0.25;
    return [
      Math.round(249 + t * (234 - 249)),
      Math.round(115 + t * (179 - 115)),
      Math.round(22 + t * (8 - 22)),
    ];
  } else if (s <= 0.75) {
    const t = (s - 0.5) / 0.25;
    return [
      Math.round(234 + t * (132 - 234)),
      Math.round(179 + t * (204 - 179)),
      Math.round(8 + t * (22 - 8)),
    ];
  } else {
    const t = (s - 0.75) / 0.25;
    return [
      Math.round(132 + t * (22 - 132)),
      Math.round(204 + t * (163 - 204)),
      Math.round(22 + t * (74 - 22)),
    ];
  }
}

/**
 * Map Scale Control (Leaflet metric bar, e.g. "200 m")
 */
function MapScaleControl() {
  const map = useMap();

  useEffect(() => {
    const scaleControl = L.control.scale({
      imperial: false,
      position: "bottomleft",
    });
    scaleControl.addTo(map);
    return () => {
      scaleControl.remove();
    };
  }, [map]);

  return null;
}

/**
 * Bounds updater and reset view handler
 */
function MapBoundsController({
  locations,
  resetTrigger,
}: {
  locations: { lat: number; lng: number }[];
  resetTrigger?: number;
}) {
  const map = useMap();
  const initialFitDone = useRef(false);

  const fitToLocations = useCallback(() => {
    if (!locations || locations.length === 0) return;

    if (locations.length === 1) {
      map.setView([locations[0].lat, locations[0].lng], 15);
    } else {
      const bounds = L.latLngBounds(locations.map((loc) => [loc.lat, loc.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [locations, map]);

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (locations.length > 0 && !initialFitDone.current) {
      fitToLocations();
      initialFitDone.current = true;
    }
  }, [locations, fitToLocations]);

  // When resetTrigger changes, re-fit view
  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > 0) {
      fitToLocations();
    }
  }, [resetTrigger, fitToLocations]);

  return null;
}

/**
 * Tracks current map viewport bounds and reports visible locations
 */
function MapViewportTracker({
  locations,
  onViewportChange,
}: {
  locations: PositionedLocationItem[];
  onViewportChange?: (visible: PositionedLocationItem[]) => void;
}) {
  const map = useMap();

  const handleUpdate = useCallback(() => {
    if (!onViewportChange) return;

    if (!locations || locations.length === 0) {
      onViewportChange([]);
      return;
    }

    const bounds = map.getBounds();
    const visible = locations.filter((loc) =>
      bounds.contains([loc.lat, loc.lng]),
    );
    onViewportChange(visible);
  }, [map, locations, onViewportChange]);

  useEffect(() => {
    handleUpdate();
    map.on("moveend", handleUpdate);
    map.on("zoomend", handleUpdate);

    return () => {
      map.off("moveend", handleUpdate);
      map.off("zoomend", handleUpdate);
    };
  }, [map, handleUpdate]);

  return null;
}

/**
 * High-performance smooth Canvas Heatmap Layer representing local UVI average
 */
function UviHeatmapCanvasLayer({
  locations,
  visible,
}: {
  locations: PositionedLocationItem[];
  visible: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const canvas = document.createElement("canvas");
    canvas.className = "uvi-heatmap-canvas";
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "450"; // Above tiles (200), below markers (600)
    container.appendChild(canvas);

    const render = () => {
      if (!visible || locations.length === 0) {
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      const size = map.getSize();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = size.x * dpr;
      canvas.height = size.y * dpr;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, size.x, size.y);

      const zoom = map.getZoom();
      // Radius adjusts smoothly with map zoom
      const radius = Math.max(30, Math.min(85, 45 + (zoom - 14) * 6));

      // Draw local UVI heat halos
      for (const loc of locations) {
        const pt = map.latLngToContainerPoint([loc.lat, loc.lng]);

        // Cull points outside visible canvas plus margin
        if (
          pt.x < -radius ||
          pt.x > size.x + radius ||
          pt.y < -radius ||
          pt.y > size.y + radius
        ) {
          continue;
        }

        const [r, g, b] = getUviSpectrumRgb(loc.uviScore);
        const grad = ctx.createRadialGradient(
          pt.x,
          pt.y,
          0,
          pt.x,
          pt.y,
          radius,
        );

        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.70)`);
        grad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, 0.48)`);
        grad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.20)`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    render();

    map.on("move", render);
    map.on("zoom", render);
    map.on("resize", render);
    map.on("viewreset", render);

    return () => {
      map.off("move", render);
      map.off("zoom", render);
      map.off("resize", render);
      map.off("viewreset", render);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [map, locations, visible]);

  return null;
}

/**
 * Popup component for individual photo points
 */
function PhotoPointPopup({ loc }: { loc: PositionedLocationItem }) {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const photoUrl = loc.file_path
    ? loc.file_path.startsWith("http")
      ? loc.file_path
      : `${API_BASE_URL.replace(/\/$/, "")}/${loc.file_path.replace(/^\//, "")}`
    : null;

  return (
    <div className="p-3 min-w-55 max-w-65">
      {photoUrl && (
        <div className="w-full h-28 rounded-lg overflow-hidden bg-gray-100 mb-2 border border-gray-100">
          <img
            src={photoUrl}
            alt={loc.filename}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </div>
      )}

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
            Nilai UVI:
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

/**
 * Markers renderer supporting clustered view at lower zoom and unbundled view at street zoom
 */
function PhotoMarkersLayer({
  groups,
  visible,
}: {
  groups: LocationGroup[];
  visible: boolean;
}) {
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

  if (!visible) return null;

  const isZoomedIn = currentZoom >= 14;

  if (!isZoomedIn) {
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
                  <PhotoPointPopup loc={loc} />
                </Popup>
              </Marker>
            );
          }

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
                        Rata-rata UVI:
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
                    <span>Perbesar & Lihat Titik ({group.total} Foto)</span>
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </>
    );
  }

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
              <PhotoPointPopup loc={loc} />
            </Popup>
          </Marker>
        )),
      )}
    </>
  );
}

export default function UviHeatmapMap({
  centerName = "Kota Malang",
  height = 540,
  locations = [],
  loading = false,
  showHeatmap = true,
  showPoints = true,
  resetTrigger = 0,
  onViewportChange,
}: UviHeatmapMapProps) {
  const defaultCenter =
    mapCenters.find((c) => c.name === centerName) ?? mapCenters[0];

  const { locationGroups, allValidLocations } = useMemo(() => {
    if (!locations || !Array.isArray(locations)) {
      return { locationGroups: [], allValidLocations: [] };
    }

    const valid: PositionedLocationItem[] = [];

    for (const item of locations) {
      const rawLat = item.lattitude ?? item.latitude;
      const rawLng = item.longtitude ?? item.longitude;
      const lat =
        typeof rawLat === "number" ? rawLat : parseFloat(String(rawLat));
      const lng =
        typeof rawLng === "number" ? rawLng : parseFloat(String(rawLng));

      if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) continue;

      const rawUvi = item.uvi_score ?? item.uviScore ?? item.uvi;
      const uviScore =
        rawUvi !== undefined && rawUvi !== null && rawUvi !== ""
          ? typeof rawUvi === "number"
            ? rawUvi
            : parseFloat(String(rawUvi))
          : null;

      const rawScoreVal = item.raw_score ?? item.rawScore;
      const rawScore =
        rawScoreVal !== undefined && rawScoreVal !== null && rawScoreVal !== ""
          ? typeof rawScoreVal === "number"
            ? rawScoreVal
            : parseFloat(String(rawScoreVal))
          : rawScoreVal === null
            ? null
            : undefined;

      const uviInfo = evaluateUviScore(uviScore, rawScore);

      valid.push({
        ...item,
        id: item.id,
        filename: item.original_filename || "Photo",
        lat,
        lng,
        anchorLat: lat,
        anchorLng: lng,
        dx: 0,
        dy: 0,
        groupTotal: 1,
        groupIndex: 0,
        uviScore,
        uviInfo,
      });
    }

    // Group close locations (< ~25 meters)
    const PROXIMITY_THRESHOLD = 0.00025;
    interface RawGroup {
      anchorLat: number;
      anchorLng: number;
      items: PositionedLocationItem[];
    }

    const rawGroups: RawGroup[] = [];
    for (const item of valid) {
      const matched = rawGroups.find(
        (g) =>
          Math.abs(g.anchorLat - item.lat) < PROXIMITY_THRESHOLD &&
          Math.abs(g.anchorLng - item.lng) < PROXIMITY_THRESHOLD,
      );
      if (matched) {
        matched.items.push(item);
      } else {
        rawGroups.push({
          anchorLat: item.lat,
          anchorLng: item.lng,
          items: [item],
        });
      }
    }

    const groups: LocationGroup[] = rawGroups.map((rg, gIdx) => {
      const total = rg.items.length;
      const validScores = rg.items
        .map((i) => i.uviScore)
        .filter((s): s is number => s !== null && s !== undefined && !isNaN(s));

      const avgUviScore =
        validScores.length > 0
          ? validScores.reduce((a, b) => a + b, 0) / validScores.length
          : null;

      const groupUviInfo = evaluateUviScore(avgUviScore);

      const positionedItems: PositionedLocationItem[] = rg.items.map(
        (item, index) => {
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
        },
      );

      return {
        id: `group-${gIdx}-${rg.anchorLat.toFixed(5)}_${rg.anchorLng.toFixed(5)}`,
        anchorLat: rg.anchorLat,
        anchorLng: rg.anchorLng,
        items: positionedItems,
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
      : [defaultCenter.lat, defaultCenter.lng];

  return (
    <div
      className="relative rounded-b-xl overflow-hidden bg-[#eef2f6]"
      style={{ height }}
    >
      {loading && (
        <div className="absolute inset-0 z-[1000] bg-white/60 backdrop-blur-xs flex items-center justify-center">
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl shadow-md border border-gray-100 text-xs text-gray-700 font-medium">
            <Spin size="small" />
            <span>Memuat lokasi peta panas UVI...</span>
          </div>
        </div>
      )}

      <MapContainer
        center={initialCenter}
        zoom={defaultCenter.zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Metric Scale Control (e.g. 200 m) */}
        <MapScaleControl />

        {/* Dynamic Bounds Adjuster on initial load or reset */}
        <MapBoundsController
          locations={allValidLocations}
          resetTrigger={resetTrigger}
        />

        {/* Viewport Bounds Tracker */}
        <MapViewportTracker
          locations={allValidLocations}
          onViewportChange={onViewportChange}
        />

        {/* Smooth UVI Heatmap Layer */}
        <UviHeatmapCanvasLayer
          locations={allValidLocations}
          visible={showHeatmap}
        />

        {/* Photo Point Markers */}
        <PhotoMarkersLayer groups={locationGroups} visible={showPoints} />
      </MapContainer>
    </div>
  );
}
