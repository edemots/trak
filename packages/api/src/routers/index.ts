import { publicProcedure, router } from "../index";
import { bankAccountRouter } from "./bank-account";
import { categoryRouter } from "./category";
import { groupRouter } from "./group";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  bankAccount: bankAccountRouter,
  category: categoryRouter,
  group: groupRouter,
});
export type AppRouter = typeof appRouter;
