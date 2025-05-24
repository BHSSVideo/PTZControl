import { Stream } from "./stream";
import { database } from "../main";
import { homedir } from "node:os";
import { join } from "node:path";
import { EventEmitter } from "node:events";
import { sendVisca } from "../helpers/sendVisca";
import { DatabaseConfigType, DatabaseConfigZod } from "../zod";

export declare interface Camera {
  on(event: string, listener: Function): this;
  on(event: "frame", listener: (data: string) => void): this;
}

export class Camera extends EventEmitter {
  public id: string;
  public address: string;
  private previewStream: Stream;
  private recordingStream: Stream;
  private configHandle: number;
  private currentConfig: DatabaseConfigType;

  constructor(id: string, address: string) {
    super();

    const index = database.cameras.findIndex((x) => x.id === id);
    if (index === -1) throw "Camera not found";

    // Fix recording value (in case of previous crash)
    database.cameras[index].recording = 0;

    this.id = id;
    this.address = address;
    this.currentConfig = database.cameras[index].config;
    this.configHandle = setInterval(() => this.fetchConfig(), 3000) as any;

    // Load config
    this.config(this.currentConfig);
  }

  public async destroy() {
    if (this.previewStream) await this.previewStream.destroy();
    clearInterval(this.configHandle);
  }

  private async fetchConfig(force?: boolean) {
    const oldConfig = JSON.stringify(this.currentConfig);

    const responses = await Promise.all(
      [
        "81 09 7E 7E 01 FF", // Camera block
        "81 09 7E 7E 03 FF", // Enlargement block
        "81 09 04 38 FF", // Focus Mode
        "81 09 04 A1 FF", // Brightness
      ].map((command) => sendVisca(this.address, command))
    );

    // Update current config with new values
    Object.entries({
      focus: responses[2][5] === "2" ? 0 : 1,
      whiteBalance: parseInt(responses[0][13] === "5" ? "4" : responses[0][13]),
      exposure: ["0", "3", "a", "b", "d"].indexOf(responses[0][17]),
      shutterSpeed: parseInt(`${responses[0][20]}${responses[0][21]}`, 16) - 1,
      iris: parseInt(`${responses[0][22]}${responses[0][23]}`, 16),
      brightness: parseInt(`${responses[3][9]}${responses[3][11]}`, 16),
      afSensitivity: parseInt(responses[1][19], 16) - 1,
      orientation: parseInt(responses[1][25], 16),
      saturation:
        parseInt(responses[1][22], 16) * 2 +
        (parseInt(responses[1][23], 16) === 1 ? 0 : 1),
    }).forEach(([key, value]) => {
      // Convert from indexes to values
      this.currentConfig[key] =
        DatabaseConfigZod.shape[key as any].options[value];
    });

    // Only save if changed
    const newConfig = JSON.stringify(this.currentConfig);
    if (newConfig !== oldConfig || force) {
      // Only save if camera exists
      const index = database.cameras.findIndex((x) => x.id === this.id);
      if (index >= 0) database.cameras[index].config = this.currentConfig;
    }
  }

  public async home() {
    await sendVisca(this.address, "81 01 06 04 FF");
  }

  public async zoomFocus(
    direction:
      | "zoom-in"
      | "zoom-out"
      | "zoom-stop"
      | "focus-in"
      | "focus-out"
      | "focus-stop",
    speed: number
  ) {
    const mode = direction.includes("zoom") ? "07" : "08";

    if (direction.includes("stop"))
      await sendVisca(this.address, `81 01 04 ${mode} 00 FF`);
    else
      await sendVisca(
        this.address,
        `81 01 04 ${mode} ${direction.includes("in") ? 2 : 3}${speed.toString(
          16
        )} FF`
      );
  }

  public async panTilt(
    direction:
      | "stop-stop"
      | "north-stop"
      | "south-stop"
      | "stop-west"
      | "stop-east"
      | "north-west"
      | "south-west"
      | "south-east"
      | "north-east",
    xSpeed: number,
    ySpeed: number
  ) {
    let xCode = 3;
    let yCode = 3;

    if (direction.includes("east")) xCode = 2;
    if (direction.includes("west")) xCode = 1;
    if (direction.includes("north")) yCode = 1;
    if (direction.includes("south")) yCode = 2;

    await sendVisca(
      this.address,
      `81 01 06 01 ${xSpeed.toString(16).padStart(2, "0")} ${ySpeed
        .toString(16)
        .padStart(2, "0")} 0${xCode} 0${yCode} FF`
    );
  }

