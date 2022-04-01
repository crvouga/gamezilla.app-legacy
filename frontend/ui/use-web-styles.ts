import { useEffect } from "react";
import { Platform } from "react-native";

export const useWebStyles = ({
  backgroundColor,
  borderColor,
  rootCssSelector = "#root",
}: {
  borderColor: string;
  backgroundColor: string;
  rootCssSelector?: string;
}) => {
  const css = `
      html, 
      body, 
      ${rootCssSelector} { 
          padding: 0px;
          margin: 0px;
          background-color: ${backgroundColor};
          max-width: 720px;
          margin-left: auto;
          margin-right: auto;
          border: 1px solid ${borderColor};
          box-sizing: border-box;
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
