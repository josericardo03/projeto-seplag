export function FormActions(props: {
  mode: 'create' | 'edit'
  saving: boolean
  onCancel: () => void
  onSubmit: () => void
}) {
  const { mode, saving, onCancel, onSubmit } = props
  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-3 rounded-2xl bg-white/80 border border-slate-200 text-slate-800 font-semibold shadow-sm hover:bg-white transition"
        disabled={saving}
      >
        Cancelar
      </button>

      <button
        type="button"
        onClick={onSubmit}
        disabled={saving}
        className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {saving ? 'Salvando...' : mode === 'edit' ? 'Salvar alterações' : 'Cadastrar pet'}
      </button>
    </div>
  )
}

