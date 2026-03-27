import { useState, useEffect } from "react"

const TODAY = new Date().toISOString().slice(0, 10)

function loadState() {
  try {
    const allTime = parseInt(localStorage.getItem("rama_alltime") || "0", 10)
    const savedDay = localStorage.getItem("rama_day")
    const daily = savedDay === TODAY
      ? parseInt(localStorage.getItem("rama_daily") || "0", 10)
      : 0
    return { allTime, daily }
  } catch {
    return { allTime: 0, daily: 0 }
  }
}

export default function App() {
  const [allTime, setAllTime] = useState(0)
  const [daily, setDaily] = useState(0)
  const [burst, setBurst] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const s = loadState()
    setAllTime(s.allTime)
    setDaily(s.daily)
    setLoaded(true)
  }, [])

  const handleClick = () => {
    const newAll = allTime + 1
    const newDaily = daily + 1
    setAllTime(newAll)
    setDaily(newDaily)
    setBurst(true)
    setTimeout(() => setBurst(false), 130)
    try {
      localStorage.setItem("rama_alltime", newAll)
      localStorage.setItem("rama_daily", newDaily)
      localStorage.setItem("rama_day", TODAY)
    } catch {}
  }

  if (!loaded) return null

  return (
    <div
      className="h-screen w-full flex flex-col select-none overflow-hidden"
      style={{ background: "linear-gradient(170deg, #fff5f7 0%, #fde8d8 50%, #fdf0e8 100%)" }}
    >
      {/* Header */}
      <div className="flex flex-col items-center pt-10 pb-2 px-6 gap-1">
        <p
          style={{
            fontFamily: "'Noto Serif Devanagari', serif",
            fontSize: "1.15rem",
            color: "#c0577a",
            letterSpacing: "0.18em",
            fontWeight: 600,
          }}
        >
          🪷 राम नाम जप 🪷
        </p>
      </div>

      {/* Counters */}
      <div className="flex flex-col items-center justify-center pt-4 pb-3 px-6 gap-0">
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#d4849e",
          }}
        >
          today
        </p>

        <span
          style={{
            fontFamily: "'Bebas Neue', 'Impact', sans-serif",
            fontSize: "clamp(5rem, 22vw, 8.5rem)",
            color: "#b5435f",
            lineHeight: 1,
            textShadow: burst
              ? "0 0 40px rgba(181,67,95,0.35)"
              : "0 4px 24px rgba(181,67,95,0.18)",
            transform: burst ? "scale(1.07)" : "scale(1)",
            transition: "transform 0.13s cubic-bezier(.36,.07,.19,.97), text-shadow 0.15s",
            display: "block",
          }}
        >
          {daily}
        </span>

        <div
          className="flex items-center gap-2 px-4 py-1 rounded-full mt-1"
          style={{
            background: "rgba(181,67,95,0.08)",
            border: "1px solid rgba(181,67,95,0.18)",
          }}
        >
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", color: "#c0577a", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            all time
          </span>
          <span style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", fontSize: "1.25rem", color: "#b5435f", lineHeight: 1 }}>
            {allTime}
          </span>
        </div>
      </div>

      {/* Big Button */}
      <div className="flex-1 p-4 pb-8">
        <button
          onClick={handleClick}
          className="relative w-full h-full rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(150deg, #f9a8c0 0%, #e8708e 50%, #d4506e 100%)",
            boxShadow: burst
              ? "0 0 55px rgba(212,80,110,0.55), 0 16px 50px rgba(212,80,110,0.4)"
              : "0 12px 45px rgba(212,80,110,0.3), 0 4px 16px rgba(0,0,0,0.08)",
            transform: burst ? "scale(0.97)" : "scale(1)",
            transition: "box-shadow 0.15s ease, transform 0.1s ease",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.22) 0%, transparent 55%)" }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 110%, rgba(255,220,230,0.18) 0%, transparent 60%)" }}
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <span
              style={{
                fontFamily: "'Noto Serif Devanagari', serif",
                fontSize: "clamp(3.5rem, 16vw, 7rem)",
                color: "rgba(255,255,255,0.95)",
                lineHeight: 1,
                textShadow: "0 3px 18px rgba(150,30,60,0.3)",
                userSelect: "none",
                fontWeight: 700,
              }}
            >
              श्री राम
            </span>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.7rem",
                color: "rgba(255,255,255,0.6)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                userSelect: "none",
              }}
            >
              tap to chant
            </span>
          </div>
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;700&family=Noto+Serif+Devanagari:wght@600;700&display=swap');
      `}</style>
    </div>
  )
}