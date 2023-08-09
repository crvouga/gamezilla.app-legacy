import { UserId } from "gamezilla/app/@/app";

export const VsUserGameScreen = ({
  playerOne,
  playerTwo,
}: {
  playerOne: UserId;
  playerTwo: UserId;
}) => {
  return (
    <div>
      view user game screen
      {playerOne}
      {playerTwo}
    </div>
  );
};
