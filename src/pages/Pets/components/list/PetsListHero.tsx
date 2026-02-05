export function PetsListHero(props: {
  onAdd: () => void
  onViewTutores: () => void
  disabled?: boolean
}) {
  const { onAdd, onViewTutores, disabled } = props
  return (
    <div className="mb-8 flex flex-col gap-5">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-white border border-indigo-100/80 px-6 py-6 sm:px-8 sm:py-7">
        <div className="border-l-4 border-indigo-500 pl-5">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-indigo-800 tracking-tight mb-2">
            Nossos Pets
          </h2>
          <p className="text-indigo-700/80 text-base sm:text-lg leading-relaxed max-w-xl">
            Gerencie todos os seus amiguinhos em um só lugar
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center self-start">
          <button
            type="button"
            onClick={onAdd}
            disabled={!!disabled}
            className={[
              'px-6 py-3 rounded-xl text-sm font-semibold transition-colors',
              disabled
                ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700',
            ].join(' ')}
          >
            + Cadastrar Pet {disabled ? '(em breve)' : ''}
          </button>

          <button
            type="button"
            onClick={onViewTutores}
            className="px-5 py-3 rounded-xl text-sm font-medium border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 transition-colors"
          >
            Ver Tutores
          </button>
        </div>
      </div>
    </div>
  )
}

