/// <reference types="vite/client" />

interface ImportMeta {
  readonly hot?: ViteHotContext
}

interface ViteHotContext {
  readonly data: any

  accept(): void
  accept(cb: (mod: any) => void): void
  accept(dep: string, cb: (mod: any) => void): void
  accept(deps: readonly string[], cb: (mods: any[]) => void): void

  dispose(cb: (data: any) => void): void
  decline(): void
  invalidate(): void

  // `InferCustomEventPayload` provides types for built-in Vite events
  on<HotEvent>(
    event: HotEvent,
    cb: (payload: InferCustomEventPayload<T>) => void,
  ): void
  send<HotEvent>(event: HotEvent, data?: InferCustomEventPayload<T>): void
}

type HotEvent =
  | "vite:beforeUpdate"
  | "vite:beforeFullReload"
  | "vite:beforePrune"
  | "vite:error"
