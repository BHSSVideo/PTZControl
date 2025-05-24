import { trpc } from "../trpc";
import { cameras } from "../main";
import { object, string } from "zod";

export default () =>
  trpc.router({
    updateCameraReset: trpc.procedure
      .input(
        object({
          id: string(),
        })
      )
      .mutation(async ({ input }) => {
        const camera = cameras.find((x) => x.id === input.id);
        if (!camera) throw "Camera not found";

        await camera.resetConfig();
      }),
  });
