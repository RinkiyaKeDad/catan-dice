import { SUMS, computeStats, formatDuration, probability, type Game } from '../game'
import { Token } from './Token'

type Props = { game: Game; onResume: () => void; onNewGame: () => void }

const pct = (x: number) => `${Math.round(x * 100)}%`
const list = (ns: number[]) => ns.join(' and ')

export function Summary({ game, onResume, onNewGame }: Props) {
  const s = computeStats(game)
  const scale = Math.max(1, ...SUMS.map((n) => s.counts[n]), probability(7) * s.total)

  return (
    <main className="summary">
      <header className="summary__head">
        <h1>Game stats</h1>
        <p className="muted">
          {s.total} {s.total === 1 ? 'roll' : 'rolls'} {s.durationMs < 60000 ? 'in' : 'over'} {formatDuration(s.durationMs)}
        </p>
      </header>

      {s.total === 0 ? (
        <p className="empty">No rolls yet. Resume the game and roll to see stats here.</p>
      ) : (
        <>
          <dl className="facts">
            <div>
              <dt>Hottest number</dt>
              <dd>{list(s.hottest)}</dd>
            </div>
            <div>
              <dt>Coldest number</dt>
              <dd>{list(s.coldest)}</dd>
            </div>
            <div>
              <dt>Sevens</dt>
              <dd>{s.counts[7]}</dd>
            </div>
            <div>
              <dt>Longest run without a 7</dt>
              <dd>{s.longestSevenDrought}</dd>
            </div>
            <div>
              <dt>Doubles</dt>
              <dd>{s.doubles}</dd>
            </div>
          </dl>

          <section aria-labelledby="by-number">
            <h2 id="by-number">By number</h2>
            <p className="muted legend">
              <span className="legend__bar" /> rolled <span className="legend__tick" /> expected
            </p>
            <ol className="rows">
              {SUMS.map((n) => {
                const c = s.counts[n]
                const exp = probability(n) * s.total
                return (
                  <li key={n} className="row">
                    <Token n={n} />
                    <div className="row__track">
                      <div className="row__bar" style={{ width: `${(c / scale) * 100}%` }} />
                      <div className="row__expected" style={{ left: `${(exp / scale) * 100}%` }} />
                    </div>
                    <div className="row__nums">
                      <strong>{c}</strong>
                      <span className="muted">
                        {pct(c / s.total)} of {pct(probability(n))}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>

          {s.perPlayer.length > 0 && (
            <section aria-labelledby="by-player">
              <h2 id="by-player">By player</h2>
              <table className="players">
                <thead>
                  <tr>
                    <th scope="col">Player</th>
                    <th scope="col">Rolls</th>
                    <th scope="col">Sevens</th>
                    <th scope="col">Average</th>
                  </tr>
                </thead>
                <tbody>
                  {s.perPlayer.map((p) => (
                    <tr key={p.name}>
                      <th scope="row">{p.name}</th>
                      <td>{p.rolls}</td>
                      <td>{p.sevens}</td>
                      <td>{p.rolls ? p.average.toFixed(1) : '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </>
      )}

      <div className="actions actions--stack">
        <button className="btn btn--primary" onClick={onNewGame}>
          New game
        </button>
        <button className="btn btn--ghost" onClick={onResume}>
          Resume this game
        </button>
      </div>
    </main>
  )
}
