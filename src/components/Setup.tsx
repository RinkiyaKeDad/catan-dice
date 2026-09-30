import { useEffect, useRef, useState } from 'react'

type Props = { initialPlayers: string[]; onStart: (players: string[]) => void; onCancel?: () => void }

export function Setup({ initialPlayers, onStart, onCancel }: Props) {
  const [players, setPlayers] = useState<string[]>(initialPlayers)
  const [draft, setDraft] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    dialog.current?.showModal()
  }, [])

  const add = () => {
    const name = draft.trim()
    if (!name || players.includes(name)) return
    setPlayers([...players, name])
    setDraft('')
  }

  return (
    <dialog ref={dialog} className="sheet" onCancel={(e) => (onCancel ? onCancel() : e.preventDefault())}>
      <h2>New game</h2>
      <p className="muted">
        Add players in turn order to track whose roll it is. You can also skip this and just roll.
      </p>

      <form
        className="add-player"
        onSubmit={(e) => {
          e.preventDefault()
          add()
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Player name"
          aria-label="Player name"
          maxLength={20}
          autoComplete="off"
        />
        <button className="btn btn--ghost" type="submit" disabled={!draft.trim()}>
          Add
        </button>
      </form>

      {players.length > 0 && (
        <ol className="player-list">
          {players.map((p, i) => (
            <li key={p}>
              <span className="player-list__n">{i + 1}</span>
              <span className="player-list__name">{p}</span>
              <button
                className="icon-btn"
                aria-label={`Remove ${p}`}
                onClick={() => setPlayers(players.filter((x) => x !== p))}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </li>
          ))}
        </ol>
      )}

      <div className="actions actions--stack">
        <button
          className="btn btn--primary"
          onClick={() => {
            // Don't lose a name that was typed but never added.
            const name = draft.trim()
            onStart(name && !players.includes(name) ? [...players, name] : players)
          }}
        >
          Start game
        </button>
        {onCancel && (
          <button className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </dialog>
  )
}
