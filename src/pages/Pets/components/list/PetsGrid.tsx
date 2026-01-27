import type { Pet } from '../../../../types'
import { PetCard } from './PetCard'

export function PetsGrid({ pets }: { pets: Pet[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-7 mb-6 sm:mb-10">
      {pets.map((pet) => (
        <PetCard key={pet.id} pet={pet} />
      ))}
    </div>
  )
}

