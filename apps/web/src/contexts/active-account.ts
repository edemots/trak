import { createContext } from "react";

export const ActiveAccountContext = createContext<{
  activeBankAccount: string | undefined;
}>({
  activeBankAccount: undefined,
});
