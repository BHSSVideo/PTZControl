import ffmpeg from "ffmpeg-static";
import { app } from "electron";
import { spawn, exec } from "node:child_process";
import { EventEmitter } from "node:events";

const SOI = Buffer.from([0xff, 0xd8]);
const EOI = Buffer.from([0xff, 0xd9]);

export declare interface Stream {
  on(event: string, listener: Function): this;
  on(event: "frame", listener: (data: string) => void): this;
}

export class Stream extends EventEmitter {
  private task: ReturnType<typeof spawn>;

  constructor(
    address: string,
    mode: "fast" | "slow" | "tracking" | "recording",
    path?: string
  ) {
    super();

    const args = {
      fast: ["-f", "mjpeg", "-"],
      slow: [
        "-f",
        "mjpeg",
        "-huffman",
        "optimal",
        "-qmin",
        "1",
        "-q:v",
        "1",
        "-",
      ],
      tracking: ["-f", "mjpeg", "-"],
      recording: [
        "-y",
        "-acodec",
        "copy",
        "-vcodec",
        "copy",
        path || "recording.mkv",
      ],
    }[mode];

    this.task = spawn(
      ffmpeg.replace(
        "app.asar",
        app.isPackaged ? "app.asar.unpacked" : "app.asar"
      ),
      [
        "-loglevel",
        "quiet",
        "-fflags",
        "nobuffer",
        "-flags",
        "low_delay",
        "-i",
        `rtsp://${address}/1`,
        ...args,
      ]
    );

    // Handle frame outputs
    if (mode === "fast" || mode === "slow") {
      let buffer = Buffer.from([]);
      this.task.stdout!.on("data", (chunk: Buffer) => {
        buffer = Buffer.concat([buffer, chunk]);

        while (true) {
          const eoiPos = buffer.indexOf(EOI);
          const soiPos = buffer.indexOf(SOI);

          if (soiPos === -1 || eoiPos === -1) break;

          // Push new jpeg frame
          const output = buffer.subarray(soiPos, eoiPos + 2);
          this.emit("frame", output.toString("base64"));

          // Remove current frame from buffer
          buffer = Buffer.from(buffer.subarray(eoiPos + 2, buffer.length - 1));
        }
      });
    }

    // this.task.stdout!.on("close", () => this.emit("exit")); // todo: add
  }

  public async destroy() {
    while (!this.task.killed) {
      this.task.kill();
      await new Promise((x) => setTimeout(x, 50));
    }
  }
}
