import { trpc } from "../trpc";
import { cameras } from "../main";
import { boolean, object, string } from "zod";

export default () =>
  trpc.router({
    updateCameraRecording: trpc.procedure
      .input(
        object({
          id: string(),
          running: boolean(),
        })
      )
      .mutation(async ({ input }) => {
        const camera = cameras.find((x) => x.id === input.id);
        if (!camera) throw "Camera not found";

        if (input.running) camera.startRecording();
        else camera.stopRecording();
      }),
  });
