import { useState, useEffect } from 'react'
import { Timer, BarChart2, Moon, Sun } from 'lucide-react'
import TimerPage from './components/TimerPage'
import DashboardPage from './components/DashboardPage'
import { usePomodoro } from './hooks/usePomodoro'


export default function App() {
  const [tab, setTab] = useState('timer')
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  const pom = usePomodoro()
  

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  // Seite neu laden wenn auf Dashboard gewechselt wird
  const handleTabChange = (t) => {
    setTab(t)
    
  }

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-stone-950/80 backdrop-blur border-b border-stone-100 dark:border-stone-800">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none">🍅</span>
            <span className="font-medium text-sm tracking-tight">Pomodoro</span>
          </div>

          {/* Tab-Navigation */}
          <nav className="flex gap-1 bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5">
            {[
              { key: 'timer', Icon: Timer, label: 'Timer' },
              { key: 'dashboard', Icon: BarChart2, label: 'Stats' },
            ].map(({ key, Icon, label }) => (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  tab === key
                    ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 shadow-sm'
                    : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </nav>

          {/* Dark-Mode-Toggle */}
          <button
            onClick={() => setDark(d => !d)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
            aria-label="Farbschema wechseln"
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      {/* Content */}
      <main>
        {tab === 'timer'
          ? <TimerPage pom={pom} />
          : <DashboardPage />
        }
      </main>
    </div>
  )
}
