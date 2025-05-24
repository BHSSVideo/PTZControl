import React from "react";
import { About } from "./settings/About";
import { Speeds } from "./settings/Speeds";
import { Cameras } from "./settings/Cameras";
import { Controls } from "./settings/Controls";
import { Gamepad } from "./settings/Gamepad";
import { ScrollArea, Tabs } from "@mantine/core";
import {
  Camera,
  Contrast2,
  DeviceGamepad,
  InfoCircle,
  Keyboard,
} from "tabler-icons-react";

export const Settings = () => {
  const sections = [
    {
      name: "Cameras",
      icon: <Camera />,
      content: <Cameras />,
    },
    {
      name: "Speeds",
      icon: <Contrast2 />,
      content: <Speeds />,
    },
    {
      name: "Controls",
      icon: <Keyboard />,
      content: <Controls />,
    },
    {
      name: "Gamepad",
      icon: <DeviceGamepad />,
      content: <Gamepad />,
    },
    {
      name: "About",
      icon: <InfoCircle />,
      content: <About />,
    },
  ];

  return (
    <Tabs
      defaultValue="cameras"
      sx={{
        height: "100vh",
        display: "flex",
        overflow: "hidden",
        flexDirection: "column",
      }}
    >
      <Tabs.List>
        {sections.map((section, i) => (
          <Tabs.Tab
            key={i}
            icon={section.icon}
            value={section.name.toLowerCase()}
          >
            {section.name}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      <ScrollArea
        sx={{
          flexGrow: 1,
        }}
      >
        {sections.map((section, i) => (
          <Tabs.Panel
            value={section.name.toLowerCase()}
            sx={{
              paddingBlock: 4,
              paddingInline: 8,
            }}
            key={i}
          >
            {section.content}
          </Tabs.Panel>
        ))}
      </ScrollArea>
    </Tabs>
  );
};
