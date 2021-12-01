import { FC } from "react";
import { Provider } from "react-redux";
import { createStore } from "./store";

const { store } = createStore();

export const AppProviders: FC = ({ children }) => {
  return (
    <>
      <Provider store={store}>{children}</Provider>
    </>
  );
};
