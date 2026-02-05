import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TutorPetsLinker } from '../TutorPetsLinker'

vi.mock('../../../../services/petService', () => ({
  petService: {
    getPets: vi.fn().mockResolvedValue({ content: [], totalPages: 0, totalElements: 0 }),
  },
}))

describe('TutorPetsLinker', () => {
  it('renderiza pets vinculados e chama onUnlink ao clicar na lixeira', async () => {
    const onUnlink = vi.fn()
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <TutorPetsLinker
          tutorId={10}
          pets={[{ id: 1, nome: 'Rex', idade: 3 }]}
          onLinkById={vi.fn()}
          onUnlink={onUnlink}
        />
      </MemoryRouter>
    )

    expect(screen.getByText('Rex')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Desvincular Rex'))
    expect(onUnlink).toHaveBeenCalledWith(1)

    // garante que o carregamento da lista não explode no teste
    await waitFor(() => {
      expect(screen.getByText('Todos os pets')).toBeInTheDocument()
    })
  })
})

