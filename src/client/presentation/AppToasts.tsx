import { actions, selectors } from "../features";
import { IonToast } from "@ionic/react";
import { useDispatch, useSelector } from "react-redux";

export const AppToasts = () => {
  const toasts = useSelector(selectors.toast.slice);
  const dispatch = useDispatch();

  return (
    <>
      {toasts.map((toast, index) => (
        <IonToast
          position="top"
          isOpen={index === 0}
          key={toast.id}
          message={toast.message}
          buttons={
            toast.onDone
              ? [
                  {
                    text: "Done",
                    role: "cancel",
                    handler: () => {
                      dispatch(toast.onDone);
                    },
                  },
                ]
              : []
          }
        />
      ))}
    </>
  );
};
