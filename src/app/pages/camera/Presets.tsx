import React, { useState } from "react";
import { SimpleGrid, Button, Stack, Box } from "@mantine/core";
import { useButtonPress } from "../../hooks/useButtonPress";
import { useApi } from "../../hooks/useApi";
import { showNotification } from "@mantine/notifications";

type Props = {
  id: string;
};

export const Presets = ({ id }: Props) => {
  const directions = ["upButton", "rightButton", "downButton", "leftButton"];
  const modes = {
    Call: "call",
    Set: "set",
    Clear: "clear",
    "Wipe All": "wipe",
  };

  const { database, client } = useApi();
  const [mode, setMode] = useState("call");
  const [loading, setLoading] = useState(false);

  // Controller buttons
  for (let i = 0; i < directions.length; i++) {
    useButtonPress(
      () =>
        client.updateCameraPreset.mutate({
          id,
          index: i,
          speed: database.settings.speed.preset,
          action: "call",
        }),
      directions[i] as any
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <SimpleGrid
        sx={{
          flexGrow: 1,
        }}
        cols={3}
      >
        {new Array(9).fill(undefined).map((_, i) => (
          <Button
            key={i}
            sx={{
              minHeight: "100%",
            }}
            size="lg"
            onClick={async () => {
              await client.updateCameraPreset.mutate({
                id,
                index: i,
                speed: database.settings.speed.preset,
                action: mode as any,
              });

              showNotification({
                color: "green",
                message: `Preset ${mode} was executed succesfully`,
              });
            }}
          >
            {i + 1}
          </Button>
        ))}
      </SimpleGrid>
      <Stack
        sx={{
          marginTop: 12,
          flexDirection: "row",
        }}
      >
        {Object.entries(modes).map(([name, action], i) => (
          <Button
            fullWidth
            size="xs"
            key={i}
            loading={loading}
            onClick={async () => {
              if (action !== "wipe") return setMode(action);

              setLoading(true);
              for (let j = 0; j < 10; j++) {
                client.updateCameraPreset.mutate({
                  id,
                  index: j,
                  speed: database.settings.speed.preset,
                  action: "clear",
                });
                await new Promise((x) => setTimeout(x, 250));
              }
              setLoading(false);
            }}
            variant={mode === action ? "filled" : "outline"}
          >
            {name}
          </Button>
        ))}
      </Stack>
    </Box>
  );
};
