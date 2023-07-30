import { ViewColumnsCanvas } from "./columns-canvas";
import { ViewColumnsDOM } from "./columns-react-dom";
import { ViewColumnsSvg } from "./columns-svg";
import { ViewColumnsProps } from "./shared";

export const ViewColumns = ({
  implementation = "svg",
  ...props
}: ViewColumnsProps & {
  implementation?: "svg" | "canvas" | "dom";
}) => {
  switch (implementation) {
    case "canvas": {
      return <ViewColumnsCanvas {...props} />;
    }

    case "svg": {
      return <ViewColumnsSvg {...props} />;
    }

    case "dom": {
      return <ViewColumnsDOM {...props} />;
    }
  }
};
