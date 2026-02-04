import type { InputHTMLAttributes } from 'react'

const base =
  'block w-full px-4 py-3 rounded-2xl bg-white/90 border border-slate-200 shadow-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed'

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props
  return <input {...rest} className={[base, className].filter(Boolean).join(' ')} />
}

export function NumberLikeInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className, inputMode, ...rest } = props
  return (
    <input
      {...rest}
      inputMode={inputMode || 'numeric'}
      className={[base, className].filter(Boolean).join(' ')}
    />
  )
}

