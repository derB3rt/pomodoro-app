import { Play, Pause, RotateCcw, SkipForward, Loader2 } from 'lucide-react'
import TimerRing from './TimerRing'
import { MODES } from '../hooks/usePomodoro'

const MODE_STYLES = {
  focus: 'bg-tomato-500 hover:bg-tomato-600 text-white',
  short: 'bg-sage-500 hover:bg-sage-700 text-white',
  long:  'bg-sky-500 hover:bg-sky-600 text-white',
}

const MODE_TAB_ACTIVE = {
  focus: 'bg-tomato-500 text-white shadow',
  short: 'bg-sage-500 text-white shadow',
  long:  'bg-sky-500 text-white shadow',
}

export default function TimerPage({ pom }) {
  const {
    mode, switchMode,
    displayTime, progress,
    running, togglePlay, reset, skip,
    pomInCycle, sessionCount,
    task, setTask,
    saving,
  } = pom

  return (
    <div className="flex flex-col items-center gap-7 py-8 px-4 max-w-sm mx-auto">

      {/* Mode-Tabs */}
      <div className="flex gap-1 bg-stone-100 dark:bg-stone-800 rounded-xl p-1 border border-stone-200 dark:border-stone-700">
        {Object.entries(MODES).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === key
                ? MODE_TAB_ACTIVE[key]
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Ring */}
      <TimerRing
        mode={mode}
        displayTime={displayTime}
        progress={progress}
        running={running}
      />

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="w-10 h-10 rounded-full border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
          aria-label="Zurücksetzen"
        >
          <RotateCcw size={15} />
        </button>

        <button
          onClick={togglePlay}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 ${MODE_STYLES[mode]}`}
          aria-label={running ? 'Pausieren' : 'Starten'}
        >
          {running ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
        </button>

        <button
          onClick={skip}
          className="w-10 h-10 rounded-full border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
          aria-label="Überspringen"
        >
          <SkipForward size={15} />
        </button>
      </div>

      {/* Tomaten-Zyklus */}
      <div className="flex gap-2 items-center">
        {Array.from({ length: 4 }, (_, i) => (
          <span
            key={i}
            className={`text-xl transition-all duration-300 ${
              i < pomInCycle ? 'opacity-100' : 'opacity-20'
            }`}
          >
            🍅
          </span>
        ))}
        <span className="text-xs text-stone-400 ml-1 font-mono">×{Math.floor(sessionCount / 4)}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <div className="bg-stone-50 dark:bg-stone-800/60 rounded-xl p-3 border border-stone-100 dark:border-stone-700">
          <p className="text-2xl font-medium text-stone-800 dark:text-stone-100">{sessionCount}</p>
          <p className="text-xs text-stone-400 mt-0.5">Session</p>
        </div>
        <div className="bg-stone-50 dark:bg-stone-800/60 rounded-xl p-3 border border-stone-100 dark:border-stone-700">
          <p className="text-2xl font-medium text-stone-800 dark:text-stone-100">
            {saving ? <Loader2 size={20} className="animate-spin text-tomato-400" /> : `${sessionCount * 25}m`}
          </p>
          <p className="text-xs text-stone-400 mt-0.5">Fokuszeit</p>
        </div>
      </div>

      {/* Aufgaben-Input */}
      <div className="w-full">
        <label className="block text-xs text-stone-400 mb-1.5 pl-1">Aktuelle Aufgabe</label>
        <input
          type="text"
          value={task}
          onChange={e => setTask(e.target.value)}
          placeholder="Woran arbeitest du gerade?"
          maxLength={80}
          className="w-full px-3 py-2.5 text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-tomato-400/40 focus:border-tomato-400 transition-all text-stone-800 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-600"
        />
      </div>
    </div>
  )
}
