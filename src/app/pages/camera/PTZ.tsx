import React, { useEffect, useState } from "react";
import {
  SimpleGrid,
  Button,
  Stack,
  Center,
  SegmentedControl,
} from "@mantine/core";
import {
  ArrowBigTop,
  ArrowBigLeft,
  ArrowBigRight,
  ArrowBigDown,
  Home,
  ZoomIn,
  ZoomOut,
  ZoomInArea,
  ZoomOutArea,
} from "tabler-icons-react";
import { useApi } from "../../hooks/useApi";
import { useCamera } from "../../hooks/useCamera";
import { DatabaseConfigZod } from "../../../electron/zod";
import { useControllerInput } from "../../hooks/useControllerInput";
import { useDidUpdate } from "@mantine/hooks";

type Props = {
  id: string;
};

export const PTZ = ({ id }: Props) => {
  useControllerInput(id);
  const camera = useCamera(id);
  const { database, client } = useApi();
  const [isMoving, setMoving] = useState(false);

  useDidUpdate(() => {
    if (isMoving) return;

    client.updateCameraPosition.mutate({
      id,
      actionXY: "stop-stop",
    });
    client.updateCameraPosition.mutate({
      id,
      actionZF: "focus-stop",
    });
    client.updateCameraPosition.mutate({
      id,
      actionZF: "zoom-stop",
    });
  }, [isMoving]);

  return (
    <Stack spacing={6}>
      <Stack
        sx={{
          flexDirection: "row",
        }}
      >
        {/* PTZ */}
        <SimpleGrid
          sx={{
            minWidth: "max-content",
          }}
          spacing={16}
          cols={3}
        >
          {Object.entries({
            "north-west": ArrowBigLeft, // Top-Left
            "north-stop": ArrowBigTop, // Top
            "north-east": ArrowBigTop, // Top-Right
            "stop-west": ArrowBigLeft, // Left
            home: Home, // Center
            "stop-east": ArrowBigRight, // Right
            "south-west": ArrowBigDown, // Bottom-Left
            "south-stop": ArrowBigDown, // Bottom
            "south-east": ArrowBigRight, // Bottom- Right
          }).map(([action, Icon], i) => (
            <Center key={i}>
              <Button
                size="xl"
                color="blue"
                variant="filled"
                onPointerUp={() =>
                  action === "home"
                    ? client.updateCameraPosition.mutate({
                        id,
                        home: true,
                      })
                    : setMoving(false)
                }
                onMouseLeave={() => setMoving(false)}
                onPointerDown={() => {
                  if (action === "home") return;

                  setMoving(true);
                  client.updateCameraPosition.mutate({
                    id,
                    actionXY: action as any,
                    speedXY: [
                      database.settings.speed.pan,
                      database.settings.speed.tilt,
                    ],
                  });
                }}
              >
                <Icon
                  style={{
                    transform: i % 2 || i === 4 ? undefined : "rotate(45deg)",
                  }}
                />
              </Button>
            </Center>
          ))}
        </SimpleGrid>

        {/* Focus and Zoom */}
        <Stack
          sx={{
            flexGrow: 1,
          }}
        >
          {[ZoomIn, ZoomOut, ZoomInArea, ZoomOutArea].map((Icon, i) => (
            <Button
              key={i}
              sx={{
                height: "100%",
              }}
              size="sm"
              color="blue"
              variant="filled"
              onPointerUp={() => setMoving(false)}
              onMouseLeave={() => setMoving(false)}
              onPointerDown={() => {
                setMoving(true);
                client.updateCameraPosition.mutate({
                  id,
                  actionZF: `${i === 0 || i === 1 ? "zoom" : "focus"}-${
                    i % 2 ? "out" : "in"
                  }` as any,
                  speedZF:
                    i === 0 || i === 1
                      ? database.settings.speed.zoom
                      : database.settings.speed.focus,
                });
              }}
            >
              <Icon />
            </Button>
          ))}
        </Stack>
      </Stack>

      {/* Auto Focus */}
      <SegmentedControl
        mt={4}
        value={camera.config.focus}
        data={DatabaseConfigZod.shape.focus.options}
        onChange={(value) =>
          client.updateCameraConfig.mutate({
            id,
            config: {
              focus: value as any,
            },
          })
        }
      />
    </Stack>
  );
};
