import { trpc } from "../trpc";
import { database } from "../main";
import { DatabaseZod } from "../zod";

export default () =>
  trpc.router({
    updateSettings: trpc.procedure
      .input(DatabaseZod.shape.settings.deepPartial())
      .mutation(({ input }) => {
        for (const [key, value] of Object.entries(input)) {
          database.settings[key] = {
            ...database.settings[key],
            ...(value as any),
          };
        }
      }),
  });
