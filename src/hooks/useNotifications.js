import { useEffect, useRef, useCallback } from 'react'

// Glocken-Ton via Web Audio API – kein externes File nötig
function playDing(type = 'focus') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const notes = type === 'focus'
      ? [{ f: 880, t: 0, d: 0.6, g: 0.35 }, { f: 1100, t: 0.15, d: 0.5, g: 0.25 }, { f: 660, t: 0.3, d: 0.8, g: 0.2 }]
      : [{ f: 528, t: 0, d: 0.5, g: 0.28 }, { f: 660, t: 0.2, d: 0.4, g: 0.2 }]

    notes.forEach(({ f, t, d, g }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, ctx.currentTime + t)
      gain.gain.setValueAtTime(0, ctx.currentTime + t)
      gain.gain.linearRampToValueAtTime(g, ctx.currentTime + t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + d)
      osc.start(ctx.currentTime + t)
      osc.stop(ctx.currentTime + t + d)
    })
    setTimeout(() => ctx.close(), 2500)
  } catch (e) { /* kein Audio-Support */ }
}

async function sendNotification(title, body) {
  if (!('Notification' in window)) return
  if (Notification.permission === 'default') {
    await Notification.requestPermission()
  }
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/pomodoro-app/icons/icon-192.png',
      silent: true,
    })
  }
}

export function useNotifications() {
  const blinkRef = useRef(null)

  useEffect(() => {
    // Notification-Berechtigung vorab anfragen
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    return () => {
      if (blinkRef.current) clearInterval(blinkRef.current)
      document.title = 'Pomodoro'
    }
  }, [])

  const stopBlink = useCallback(() => {
    if (blinkRef.current) {
      clearInterval(blinkRef.current)
      blinkRef.current = null
    }
    document.title = 'Pomodoro'
  }, [])

  const notify = useCallback((mode) => {
    const isFocus = mode === 'focus'
    const title = isFocus ? '🍅 Fokuszeit beendet!' : '▶️ Pause vorbei!'
    const body  = isFocus ? 'Kurze Pause verdient – gut gemacht!' : 'Bereit für die nächste Fokusrunde?'

    // 1. Sound
    playDing(isFocus ? 'focus' : 'break')

    // 2. Browser-Notification
    sendNotification(title, body)

    // 3. Tab-Titel blinken (stoppt nach 10 Sekunden oder beim nächsten Start)
    stopBlink()
    let flash = false
    blinkRef.current = setInterval(() => {
      document.title = flash ? 'Pomodoro' : title
      flash = !flash
    }, 800)
    setTimeout(stopBlink, 10_000)
  }, [stopBlink])

  return { notify, stopBlink }
}
