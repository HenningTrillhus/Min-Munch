const ITEMS = [1, 2, 3, 4, 5]

export default function StarRating({ value = 0, onChange, size = 'md', icon = 'star' }) {
  const interactive = typeof onChange === 'function'
  const symbol = icon === 'heart' ? '♥' : '★'

  return (
    <div
      className={`star-rating star-rating-${size} icon-${icon}`}
      role={interactive ? 'radiogroup' : undefined}
    >
      {ITEMS.map((item) => (
        <span
          key={item}
          className={`star ${item <= value ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={interactive ? () => onChange(item === value ? 0 : item) : undefined}
          role={interactive ? 'radio' : undefined}
          aria-checked={interactive ? item <= value : undefined}
          aria-label={interactive ? `${item} av 5` : undefined}
        >
          {symbol}
        </span>
      ))}
    </div>
  )
}
