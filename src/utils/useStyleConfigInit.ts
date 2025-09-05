import { useEffect } from "react";

type StyleConfig = Record<string, any>;

function useStyleConfigInit(defaultConfig: StyleConfig, localStorageKey = "config") {
  // 遞迴設定 CSS 變數和 document.title
  const initializeConfigStyles = (config: StyleConfig, basePath: string[] = []) => {
    const traverseConfig = (currentConfig: StyleConfig, currentPath: string[]) => {
      Object.entries(currentConfig).forEach(([key, value]) => {
        const newPath = [...currentPath, key];
        const cssVarName = `--${newPath.join("-")}`;
        
        // console.log(value,newPath,newPath[newPath.length-1])
        if (newPath[newPath.length - 1] === "title"&& typeof value === "string") {
          document.title = value;
        }

        if (typeof value === "object" && value !== null) {
          traverseConfig(value, newPath);
        } else {
          if (typeof value === "number") {
            if (newPath.includes("layout")) {
              document.documentElement.style.setProperty(cssVarName, value.toString() + "mm");
            } else {
              document.documentElement.style.setProperty(cssVarName, value.toString() + "px");
            }
          } else {
            document.documentElement.style.setProperty(cssVarName, value + "");
          }
        }
      });
    };

    traverseConfig(config, basePath);
  };

  useEffect(() => {
    const storedConfig = localStorage.getItem(localStorageKey);
    if (storedConfig) {
      try {
        const parsedConfig = JSON.parse(storedConfig);
        initializeConfigStyles(parsedConfig);
      } catch {
        initializeConfigStyles(defaultConfig);
      }
    } else {
      localStorage.setItem(localStorageKey, JSON.stringify(defaultConfig));
      initializeConfigStyles(defaultConfig);
    }
  }, [defaultConfig, localStorageKey]);
}

export default useStyleConfigInit;