  public async preset(
    action: "call" | "set" | "clear",
    index: number,
    speed: number
  ) {
    const code = { call: "02", set: "01", clear: "00" }[action];

    // Apply speed if call
    if (action === "call")
      await sendVisca(
        this.address,
        `81 01 06 01 ${speed.toString(16).padStart(2, "0")} FF`
      );

    await sendVisca(
      this.address,
      `81 01 04 3F ${code} ${index.toString(16).padStart(2, "0")} FF`
    );
  }

  public async startRecording() {
    // Check if already recording
    if (this.recordingStream) return;

    const index = database.cameras.findIndex((x) => x.id === this.id);
    if (index === -1) throw "Camera not found";

    const path = join(
      homedir(),
      "Desktop",
      `${database.cameras[index].name.replace(/[^a-z0-9]/gi, " ")} (${new Date()
        .toLocaleTimeString("en-GB")
        .replace(/[^a-z0-9]/gi, "-")}).mkv`
    );

    database.cameras[index].recording = Date.now();
    this.recordingStream = new Stream(this.address, "recording", path);
  }

  public async stopRecording() {
    // Check if not recording
    if (!this.recordingStream) return;
    await this.recordingStream.destroy();

    const index = database.cameras.findIndex((x) => x.id === this.id);
    if (index === -1) throw "Camera not found";

    database.cameras[index].recording = 0;
    this.recordingStream = undefined as any;
  }

  public async config(config: Partial<DatabaseConfigType>) {
    for (const [key, value] of Object.entries(config)) {
      const name = key as keyof DatabaseConfigType;
      const indexValue = DatabaseConfigZod.shape[key].options.indexOf(value);

      switch (name) {
        case "stream":
          this.currentConfig.stream = value as any;

          if (this.previewStream) await this.previewStream.destroy();
          if (indexValue > 0) {
            this.previewStream = new Stream(
              this.address,
              {
                "High Quality": "slow",
                "Low Latency": "fast",
                "AI Tracking": "tracking",
              }[this.currentConfig.stream] as any
            );
            this.previewStream.on("frame", (data) => this.emit("frame", data));
          }

          await this.fetchConfig(true);
          break;
        case "focus":
          await sendVisca(this.address, `81 01 04 38 0${indexValue + 2} FF`);
          break;
        case "whiteBalance":
          await sendVisca(
            this.address,
            `81 01 04 35 0${indexValue === 4 ? 5 : indexValue} FF`
          );
          if (indexValue === 3)
            await sendVisca(this.address, "81 01 04 10 05 FF");
          break;
        case "exposure":
          await sendVisca(
            this.address,
            `81 01 04 39 0${["0", "3", "a", "b", "d"][indexValue]} FF`
          );
          break;
        case "shutterSpeed":
          var hex = (indexValue + 1).toString(16).padStart(2, "0");
          await sendVisca(
            this.address,
            `81 01 04 4A 00 00 0${hex[0]} 0${hex[1]} FF`
          );
          break;
        case "iris":
          var hex = indexValue.toString(16).padStart(2, "0");
          await sendVisca(
            this.address,
            `81 01 04 4B 00 00 0${hex[0]} 0${hex[1]} FF`
          );
          break;
        case "brightness":
          var hex = indexValue.toString(16).padStart(2, "0");
          await sendVisca(
            this.address,
            `81 01 04 A1 00 00 0${hex[0]} 0${hex[1]} FF`
          );
          break;
        case "afSensitivity":
          await sendVisca(
            this.address,
            `81 01 04 58 0${(indexValue + 1).toString(16)} FF`
          );
          break;
        case "orientation":
          await sendVisca(
            this.address,
            `81 01 04 A4 0${indexValue.toString(16)} FF`
          );
          break;
        case "saturation":
          await sendVisca(
            this.address,
            `81 01 04 49 00 00 00 0${indexValue.toString(16)} FF`
          );
          break;
      }
    }
    await this.fetchConfig();
  }

  public async resetConfig() {
    await sendVisca(this.address, "81 01 04 A0 10 FF");
  }
}
