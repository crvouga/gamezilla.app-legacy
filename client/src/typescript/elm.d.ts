/// <reference path="./elm-ts-interop.d.ts" />

declare module "*.elm" {
  export const Elm: {
    Main: {
      init(options: {
        node?: HTMLElement | null;
        flags: Elm.Flags;
      }): Elm.ElmApp;
    };
  };
}
