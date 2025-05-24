import React, { useState } from "react";
import { useApi } from "../../hooks/useApi";
import { titleCase } from "../../utils/titleCase";
import { useCamera } from "../../hooks/useCamera";
import { DatabaseConfigZod } from "../../../electron/zod";
import {
  Box,
  Button,
  Modal,
  NativeSelect,
  Select,
  SimpleGrid,
  Stack,
} from "@mantine/core";

type Props = {
  id: string;
};

export const Image = ({ id }: Props) => {
  const { database, client } = useApi();
  const [copyId, setCopyId] = useState<string>();
  const camera = useCamera(id);

  return (
    <>
      <Modal
        opened={typeof copyId !== "undefined"}
        onClose={() => setCopyId(undefined)}
        title="Copy Settings to Camera"
      >
        <Select
          label="Destination Camera"
          onChange={(value) => setCopyId(value!)}
          data={database.cameras.map((x) => ({
            value: x.id,
            label: x.name + (x.id === id ? " (this camera)" : ""),
            disabled: x.id === id,
          }))}
        />
        <Button
          fullWidth
          mt={8}
          disabled={!copyId}
          onClick={async () => {
            await client.updateCameraConfig.mutate({
              id: copyId!,
              config: database.cameras.find((x) => x.id === copyId)!.config,
            });

            setCopyId(undefined);
          }}
        >
          Transfer
        </Button>
      </Modal>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <SimpleGrid cols={2}>
          {Object.entries(camera.config)
            .slice(2, Object.keys(camera.config).length)
            .map(([name, value], i) => (
              <NativeSelect
                size="xs"
                key={i}
                sx={{
                  marginTop: i > 3 ? -12 : -8,
                }}
                label={titleCase(name)}
                data={DatabaseConfigZod.shape[name].options}
                value={value}
                onChange={async (event) => {
                  client.updateCameraConfig.mutate({
                    id,
                    config: {
                      [name as any]: event.target.value as any,
                    },
                  });
                }}
              />
            ))}
        </SimpleGrid>
        <Stack
          sx={{
            flexDirection: "row",
            marginTop: 12,
          }}
        >
          <Button
            fullWidth
            size="xs"
            onClick={() =>
              client.updateCameraReset.mutate({
                id,
              })
            }
          >
            Reset to Default
          </Button>
          <Button fullWidth size="xs" onClick={() => setCopyId("")}>
            Copy to Other
          </Button>
        </Stack>
      </Box>
    </>
  );
};
