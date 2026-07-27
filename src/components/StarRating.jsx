const STARS = [1, 2, 3, 4, 5]

export default function StarRating({ value = 0, onChange, size = 'md' }) {
  const interactive = typeof onChange === 'function'

  return (
    <div className={`star-rating star-rating-${size}`} role={interactive ? 'radiogroup' : undefined}>
      {STARS.map((star) => (
        <span
          key={star}
          className={`star ${star <= value ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={interactive ? () => onChange(star === value ? 0 : star) : undefined}
          role={interactive ? 'radio' : undefined}
          aria-checked={interactive ? star <= value : undefined}
          aria-label={interactive ? `${star} av 5` : undefined}
        >
          ★
        </span>
      ))}
    </div>
  )
}
