import { COLUMN_COUNT, type ColumnIndex, MAX_COLUMN_HEIGHT } from '../../../connect-four'
import { gameTheme } from '../../shared'
import { type Columnsinput, columnsinputSub } from '../shared'
import { initColumns } from './columns'
import { initDiscs, syncDiscs } from './discs'
import type { SvgIds } from './shared'
import { initWins, syncWins } from './wins'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'connect-four-columns': {
        'initial-columns-json': string
      }
    }
  }
}

const randomId = 123
const ids: SvgIds = {
  playerOneGradient: `playerOneGradient${randomId}`,
  playerTwoGradient: `playerTwoGradient${randomId}`,
  holePattern: `holePattern${randomId}`,
  columnGradient: `columnGradient${randomId}`,
  holeMask: `holeMask${randomId}`
}

/* Have to increase the viewBox so that the draw animation is smooth >:-{ */
const N = 1000

if (typeof window !== 'undefined' && 'customElements' in window) {
  customElements.define(
    'connect-four-columns',
    class extends HTMLElement {
      private input: Columnsinput | null = null
      private previnput: Columnsinput | null = null
      private cleanUps: (() => void)[] = []

      constructor() {
        super()
        this.attachShadow({
          mode: 'open'
        })
      }

      disconnectedCallback() {
        for (const cleanUp of this.cleanUps) {
          cleanUp()
        }
      }

      connectedCallback() {
        this.initUI()
      }

      initUI() {
        const unsubscribe = columnsinputSub.sub((input) => {
          this.previnput = this.input
          this.input = input
          this.syncUI()
        })
        this.cleanUps.push(unsubscribe)

        const initialColumns = this.getAttribute('initial-columns-json')
        if (initialColumns) {
          this.input = {
            columns: JSON.parse(initialColumns)
          }
        }

        if (!this.shadowRoot) {
          return
        }

        this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            width: 100%;
            cursor: pointer;
          }
        </style>
        <svg width="100%" viewBox="0 0 ${COLUMN_COUNT} ${MAX_COLUMN_HEIGHT}">
          ${createSvgDefs({ ids })}

          <g transform="translate(0, ${MAX_COLUMN_HEIGHT}) scale(1,-1)">
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="${gameTheme.primary.darker}"
              ></rect>

            <g id="discs" transform="translate(0.5, 0.5)"></g>

            <rect
              x="0"
              y="0"
              width="${COLUMN_COUNT}"
              height="${MAX_COLUMN_HEIGHT}"
              fill="url(#${ids.columnGradient})"
              mask="url(#${ids.holeMask})"
            />

            <svg
              id="wins"
              x="0"
              y="0"
              width="${COLUMN_COUNT}"
              height="${MAX_COLUMN_HEIGHT}"
              viewBox="0 0 ${COLUMN_COUNT * N} ${MAX_COLUMN_HEIGHT * N}"></svg>

            <g id="columns"></g>
          </g>
        </svg>`

        const columns = this.getColumnsParentNode()
        const discs = this.getDiscsParentNode()
        const wins = this.getWinsParentNode()

        if (columns) {
          initColumns({
            onClick: (columnIndex) => {
              this.onColumnClick(columnIndex)
            },
            parentNode: columns
          })
        }

        if (this.input && discs) {
          initDiscs({
            columns: this.input.columns,
            ids,
            parentNode: discs
          })
        }

        if (this.input && wins) {
          initWins({
            columns: this.input.columns,
            parentNode: wins
          })
        }
      }

      onColumnClick(columnIndex: ColumnIndex) {
        this.input?.onDropDisc?.(columnIndex)
      }

      getColumnsParentNode() {
        const columns = this.shadowRoot?.getElementById('columns')!
        if (columns instanceof SVGGElement) {
          return columns
        }
        return null
      }
      getDiscsParentNode() {
        const node = this.shadowRoot?.getElementById('discs')
        if (node instanceof SVGGElement) {
          return node
        }
        return null
      }
      getWinsParentNode() {
        const node = this.shadowRoot?.getElementById('wins')

        if (node instanceof SVGElement) {
          return node
        }
        return null
      }

      syncUI() {
        const discs = this.getDiscsParentNode()
        const columns = this.input?.columns
        if (columns && discs) {
          syncDiscs({
            columns,
            ids,
            parentNode: discs
          })
        }
        const wins = this.getWinsParentNode()
        if (columns && wins) {
          syncWins({
            columns,
            parentNode: wins,
            prevColumns: this.previnput?.columns ?? null
          })
        }

        const root = this.shadowRoot?.querySelector('svg')

        if (root) {
          if (this.input?.disabled) {
            root.classList.add('pointer-events-none')
          } else {
            root.classList.remove('pointer-events-none')
          }
        }
      }
    }
  )
}

function createSvgDefs({ ids }: { ids: SvgIds }) {
  return `<defs>
      <pattern
        id="${ids.holePattern}"
        patternUnits="userSpaceOnUse"
        width="1"
        height="1">
        <circle cx="0.5" cy="0.5" r="0.425" fill="black"></circle>
      </pattern>

      <mask id="${ids.holeMask}">
        <rect
          x="0"
          y="0"
          width="${COLUMN_COUNT}"
          height="${MAX_COLUMN_HEIGHT}"
          fill="white"></rect>
        <rect
          x="0"
          y="0"
          width="${COLUMN_COUNT}"
          height="${MAX_COLUMN_HEIGHT}"
          fill="url(#${ids.holePattern})"></rect>
      </mask>

      <linearGradient id="${ids.columnGradient}" gradient-transform="rotate(90)">
        <stop offset="0%" stop-color="${gameTheme.primary.light}" />
        <stop offset="100%" stop-color="${gameTheme.primary.dark}" />
      </linearGradient>

      <linearGradient id="${ids.playerOneGradient}" gradient-transform="rotate(90)">
        <stop offset="0%" stop-color="${gameTheme['player-one'].light}" />
        <stop offset="100%" stop-color="${gameTheme['player-one'].dark}" />
      </linearGradient>

      <linearGradient id="${ids.playerTwoGradient}" gradient-transform="rotate(90)">
        <stop offset="0%" stop-color="${gameTheme['player-two'].light}" />
        <stop offset="100%" stop-color="${gameTheme['player-two'].dark}" />
      </linearGradient>
    </defs>`
}
