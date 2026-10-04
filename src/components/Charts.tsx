import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { chartTheme } from "./kit";

type Row = Record<string, string | number>;
type S = { key: string; color: string; name?: string | undefined };

const common = (x: string) => (
  <>
    <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
    <XAxis dataKey={x} tick={chartTheme.axis} axisLine={false} tickLine={false} />
    <YAxis tick={chartTheme.axis} axisLine={false} tickLine={false} width={36} />
    <Tooltip contentStyle={chartTheme.tooltip} />
  </>
);

export function TrendArea({ data, x, series, h = 220 }: { data: Row[]; x: string; series: S[]; h?: number }) {
  return (
    <ResponsiveContainer width="100%" height={h}>
      <AreaChart data={data}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`g-${s.key}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {common(x)}
        {series.map((s) => <Area key={s.key} type="monotone" dataKey={s.key} name={s.name ?? s.key} stroke={s.color} strokeWidth={2} fill={`url(#g-${s.key})`} />)}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function TrendLine({ data, x, series, h = 220 }: { data: Row[]; x: string; series: S[]; h?: number }) {
  return (
    <ResponsiveContainer width="100%" height={h}>
      <LineChart data={data}>
        {common(x)}
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {series.map((s) => <Line key={s.key} type="monotone" dataKey={s.key} name={s.name ?? s.key} stroke={s.color} strokeWidth={2} dot={false} />)}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function Bars({ data, x, series, h = 220, stacked }: { data: Row[]; x: string; series: S[]; h?: number; stacked?: boolean | undefined }) {
  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart data={data}>
        {common(x)}
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {series.map((s) => <Bar key={s.key} dataKey={s.key} name={s.name ?? s.key} fill={s.color} stackId={stacked ? "a" : undefined} radius={stacked ? 0 : [2, 2, 0, 0]} />)}
      </BarChart>
    </ResponsiveContainer>
  );
}
