import { DatabaseType } from "../zod";
import { EventEmitter } from "node:events";
import { tempPath } from "../helpers/tempPath";
import { writeFileSync, existsSync, readFileSync } from "node:fs";

export declare interface Database {
  on(event: string, listener: Function): this;
  on(event: "change", listener: () => void): this;
}

export class Database extends EventEmitter {
  private dbPath = tempPath("ptz-control.json");
  public version: DatabaseType["version"] = 1;
  public cameras: DatabaseType["cameras"] = [];
  public settings: DatabaseType["settings"] = {
    darkMode: true,
    control: {
      requireFocus: true,
      gamepadMode: "left",
      keyboardMode: "left",
    },
    speed: {
      mode: "linear",
      preset: 24,
      pan: 12,
      tilt: 10,
      zoom: 4,
      focus: 4,
    },
  };

  constructor() {
    super();

    // Check if first run
    if (existsSync(this.dbPath)) {
      console.log("found database");
      // todo: version control
      const payload = readFileSync(this.dbPath);
      const oldDatabase: DatabaseType = JSON.parse(payload.toString());
      this.version = oldDatabase.version;
      this.cameras = oldDatabase.cameras;
      this.settings = oldDatabase.settings;
    }

    // Handle updates
    let oldPayload = "";
    setInterval(() => {
      const newPayload = this.serialize();

      if (newPayload !== oldPayload) {
        writeFileSync(this.dbPath, newPayload);
        this.emit("change", this.value());
      }

      oldPayload = newPayload;
    }, 10);
  }

  public value() {
    return {
      version: this.version,
      cameras: this.cameras,
      settings: this.settings,
    };
  }

  public serialize() {
    return JSON.stringify(this.value(), null, 2);
  }
}
