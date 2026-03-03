import { useState, useEffect, useRef } from 'react'

function getRiskScore({ filesChanged, linesAdded, hoursSinceLastDeploy, isFridayAfternoon }) {
  if (isFridayAfternoon) return { score: 97, label: 'DANGER ZONE', emoji: '💀' }

  let score = 0

  // Files changed: 0-40 points
  if (filesChanged <= 1)       score += 5
  else if (filesChanged <= 5)  score += 15
  else if (filesChanged <= 15) score += 28
  else if (filesChanged <= 30) score += 36
  else                          score += 40

  // Lines added: 0-35 points
  if (linesAdded <= 10)        score += 3
  else if (linesAdded <= 50)   score += 10
  else if (linesAdded <= 200)  score += 20
  else if (linesAdded <= 500)  score += 28
  else                          score += 35

  // Hours since last deploy: 0-25 points
  if (hoursSinceLastDeploy < 1)        score += 25
  else if (hoursSinceLastDeploy <= 6)  score += 5
  else if (hoursSinceLastDeploy <= 24) score += 10
  else if (hoursSinceLastDeploy <= 72) score += 16
  else                                  score += 20

  return {
    score: Math.min(score, 99),
    label: score < 30 ? 'LOW RISK' : score < 60 ? 'MODERATE' : score < 80 ? 'HIGH RISK' : 'DANGER ZONE',
    emoji: score < 30 ? '✅' : score < 60 ? '⚠️' : score < 80 ? '🔥' : '💀',
  }
}

function getBarColor(score, isFriday) {
  if (isFriday) return 'rainbow-bg'
  if (score < 30) return 'bg-emerald-500'
  if (score < 60) return 'bg-amber-400'
  if (score < 80) return 'bg-orange-500'
  return 'bg-red-600'
}

function getTextColor(score, isFriday) {
  if (isFriday) return 'text-pink-400'
  if (score < 30) return 'text-emerald-400'
  if (score < 60) return 'text-amber-400'
  if (score < 80) return 'text-orange-400'
  return 'text-red-400'
}

function Slider({ label, value, onChange, min, max, step = 1, unit = '' }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <span className="text-lg font-bold text-white tabular-nums">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #818cf8 0%, #a78bfa ${pct}%, rgba(255,255,255,0.1) ${pct}%, rgba(255,255,255,0.1) 100%)`,
        }}
      />
      <div className="flex justify-between text-xs text-slate-500">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}

