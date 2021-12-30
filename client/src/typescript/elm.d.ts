/// <reference path="../../elm-ts-interop-stuff/index.d.ts" />

declare module "*.elm" {
  export const Elm: {
    Main: {
      init(options: { node: HTMLElement; flags: Elm.Flags }): Elm.ElmApp;
    };
  };
}
