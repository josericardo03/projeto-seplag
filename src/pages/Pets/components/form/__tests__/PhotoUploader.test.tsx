import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PhotoUploader } from '../PhotoUploader'

describe('PhotoUploader', () => {
  it('mostra botão de remover remoto e chama onRemoveRemote', () => {
    const onRemoveRemote = vi.fn()

    render(
      <PhotoUploader
        existingUrl="http://img"
        existingId={10}
        file={null}
        onPick={vi.fn()}
        onRemoveRemote={onRemoveRemote}
      />
    )

    fireEvent.click(screen.getByText('Remover do pet'))
    expect(onRemoveRemote).toHaveBeenCalledTimes(1)
  })
})

