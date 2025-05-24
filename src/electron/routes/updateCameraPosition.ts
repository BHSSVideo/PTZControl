import { trpc } from "../trpc";
import { cameras } from "../main";
import z, { boolean, number, object, optional, string, tuple } from "zod";

export default () =>
  trpc.router({
    updateCameraPosition: trpc.procedure
      .input(
        object({
          id: string(),
          home: optional(boolean()),
          speedXY: optional(tuple([number(), number()])),
          speedZF: optional(number()),
          actionXY: optional(
            z.enum([
              "stop-stop",
              "north-stop",
              "south-stop",
              "stop-west",
              "stop-east",
              "north-west",
              "south-west",
              "south-east",
              "north-east",
            ])
          ),
          actionZF: optional(
            z.enum([
              "zoom-stop",
              "zoom-in",
              "zoom-out",
              "focus-stop",
              "focus-in",
              "focus-out",
            ])
          ),
        })
      )
      .mutation(async ({ input }) => {
        const camera = cameras.find((x) => x.id === input.id);
        if (!camera) throw "Camera not found";

        if (input.home) return await camera.home();

        if (input.actionZF)
          return await camera.zoomFocus(input.actionZF, input.speedZF || 0);

        if (input.actionXY)
          return await camera.panTilt(
            input.actionXY,
            input.speedXY ? input.speedXY[0] || 0 : 0,
            input.speedXY ? input.speedXY[1] || 0 : 0
          );
      }),
  });
