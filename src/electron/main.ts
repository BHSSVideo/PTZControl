import "./services/window";
import "./services/server";

import { Camera } from "./services/camera";
import { Database } from "./services/database";

export let database = new Database();
export let cameras: Array<Camera> = database.cameras.map(
  (camera) => new Camera(camera.id, camera.address)
);
