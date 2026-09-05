import { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Select, Divider } from "antd";
import {
  mapCenters,
  markerPoints,
  mapPoiLabels,
  mapLayers,
  uviHeatLegend,
  mapStats,
} from "../../data/mapData";

export type MapLayerKey = (typeof mapLayers)[number]["key"];

interface MapViewProps {
  centerName?: string;
  height?: number | string;
  onLayerChange?: (key: MapLayerKey) => void;
  /** when set, only this layer's visualization is shown */
  initialLayer?: MapLayerKey;
  showStats?: boolean;
}

/** Heat color for a UVI score on a green→amber→red scale */
function uviColor(uvi: number): string {
  if (uvi >= 8) return "#16a34a";
  if (uvi >= 7) return "#84cc16";
  if (uvi >= 6) return "#f59e0b";
  if (uvi >= 5) return "#f97316";
  return "#ef4444";
}

function PoiLabel({ name, lat, lng }: { name: string; lat: number; lng: number }) {
  // divIcon html is static; render text via a dedicated small divIcon per label
  const icon = L.divIcon({
    className: "uvip-poi-label",
    html: `<div style="font:500 10px/1.2 Inter,system-ui,sans-serif;color:#475569;white-space:nowrap;padding:1px 4px;background:rgba(255,255,255,0.78);border-radius:3px;box-shadow:0 1px 2px rgba(0,0,0,0.06);transform:translate(8px,-6px)">${name}</div>`,
    iconSize: [0, 0],
  });
  return <Marker position={[lat, lng]} icon={icon} />;
}

export default function MapView({
  centerName = "Kota Malang",
  height = 420,
  initialLayer = "uvi",
  showStats = true,
}: MapViewProps) {
  const [layer, setLayer] = useState<MapLayerKey>(initialLayer);
  const center = mapCenters.find((c) => c.name === centerName) ?? mapCenters[0];

  const handleLayer = (key: MapLayerKey) => {
    setLayer(key);
  };

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-gray-200 bg-[#eef2f6]"
      style={{ height }}
    >
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={center.zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* UVI heatmap circles */}
        {layer === "uvi" &&
          markerPoints.map((p) => (
            <CircleMarker
              key={`heat-${p.id}`}
              center={[p.lat, p.lng]}
              radius={22 + p.uvi * 2}
              pathOptions={{
                color: "transparent",
                fillColor: uviColor(p.uvi),
                fillOpacity: 0.35,
              }}
            />
          ))}

        {/* Survey points */}
        {layer !== "uvi" &&
          markerPoints.map((p) => (
            <CircleMarker
              key={`pt-${p.id}`}
              center={[p.lat, p.lng]}
              radius={8}
              pathOptions={{
                color: "#ffffff",
                weight: 2,
                fillColor: layer === "gvi" ? "#16a34a" : "#3b82f6",
                fillOpacity: 1,
              }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                <div style={{ fontSize: 12 }}>
                  <b>{p.name}</b>
                  <br />
                  {layer === "gvi" ? "GVI covered zone" : `${p.surveyCount} survey points`}
                  <br />
                  UVI {p.uvi.toFixed(2)}
                </div>
              </Tooltip>
            </CircleMarker>
          ))}

        {/* POI name labels */}
        {mapPoiLabels.map((poi) => (
          <PoiLabel key={poi.name} {...poi} />
        ))}
      </MapContainer>

      {/* Active layer control (top-right) */}
      <div className="absolute top-3 right-3 z-[1000] bg-white rounded-lg shadow-md p-2.5 w-64">
        <Divider titlePlacement="left" style={{ margin: "0 0 6px" }}>
          <span className="text-xs font-semibold text-gray-500">Active Layer</span>
        </Divider>
        <Select
          size="small"
          variant="borderless"
          value={layer}
          onChange={handleLayer}
          options={mapLayers.map((l) => ({ value: l.key, label: l.label }))}
          className="!p-0"
        />
      </div>

      {/* Stat chips (top-left) */}
      {showStats && (
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
                  <span className="text-xs font-medium text-gray-400 ml-0.5">{s.unit}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UVI legend (bottom-left) */}
      {layer === "uvi" && (
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
      )}

    </div>
  );
}