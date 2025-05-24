import React, { useEffect, useState } from "react";
import { RichTextEditor } from "@mantine/rte";
import { useDebouncedValue } from "@mantine/hooks";
import { useApi } from "../../hooks/useApi";
import { Box } from "@mantine/core";

type Props = {
  id: string;
};

export const Notes = ({ id }: Props) => {
  const { database, client } = useApi();
  const [notes, setNotes] = useState("");

  const [debounced] = useDebouncedValue(notes, 200);
  useEffect(() => {
    if (notes === "") return;
    if (notes === "<p><br></p>") return;

    client.updateCamera.mutate({
      id,
      notes,
    });
  }, [debounced]);

  useEffect(() => {
    setNotes(database.cameras.find((x) => x.id === id)!.notes);
  }, [database]);

  return (
    <RichTextEditor
      id="editor"
      value={notes}
      onChange={setNotes}
      controls={[
        ["bold", "italic", "underline", "strike", "clean"],
        ["orderedList", "unorderedList", "link"],
        ["alignLeft", "alignCenter", "alignRight"],
      ]}
    />
  );
};
