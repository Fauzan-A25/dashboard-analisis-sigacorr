import { type FC } from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: Array<{
    name: string;
    [key: string]: number | string;
  }>;
  bars: Array<{
    key: string;
    color: string;
    name: string;
  }>;
  xAxisKey?: string;
  height?: number;
  stacked?: boolean;
}

const BarChart: FC<BarChartProps> = ({
  data,
  bars,
  xAxisKey = 'name',
  height = 400,
  stacked = false,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="var(--divider)"
        />
        <XAxis
          dataKey={xAxisKey}
          stroke="var(--text-secondary)"
          tick={{ fill: 'var(--text-secondary)' }}
        />
        <YAxis
          stroke="var(--text-secondary)"
          tick={{ fill: 'var(--text-secondary)' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
          }}
          labelStyle={{ color: 'var(--text-primary)' }}
          itemStyle={{ color: 'var(--text-secondary)' }}
          formatter={(value: any) => {
            const num = Number(value);
            if (!Number.isFinite(num)) return '0';
            return typeof value === 'number' ? num.toFixed(1) : String(value);
          }}
        />
        {bars.map((bar) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.name}
            fill={bar.color}
            stackId={stacked ? 'stack' : undefined}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;