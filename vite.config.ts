import preact from '@preact/preset-vite'
import react from '@vitejs/plugin-react'
import { defineConfig, PluginOption } from 'vite'
import inferno from 'vite-plugin-inferno'
import tsconfigPaths from 'vite-tsconfig-paths'
import { VDOM_IMPL } from './src/config/client'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

const vDomPlugin = (): PluginOption[] => {
  switch (VDOM_IMPL) {
    case 'inferno': {
      return [inferno()]
    }

    case 'preact': {
      return [preact()]
    }

    case 'react': {
      return [react()]
    }

    case 'react-with-compiler': {
      return [react({ babel: { plugins: [['babel-plugin-react-compiler', {}]] } })]
    }

    case 'vue': {
      const isCustomElement = (tag: string): boolean => tag.includes('-')
      return [vue({ template: { compilerOptions: { isCustomElement } } }), vueJsx({ isCustomElement })]
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), ...vDomPlugin()],
  define: { 'process.env': process.env },
})
