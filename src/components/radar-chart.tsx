'use client'

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { CategoryData } from '@/types'

interface RadarDataPoint {
  category: string
  score: number
  fullMark: number
  color: string
}

interface WheelRadarProps {
  categories: CategoryData[]
  values: Record<string, number>
  height?: number
  showValues?: boolean
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-xl shadow-lg border border-white/50 text-sm">
      <p className="font-semibold text-[#2d1b3d]">{data.category}</p>
      <p className="text-[#7c3aed] font-bold text-lg">{data.score}/10</p>
    </div>
  )
}

/** Dot customizado do Recharts — renderiza bolinha + nota no lugar certo */
function CustomRadarDot(props: any) {
  const { cx, cy, payload } = props
  if (!payload || cx === undefined || cy === undefined) return null

  const color = payload.color ?? '#7c3aed'
  return (
    <g>
      {/* Glow */}
      <circle cx={cx} cy={cy} r={16} fill={color} fillOpacity={0.12} />
      {/* Círculo sólido */}
      <circle cx={cx} cy={cy} r={7} fill={color} stroke="#fff" strokeWidth={2} />
      {/* Valor numérico acima */}
      <text
        x={cx}
        y={cy - 14}
        textAnchor="middle"
        fill="#1a0f26"
        fontSize={12}
        fontWeight={700}
        fontFamily="system-ui, sans-serif"
      >
        {payload.score}
      </text>
    </g>
  )
}

export function WheelRadar({ categories, values, height = 420, showValues = true }: WheelRadarProps) {
  const data: RadarDataPoint[] = categories.map((cat) => ({
    category: cat.label,
    score: values[cat.id] ?? 0,
    fullMark: 10,
    color: cat.color,
  }))

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="65%">
          <PolarGrid stroke="rgba(100,80,120,0.15)" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fontSize: 11, fill: '#2d1b3d', fontWeight: 600 }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tickCount={6}
            tick={{ fontSize: 10, fill: '#8a7a9a' }}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name="Roda da Vida"
            dataKey="score"
            stroke="#7c3aed"
            fill="#7c3aed"
            fillOpacity={0.15}
            strokeWidth={2.5}
            dot={showValues ? <CustomRadarDot /> : false}
            activeDot={{ r: 7, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
