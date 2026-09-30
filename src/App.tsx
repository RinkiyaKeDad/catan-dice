import { useCallback, useEffect, useRef, useState } from 'react'
import {
  countSums,
  currentPlayer,
  loadGame,
  newGame,
  rollDie,
  rollsSinceSeven,
  saveGame,
  type Game,
} from './game'
import { Die } from './components/Die'
import { Tally } from './components/Tally'
import { Summary } from './components/Summary'
import { Setup } from './components/Setup'
import { useWakeLock } from './useWakeLock'

const ROLL_MS = 520
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function App() {
  const [game, setGame] = useState<Game>(() => loadGame() ?? newGame())
  const [view, setView] = useState<'play' | 'summary'>(() => (game.endedAt ? 'summary' : 'play'))
  const [setupOpen, setSetupOpen] = useState(() => loadGame() === null)
  const [rolling, setRolling] = useState(false)
  const [faces, setFaces] = useState<[number, number]>(() => {
    const last = game.rolls.at(-1)
    return last ? [last.a, last.b] : [6, 6]
  })
  const timer = useRef<number>(undefined)

  useEffect(() => saveGame(game), [game])
  useEffect(() => () => window.clearInterval(timer.current), [])
  useWakeLock(view === 'play')

  const last = game.rolls.at(-1)
  const sum = last ? last.a + last.b : undefined
  const player = currentPlayer(game)

  const commit = useCallback((a: number, b: number) => {
    setFaces([a, b])
    setRolling(false)
    setGame((g) => ({ ...g, rolls: [...g.rolls, { a, b, at: Date.now(), player: currentPlayer(g) }] }))
    if (a + b === 7) navigator.vibrate?.([40, 60, 40])
    else navigator.vibrate?.(25)
  }, [])

  const roll = useCallback(() => {
    if (rolling) return
    const a = rollDie()
    const b = rollDie()
    if (reducedMotion()) return commit(a, b)

    setRolling(true)
    const started = performance.now()
    timer.current = window.setInterval(() => {
      if (performance.now() - started >= ROLL_MS) {
        window.clearInterval(timer.current)
        commit(a, b)
      } else {
        setFaces([rollDie(), rollDie()])
      }
    }, 70)
  }, [rolling, commit])

  const undo = () => {
    if (rolling || game.rolls.length === 0) return
    const rolls = game.rolls.slice(0, -1)
    const prev = rolls.at(-1)
    setFaces(prev ? [prev.a, prev.b] : [6, 6])
    setGame({ ...game, rolls })
  }

  useEffect(() => {
    if (view !== 'play' || setupOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('button, input')) return
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        roll()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [view, setupOpen, roll])

  const start = (players: string[]) => {
    setGame(newGame(players))
    setFaces([6, 6])
    setView('play')
    setSetupOpen(false)
  }

  const setup = setupOpen && (
    <Setup
      initialPlayers={game.players}
      onStart={start}
      onCancel={game.rolls.length || game.endedAt ? () => setSetupOpen(false) : undefined}
    />
  )

  if (view === 'summary') {
    return (
      <>
        <Summary
          game={game}
          onResume={() => {
            setGame({ ...game, endedAt: undefined })
            setView('play')
          }}
          onNewGame={() => setSetupOpen(true)}
        />
        {setup}
      </>
    )
  }

  const since7 = rollsSinceSeven(game.rolls)
  const recent = game.rolls.slice(-9, -1).reverse()

  return (
    <main className="play">
      <header className="bar">
        <div className="bar__meta">
          <span>
            <strong>{game.rolls.length}</strong> {game.rolls.length === 1 ? 'roll' : 'rolls'}
          </span>
          {game.rolls.length > 0 && (
            <span className="muted">
              {since7 === 0 ? 'Seven just now' : `${since7} since last 7`}
            </span>
          )}
        </div>
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => {
            setGame({ ...game, endedAt: Date.now() })
            setView('summary')
          }}
        >
          End game
        </button>
      </header>

      <button className="stage" onClick={roll} aria-label="Roll the dice">
        {player !== undefined && (
          <span className="stage__player">
            {game.players[player]}
            <span className="muted">’s roll</span>
          </span>
        )}
        <span className="dice">
          <Die value={faces[0]} tone="foam" rolling={rolling} />
          <Die value={faces[1]} tone="wheat" rolling={rolling} />
        </span>
        <span
          className={`sum${sum === 7 ? ' sum--seven' : ''}${rolling ? ' is-hidden' : ''}`}
          aria-live="polite"
          key={game.rolls.length}
        >
          {sum ?? ''}
        </span>
        <span className="stage__hint">
          {rolling ? '' : sum === 7 ? 'Robber moves' : sum === undefined ? 'Tap to roll' : ''}
        </span>
      </button>

      <ol className="recent" aria-label="Previous rolls, newest first">
        {recent.map((r, i) => (
          <li key={game.rolls.length - i} className={r.a + r.b === 7 ? 'is-seven' : ''}>
            {r.a + r.b}
          </li>
        ))}
      </ol>

      <Tally counts={countSums(game.rolls)} total={game.rolls.length} last={rolling ? undefined : sum} />

      <div className="actions">
        <button className="btn btn--ghost btn--icon" onClick={undo} disabled={!game.rolls.length || rolling} aria-label="Undo last roll">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              d="M9 14L4 9l5-5M4 9h10.5a5.5 5.5 0 010 11H11"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button className="btn btn--primary btn--roll" onClick={roll} disabled={rolling}>
          Roll
        </button>
      </div>

      {setup}
    </main>
  )
}
