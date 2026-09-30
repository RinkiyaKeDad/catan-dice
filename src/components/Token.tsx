import { ways } from '../game'

type Props = { n: number; size?: 'sm' | 'md' }

/** A Catan number token: the number with probability pips beneath. 6 and 8 are red. */
export function Token({ n, size = 'md' }: Props) {
  const hot = n === 6 || n === 8
  return (
    <span className={`token token--${size}${hot ? ' token--hot' : ''}${n === 7 ? ' token--robber' : ''}`}>
      <span className="token__n">{n}</span>
      <span className="token__pips" aria-hidden="true">
        {Array.from({ length: ways(n) }, (_, i) => (
          <i key={i} />
        ))}
      </span>
    </span>
  )
}
