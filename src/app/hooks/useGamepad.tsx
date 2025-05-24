import React, { createContext, useContext, useEffect, useState } from "react";

export type Context = {
  leftStickX: number;
  leftStickY: number;
  leftStickHat: boolean;
  rightStickX: number;
  rightStickY: number;
  rightStickHat: boolean;
  leftTrigger: number;
  rightTrigger: number;
  leftBumper: boolean;
  rightBumper: boolean;
  upButton: boolean;
  downButton: boolean;
  leftButton: boolean;
  rightButton: boolean;
  aButton: boolean;
  bButton: boolean;
  xButton: boolean;
  yButton: boolean;
  viewButton: boolean;
  menuButton: boolean;
  logoButton: boolean;
};
const GamepadContext = createContext<Context | undefined>(undefined);

export const GamepadProvider = ({ children }) => {
  const [index, setIndex] = useState<false | number>(false);
  const [state, setState] = useState<Context>();

  // Input filtering
  const deadZone = ([x, y]: [number, number]): [number, number] => {
    if (Math.abs(x) < 0.3) x = 0;
    if (Math.abs(y) < 0.3) y = 0;

    return [x, y];
  };
  const normalize = ([x, y]: [number, number]): [number, number] => {
    const magnitude = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

    if (magnitude > 1) {
      x /= magnitude;
      y /= magnitude;
    }

    return [x, y];
  };

  // Event loop
  useEffect(() => {
    if (index === false) return setState(undefined);
    let previousState: Context = {} as any;

    const handle = setInterval(() => {
      // Query current state
      const gamepad = navigator.getGamepads()[index] as Gamepad;
      const currentState: Context = {
        leftStickX: gamepad.axes[0],
        leftStickY: gamepad.axes[1],
        leftStickHat: gamepad.buttons[10].pressed,
        rightStickX: gamepad.axes[2],
        rightStickY: gamepad.axes[3],
        rightStickHat: gamepad.buttons[11].pressed,
        leftTrigger: gamepad.buttons[6].value,
        rightTrigger: gamepad.buttons[7].value,
        leftBumper: gamepad.buttons[4].pressed,
        rightBumper: gamepad.buttons[5].pressed,
        upButton: gamepad.buttons[12].pressed,
        downButton: gamepad.buttons[13].pressed,
        leftButton: gamepad.buttons[14].pressed,
        rightButton: gamepad.buttons[15].pressed,
        aButton: gamepad.buttons[0].pressed,
        bButton: gamepad.buttons[1].pressed,
        xButton: gamepad.buttons[2].pressed,
        yButton: gamepad.buttons[3].pressed,
        viewButton: gamepad.buttons[8].pressed,
        menuButton: gamepad.buttons[9].pressed,
        logoButton: gamepad.buttons[16].pressed,
      };

      for (const side of ["left", "right"]) {
        const stick = normalize(
          deadZone([
            currentState[`${side}StickX`],
            currentState[`${side}StickY`],
          ])
        );
        currentState[`${side}StickX`] = stick[0];
        currentState[`${side}StickY`] = stick[1];
      }

      // Check to see if any fields changed
      for (const key of Object.keys(currentState)) {
        if (!currentState || currentState[key] !== previousState[key]) {
          previousState = currentState;
          setState(currentState);
          break;
        }
      }
    }, 1000 / 100); // 100hz

    return () => clearInterval(handle);
  }, [index]);

  // Connection logic
  useEffect(() => {
    const onChange = (event: GamepadEvent) => {
      if (event.type === "gamepadconnected" && index === false)
        setIndex(event.gamepad.index);

      if (event.type !== "gamepadconnected" && index !== false) setIndex(false);
    };

    window.addEventListener("gamepadconnected", onChange);
    window.addEventListener("gamepaddisconnected", onChange);

    return () => {
      window.removeEventListener("gamepadconnected", onChange);
      window.removeEventListener("gamepaddisconnected", onChange);
    };
  }, [index]);

  return (
    <GamepadContext.Provider value={state}>{children}</GamepadContext.Provider>
  );
};

export const useGamepad = () => useContext(GamepadContext);