export default function App() {
  const [filesChanged, setFilesChanged] = useState(5)
  const [linesAdded, setLinesAdded]     = useState(50)
  const [hoursSince, setHoursSince]     = useState(24)
  const [isFriday, setIsFriday]         = useState(false)
  const [barKey, setBarKey]             = useState(0)
  const prevScore                        = useRef(null)

  const { score, label, emoji } = getRiskScore({
    filesChanged,
    linesAdded,
    hoursSinceLastDeploy: hoursSince,
    isFridayAfternoon: isFriday,
  })

  useEffect(() => {
    if (prevScore.current !== score) {
      setBarKey(k => k + 1)
      prevScore.current = score
    }
  }, [score])

  const barColor  = getBarColor(score, isFriday)
  const textColor = getTextColor(score, isFriday)
  const isShaking = score >= 80 || isFriday

  const verdict = isFriday
    ? "It's Friday... but hey, YOLO! 🚀"
    : score < 30
    ? "Ship it! You're good to go. 🟢"
    : score < 60
    ? "Proceed with caution. 🟡"
    : score < 80
    ? "Are you sure about this? 🟠"
    : "Step away from the terminal. 🔴"

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#0a0a0f', fontFamily: "'Inter', 'system-ui', sans-serif" }}
    >
      {/* Ambient background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-spin-slow"
          style={{ background: 'rgba(109,40,217,0.18)' }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-spin-slow"
          style={{ background: 'rgba(67,56,202,0.18)', animationDirection: 'reverse' }}
        />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8 animate-float">
          <div className="text-6xl mb-3">🚀</div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Should I{' '}
            <span
              style={{
                background: 'linear-gradient(to right, #a78bfa, #818cf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Deploy?
            </span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            The calculator your team lead doesn't want you to have.
          </p>
        </div>

        {/* Main card */}
        <div
          key={isShaking ? `shake-${score}` : 'still'}
          className={`glass rounded-3xl p-8 shadow-2xl ${isShaking ? 'animate-shake' : ''}`}
        >
          {/* Inputs */}
          <div className="space-y-6 mb-8">
            <Slider label="Files Changed"             value={filesChanged} onChange={setFilesChanged} min={0} max={100} />
            <Slider label="Lines Added"               value={linesAdded}   onChange={setLinesAdded}   min={0} max={2000} step={10} />
            <Slider label="Hours Since Last Deploy"   value={hoursSince}   onChange={setHoursSince}   min={0} max={168} unit="h" />

            {/* Friday checkbox */}
            <label
              className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 select-none"
              style={isFriday
                ? { background: 'linear-gradient(135deg,#ff0080,#ff8c00,#40e0d0,#7b2ff7)', boxShadow: '0 8px 32px rgba(255,0,128,0.3)' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="relative flex-shrink-0">
                <input
                  type="checkbox"
                  checked={isFriday}
                  onChange={e => setIsFriday(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200"
                  style={isFriday
                    ? { background: 'rgba(255,255,255,0.3)', border: '2px solid rgba(255,255,255,0.6)' }
                    : { background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)' }}
                >
                  {isFriday && <span className="text-white text-sm font-bold">✓</span>}
                </div>
              </div>
              <div>
                <div className="font-semibold text-sm text-white">It's Friday after 3 PM ☠️</div>
                <div className="text-xs mt-0.5 text-white/70">May God have mercy on your soul</div>
              </div>
            </label>
          </div>

          {/* Risk Score */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Risk Score</span>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                  style={isFriday
                    ? { background: 'rgba(236,72,153,0.2)', color: '#f9a8d4' }
                    : score < 30
                    ? { background: 'rgba(16,185,129,0.2)', color: '#6ee7b7' }
                    : score < 60
                    ? { background: 'rgba(245,158,11,0.2)', color: '#fcd34d' }
                    : score < 80
                    ? { background: 'rgba(249,115,22,0.2)', color: '#fdba74' }
                    : { background: 'rgba(239,68,68,0.2)',  color: '#fca5a5' }}
                >
                  {label}
                </span>
                <span className="text-lg">{emoji}</span>
              </div>
            </div>

            {/* Big score number */}
            <div className={`text-7xl font-black tabular-nums text-center py-2 ${textColor} transition-colors duration-500`}>
              {score}
              <span className="text-2xl text-slate-500 font-normal">/100</span>
            </div>

            {/* Animated bar */}
            <div
              className="h-4 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div
                key={barKey}
                className={`h-full rounded-full ${barColor} animate-bar-fill transition-all duration-500`}
                style={{ width: `${score}%` }}
              />
            </div>

            {/* Verdict */}
            <div
              className={`mt-4 p-4 rounded-2xl text-center transition-all duration-500 ${
                (score >= 80 || isFriday) ? 'animate-pulse-glow' : ''
              }`}
              style={isFriday
                ? { background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.3)' }
                : score < 30
                ? { background: 'rgba(16,185,129,0.1)',  border: '1px solid rgba(16,185,129,0.3)' }
                : score < 60
                ? { background: 'rgba(245,158,11,0.1)',  border: '1px solid rgba(245,158,11,0.3)' }
                : score < 80
                ? { background: 'rgba(249,115,22,0.1)',  border: '1px solid rgba(249,115,22,0.3)' }
                : { background: 'rgba(239,68,68,0.1)',   border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <p className={`text-lg font-bold ${textColor}`}>{verdict}</p>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          No engineers were harmed making this calculator. No guarantees about your prod env.
        </p>
      </div>
    </div>
  )
}
