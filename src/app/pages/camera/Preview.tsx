import {
  Box,
  Center,
  LoadingOverlay,
  SegmentedControl,
  Title,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { DatabaseConfigZod, DatabaseZod } from "../../../electron/zod";
import { useApi } from "../../hooks/useApi";
import { useCamera } from "../../hooks/useCamera";

type Props = {
  id: string;
};

export const Preview = ({ id }: Props) => {
  const { client } = useApi();
  const camera = useCamera(id);
  const [isLoading, setLoading] = useState(true);

  // Load frames
  useEffect(() => {
    setLoading(true);
    const image = document.createElement("img");
    image.setAttribute("draggable", "false");
    image.setAttribute(
      "style",
      "width: 100%; height: 100%; object-fit: contain"
    );
    document.getElementById("container")?.appendChild(image);

    const subscription = client.onFrame.subscribe(
      { id },
      {
        onData: (data) => {
          setLoading(false);
          image.src = `data:image/jpeg;base64,${data}`;
        },
        onStopped: () => setLoading(true),
      }
    );

    return () => {
      image.remove();
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: "black",
      }}
    >
      <Box
        id="container"
        sx={{
          width: "100%",
          height: "100%",
          position: "absolute",
          opacity: camera.config.stream === "Off" ? 0 : 1,
        }}
      />

      <SegmentedControl
        color="blue"
        size="xs"
        data={DatabaseConfigZod.shape.stream.options}
        value={camera.config.stream}
        onChange={(value) => {
          setLoading(true);
          client.updateCameraConfig.mutate({
            id,
            config: {
              stream: value as any,
            },
          });
        }}
        sx={{
          position: "absolute",
          right: 8,
          bottom: 8,
        }}
      />

      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
      >
        {camera.config.stream === "Off" ? (
          <Center
            sx={{
              height: "100%",
            }}
          >
            <Title order={4}>Stream is currently off</Title>
          </Center>
        ) : (
          <LoadingOverlay visible={isLoading} />
        )}
      </Box>
    </Box>
  );
};
