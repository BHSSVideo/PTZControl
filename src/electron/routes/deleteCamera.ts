import { trpc } from "../trpc";
import { object, string } from "zod";
import { cameras, database } from "../main";

export default () =>
  trpc.router({
    deleteCamera: trpc.procedure
      .input(
        object({
          id: string(),
        })
      )
      .mutation(async ({ input }) => {
        // Remove database entry
        var databaseIndex = database.cameras.findIndex(
          (x) => x.id === input.id
        );
        if (databaseIndex >= 0) database.cameras.splice(databaseIndex, 1);

        // Remove camera object
        var arrayIndex = cameras.findIndex((x) => x.id === input.id);
        if (arrayIndex >= 0) {
          await cameras[arrayIndex].destroy();
          cameras.splice(arrayIndex, 1);
        }
      }),
  });
