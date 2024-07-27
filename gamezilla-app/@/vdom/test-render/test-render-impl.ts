import type { VDomImpl } from '../vdom-impl'
import type { ITestRender } from './test-render'
import { TestRenderReact } from './test-render-impl-react'

export const TestRender = async (vDomImpl: VDomImpl): Promise<ITestRender> => {
  switch (vDomImpl) {
    case 'react-with-compiler':
    case 'react': {
      return TestRenderReact
    }

    case 'inferno':
    case 'preact': {
      throw new Error(`TestRender not implemented for ${vDomImpl}`)
    }
  }
}
