import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { decryptText } from '../lib/crypto'

function getDeviceId() {
  return localStorage.getItem('pom_device_id') ?? ''
}

export function useStats(days = 14) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const since = new Date()
    since.setDate(since.getDate() - (days - 1))
    since.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('pomodoros')
      .select('completed_at, task, duration_mins')
      .eq('device_id', getDeviceId())
      .gte('completed_at', since.toISOString())
      .order('completed_at', { ascending: true })

    if (!error && data) {
      // Aufgaben entschlüsseln
      const decrypted = await Promise.all(
        data.map(async row => ({
          ...row,
          task: await decryptText(row.task),
        }))
      )
      setRows(decrypted)
    }
    setLoading(false)
  }, [days])

  useEffect(() => { load() }, [load])

  const today = new Date().toISOString().slice(0, 10)
  const todayCount = rows.filter(r => r.completed_at.startsWith(today)).length
  const totalCount = rows.length
  const totalMins = rows.reduce((s, r) => s + (r.duration_mins ?? 25), 0)

  // Balkendiagramm-Daten für gewählten Zeitraum
  const chartDays = Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    const key = d.toISOString().slice(0, 10)
    const label = days <= 14
      ? d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric' })
      : d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
    const count = rows.filter(r => r.completed_at.startsWith(key)).length
    return { key, label, count }
  })

  // Top-Aufgaben
  const taskMap = {}
  rows.forEach(r => {
    const t = r.task || '—'
    taskMap[t] = (taskMap[t] ?? 0) + 1
  })
  const topTasks = Object.entries(taskMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  return { loading, load, todayCount, totalCount, totalMins, chartDays, topTasks }
}
