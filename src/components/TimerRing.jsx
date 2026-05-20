import { MODES } from '../hooks/usePomodoro'

const CIRCUMFERENCE = 2 * Math.PI * 95

export default function TimerRing({ mode, displayTime, progress, running }) {
  const color = MODES[mode].color
  const dashOffset = progress * CIRCUMFERENCE

  return (
    <div className="relative w-56 h-56 mx-auto">
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        style={{ transform: 'rotate(-90deg)' }}
        aria-hidden="true"
      >
        {/* Hintergrund-Ring */}
        <circle
          cx="100" cy="100" r="95"
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          className="text-stone-200 dark:text-stone-700"
        />
        {/* Fortschritts-Ring */}
        <circle
          cx="100" cy="100" r="95"
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.5s linear, stroke 0.3s' }}
        />
      </svg>

      {/* Inhalt zentriert */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <span
          className="font-mono text-5xl font-medium tracking-tight tabular-nums"
          style={{ color: running ? color : undefined }}
        >
          {displayTime}
        </span>
        <span className="text-xs uppercase tracking-widest text-stone-400 font-sans">
          {MODES[mode].label}
        </span>
      </div>
    </div>
  )
}
