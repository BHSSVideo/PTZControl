import { app } from "electron";
import { join } from "node:path";
import { tmpdir } from "node:os";

export const tempPath = (file: string) =>
  join(app.isPackaged ? tmpdir() : join(__dirname, "../.."), file);
