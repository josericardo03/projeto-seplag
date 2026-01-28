import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { TutorPetsLinker } from '../TutorPetsLinker'

describe('TutorPetsLinker', () => {
  it('renderiza pets e chama onUnlink ao clicar na lixeira', () => {
    const onUnlink = vi.fn()
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <TutorPetsLinker
          tutorId={10}
          pets={[{ id: 1, nome: 'Rex', idade: 3 }]}
          petIdText=""
          onChangePetId={vi.fn()}
          onLink={vi.fn()}
          onUnlinkById={vi.fn()}
          onUnlink={onUnlink}
        />
      </MemoryRouter>
    )

    expect(screen.getByText('Rex')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Desvincular Rex'))
    expect(onUnlink).toHaveBeenCalledWith(1)
  })
})

