/** The flag of Türkiye — red field, white crescent and five-pointed star. */
export default function TurkishFlag({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 800"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Flag of Türkiye"
    >
      <rect width="1200" height="800" fill="#E30A17" rx="48" />
      <circle cx="425" cy="400" r="200" fill="#fff" />
      <circle cx="475" cy="400" r="160" fill="#E30A17" />
      <polygon
        fill="#fff"
        points="685,400 615.9,422.5 615.9,495.1 573.2,436.3 504.1,458.8 546.8,400 504.1,341.2 573.2,363.7 615.9,304.9 615.9,377.5"
      />
    </svg>
  )
}
