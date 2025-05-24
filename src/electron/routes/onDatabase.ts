import { trpc } from "../trpc";
import { database } from "../main";
import { DatabaseType } from "../zod";
import { observable } from "@trpc/server/observable";

export default () =>
  trpc.router({
    onDatabase: trpc.procedure.subscription(({}) => {
      return observable<DatabaseType>((emit) => {
        const onData = () => emit.next(database.value());
        database.addListener("change", onData);
        onData();

        return () => {
          database.removeListener("change", onData);
        };
      });
    }),
  });
