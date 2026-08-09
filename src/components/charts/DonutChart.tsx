import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { datasetSummary, datasetTotal } from "../../data/datasetSummary";

export default function DonutChart() {
  return (
    <div className="flex items-center gap-4">
      {/* Chart */}
      <div className="relative w-[140px] h-[140px] flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={datasetSummary}
              cx="50%"
              cy="50%"
              innerRadius={42}
              outerRadius={65}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
              animationBegin={200}
              animationDuration={1000}
            >
              {datasetSummary.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-gray-800">
            {datasetTotal.toLocaleString()}
          </span>
          <span className="text-[10px] text-gray-400">Total Data</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2">
        {datasetSummary.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="text-xs">
              <span className="text-gray-600">{item.name}</span>
              <br />
              <span className="text-gray-400 text-[10px]">
                {item.value.toLocaleString()} ({item.percentage})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
