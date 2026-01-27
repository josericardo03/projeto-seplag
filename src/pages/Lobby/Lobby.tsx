import { Link } from 'react-router-dom'
import { PetsHeader } from '../Pets/components/shared/PetsHeader'

function LobbyCard(props: { title: string; desc: string; to: string; cta: string; gradient: string }) {
  const { title, desc, to, cta, gradient } = props
  return (
    <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-black/5 p-7 flex flex-col gap-4">
      <div className={`h-12 w-12 rounded-2xl ${gradient} flex items-center justify-center text-white font-extrabold`}>
        {title.slice(0, 1)}
      </div>
      <div className="min-w-0">
        <h2 className="text-xl font-extrabold text-slate-900">{title}</h2>
        <p className="text-slate-600 mt-1">{desc}</p>
      </div>
      <Link
        to={to}
        className="mt-2 inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700 transition"
      >
        {cta}
      </Link>
    </div>
  )
}

export default function Lobby() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-200">
      <PetsHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Lobby
          </h1>
          <p className="mt-3 text-slate-600 max-w-2xl">
            Acesso rápido para cadastrar e gerenciar Pets, Tutores e vínculos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LobbyCard
            title="Pets"
            desc="Listar, cadastrar, editar e ver detalhes."
            to="/"
            cta="Abrir Pets"
            gradient="bg-gradient-to-br from-indigo-600 to-purple-700"
          />
          <LobbyCard
            title="Tutores"
            desc="Listar, cadastrar, editar e vincular/desvincular pets."
            to="/tutores"
            cta="Abrir Tutores"
            gradient="bg-gradient-to-br from-emerald-600 to-teal-700"
          />
        </div>

        <div className="mt-8">
          <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-black/5 p-7">
            <h3 className="text-lg font-extrabold text-slate-900">Ações rápidas</h3>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Link
                to="/pets/novo"
                className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 font-semibold shadow-sm hover:bg-slate-50 transition w-full sm:w-auto"
              >
                + Cadastrar Pet
              </Link>
              <Link
                to="/tutores/novo"
                className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 font-semibold shadow-sm hover:bg-slate-50 transition w-full sm:w-auto"
              >
                + Cadastrar Tutor
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

