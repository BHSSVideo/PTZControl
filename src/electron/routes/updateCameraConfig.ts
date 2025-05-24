import { trpc } from "../trpc";
import { cameras } from "../main";
import { object, string } from "zod";
import { DatabaseConfigZod } from "../zod";

export default () =>
  trpc.router({
    updateCameraConfig: trpc.procedure
      .input(
        object({
          id: string(),
          config: DatabaseConfigZod.partial(),
        })
      )
      .mutation(async ({ input }) => {
        const camera = cameras.find((x) => x.id === input.id);
        if (!camera) throw "Camera not found";

        await camera.config(input.config);
      }),
  });
