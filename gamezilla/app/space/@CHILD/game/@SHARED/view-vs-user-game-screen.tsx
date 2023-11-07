import { UserId } from "gamezilla/app/@SHARED/data";

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
