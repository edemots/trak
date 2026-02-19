import { publicProcedure, router } from "../index";
import { bankAccountRouter } from "./bank-account";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  bankAccount: bankAccountRouter,
});
export type AppRouter = typeof appRouter;
