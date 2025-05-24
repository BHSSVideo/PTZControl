import { trpc } from "../trpc";
import { cameras } from "../main";
import z, { number, object, string } from "zod";

export default () =>
  trpc.router({
    updateCameraPreset: trpc.procedure
      .input(
        object({
          id: string(),
          speed: number(),
          index: number(),
          action: z.enum(["call", "set", "clear"]),
        })
      )
      .mutation(async ({ input }) => {
        const camera = cameras.find((x) => x.id === input.id);
        if (!camera) throw "Camera not found";

        await camera.preset(input.action, input.index, input.speed);
      }),
  });
