import { trpc } from "../trpc";
import { cameras } from "../main";
import { DatabaseType } from "../zod";
import { object, string } from "zod";
import { observable } from "@trpc/server/observable";

export default () =>
  trpc.router({
    onFrame: trpc.procedure
      .input(
        object({
          id: string(),
        })
      )
      .subscription(({ input }) => {
        return observable<DatabaseType>((emit) => {
          const camera = cameras.find((x) => x.id === input.id);
          if (!camera) throw "Camera not found";

          camera.addListener("frame", emit.next);
          return () => {
            camera.removeListener("frame", emit.next);
          };
        });
      }),
  });
