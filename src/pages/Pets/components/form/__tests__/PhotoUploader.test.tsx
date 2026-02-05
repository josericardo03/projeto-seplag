import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PhotoUploader } from '../PhotoUploader'

describe('PhotoUploader', () => {
  it('ao clicar no X marca remoção para salvar', () => {
    const onChangeRemoveExisting = vi.fn()

    render(
      <PhotoUploader
        existingUrl="http://img"
        file={null}
        onPick={vi.fn()}
        removeExisting={false}
        onChangeRemoveExisting={onChangeRemoveExisting}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Remover foto' }))
    expect(onChangeRemoveExisting).toHaveBeenCalledWith(true)
  })
})

