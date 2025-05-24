import { useEffect, useRef } from "react";
import { useApi } from "./useApi";
import { useButtonPress } from "./useButtonPress";
import { ControlsType } from "../types";
import { useGamepad } from "./useGamepad";

const map = (
  input: number,
  inputRange: [number, number],
  outputRange: [number, number]
) =>
  ((input - inputRange[0]) * (outputRange[1] - outputRange[0])) /
    (inputRange[1] - inputRange[0]) +
  outputRange[0];

export const useControllerInput = (id: string) => {
  const state = useGamepad();
  const previousZSpeed = useRef(0);
  const previousZDirection = useRef("");
  const previousPTSpeed = useRef([0, 0]);
  const previousPTDirection = useRef("");
  const { database, client } = useApi();

  const transform = (input: number, mode: ControlsType["ramping"]): number =>
    ({
      constant: 1,
      linear: input,
      square: Math.pow(input, 2),
      squareRoot: Math.pow(input, 1 / 2),
      exponentialIn: Math.pow(2, 10 * input - 10),
      exponentialOut: 1 - Math.pow(2, -10 * input),
      trig: -(Math.cos(Math.PI * input) - 1) / 2,
    }[mode]);

  // Home
  useButtonPress(
    () =>
      client.updateCameraPosition.mutate({
        id,
        home: true,
      }),
    "xButton"
  );

  // PTZ controls
  useEffect(() => {
    if (!state) return;
    if (!document.hasFocus()) return;

    // Start with stop commands
    let xDirection = "stop";
    let yDirection = "stop";
    let zDirection = "zoom-stop";

    // Start with constant speeds
    let panSpeed = database.settings.speed.pan;
    let tiltSpeed = database.settings.speed.tilt;
    let zoomSpeed = database.settings.speed.zoom;

    if (
      database.settings.control.gamepadMode === "left" ||
      database.settings.control.gamepadMode === "right"
    ) {
      if (state[`${database.settings.control.gamepadMode}StickX`] > 0)
        xDirection = "east";
      else if (state[`${database.settings.control.gamepadMode}StickX`] < 0)
        xDirection = "west";
      if (state[`${database.settings.control.gamepadMode}StickY`] > 0)
        yDirection = "south";
      else if (state[`${database.settings.control.gamepadMode}StickY`] < 0)
        yDirection = "north";
      if (state.leftTrigger > 0) zDirection = "zoom-out";
      else if (state.rightTrigger > 0) zDirection = "zoom-in";

      panSpeed = Math.abs(
        state[`${database.settings.control.gamepadMode}StickX`]
      );
      tiltSpeed = Math.abs(
        state[`${database.settings.control.gamepadMode}StickY`]
      );
      zoomSpeed =
        state.leftTrigger > 0 ? state.leftTrigger : state.rightTrigger;
    }

    if (database.settings.control.gamepadMode === "split") {
      if (state.leftStickX > 0) xDirection = "east";
      else if (state.leftStickX < 0) xDirection = "west";
      if (state.rightStickY > 0) yDirection = "south";
      else if (state.rightStickY < 0) yDirection = "north";
      if (state.leftTrigger > 0) zDirection = "zoom-out";
      else if (state.rightTrigger > 0) zDirection = "zoom-in";

      panSpeed = Math.abs(state.leftStickX);
      tiltSpeed = Math.abs(state.rightStickY);
      zoomSpeed =
        state.leftTrigger > 0 ? state.leftTrigger : state.rightTrigger;
    }

    if (database.settings.control.gamepadMode === "trigger") {
      if (state.rightTrigger > 0.05) xDirection = "east";
      else if (state.leftTrigger > 0.05) xDirection = "west";
      if (state.leftStickY > 0) yDirection = "south";
      else if (state.leftStickY < 0) yDirection = "north";
      if (state.rightStickY > 0) zDirection = "zoom-out";
      else if (state.rightStickY < 0) zDirection = "zoom-in";

      panSpeed = state.leftTrigger > 0 ? state.leftTrigger : state.rightTrigger;
      tiltSpeed = Math.abs(state.leftStickY);
      zoomSpeed = Math.abs(state.rightStickY);
    }

    // Apply transformation functions
    panSpeed = Math.floor(
      map(
        transform(panSpeed, database.settings.speed.mode),
        [0, 1],
        [0, database.settings.speed.pan]
      )
    );
    tiltSpeed = Math.floor(
      map(
        transform(tiltSpeed, database.settings.speed.mode),
        [0, 1],
        [0, database.settings.speed.tilt]
      )
    );
    zoomSpeed = Math.floor(
      map(
        transform(zoomSpeed, database.settings.speed.mode),
        [0, 1],
        [0, database.settings.speed.zoom]
      )
    );

    // Check for new PT command
    let newPTSpeed = [panSpeed, tiltSpeed];
    let newPTDirection = `${yDirection}-${xDirection}`;
    if (
      previousPTSpeed.current[0] !== newPTSpeed[0] ||
      previousPTSpeed.current[1] !== newPTSpeed[1] ||
      previousPTDirection.current !== newPTDirection
    ) {
      previousPTDirection.current = newPTDirection;
      previousPTSpeed.current = newPTSpeed;

      client.updateCameraPosition.mutate({
        id,
        actionXY: newPTDirection as any,
        speedXY: newPTSpeed as any,
      });
    }

    // Check for new Z command
    const newZSpeed = zoomSpeed;
    const newZDirection = zDirection;
    if (
      previousZSpeed.current !== newZSpeed ||
      previousZDirection.current !== newZDirection
    ) {
      previousZSpeed.current = newZSpeed;
      previousZDirection.current = newZDirection;

      client.updateCameraPosition.mutate({
        id,
        actionZF: newZDirection as any,
        speedZF: newZSpeed as any,
      });
    }
  }, [state, database]);
};
