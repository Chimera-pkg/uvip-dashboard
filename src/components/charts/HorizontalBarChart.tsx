import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  LabelList,
} from "recharts";
import {
  modelPerformance,
  targetR2,
  lastTraining,
} from "../../data/modelPerformance";

export default function HorizontalBarChart() {
  return (
    <div>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart
          data={modelPerformance}
          layout="vertical"
          margin={{ top: 5, right: 40, left: 0, bottom: 5 }}
          barSize={14}
        >
          <XAxis
            type="number"
            domain={[0, 1]}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            width={90}
          />
          <ReferenceLine
            x={targetR2}
            stroke="#ef4444"
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />
          <Bar dataKey="r2" radius={[0, 6, 6, 0]} animationDuration={1200}>
            {modelPerformance.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
            <LabelList
              dataKey="r2"
              position="right"
              style={{ fontSize: 11, fontWeight: 600, fill: "#374151" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-between mt-2 px-2">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-4 h-0.5 bg-red-400 inline-block border-dashed" />
          Target R² {">"} {targetR2.toFixed(2)}
        </div>
        <span className="text-xs text-gray-400">
          Last Training: {lastTraining}
        </span>
      </div>
    </div>
  );
}
