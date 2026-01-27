export function SpeciesBadge({ species }: { species: string }) {
  const isDog = species.toLowerCase().includes('cach') || species.toLowerCase().includes('cão')
  return (
    <span
      className={[
        'self-start mb-4 px-4 py-1 rounded-full text-xs font-semibold text-white',
        isDog ? 'bg-gradient-to-r from-pink-500 to-red-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500',
      ].join(' ')}
    >
      {species}
    </span>
  )
}

