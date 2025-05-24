import React, { useState } from "react";
import { useApi } from "../../hooks/useApi";
import { titleCase } from "../../utils/titleCase";
import { Button, Group, Modal, Table, Text, TextInput } from "@mantine/core";

export const Cameras = () => {
  const { database, client } = useApi();
  const [isLoading, setLoading] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    address: string;
  }>();

  return (
    <>
      <Modal
        opened={!!form}
        onClose={() => setForm(undefined)}
        title="New Camera"
      >
        {["name", "address"].map((field, i) =>
          form ? (
            <TextInput
              key={i}
              label={titleCase(field)}
              value={form![field]}
              onChange={(e) =>
                setForm((previous) => ({
                  ...previous!,
                  [field]: e.target.value,
                }))
              }
            />
          ) : undefined
        )}
        <Button
          fullWidth
          mt={8}
          onClick={async () => {
            if (!form) return;
            if (form.name.length < 3) return;
            if (form.address.length < 3) return;

            // Ensure only one instance per camera
            if (
              database.cameras.findIndex(
                (camera) => camera.address === form.address
              ) !== -1
            )
              return;

            await client.createCamera.mutate({
              name: form.name,
              address: form.address,
            });

            setForm(undefined);
          }}
        >
          Save
        </Button>
      </Modal>

      {database.cameras.length ? (
        <Table striped verticalSpacing="xs">
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {database.cameras.map((camera, i) => (
              <tr key={i}>
                <td>{camera.name || "N/A"}</td>
                <td>{camera.address || "N/A"}</td>
                <td>
                  <Group noWrap>
                    <Button
                      fullWidth
                      size="xs"
                      disabled={isLoading}
                      onClick={async () => {
                        setLoading(true);
                        await client.deleteCamera.mutate({
                          id: camera.id,
                        });
                        setLoading(false);
                      }}
                    >
                      Delete Camera
                    </Button>
                    <Button
                      fullWidth
                      size="xs"
                      disabled={isLoading}
                      onClick={() =>
                        window.open(
                          `${window.location.protocol}//${window.location.host}/#${camera.id}`,
                          "_blank"
                        )
                      }
                    >
                      Launch Camera
                    </Button>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Text>No cameras added!</Text>
      )}

      <Button
        mt={8}
        fullWidth
        onClick={() =>
          setForm({
            name: "New Camera",
            address: "192.168.100.88",
          })
        }
      >
        Add Camera
      </Button>
    </>
  );
};
