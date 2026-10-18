
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { chartTheme } from "./kit";

type Row = Record<string, string | number | null | undefined>;

type S = {
  key: string;
  color: string;
  name?: string;
};

type ChartProps = {
  data: Row[];
  x: string;
  series: S[];
  h?: number;
  unit?: string;
};

type BarProps = ChartProps & {
  stacked?: boolean;
};

type MaxSummaryProps = ChartProps & {
  stacked?: boolean;
};

type HoverState = {
  label: string;
  values: {
    name: string;
    value: number;
    color: string;
  }[];
  x: number;
  y: number;
};

function numericValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function formatValue(value: number, unit = "") {
  return `${Number(value.toFixed(2)).toLocaleString()}${
    unit ? ` ${unit}` : ""
  }`;
}

function formatLabel(value: unknown) {
  if (value == null || value === "") return "Unknown time";

  const text = String(value);

  if (/^\d{1,2}:\d{2}$/.test(text)) return text;

  const date = new Date(text);

  if (!Number.isNaN(date.getTime()) && /[-T]/.test(text)) {
    return date.toLocaleString();
  }

  return text;
}

function useChartHover(series: S[], unit: string) {
  const [hover, setHover] = useState<HoverState | null>(null);

  function handleMove(state: any) {
    if (!state || !Array.isArray(state.activePayload)) {
      setHover(null);
      return;
    }

    const values = state.activePayload
      .map((entry: any) => {
        const value = numericValue(entry.value);
        if (value === null) return null;

        const matchingSeries = series.find(
          (item) => item.key === entry.dataKey
        );

        return {
          name: entry.name ?? matchingSeries?.name ?? entry.dataKey ?? "Reading",
          value,
          color: entry.color ?? matchingSeries?.color ?? "#64748b",
        };
      })
      .filter((entry: HoverState["values"][number] | null): entry is HoverState["values"][number] => entry !== null);

    if (!values.length) {
      setHover(null);
      return;
    }

    setHover({
      label: formatLabel(state.activeLabel),
      values,
      x: Number(state.chartX ?? 0),
      y: Number(state.chartY ?? 0),
    });
  }

  return { hover, handleMove, clearHover: () => setHover(null), unit };
}

function HoverPanel({
  hover,
  unit,
}: {
  hover: HoverState | null;
  unit: string;
}) {
  if (!hover) return null;

  return (
    <div
      className="pointer-events-none absolute z-50 w-max max-w-[240px] rounded-xl border p-3 shadow-xl"
      style={{
        left: `clamp(0px, ${hover.x + 12}px, calc(100% - 245px))`,
        top: `clamp(0px, ${hover.y + 12}px, calc(100% - 110px))`,
        background: "var(--card)",
        color: "var(--foreground)",
        borderColor: "var(--border)",
      }}
    >
      <p className="mb-2 text-xs font-semibold">
        {hover.label}
      </p>

      {hover.values.map((item, index) => (
        <div
          key={`${item.name}-${index}`}
          className="flex items-center justify-between gap-4 py-1 text-sm"
        >
          <span className="flex items-center gap-2">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">{item.name}</span>
          </span>
          <strong className="font-mono">
            {formatValue(item.value, unit)}
          </strong>
        </div>
      ))}
    </div>
  );
}

function ChartAxes({ x }: { x: string }) {
  return (
    <>
      <CartesianGrid
        stroke={chartTheme.grid}
        strokeDasharray="3 3"
        vertical={false}
      />
      <XAxis
        dataKey={x}
        tick={chartTheme.axis}
        axisLine={false}
        tickLine={false}
      />
      <YAxis
        tick={chartTheme.axis}
        axisLine={false}
        tickLine={false}
        width={48}
      />
    </>
  );
}

export function MaxSummary({
  data,
  x,
  series,
  unit = "",
  stacked = false,
}: MaxSummaryProps) {
  let maximum: number | null = null;
  let maximumLabel: unknown = null;

  for (const row of data) {
    const values = series
      .map((item) => numericValue(row[item.key]))
      .filter((value): value is number => value !== null);

    if (!values.length) continue;

    const total = stacked
      ? values.reduce((sum, value) => sum + value, 0)
      : Math.max(...values);

    if (maximum === null || total > maximum) {
      maximum = total;
      maximumLabel = row[x];
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-md border bg-surface/60 p-3">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {stacked ? "Maximum combined total" : "Maximum reading"}
        </p>
        <p className="mt-1 font-display text-2xl font-semibold tracking-tight">
          {maximum === null ? "—" : formatValue(maximum, unit)}
        </p>
      </div>
      <div className="text-right">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Recorded at
        </p>
        <p className="mt-1 text-sm font-medium">
          {maximum === null ? "No data" : formatLabel(maximumLabel)}
        </p>
      </div>
    </div>
  );
}

export function TrendArea({
  data,
  x,
  series,
  h = 220,
  unit = "",
}: ChartProps) {
  const { hover, handleMove, clearHover } = useChartHover(series, unit);

  return (
    <div className="relative w-full" style={{ height: h }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          onMouseMove={handleMove}
          onMouseLeave={clearHover}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            {series.map((s) => (
              <linearGradient
                key={s.key}
                id={`g-${s.key}`}
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <ChartAxes x={x} />
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name ?? s.key}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#g-${s.key})`}
              activeDot={{ r: 6 }}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <HoverPanel hover={hover} unit={unit} />
    </div>
  );
}

export function TrendLine({
  data,
  x,
  series,
  h = 220,
  unit = "",
}: ChartProps) {
  const { hover, handleMove, clearHover } = useChartHover(series, unit);

  return (
    <div className="relative w-full" style={{ height: h }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          onMouseMove={handleMove}
          onMouseLeave={clearHover}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <ChartAxes x={x} />
          {series.length > 1 && (
            <Legend wrapperStyle={{ fontSize: 11 }} />
          )}
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name ?? s.key}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <HoverPanel hover={hover} unit={unit} />
    </div>
  );
}

export function Bars({
  data,
  x,
  series,
  h = 220,
  stacked,
  unit = "",
}: BarProps) {
  const { hover, handleMove, clearHover } = useChartHover(series, unit);

  return (
    <div className="relative w-full" style={{ height: h }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          onMouseMove={handleMove}
          onMouseLeave={clearHover}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <ChartAxes x={x} />
          {series.length > 1 && (
            <Legend wrapperStyle={{ fontSize: 11 }} />
          )}
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name ?? s.key}
              fill={s.color}
              activeBar={{ stroke: "var(--foreground)", strokeWidth: 1 }}
              {...(stacked ? { stackId: "a" } : {})}
              radius={stacked ? 0 : [3, 3, 0, 0]}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <HoverPanel hover={hover} unit={unit} />
    </div>
  );
}
