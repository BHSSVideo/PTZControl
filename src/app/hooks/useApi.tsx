import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import type { AppRouter } from "../../electron/trpc";
import type { DatabaseType } from "../../electron/zod";
import { Center, Loader } from "@mantine/core";
import { createTRPCProxyClient } from "@trpc/client";
import { createWSClient } from "@trpc/client/links/wsLink";
import { wsLink } from "@trpc/client/links/wsLink";
import { loggerLink } from "@trpc/client/links/loggerLink";

const client = createTRPCProxyClient<AppRouter>({
  links: [
    loggerLink({
      logger: (data) => {
        if (data.direction === "up") return;
        if (data.path === "onFrame") return;
        console.log(data.path);
      },
    }),
    wsLink<AppRouter>({
      client: createWSClient({
        url: `ws://${location.host.split(":")[0]}:8080`,
      }),
    }),
  ],
});

const ApiContext = createContext<{
  client: typeof client;
  database: DatabaseType;
}>(undefined as any);

export const ApiProvider = ({ children }: PropsWithChildren<{}>) => {
  const [database, setDatabase] = useState<DatabaseType>();

  useEffect(
    () =>
      client.onDatabase.subscribe(undefined, {
        onData: setDatabase,
      }).unsubscribe,
    []
  );

  return (
    <ApiContext.Provider
      value={{
        client: client!,
        database: database!,
      }}
    >
      {database ? (
        children
      ) : (
        <Center
          sx={{
            height: "100vh",
          }}
        >
          <Loader size="xl" />
        </Center>
      )}
    </ApiContext.Provider>
  );
};

export const useApi = () => useContext(ApiContext);
