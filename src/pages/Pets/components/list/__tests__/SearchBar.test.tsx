import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SearchBar } from '../SearchBar'

describe('SearchBar', () => {
  it('chama onChange ao digitar', () => {
    const onChange = vi.fn()
    render(<SearchBar value="" onChange={onChange} onSearch={vi.fn()} onClear={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('Buscar pet por nome...'), { target: { value: 'Rex' } })
    expect(onChange).toHaveBeenCalledWith('Rex')
  })

  it('chama onSearch ao pressionar Enter', () => {
    const onSearch = vi.fn()
    render(<SearchBar value="Rex" onChange={vi.fn()} onSearch={onSearch} onClear={vi.fn()} />)
    fireEvent.keyDown(screen.getByPlaceholderText('Buscar pet por nome...'), { key: 'Enter' })
    expect(onSearch).toHaveBeenCalledTimes(1)
  })

  it('chama onClear ao clicar no botão de limpar', () => {
    const onClear = vi.fn()
    render(<SearchBar value="Rex" onChange={vi.fn()} onSearch={vi.fn()} onClear={onClear} />)
    fireEvent.click(screen.getByLabelText('Limpar busca'))
    expect(onClear).toHaveBeenCalledTimes(1)
  })
})

