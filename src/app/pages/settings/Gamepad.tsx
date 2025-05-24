import React, { Fragment } from "react";
import {
  Badge,
  Box,
  Center,
  Grid,
  Group,
  RingProgress,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  useMantineTheme,
} from "@mantine/core";
import {
  ArrowBigLeft,
  ArrowBigDown,
  ArrowBigRight,
  ArrowBigTop,
  LetterA,
  LetterB,
  LetterX,
  LetterY,
} from "tabler-icons-react";
import { useGamepad } from "../../hooks/useGamepad";

export const Gamepad = () => {
  const state = useGamepad();
  const theme = useMantineTheme();

  return (
    <>
      {!state && <Text>Press any button to recognize controller!</Text>}
      {state && (
        <Grid justify="center" gutter="md" m={16}>
          {/* Sticks */}
          <Grid.Col span={6} sx={{}}>
            <Group position="center">
              {["left", "right"].map((name, i) => (
                <Stack align="center" spacing={2} key={i}>
                  <Text>
                    {name[0].toUpperCase()}
                    {name.substring(1)}
                    &nbsp;Stick
                  </Text>
                  <Box
                    sx={{
                      width: 96,
                      height: 96,
                      position: "relative",
                      borderRadius: 8,
                      background: theme.colors.gray[8],
                    }}
                  >
                    {[25, 50, 75, 100].map((size, j) => (
                      <Box
                        key={j}
                        sx={{
                          top: "50%",
                          left: "50%",
                          width: `${size}%`,
                          height: `${size}%`,
                          borderWidth: 1,
                          borderRadius: "100%",
                          position: "absolute",
                          borderStyle: "solid",
                          borderColor: i
                            ? theme.colors.red[6]
                            : theme.colors.green[6],
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    ))}
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        background: state[`${name}StickHat`]
                          ? theme.colors.yellow[8]
                          : theme.colors.blue[8],
                        position: "absolute",
                        borderRadius: "100%",
                        transform: "translate(-50%, -50%)",
                        top: `${(state[`${name}StickY`] + 1) / 0.02}%`,
                        left: `${(state[`${name}StickX`] + 1) / 0.02}%`,
                      }}
                    />
                  </Box>
                  <Text size="xs">
                    ({state[`${name}StickX`].toFixed(2)},
                    {state[`${name}StickY`].toFixed(2)})
                  </Text>
                </Stack>
              ))}
            </Group>
          </Grid.Col>

          {/* Triggers */}
          <Grid.Col span={6}>
            <Group position="center">
              {["left", "right"].map((name, i) => (
                <Stack align="center" spacing={0} key={i}>
                  <Text>
                    {name[0].toUpperCase()}
                    {name.substring(1)}
                    &nbsp;Trigger
                  </Text>
                  <RingProgress
                    roundCaps
                    size={96}
                    thickness={8}
                    sections={[
                      { value: state[`${name}Trigger`] * 100, color: "blue" },
                    ]}
                    label={
                      <Text color="blue" weight={700} align="center" size="md">
                        {Math.round(state[`${name}Trigger`] * 100)}%
                      </Text>
                    }
                  />
                  <Badge
                    fullWidth
                    key={i}
                    variant={state[`${name}Bumper`] ? "filled" : "outline"}
                  >
                    {name}&nbsp;Bumper
                  </Badge>
                </Stack>
              ))}
            </Group>
          </Grid.Col>

          {/* Primary Buttons  */}
          <Grid.Col span={6}>
            <Group position="center">
              <SimpleGrid
                sx={{
                  flexGrow: 1,
                }}
                spacing={0}
                cols={3}
              >
                {Object.entries({
                  up: ArrowBigTop,
                  left: ArrowBigLeft,
                  right: ArrowBigRight,
                  down: ArrowBigDown,
                }).map(([name, Icon], i) => (
                  <Fragment key={i}>
                    <Box></Box>
                    <Center>
                      <ThemeIcon
                        variant={state[`${name}Button`] ? "filled" : "outline"}
                      >
                        <Icon />
                      </ThemeIcon>
                    </Center>
                  </Fragment>
                ))}
              </SimpleGrid>
              <SimpleGrid
                sx={{
                  flexGrow: 1,
                }}
                spacing={0}
                cols={3}
              >
                {Object.entries({
                  y: LetterY,
                  x: LetterX,
                  b: LetterB,
                  a: LetterA,
                }).map(([name, Icon], i) => (
                  <Fragment key={i}>
                    <Box></Box>
                    <Center>
                      <ThemeIcon
                        variant={state[`${name}Button`] ? "filled" : "outline"}
                      >
                        <Icon />
                      </ThemeIcon>
                    </Center>
                  </Fragment>
                ))}
              </SimpleGrid>
            </Group>
          </Grid.Col>

          {/* Secondary Buttons */}
          <Grid.Col span={6}>
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Group>
                {["view", "logo", "menu"].map((name, i) => (
                  <Badge
                    key={i}
                    fullWidth
                    sx={{
                      width: 96,
                    }}
                    variant={state[`${name}Button`] ? "filled" : "outline"}
                  >
                    {name}
                  </Badge>
                ))}
              </Group>
            </Box>
          </Grid.Col>
        </Grid>
      )}
    </>
  );
};
