import { useState, useEffect, useCallback } from "react"

const getToday = () => new Date().toISOString().slice(0, 10)

function loadLocal() {
  try {
    const allTime = parseInt(localStorage.getItem("rama_alltime") || "0", 10)
    const savedDay = localStorage.getItem("rama_day")
    const today = getToday()
    const daily = savedDay === today
      ? parseInt(localStorage.getItem("rama_daily") || "0", 10)
      : 0
    return { allTime, daily }
  } catch {
    return { allTime: 0, daily: 0 }
  }
}

function saveLocal(daily: number, allTime: number) {
  try {
    localStorage.setItem("rama_alltime", String(allTime))
    localStorage.setItem("rama_daily", String(daily))
    localStorage.setItem("rama_day", getToday())
  } catch {
    // localStorage may be unavailable in some environments
  }
}

async function syncToServer(date: string, count: number) {
  try {
    const res = await fetch("/api/count", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, count }),
    })
    if (res.ok) {
      localStorage.setItem("rama_synced", date)
    }
    return res.ok
  } catch {
    return false
  }
}

// Load initial state once, outside the component to avoid setState-in-effect
const initialState = loadLocal()

export default function App() {
  const [allTime, setAllTime] = useState(initialState.allTime)
  const [daily, setDaily] = useState(initialState.daily)
  const [burst, setBurst] = useState(false)
  const [synced, setSynced] = useState(false)

  // On mount, try to merge with server data
  useEffect(() => {
    const today = getToday()
    Promise.allSettled([
      fetch(`/api/count?date=${today}`).then(r => r.json()),
      fetch("/api/total").then(r => r.json()),
    ]).then(([dailyRes, totalRes]) => {
      const serverDaily = dailyRes.status === "fulfilled" ? dailyRes.value.count || 0 : 0
      const serverTotal = totalRes.status === "fulfilled" ? totalRes.value.total || 0 : 0

      // Take the max of local vs server to avoid data loss
      const local = loadLocal()
      const bestDaily = Math.max(local.daily, serverDaily)
      const bestAllTime = Math.max(local.allTime, serverTotal)

      if (bestDaily !== local.daily || bestAllTime !== local.allTime) {
        setDaily(bestDaily)
        setAllTime(bestAllTime)
        saveLocal(bestDaily, bestAllTime)
      }
    })
  }, [])

  const handleClick = () => {
    const newAll = allTime + 1
    const newDaily = daily + 1
    setAllTime(newAll)
    setDaily(newDaily)
    setBurst(true)
    setTimeout(() => setBurst(false), 130)
    saveLocal(newDaily, newAll)
  }

  // Sync function
  const doSync = useCallback(() => {
    const today = getToday()
    const count = parseInt(localStorage.getItem("rama_daily") || "0", 10)
    if (count > 0) {
      syncToServer(today, count).then(ok => {
        if (ok) setSynced(true)
      })
    }
  }, [])

  // 11:30 PM auto-sync — checks every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const today = getToday()
      const alreadySynced = localStorage.getItem("rama_synced") === today

      // Sync at 23:30 (11:30 PM) if not already synced today
      if (hours === 23 && minutes >= 30 && !alreadySynced) {
        doSync()
      }

      // Reset synced flag at midnight for the new day
      if (hours === 0 && minutes === 0) {
        localStorage.removeItem("rama_synced")
        setSynced(false)
      }
    }, 60_000) // check every 60 seconds

    return () => clearInterval(interval)
  }, [doSync])

  // Backup sync on page close/unload
  useEffect(() => {
    const onUnload = () => {
      const today = getToday()
      const count = parseInt(localStorage.getItem("rama_daily") || "0", 10)
      if (count > 0) {
        // sendBeacon is more reliable than fetch during unload
        navigator.sendBeacon(
          "/api/count",
          new Blob(
            [JSON.stringify({ date: today, count })],
            { type: "application/json" }
          )
        )
      }
    }
    window.addEventListener("beforeunload", onUnload)
    return () => window.removeEventListener("beforeunload", onUnload)
  }, [])

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

        {/* Sync indicator */}
        {synced && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.6rem", color: "#7cb87c", marginTop: "0.5rem", letterSpacing: "0.1em" }}>
            ✓ synced
          </p>
        )}
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