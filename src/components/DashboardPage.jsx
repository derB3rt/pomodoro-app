import { useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { RefreshCw, Loader2, Clock, Target, Flame } from 'lucide-react'

const TOMATO = '#D85A30'
const TOMATO_LIGHT = '#FAECE7'

function StatCard({ icon: Icon, value, label, accent }) {
  return (
    <div className="bg-stone-50 dark:bg-stone-800/60 rounded-xl p-4 border border-stone-100 dark:border-stone-700 flex flex-col gap-1">
      <Icon size={16} className="text-stone-400" />
      <p className="text-3xl font-medium text-stone-800 dark:text-stone-100 mt-1" style={accent ? { color: TOMATO } : {}}>
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

export default function DashboardPage({ stats }) {
  const { loading, load, todayCount, totalCount, totalMins, last14, topTasks } = stats

  useEffect(() => { load() }, [load])

  const maxBar = Math.max(...last14.map(d => d.count), 1)
  const todayKey = new Date().toISOString().slice(0, 10)

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium text-stone-700 dark:text-stone-300">Verlauf (30 Tage)</h2>
        <button
          onClick={load}
          disabled={loading}
          className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
          aria-label="Aktualisieren"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
        </button>
      </div>

      {/* Stat-Karten */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Target} value={todayCount} label="Heute" accent />
        <StatCard icon={Flame} value={totalCount} label="Gesamt" />
        <StatCard icon={Clock} value={`${Math.round(totalMins / 60)}h`} label="Fokuszeit" />
      </div>

      {/* Balken-Diagramm – letzte 14 Tage */}
      <div className="bg-stone-50 dark:bg-stone-800/60 rounded-xl p-4 border border-stone-100 dark:border-stone-700">
        <p className="text-xs text-stone-400 mb-3">Letzte 14 Tage</p>
        {loading ? (
          <div className="h-36 flex items-center justify-center">
            <Loader2 size={20} className="animate-spin text-tomato-400" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={last14} barCategoryGap="30%">
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#a8a29e' }}
                axisLine={false}
                tickLine={false}
                interval={1}
              />
              <YAxis hide allowDecimals={false} domain={[0, maxBar + 1]} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: TOMATO_LIGHT, radius: 4 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={28}>
                {last14.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={entry.key === todayKey ? TOMATO : '#e7e5e4'}
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
          <div className="space-y-2">
            {topTasks.map(({ name, count }) => (
              <div key={name} className="flex items-center gap-2">
                <div
                  className="h-1.5 rounded-full bg-tomato-400/80 shrink-0"
                  style={{ width: `${Math.round((count / topTasks[0].count) * 100)}%`, minWidth: 4 }}
                />
                <span className="text-xs text-stone-600 dark:text-stone-300 truncate flex-1">{name}</span>
                <span className="text-xs font-mono text-stone-400 shrink-0">{count}×</span>
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
