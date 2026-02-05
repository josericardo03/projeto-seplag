export function onlyDigits(value: string) {
  return value.replace(/[^\d]/g, '')
}

export function formatPhoneBR(value: string) {
  const d = onlyDigits(value).slice(0, 11)
  if (d.length <= 2) return d
  const ddd = d.slice(0, 2)
  const rest = d.slice(2)
  if (rest.length <= 4) return `(${ddd}) ${rest}`
  if (rest.length <= 8) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`
  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`
}

export function formatCpfBR(value: string) {
  const d = onlyDigits(value).slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

export function cpfCaretFromDigitsCount(digitsBeforeCaret: number) {
  // Mapeia a posição do cursor contando apenas dígitos para a string formatada:
  // XXX.XXX.XXX-XX
  let caret = digitsBeforeCaret
  if (digitsBeforeCaret > 3) caret += 1 // .
  if (digitsBeforeCaret > 6) caret += 1 // .
  if (digitsBeforeCaret > 9) caret += 1 // -
  return caret
}

