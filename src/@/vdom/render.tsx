import type { VDom } from './vdom'
import type { VDomImpl } from './vdom-impl'

export type Render<Input> = (input: Input) => void

export type CreatePortal = (vDom: VDom, container: Element) => VDom

export let createPortal: CreatePortal | null = null

export const Renderer = async <Input,>(
  vDomImpl: VDomImpl,
  root: HTMLElement,
  Component: (input: JSX.IntrinsicAttributes & Input) => VDom,
): Promise<Render<JSX.IntrinsicAttributes & Input>> => {
  switch (vDomImpl) {
    case 'inferno': {
      const Inferno = await import('inferno')
      createPortal = Inferno.createPortal
      return (input) => {
        Inferno.render(<Component {...input} />, root)
      }
    }

    case 'react-with-compiler':
    case 'react': {
      const [ReactDOMClient, ReactDOM, React] = await Promise.all([
        import('react-dom/client'),
        import('react-dom'),
        import('react'),
      ])
      const reactRoot = ReactDOMClient.createRoot(root)
      createPortal = ReactDOM.createPortal
      return (input) => {
        reactRoot.render(
          <React.StrictMode>
            <Component {...input} />
          </React.StrictMode>,
        )
      }
    }

    case 'preact': {
      const [Preact, PreactCompat] = await Promise.all([import('preact'), import('preact/compat')])
      createPortal = PreactCompat.createPortal
      return (input) => {
        Preact.render(<Component {...input} />, root)
      }
    }

    case 'vue': {
      const { createApp, ref, h } = await import('vue')

      const inputRef = ref<Input | null>(null)

      const app = createApp({
        render: () => {
          if (inputRef.value) {
            return h(Component, inputRef.value)
          }
          return null
        },
      })

      app.config.compilerOptions.isCustomElement = (tag) => tag.includes('-')

      app.mount(root)

      return (input) => {
        inputRef.value = input
      }
    }
  }
}
