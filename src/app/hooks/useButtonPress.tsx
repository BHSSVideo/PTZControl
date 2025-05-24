import { useEffect, useRef } from "react";
import { Context, useGamepad } from "./useGamepad";

export const useButtonPress = (callback: () => void, target: keyof Context) => {
  const state = useGamepad();
  const value = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    // Check if connected
    if (typeof state !== "object") return;

    const newValue = state[target] as boolean;
    const oldValue = value.current;
    value.current = newValue;

    // Check if first run
    if (typeof oldValue === "undefined") return;

    // Check if non-target state update
    if (newValue === oldValue) return;

    // Check if press down or up
    if (newValue) return;

    callback();
  }, [state]);
};
