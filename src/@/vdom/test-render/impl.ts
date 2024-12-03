import type { VDomImpl } from '../vdom-impl'
import type { ITestRender } from './interface'
import { TestRenderReact } from './impl-react'

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
