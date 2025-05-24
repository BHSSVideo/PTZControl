import { initTRPC } from "@trpc/server";
import createCamera from "./routes/createCamera";
import deleteCamera from "./routes/deleteCamera";
import onDatabase from "./routes/onDatabase";
import onFrame from "./routes/onFrame";
import updateCamera from "./routes/updateCamera";
import updateCameraConfig from "./routes/updateCameraConfig";
import updateCameraPosition from "./routes/updateCameraPosition";
import updateCameraPreset from "./routes/updateCameraPreset";
import updateCameraRecording from "./routes/updateCameraRecording";
import updateCameraReset from "./routes/updateCameraReset";
import updateSettings from "./routes/updateSettings";

export const trpc = initTRPC.create();
export const appRouter = trpc.mergeRouters(
  createCamera(),
  deleteCamera(),
  onDatabase(),
  onFrame(),
  updateCamera(),
  updateCameraConfig(),
  updateCameraPosition(),
  updateCameraPreset(),
  updateCameraRecording(),
  updateCameraReset(),
  updateSettings()
);
export type AppRouter = typeof appRouter;
