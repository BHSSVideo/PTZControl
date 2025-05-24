import { useMemo } from "react";
import { useApi } from "./useApi";

export const useCamera = (id: string) => {
  const { database } = useApi();
  const camera = useMemo(
    () => database.cameras.find((x) => x.id === id)!,
    [database]
  );

  return camera;
};
