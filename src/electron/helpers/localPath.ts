import { app } from "electron";
import { join } from "node:path";

export const localPath = (file: string) =>
  join(join(__dirname, app.isPackaged ? ".." : "../../public"), file);
