import { createContext } from "react";

export const adminContext = createContext({
  admin: false,
  setAdmin: () => {}
});
