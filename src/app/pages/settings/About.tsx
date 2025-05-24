import React from "react";
import { Stack, Text, Title, Image, Anchor } from "@mantine/core";

export const About = () => {
  return (
    <Stack align="center" mt={24} spacing={8}>
      <Image src="icon.svg" width={128} />
      <Title order={4}>PTZ Control v1.0.0</Title>
      <Text>
        Developed by&nbsp;
        <Anchor
          target="_blank"
          href="https://www.github.com/tobythomassen/ptz-control"
        >
          Toby Thomassen
        </Anchor>
      </Text>
    </Stack>
  );
};
