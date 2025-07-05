import { app, Dispatch, h, text, VNode } from 'hyperapp'
import { VDOM_FRAGMENT_KEY } from './fragment'
import { VirtualDomEngine } from './interface'
import { kebabObjectToCamelObject } from './style'

type AppState = {
  vDom: VNode<any>
  lastUpdate: number
}

type SetVDomAction = (state: AppState, vDom: VNode<any>) => AppState

export const initHyperapp = (): VirtualDomEngine => {
  const setVDom: SetVDomAction = (state, vDom) => ({
    ...state,
    vDom,
    lastUpdate: Date.now(),
  })

  let dispatch: Dispatch<AppState>
  return {
    render: (vDom, node) => {
      dispatch ??= app({
        init: { vDom: h('div', {}, []), lastUpdate: Date.now() } as AppState,
        view: (state: AppState) => state.vDom || h('div', {}, []),
        node,
      })

      try {
        const processedVDom = processChildren(vDom)
        if (processedVDom && typeof processedVDom === 'object') {
          dispatch(setVDom, processedVDom as VNode<any>)
        }
      } catch (error) {
        console.error('Error processing vDom:', error)
        // Fallback to empty div on error
        dispatch(setVDom, h('div', {}, []))
      }
    },
    createPortal: (vDom, _container) => {
      return vDom
    },
    createElement: (tag: any, props: any, children: any) => {
      children = Array.isArray(children) ? children : children ? [children] : []
      children = processChildren(children)

      if (typeof tag === 'function') {
        return tag({ ...props, children })
      }

      if (tag === VDOM_FRAGMENT_KEY) {
        return children.length === 1 ? children[0] : children
      }

      // Filter props for DOM elements - remove children and process style/events
      const filteredProps: any = {}
      if (props) {
        for (const key in props) {
          const value = props[key]

          // Skip problematic props
          if (key === 'children' || value === undefined || value === null) continue

          if (key === 'style' && value) {
            filteredProps.style = kebabObjectToCamelObject(value)
          } else if (key === 'class' && value) {
            filteredProps.class = value
          } else if (key.startsWith('on') && typeof value === 'function') {
            // Convert React-style event handlers to hyperapp format
            // onClick -> onclick, onMouseDown -> onmousedown, onTouchStart -> ontouchstart, etc.
            const hyperappEventName = key.toLowerCase()

            // Convert event handler name and pass through directly
            filteredProps[hyperappEventName] = value
          } else if (value !== undefined && value !== null) {
            filteredProps[key] = value
          }
        }
      }

      return h(tag, filteredProps, children)
    },
  }
}

const processChildren = (children: any): any => {
  if (children === null || children === undefined || children === false) {
    return []
  }

  if (Array.isArray(children)) {
    return children
      .map(processChildren)
      .flat(Infinity)
      .filter((child) => child !== null && child !== undefined && child !== false)
  }

  if (typeof children === 'string') {
    return text(children)
  }

  if (typeof children === 'number') {
    return text(children.toString())
  }

  if (typeof children === 'boolean') {
    return children ? text('true') : []
  }

  if (typeof children === 'object' && children !== null) {
    return children
  }

  return []
}
