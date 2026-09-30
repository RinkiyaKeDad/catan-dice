// Pip positions on a 3x3 grid, numbered 0–8 left-to-right, top-to-bottom.
const PIPS: Record<number, number[]> = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

type Props = { value: number; tone: 'foam' | 'wheat'; rolling: boolean }

export function Die({ value, tone, rolling }: Props) {
  return (
    <div className={`die die--${tone}${rolling ? ' is-rolling' : ''}`} aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={PIPS[value].includes(i) ? 'pip' : 'pip pip--off'} />
      ))}
    </div>
  )
}
