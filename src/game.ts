export type Roll = {
  a: number
  b: number
  at: number
  /** Index into Game.players, when players are set up. */
  player?: number
}

export type Game = {
  id: string
  startedAt: number
  endedAt?: number
  players: string[]
  rolls: Roll[]
}

export const SUMS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const

/** Ways to make each sum with two dice, out of 36. Also the number of pips on a Catan token. */
export const ways = (n: number) => 6 - Math.abs(7 - n)
export const probability = (n: number) => ways(n) / 36

const STORAGE_KEY = 'catan-dice:game'

export function newGame(players: string[] = []): Game {
  return {
    id: crypto.randomUUID(),
    startedAt: Date.now(),
    players,
    rolls: [],
  }
}

export function loadGame(): Game | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Game) : null
  } catch {
    return null
  }
}

export function saveGame(game: Game) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(game))
  } catch {
    // Storage can be unavailable (private mode); the game still works in memory.
  }
}

/** Unbiased 1–6 using the crypto RNG. */
export function rollDie(): number {
  const buf = new Uint8Array(1)
  // 252 is the largest multiple of 6 below 256; reject above it to avoid modulo bias.
  do crypto.getRandomValues(buf)
  while (buf[0] >= 252)
  return (buf[0] % 6) + 1
}

export function currentPlayer(game: Game): number | undefined {
  if (game.players.length === 0) return undefined
  return game.rolls.length % game.players.length
}

export function countSums(rolls: Roll[]): Record<number, number> {
  const counts: Record<number, number> = {}
  for (const n of SUMS) counts[n] = 0
  for (const r of rolls) counts[r.a + r.b]++
  return counts
}

export function rollsSinceSeven(rolls: Roll[]): number {
  let i = rolls.length - 1
  while (i >= 0 && rolls[i].a + rolls[i].b !== 7) i--
  return rolls.length - 1 - i
}

export type Stats = {
  total: number
  counts: Record<number, number>
  hottest: number[]
  coldest: number[]
  longestSevenDrought: number
  doubles: number
  durationMs: number
  perPlayer: { name: string; rolls: number; sevens: number; average: number }[]
}

export function computeStats(game: Game): Stats {
  const { rolls } = game
  const counts = countSums(rolls)

  // Compare against expectation so a 7 isn't always "hottest" just because it's most likely.
  const deltas = SUMS.map((n) => ({ n, d: counts[n] - probability(n) * rolls.length }))
  const maxD = Math.max(...deltas.map((x) => x.d))
  const minD = Math.min(...deltas.map((x) => x.d))
  const hottest = rolls.length ? deltas.filter((x) => x.d === maxD).map((x) => x.n) : []
  const coldest = rolls.length ? deltas.filter((x) => x.d === minD).map((x) => x.n) : []

  let longestSevenDrought = 0
  let run = 0
  for (const r of rolls) {
    if (r.a + r.b === 7) run = 0
    else longestSevenDrought = Math.max(longestSevenDrought, ++run)
  }

  const end = game.endedAt ?? rolls.at(-1)?.at ?? Date.now()

  const perPlayer = game.players.map((name, i) => {
    const mine = rolls.filter((r) => r.player === i)
    const sum = mine.reduce((s, r) => s + r.a + r.b, 0)
    return {
      name,
      rolls: mine.length,
      sevens: mine.filter((r) => r.a + r.b === 7).length,
      average: mine.length ? sum / mine.length : 0,
    }
  })

  return {
    total: rolls.length,
    counts,
    hottest,
    coldest,
    longestSevenDrought,
    doubles: rolls.filter((r) => r.a === r.b).length,
    durationMs: Math.max(0, end - game.startedAt),
    perPlayer,
  }
}

export function formatDuration(ms: number): string {
  const mins = Math.floor(ms / 60000)
  if (mins < 1) return 'under a minute'
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  return `${h} h ${mins % 60} min`
}
