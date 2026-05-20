import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useNotifications } from './useNotifications'
import { encryptText } from '../lib/crypto'

export const MODES = {
  focus: { label: 'Fokus', mins: 25, color: '#D85A30' },
  short: { label: 'Kurze Pause', mins: 5,  color: '#6B8F5E' },
  long:  { label: 'Lange Pause', mins: 15, color: '#4A90D9' },
}

const CIRCUMFERENCE = 2 * Math.PI * 95

function getDeviceId() {
  let id = localStorage.getItem('pom_device_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('pom_device_id', id)
  }
  return id
}

export function usePomodoro() {
  const [mode, setModeState] = useState('focus')
  const [remainSecs, setRemainSecs] = useState(MODES.focus.mins * 60)
  const [totalSecs, setTotalSecs] = useState(MODES.focus.mins * 60)
  const [running, setRunning] = useState(false)
  const [pomInCycle, setPomInCycle] = useState(0)
  const [sessionCount, setSessionCount] = useState(0)
  const [task, setTask] = useState('')
  const [saving, setSaving] = useState(false)

  const intervalRef = useRef(null)
  const deviceId = useRef(getDeviceId())
  const { notify, stopBlink } = useNotifications()

  const stop = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
  }, [])

  const switchMode = useCallback((m) => {
    stop()
    setRunning(false)
    setModeState(m)
    const secs = MODES[m].mins * 60
    setTotalSecs(secs)
    setRemainSecs(secs)
  }, [stop])

  const savePomodoro = useCallback(async (taskLabel) => {
    setSaving(true)
    try {
      await supabase.from('pomodoros').insert({
        device_id: deviceId.current,
        task: await encryptText(taskLabel) || null,
        duration_mins: MODES.focus.mins,
        completed_at: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Fehler beim Speichern:', err)
    } finally {
      setSaving(false)
    }
  }, [])

  const onFocusComplete = useCallback(async (currentTask) => {
    notify('focus')
    await savePomodoro(currentTask)
    setSessionCount(prev => prev + 1)
    setPomInCycle(prev => {
      const next = (prev + 1) % 4
      setTimeout(() => switchMode(next === 0 ? 'long' : 'short'), 400)
      return next
    })
  }, [notify, savePomodoro, switchMode])

  const onBreakComplete = useCallback(() => {
    notify('break')
    setTimeout(() => switchMode('focus'), 400)
  }, [notify, switchMode])

  // Timer stoppen → Blinken stoppen
  const togglePlay = useCallback(() => {
    setRunning(r => {
      if (!r) stopBlink() // beim Starten Blinken stoppen
      return !r
    })
  }, [stopBlink])

  // tick
  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setRemainSecs(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)
          if (mode === 'focus') onFocusComplete(task)
          else onBreakComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, mode, task, onFocusComplete, onBreakComplete])

  const reset = useCallback(() => {
    stop()
    stopBlink()
    setRunning(false)
    const secs = MODES[mode].mins * 60
    setTotalSecs(secs)
    setRemainSecs(secs)
  }, [mode, stop, stopBlink])

  const skip = useCallback(() => {
    stop()
    stopBlink()
    setRunning(false)
    if (mode === 'focus') switchMode('short')
    else switchMode('focus')
  }, [mode, stop, stopBlink, switchMode])

  // Tab-Titel zeigt laufenden Timer
  useEffect(() => {
    if (running) {
      const mins = Math.floor(remainSecs / 60)
      const secs = remainSecs % 60
      document.title = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')} – Pomodoro`
    } else if (remainSecs === MODES[mode].mins * 60) {
      document.title = 'Pomodoro'
    }
  }, [running, remainSecs, mode])

  const progress = totalSecs > 0 ? (totalSecs - remainSecs) / totalSecs : 0
  const dashOffset = progress * CIRCUMFERENCE
  const mins = Math.floor(remainSecs / 60)
  const secs = remainSecs % 60
  const displayTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  return {
    mode, switchMode,
    displayTime, progress, dashOffset,
    running, togglePlay, reset, skip,
    pomInCycle, sessionCount,
    task, setTask,
    saving,
    CIRCUMFERENCE,
  }
}
