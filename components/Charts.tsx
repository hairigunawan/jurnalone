// components/Charts.tsx
"use client";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie // <--- Ini yang ditambahkan
} from 'recharts';

interface ChartEntry {
  name: string;
  profit: number;
  equity: number;
  color?: string;
}

// Custom Tooltip untuk tampilan lebih bersih
const CustomTooltip = ({ active, payload, label }: any) => { // recharts tooltips are notoriously hard to type perfectly without 'any'
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg text-xs">
        <p className="font-bold text-gray-700 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value} USD
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function MonthlyChart({ data }: { data: ChartEntry[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={8}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} tickFormatter={(value) => `${value} USD`} />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
          <Bar dataKey="profit" name="Profit" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10B981' : '#EF4444'} />
            ))}
          </Bar>
          <Line type="monotone" dataKey="equity" stroke="#F59E0B" strokeWidth={2} dot={{r: 4, fill: '#F59E0B', strokeWidth: 0}} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DailyChart({ data }: { data: ChartEntry[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} tickFormatter={(value) => `${value} USD`} />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
          <Bar dataKey="profit" name="Profit" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10B981' : '#EF4444'} />
            ))}
          </Bar>
          <Line type="monotone" dataKey="equity" stroke="#F59E0B" strokeWidth={2} dot={{r: 4, fill: '#F59E0B', strokeWidth: 0}} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({ percent, color, label, value }: { percent: number, color: string, label: string, value: string }) {
  const data = [
    { name: 'Value', value: percent },
    { name: 'Remaining', value: 100 - percent },
  ];
  
  const COLORS = [color, '#F3F4F6'];

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative w-40 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-gray-400 mb-1">{label}</span>
          <span className="text-xl font-bold text-gray-800">{value}</span>
        </div>
      </div>
    </div>
  );
}