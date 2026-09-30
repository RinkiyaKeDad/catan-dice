import { useEffect } from 'react'

/** Keep the screen awake while the app is open, so the phone doesn't sleep mid-game. */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let cancelled = false

    const acquire = async () => {
      if (document.visibilityState !== 'visible') return
      try {
        lock = await navigator.wakeLock.request('screen')
        if (cancelled) lock.release()
      } catch {
        // Denied (e.g. low battery mode); nothing to do.
      }
    }

    acquire()
    document.addEventListener('visibilitychange', acquire)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', acquire)
      lock?.release()
    }
  }, [active])
}
