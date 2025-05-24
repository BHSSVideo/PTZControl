import { createSocket } from "node:dgram";

export const sendVisca = (address: string, payload: string): Promise<string> =>
  new Promise((resolve, reject) => {
    {
      const socket = createSocket("udp4");
      socket.once("message", (msg) => resolve(msg.toString("hex")));
      socket.once("error", () => reject("Invalid destination"));

      const data = Buffer.from(payload.replace(/\W/g, ""), "hex");
      socket.send(data, 1259, address);
      setTimeout(() => reject("No response"), 500); // todo: errors
    }
  });
