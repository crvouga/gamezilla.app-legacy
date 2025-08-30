import { describe, expect, test } from '~/@/test-runner'
import { addSafeArea } from './add-safe-area'

describe('addSafeArea', () => {
  test('should add safe area insets when no existing padding', () => {
    const result = addSafeArea(['top', 'bottom', 'left', 'right'], {})

    expect(result).toEqual({
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      paddingLeft: 'env(safe-area-inset-left)',
      paddingRight: 'env(safe-area-inset-right)',
    })
  })

  test('should combine safe area with existing padding', () => {
    const result = addSafeArea(['top', 'bottom'], {
      paddingTop: '10px',
      paddingBottom: '20px',
    })

    expect(result).toEqual({
      paddingTop: 'calc(10px + env(safe-area-inset-top))',
      paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
    })
  })

  test('should only add safe area for specified edges', () => {
    const result = addSafeArea(['top', 'right'], {
      paddingBottom: '10px',
      paddingLeft: '20px',
    })

    expect(result).toEqual({
      paddingTop: 'env(safe-area-inset-top)',
      paddingRight: 'env(safe-area-inset-right)',
      paddingBottom: '10px',
      paddingLeft: '20px',
    })
  })

  test('should handle empty edges array', () => {
    const styles = {
      paddingTop: '10px',
    }
    const result = addSafeArea([], styles)
    expect(result).toEqual(styles)
  })
})
