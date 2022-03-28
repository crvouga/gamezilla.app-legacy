type ISuit = "ace" | "club" | "diamond" | "heart";

type IRank =
  | "ace"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "jack"
  | "queen"
  | "king";

type IPlayingCard = {
  suit: ISuit;
  rank: IRank;
};

type IDeck = IPlayingCard[];
