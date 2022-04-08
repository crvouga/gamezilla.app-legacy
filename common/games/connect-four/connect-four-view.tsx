import Svg from "react-native-svg";
import { AppBar, AppBarAction, AppBarBackAction } from "../../ui";
import { COLUMN_COUNT, MAX_COLUMN_HEIGHT } from "./connect-four";

export const ConnectFourView = ({
  onStop,
  onBack,
}: {
  onStop: () => void;
  onBack: () => void;
}) => {
  return (
    <>
      <AppBar
        left={<AppBarBackAction onPress={onBack} />}
        title="Connect Four"
        right={<AppBarAction onPress={onStop} icon="power" />}
      />

      <Svg
        width="100%"
        style={{ aspectRatio: COLUMN_COUNT / MAX_COLUMN_HEIGHT }}
        viewBox={[0, 0, COLUMN_COUNT, MAX_COLUMN_HEIGHT].join(" ")}
      ></Svg>
    </>
  );
};
