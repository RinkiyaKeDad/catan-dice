// Rolls the app's real dice function many times and compares the results with the odds for fair dice.
// Usage: npm run simulate [-- <rolls>]
import { SUMS, probability, rollDie } from '../src/game.ts'

const N = Number(process.argv[2] ?? 1_000_000)
const faces = Array(7).fill(0)
const sums = Array(13).fill(0)

for (let i = 0; i < N; i++) {
  const a = rollDie()
  const b = rollDie()
  faces[a]++
  faces[b]++
  sums[a + b]++
}

const pct = (x: number) => `${(x * 100).toFixed(2)}%`

console.log(`${N.toLocaleString('en-US')} rolls\n`)
console.log('Total  Rolled  Expected')
for (const n of SUMS) {
  console.log(`${String(n).padStart(5)}  ${pct(sums[n] / N).padStart(6)}  ${pct(probability(n)).padStart(8)}`)
}
console.log(`\nEach face (expected 16.67%): ${faces.slice(1).map((f) => pct(f / (2 * N))).join('  ')}`)
