import { test } from "vitest";
import { initFollower, initLeader, updateLeader } from "./msg-ordering";

type State = {
  balance: number;
};

type Cmd =
  | {
      t: "deposit";
      amount: number;
    }
  | {
      t: "withdraw";
      amount: number;
    };

type Evt =
  | {
      t: "deposited";
      amount: number;
    }
  | {
      t: "withdrawn";
      amount: number;
    };

const reducer = (state: State, msg: Evt): State => {
  switch (msg.t) {
    case "deposited": {
      return {
        ...state,
        balance: state.balance + msg.amount,
      };
    }

    case "withdrawn": {
      return {
        ...state,
        balance: state.balance - msg.amount,
      };
    }
  }
};

const init = (): State => {
  return {
    balance: 0,
  };
};

const deposit = (amount: number): Cmd => {
  return {
    t: "deposit",
    amount,
  };
};

const withdraw = (amount: number): Cmd => {
  return {
    t: "withdraw",
    amount,
  };
};

const initialize = () => {
  let L = initLeader<State, Evt, Cmd>(init());

  let F1 = initFollower<State, Evt, Cmd>(init());

  let F2 = initFollower<State, Evt, Cmd>(init());

  return {
    L,
    F1,
    F2,
  };
};
