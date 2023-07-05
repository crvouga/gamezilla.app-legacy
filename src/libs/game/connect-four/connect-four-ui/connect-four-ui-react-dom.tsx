import { useEffect, useRef } from "react";
import { ViewColumnsProps } from "./connect-four-ui-shared";
import * as ConnectFourUI from "./connect-four-ui-dom";

export const ViewColumnsDOM = (props: ViewColumnsProps) => {
  const instanceRef = useRef<ConnectFourUI.ConnectFourUI>(
    ConnectFourUI.create({
      initialColumns: props.columns,
      onClick: props.onClick,
    })
  );

  useEffect(() => {
    instanceRef.current.setColumns(props.columns);
  }, [props.columns]);

  return <div className="w-full" ref={instanceRef.current.setRoot}></div>;
};
