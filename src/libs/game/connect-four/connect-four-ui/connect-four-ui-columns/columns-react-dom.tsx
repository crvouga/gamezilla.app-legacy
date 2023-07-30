import { useEffect, useRef } from "react";
import * as ConnectFourUI from "./columns-dom";
import { ViewColumnsProps } from "./shared";

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

  useEffect(() => {
    return () => {
      try {
        instanceRef.current.cleanUp();
      } catch (e) {
        console.error(e);
      }
    };
  }, []);

  return <div className="w-full" ref={instanceRef.current.setRoot}></div>;
};
