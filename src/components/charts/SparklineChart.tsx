import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SparklineChartProps {
  data: number[];
  color: string;
  height?: number;
}

export default function SparklineChart({
  data,
  color,
  height = 40,
}: SparklineChartProps) {
  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <defs>
          <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={1} />
          </linearGradient>
        </defs>
        <Line
          type="monotone"
          dataKey="value"
          stroke={`url(#spark-${color.replace("#", "")})`}
          strokeWidth={2}
          dot={false}
          isAnimationActive={true}
          animationDuration={1200}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
