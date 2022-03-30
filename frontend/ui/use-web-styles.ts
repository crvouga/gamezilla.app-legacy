import { useEffect } from "react";
import { Platform } from "react-native";

export const useWebStyles = ({
  backgroundColor,
  rootCssSelector = "#root",
}: {
  backgroundColor: string;
  rootCssSelector?: string;
}) => {
  const css = `
      html, 
      body, 
      ${rootCssSelector} { 
          padding: 0px;
          margin: 0px;
          background-color: ${backgroundColor}
      }
  `;
  return useEffect(() => {
    if (Platform.OS === "web") {
      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
    }
  }, [backgroundColor]);
};
