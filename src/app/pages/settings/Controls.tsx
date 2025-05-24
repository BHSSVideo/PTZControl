import React from "react";
import { Grid, NativeSelect, Table } from "@mantine/core";
import { useApi } from "../../hooks/useApi";

export const Controls = () => {
  const { database, client } = useApi();

  return (
    <Grid align="center">
      <Grid.Col span={12}>
        <NativeSelect
          label="Method"
          data={[
            {
              value: "left",
              label: "Left Stick",
            },
            {
              value: "right",
              label: "Right Stick",
            },
            {
              value: "split",
              label: "Split Sticks",
            },
            {
              value: "trigger",
              label: "Triggers",
            },
          ]}
          value={database.settings.control.gamepadMode}
          onChange={(event) =>
            client.updateSettings.mutate({
              control: {
                gamepadMode: event.target.value as any,
              },
            })
          }
        />
      </Grid.Col>
      <Grid.Col span={12}>
        <Table mt={-12} verticalSpacing={2}>
          <thead>
            <tr>
              <th>Input</th>
              <th>Output</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Controller X Button</td>
              <td>Camera Return to Home</td>
            </tr>

            {
              {
                left: (
                  <>
                    <tr>
                      <td>Controller Left Stick Horizontal</td>
                      <td>Camera Pan</td>
                    </tr>
                    <tr>
                      <td>Controller Left Stick Vertical</td>
                      <td>Camera Tilt</td>
                    </tr>
                    <tr>
                      <td>Controller Left Trigger</td>
                      <td>Camera Zoom Out</td>
                    </tr>
                    <tr>
                      <td>Controller Right Trigger</td>
                      <td>Camera Zoom In</td>
                    </tr>
                  </>
                ),
                right: (
                  <>
                    <tr>
                      <td>Controller Right Stick Horizontal</td>
                      <td>Camera Pan</td>
                    </tr>
                    <tr>
                      <td>Controller Right Stick Vertical</td>
                      <td>Camera Tilt</td>
                    </tr>
                    <tr>
                      <td>Controller Left Trigger</td>
                      <td>Camera Zoom Out</td>
                    </tr>
                    <tr>
                      <td>Controller Right Trigger</td>
                      <td>Camera Zoom In</td>
                    </tr>
                  </>
                ),
                split: (
                  <>
                    <tr>
                      <td>Controller Left Stick Horizontal</td>
                      <td>Camera Pan</td>
                    </tr>
                    <tr>
                      <td>Controller Right Stick Vertical</td>
                      <td>Camera Tilt</td>
                    </tr>
                    <tr>
                      <td>Controller Left Trigger</td>
                      <td>Camera Zoom Out</td>
                    </tr>
                    <tr>
                      <td>Controller Right Trigger</td>
                      <td>Camera Zoom In</td>
                    </tr>
                  </>
                ),
                trigger: (
                  <>
                    <tr>
                      <td>Controller Left Stick Vertical</td>
                      <td>Camera Tilt</td>
                    </tr>
                    <tr>
                      <td>Controller Right Stick Vertical</td>
                      <td>Camera Zoom</td>
                    </tr>
                    <tr>
                      <td>Controller Left Trigger</td>
                      <td>Camera Pan Left</td>
                    </tr>
                    <tr>
                      <td>Controller Right Trigger</td>
                      <td>Camera Pan Right</td>
                    </tr>
                  </>
                ),
              }[database.settings.control.gamepadMode]
            }

            <tr>
              <td>Controller Up Button</td>
              <td>Camera Preset 1</td>
            </tr>
            <tr>
              <td>Controller Right Button</td>
              <td>Camera Preset 2</td>
            </tr>
            <tr>
              <td>Controller Down Button</td>
              <td>Camera Preset 3</td>
            </tr>
            <tr>
              <td>Controller Left Button</td>
              <td>Camera Preset 4</td>
            </tr>
          </tbody>
        </Table>
      </Grid.Col>
    </Grid>
  );
};
