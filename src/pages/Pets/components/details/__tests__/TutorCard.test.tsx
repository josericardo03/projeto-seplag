import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TutorCard } from '../TutorCard'

describe('TutorCard', () => {
  it('renderiza a foto quando tutor.foto tem url', () => {
    render(
      <TutorCard
        tutor={{
          id: 1,
          nome: 'Maria',
          foto: { id: 10, nome: 'x', contentType: 'image/png', url: 'http://img' },
        }}
      />
    )

    expect(screen.getByRole('img', { name: 'Foto de Maria' })).toBeInTheDocument()
  })
})

