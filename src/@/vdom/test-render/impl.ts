import type { VDomImpl } from '../vdom-impl'
import './happydom'
import { TestRenderReact } from './impl-react'
import type { ITestRender } from './interface'

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
