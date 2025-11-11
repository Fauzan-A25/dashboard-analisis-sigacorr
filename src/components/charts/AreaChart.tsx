import { type FC } from 'react';
import '../../styles/area-chart.css';
import { 
  AreaChart as RechartsAreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';

interface AreaChartProps {
  data: Array<{
    name: string;
    [key: string]: number | string;
  }>;
  lines: Array<{
    key: string;
    color: string;
    name: string;
  }>;
  xAxisKey?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
}

const AreaChart: FC<AreaChartProps> = ({
  data,
  lines,
  xAxisKey = 'name',
  height = 400,
  showLegend = false,
  showGrid = true,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart
        data={data}
        margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
      >
        <defs>
          {lines.map((line) => (
            <linearGradient 
              key={line.key} 
              id={`gradient-${line.key}`} 
              x1="0" 
              y1="0" 
              x2="0" 
              y2="1"
            >
              <stop offset="0%" stopColor={line.color} stopOpacity={0.4} />
              <stop offset="50%" stopColor={line.color} stopOpacity={0.1} />
              <stop offset="100%" stopColor={line.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--divider)"
            strokeOpacity={0.3}
          />
        )}
        
        <XAxis
          dataKey={xAxisKey}
          stroke="var(--border)"
          tick={{ 
            fill: 'var(--text-muted)', 
            fontSize: 'var(--text-xs)',
            fontWeight: 500
          }}
          tickLine={false}
          axisLine={{ stroke: 'var(--divider)', strokeWidth: 1 }}
        />
        
        <YAxis
          stroke="var(--border)"
          tick={{ 
            fill: 'var(--text-muted)', 
            fontSize: 'var(--text-xs)',
            fontWeight: 500
          }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
            return value.toString();
          }}
        />
        
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload || payload.length === 0) return null;
            
            return (
              <div className="chart-tooltip">
                <p className="tooltip-label">{label}</p>
                <div className="tooltip-content">
                  {payload.map((entry: any, index: number) => (
                    <div key={index} className="tooltip-item">
                      <span 
                        className="tooltip-dot" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="tooltip-name">{entry.name}:</span>
                      <span className="tooltip-value">
                        {typeof entry.value === 'number' 
                          ? entry.value.toLocaleString('id-ID', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2
                            })
                          : entry.value
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }}
        />
        
        {showLegend && (
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: 'var(--text-sm)',
              fontWeight: 500
            }}
            iconType="circle"
            iconSize={8}
          />
        )}
        
        {lines.map((line) => (
          <Area
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.name}
            stroke={line.color}
            strokeWidth={2.5}
            fill={`url(#gradient-${line.key})`}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChart;
