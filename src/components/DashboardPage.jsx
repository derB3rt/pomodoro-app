import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { RefreshCw, Loader2, Clock, Target, Flame } from 'lucide-react'
import { useStats } from '../hooks/useStats'

const TOMATO = '#D85A30'
const TOMATO_LIGHT = '#3d1208'

const RANGES = [
  { label: '7 Tage', value: 7 },
  { label: '14 Tage', value: 14 },
  { label: '30 Tage', value: 30 },
]

function StatCard({ icon: Icon, value, label, accent }) {
  return (
    <div className="bg-stone-50 dark:bg-stone-800/60 rounded-xl p-4 border border-stone-100 dark:border-stone-700 flex flex-col gap-1">
      <Icon size={16} className="text-stone-400" />
      <p className="text-3xl font-medium text-stone-800 dark:text-stone-100 mt-1"
        style={accent ? { color: TOMATO } : {}}>
        {value}
      </p>
      <p className="text-xs text-stone-400">{label}</p>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-stone-500 mb-0.5">{label}</p>
      <p className="font-medium text-stone-800 dark:text-stone-100">{payload[0].value} 🍅</p>
    </div>
  )
}

export default function DashboardPage() {
  const [days, setDays] = useState(14)
  const stats = useStats(days)
  const { loading, load, todayCount, totalCount, totalMins, chartDays, topTasks } = stats

  useEffect(() => { load() }, [load])

  const maxBar = Math.max(...chartDays.map(d => d.count), 1)
  const todayKey = new Date().toISOString().slice(0, 10)
  const maxTaskCount = topTasks.length > 0 ? topTasks[0].count : 1

  // X-Achsen-Label: bei 30 Tagen weniger Labels zeigen
  const tickInterval = days === 30 ? 4 : days === 14 ? 1 : 0

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium text-stone-700 dark:text-stone-300">Verlauf</h2>
        <div className="flex items-center gap-2">
          {/* Zeitraum-Auswahl */}
          <div className="flex gap-1 bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5 border border-stone-200 dark:border-stone-700">
            {RANGES.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setDays(value)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  days === value
                    ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 shadow-sm'
                    : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
            aria-label="Aktualisieren"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          </button>
        </div>
      </div>

      {/* Stat-Karten */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Target} value={todayCount} label="Heute" accent />
        <StatCard icon={Flame} value={totalCount} label={`${days} Tage`} />
        <StatCard icon={Clock} value={`${Math.round(totalMins / 60)}h`} label="Fokuszeit" />
      </div>

      {/* Balken-Diagramm */}
      <div className="bg-stone-50 dark:bg-stone-800/60 rounded-xl p-4 border border-stone-100 dark:border-stone-700">
        {loading ? (
          <div className="h-36 flex items-center justify-center">
            <Loader2 size={20} className="animate-spin text-tomato-400" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={chartDays} barCategoryGap="30%">
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#a8a29e' }}
                axisLine={false}
                tickLine={false}
                interval={tickInterval}
              />
              <YAxis hide allowDecimals={false} domain={[0, maxBar + 1]} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: TOMATO_LIGHT, radius: 4 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={28}>
                {chartDays.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={entry.key === todayKey ? TOMATO : '#44403c'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top-Aufgaben */}
      {topTasks.length > 0 && (
        <div className="bg-stone-50 dark:bg-stone-800/60 rounded-xl p-4 border border-stone-100 dark:border-stone-700">
          <p className="text-xs text-stone-400 mb-3">Top-Aufgaben</p>
          <div className="space-y-3">
            {topTasks.map(({ name, count }) => (
              <div key={name} className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-stone-600 dark:text-stone-300 truncate">{name}</span>
                  <span className="text-xs font-mono text-stone-400 shrink-0 ml-2">{count}×</span>
                </div>
                <div className="h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-tomato-500 transition-all duration-500"
                    style={{ width: `${Math.round((count / maxTaskCount) * 80) + 5}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalCount === 0 && !loading && (
        <p className="text-center text-sm text-stone-400 py-6">
          Noch keine Daten – starte deinen ersten Pomodoro! 🍅
        </p>
      )}
    </div>
  )
}
