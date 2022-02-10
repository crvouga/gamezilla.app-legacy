import React from "react";

const themeModeContext = React.createContext<null>(null);

export const useThemeMode = () => {
  return React.useContext(themeModeContext);
};

export const ThemeModeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <themeModeContext.Provider value={null}>
      {children}
    </themeModeContext.Provider>
  );
};

export default ThemeModeProvider;
