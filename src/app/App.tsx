import React, { useMemo } from "react";
import { Camera } from "./pages/Camera";
import { Settings } from "./pages/Settings";
import { ApiProvider } from "./hooks/useApi";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { GamepadProvider } from "./hooks/useGamepad";
import { NotificationsProvider } from "@mantine/notifications";

export const App = () => {
  const id = useMemo(() => location.hash.split("#")[1], []);

  return (
    <MantineProvider
      theme={{ colorScheme: "dark" }}
      withCSSVariables
      withGlobalStyles
      withNormalizeCSS
    >
      <ModalsProvider>
        <NotificationsProvider position="bottom-center">
          <GamepadProvider>
            <ApiProvider>{id ? <Camera id={id} /> : <Settings />}</ApiProvider>
          </GamepadProvider>
        </NotificationsProvider>
      </ModalsProvider>
    </MantineProvider>
  );
};
