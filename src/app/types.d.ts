export type CamerasType = Array<{
  name: string;
  address: string;
}>;

export type SpeedsType = {
  pan: number;
  tilt: number;
  zoom: number;
  focus: number;
  preset: number;
};

export type ControlsType = {
  ramping:
    | "constant"
    | "linear"
    | "square"
    | "squareRoot"
    | "exponentialIn"
    | "exponentialOut"
    | "trig";
  method: "left" | "right" | "split" | "trigger";
};
