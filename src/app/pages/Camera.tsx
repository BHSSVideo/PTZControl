import React from "react";
import { PTZ } from "./camera/PTZ";
import { Image } from "./camera/Image";
import { Notes } from "./camera/Notes";
import { Presets } from "./camera/Presets";
import { Preview } from "./camera/Preview";
import { useDisclosure } from "@mantine/hooks";
import {
  Accordion,
  ActionIcon,
  Box,
  Button,
  Center,
  Divider,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  Adjustments,
  DeviceGamepad2,
  Menu2,
  Notes as Notepad,
  PlayerRecord,
  PlayerStop,
  Stack2,
  X,
} from "tabler-icons-react";
import { useCamera } from "../hooks/useCamera";
import { timestamp } from "../utils/timestamp";
import { useApi } from "../hooks/useApi";
import { Timestamp } from "../components/Timestamp";

type Props = {
  id: string;
};

export const Camera = ({ id }: Props) => {
  const sidebarWidth = 512;
  const transition = "all .15s ease-in-out";
  const sections = [
    {
      name: "Image",
      icon: <Adjustments size={16} />,
      content: <Image id={id} />,
    },
    {
      name: "PTZ",
      icon: <DeviceGamepad2 size={16} />,
      content: <PTZ id={id} />,
    },
    {
      name: "Presets",
      icon: <Stack2 size={16} />,
      content: <Presets id={id} />,
    },
    {
      name: "Notes",
      icon: <Notepad size={16} />,
      content: <Notes id={id} />,
    },
  ];

  const camera = useCamera(id);
  const { client } = useApi();
  const [opened, handlers] = useDisclosure(true);

  return !camera ? (
    <Center
      sx={{
        height: "100vh",
      }}
    >
      <Stack spacing={2}>
        <Title order={4}>Not Found</Title>
        <Text>
          This camera was removed or recreated, try relaunching from the
          "Cameras" tab!
        </Text>
      </Stack>
    </Center>
  ) : (
    <>
      {/* Sidebar */}
      <Box
        sx={{
          top: 48 + 2, // For divider
          bottom: 0,
          transition,
          display: "flex",
          position: "absolute",
          width: opened ? sidebarWidth : 0,
          left: opened ? 0 : -sidebarWidth,
        }}
      >
        <ScrollArea
          sx={{
            width: "100%",
          }}
        >
          <Accordion
            multiple={true}
            defaultValue={["image"]}
            sx={{
              width: "100%",
            }}
          >
            {sections.map((section, i) => (
              <Accordion.Item key={i} value={section.name.toLowerCase()}>
                <Accordion.Control
                  icon={section.icon}
                  sx={(theme) => ({
                    borderBottomWidth: 1,
                    borderBottomStyle: "solid",
                    borderBottomColor:
                      theme.colorScheme === "dark"
                        ? theme.colors.dark[4]
                        : theme.colors.gray[3],
                  })}
                >
                  {section.name}
                </Accordion.Control>
                <Accordion.Panel pt={4}>{section.content}</Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </ScrollArea>
      </Box>

      <Box
        sx={{
          height: "100vh",
          display: "flex",
          overflow: "hidden",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Stack
          sx={{
            minHeight: 48,
            paddingInline: 8,
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <ActionIcon onClick={handlers.toggle} size="lg">
            {[<X />, <Menu2 />].map((icon, i) => (
              <Box
                sx={{
                  transition,
                  marginTop: 2,
                  position: "absolute",
                  opacity: (opened && !i) || (!opened && i) ? 1 : 0,
                  transform:
                    opened && i
                      ? "rotate( 90deg ) scale( 0 )"
                      : "transform: rotate( -90deg ) scale( 0 )",
                }}
                key={i}
              >
                {icon}
              </Box>
            ))}
          </ActionIcon>
          <Title order={4}>{camera.name}</Title>
          <Box sx={{ flexGrow: 1 }} />
          {camera.recording ? (
            <Text>
              <Timestamp source={new Date(camera.recording)} />
            </Text>
          ) : undefined}
          <Button
            leftIcon={camera.recording ? <PlayerStop /> : <PlayerRecord />}
            size="xs"
            onClick={async () => {
              await client.updateCameraRecording.mutate({
                id,
                running: !camera.recording,
              });
            }}
          >
            {camera.recording ? "Stop Recording" : "Start Recording"}
          </Button>
        </Stack>

        <Divider size={2} />

        {/* Sidebar + Main */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
          }}
        >
          {/* Virtual Sidebar */}
          <Box
            sx={{
              width: opened ? sidebarWidth : 0,
              transition,
            }}
          />

          {/* Main */}
          <Box
            sx={{
              flexGrow: 2,
              display: "flex",
              height: "calc(100vh - 50px)",
            }}
          >
            <Preview id={id} />
          </Box>
        </Box>
      </Box>
    </>
  );
};
