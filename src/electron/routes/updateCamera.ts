import { trpc } from "../trpc";
import { database } from "../main";
import { object, optional, string } from "zod";

export default () =>
  trpc.router({
    updateCamera: trpc.procedure
      .input(
        object({
          id: string(),
          name: optional(string()),
          notes: optional(string()),
        })
      )
      .mutation(({ input }) => {
        const index = database.cameras.findIndex((x) => x.id === input.id);
        if (index === -1) throw "Camera not found";

        // Only update allowed fields
        for (const field of ["name", "notes"]) {
          if (input[field]) database.cameras[index][field] = input[field];
        }
      }),
  });
