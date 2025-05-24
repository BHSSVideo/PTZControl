import { trpc } from "../trpc";
import { cameras, database } from "../main";
import { Camera } from "../services/camera";
import { object, string } from "zod";
import { randomUUID } from "node:crypto";
import { DatabaseType } from "../zod";

export default () =>
  trpc.router({
    createCamera: trpc.procedure
      .input(
        object({
          name: string(),
          address: string(),
        })
      )
      .mutation(async ({ input }) => {
        const camera: DatabaseType["cameras"][number] = {
          id: randomUUID(),
          name: input.name,
          address: input.address,
          notes: "<p><br></p>",
          recording: 0,
          config: {
            stream: "Off",
            focus: "Auto Focus",
            whiteBalance: "Auto",
            exposure: "Auto",
            shutterSpeed: "1/30",
            iris: "Closed",
            brightness: "0",
            afSensitivity: "High",
            orientation: "Typical",
            saturation: "60%",
          },
        };
        database.cameras.push(camera);
        cameras.push(new Camera(camera.id, camera.address));
      }),
  });
