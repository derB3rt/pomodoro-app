import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function getDeviceId() {
  return localStorage.getItem('pom_device_id') ?? ''
}

export function useStats() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const since = new Date()
    since.setDate(since.getDate() - 29)
    since.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('pomodoros')
      .select('completed_at, task, duration_mins')
      .eq('device_id', getDeviceId())
      .gte('completed_at', since.toISOString())
      .order('completed_at', { ascending: true })

    if (!error && data) setRows(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Aggregationen
  const today = new Date().toISOString().slice(0, 10)
  const todayCount = rows.filter(r => r.completed_at.startsWith(today)).length
  const totalCount = rows.length
  const totalMins = rows.reduce((s, r) => s + (r.duration_mins ?? 25), 0)

  // Letzte 14 Tage für Balkendiagramm
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    const key = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric' })
    const count = rows.filter(r => r.completed_at.startsWith(key)).length
    return { key, label, count }
  })

  // Top-Aufgaben (letzte 30 Tage)
  const taskMap = {}
  rows.forEach(r => {
    const t = r.task || '—'
    taskMap[t] = (taskMap[t] ?? 0) + 1
  })
  const topTasks = Object.entries(taskMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  return { loading, load, todayCount, totalCount, totalMins, last14, topTasks }
}
