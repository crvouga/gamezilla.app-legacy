import { useEffect } from "react";
import { Platform } from "react-native";

const createCSS = ({ backgroundColor }: { backgroundColor: string }) => {
  return `
        html, 
        body, 
        #root { 
            padding: 0px;
            margin: 0px;
            background-color: ${backgroundColor}
        }
    `;
};

export const useWebStyles = ({
  backgroundColor,
}: {
  backgroundColor: string;
}) => {
  return useEffect(() => {
    if (Platform.OS === "web") {
      const style = document.createElement("style");
      style.textContent = createCSS({ backgroundColor });
      document.head.appendChild(style);
    }
  }, [backgroundColor]);
};
