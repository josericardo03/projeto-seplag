import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'softDanger'
type Size = 'sm' | 'md'

const base =
  'inline-flex items-center justify-center gap-2 font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed select-none'

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 rounded-xl text-sm',
  md: 'px-6 py-3 rounded-2xl text-base',
}

const variants: Record<Variant, string> = {
  primary: 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700',
  secondary: 'bg-white border border-slate-200 text-slate-800 shadow-sm hover:bg-slate-50',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
  softDanger: 'bg-red-50 border border-red-100 text-red-700 hover:bg-red-100',
}

export function Button(
  props: ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant
    size?: Size
  }
) {
  const { className, variant = 'secondary', size = 'md', type = 'button', ...rest } = props
  return <button {...rest} type={type} className={[base, sizes[size], variants[variant], className].filter(Boolean).join(' ')} />
}

