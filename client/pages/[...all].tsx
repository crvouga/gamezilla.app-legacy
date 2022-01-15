import type { NextPage } from "next";
import { App } from "../src/App/App";

const All: NextPage = () => {
  return (
    <div className="fixed top-0 left-0 bottom-0 right-0 overflow-hidden select-none">
      <App />
    </div>
  );
};

export default All;
