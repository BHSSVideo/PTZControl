import React from "react";
import { useApi } from "../../hooks/useApi";
import { titleCase } from "../../utils/titleCase";
import { Anchor, Box, Grid, NativeSelect, Slider, Text } from "@mantine/core";

export const Speeds = () => {
  const { database, client } = useApi();

  return (
    <Grid align="center">
      <Grid.Col span={12}>
        <NativeSelect
          label={
            <>
              Ramping&nbsp;
              <Anchor
                size="xs"
                href="https://www.desmos.com/calculator/q8yxuxd8qu"
                target="_blank"
              >
                (help)
              </Anchor>
            </>
          }
          data={[
            "constant",
            "linear",
            "square",
            "squareRoot",
            "exponentialIn",
            "exponentialOut",
            "trig",
          ].map((value) => ({
            value,
            label: titleCase(value),
          }))}
          value={database.settings.speed.mode}
          onChange={(event) =>
            client.updateSettings.mutate({
              speed: {
                mode: event.target.value as any,
              },
            })
          }
        />
      </Grid.Col>
      {Object.entries({
        preset: [1, 24],
        pan: [1, 24],
        tilt: [1, 20],
        zoom: [0, 7],
        focus: [0, 7],
      }).map(([name, range], i) => (
        <Grid.Col span={i === 0 ? 12 : 6} key={i}>
          <Box>
            <Text>{titleCase(name)} Speed</Text>
            <Slider
              min={range[0]}
              max={range[1]}
              value={database.settings.speed[name]}
              onChange={(value) =>
                client.updateSettings.mutate({
                  speed: {
                    [name]: value,
                  },
                })
              }
            />
          </Box>
        </Grid.Col>
      ))}
    </Grid>
  );
};
