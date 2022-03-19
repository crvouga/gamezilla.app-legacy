import {
  ActivityIndicator,
  Dialog,
  Portal,
  Headline,
} from "react-native-paper";
import { spacing } from "./theme";

export const LoadingDialog = ({
  visible,
  title,
}: {
  visible: boolean;
  title: string;
}) => {
  return (
    <Portal>
      <Dialog visible={visible}>
        <Dialog.Content>
          <ActivityIndicator
            size="large"
            style={{ marginBottom: spacing(2) }}
          />
          <Headline style={{ textAlign: "center" }}>{title}</Headline>
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
};
