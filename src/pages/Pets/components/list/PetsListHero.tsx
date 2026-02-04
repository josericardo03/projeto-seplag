export function PetsListHero(props: {
  onAdd: () => void
  onViewTutores: () => void
  disabled?: boolean
}) {
  const { onAdd, onViewTutores, disabled } = props
  return (
    <div className="mb-10 flex flex-col gap-5">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 bg-clip-text text-transparent mb-3 leading-tight">
            Nossos <span className="bg-gradient-to-r from-pink-400 to-red-500 bg-clip-text text-transparent">Pets</span>
          </h2>
          <p className="text-gray-600 text-lg sm:text-xl font-normal leading-relaxed">
            Gerencie todos os seus amiguinhos em um só lugar
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center self-start">
          <button
            type="button"
            onClick={onAdd}
            disabled={!!disabled}
            className={[
              'px-8 py-3.5 rounded-2xl font-semibold text-base shadow-lg transition-all duration-300',
              disabled
                ? 'bg-slate-300 text-slate-700 cursor-not-allowed shadow-sm'
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:-translate-y-0.5 hover:shadow-xl',
            ].join(' ')}
          >
            + Cadastrar Pet {disabled ? '(em breve)' : ''}
          </button>

          <button
            type="button"
            onClick={onViewTutores}
            className="px-7 py-3.5 rounded-2xl font-semibold text-base border border-indigo-100 bg-white/80 text-indigo-700 shadow-sm hover:bg-white hover:border-indigo-200 transition"
          >
            Ver Tutores
          </button>
        </div>
      </div>
    </div>
  )
}

