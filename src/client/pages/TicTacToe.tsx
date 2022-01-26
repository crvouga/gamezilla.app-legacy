import React from "react";
import { Icons, ListItem, PageBar } from "../components";

export const TicTacToePage = () => {
  return (
    <>
      <PageBar center="Tic Tac Toe" />
      {/* 
      <svg width="100%" viewBox="0 0 3 3">
        <line stroke="black" strokeWidth={0.1} x1={1} y1={0} x2={1} y2={3} />
        <line stroke="black" strokeWidth={0.1} x1={2} y1={0} x2={2} y2={3} />
        <line stroke="black" strokeWidth={0.1} x1={0} y1={1} x2={3} y2={1} />
        <line stroke="black" strokeWidth={0.1} x1={0} y1={2} x2={3} y2={2} />
      </svg> */}

      <ListItem
        start={<Icons.NetworkCell />}
        center="Create Game"
        end={<Icons.ChevronRight />}
      />

      <ListItem
        start={<Icons.Person />}
        center="Find Game"
        end={<Icons.ChevronRight />}
      />
    </>
  );
};
