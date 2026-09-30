import { SUMS, probability } from '../game'
import { Token } from './Token'

type Props = { counts: Record<number, number>; total: number; last?: number }

export function Tally({ counts, total, last }: Props) {
  const scale = Math.max(1, ...SUMS.map((n) => counts[n]), probability(7) * total)
  return (
    <section className="tally" aria-label="Times each number has been rolled">
      {SUMS.map((n) => {
        const expected = probability(n) * total
        return (
          <div key={n} className={`tally__col${n === last ? ' is-last' : ''}`}>
            <span className="tally__count">{counts[n]}</span>
            <div className="tally__track">
              <div className="tally__bar" style={{ height: `${(counts[n] / scale) * 100}%` }} />
              {total > 0 && (
                <div className="tally__expected" style={{ bottom: `${(expected / scale) * 100}%` }} />
              )}
            </div>
            <Token n={n} size="sm" />
          </div>
        )
      })}
    </section>
  )
}
