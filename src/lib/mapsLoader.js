import { createContext, useContext } from "react";

export const MapsLoadedContext = createContext(false);
export const useMapsLoaded = () => useContext(MapsLoadedContext);
