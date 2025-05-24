import { localPath } from "../helpers/localPath";
import { BrowserWindow, app, shell } from "electron";

// Allow single only 1 instance
const lock = app.requestSingleInstanceLock();
if (!lock) app.quit();

app.on("ready", async () => {
  // Check if window is already available
  if (BrowserWindow.getAllWindows().length)
    return BrowserWindow.getAllWindows()[0].show();

  // Create launcher window
  const window = new BrowserWindow({
    autoHideMenuBar: true,
    icon: localPath("public/icon.ico"),
    title: "PTZ Control",
    minWidth: 600,
    minHeight: 400,
  });
  window.loadURL(`http://localhost:${app.isPackaged ? 8080 : 8888}`);
  window.on("close", () => app.quit());

  // Handle link opening
  window.webContents.setWindowOpenHandler((details) => {
    // Check if reference link
    if (!details.url.includes("localhost")) {
      shell.openExternal(details.url);
      return { action: "deny" };
    }

    // Check if window is already open
    const window = BrowserWindow.getAllWindows().find(
      (window) => window.webContents.getURL() === details.url
    );
    if (window) {
      window.focus();
      return { action: "deny" };
    }

    return {
      action: "allow",
      overrideBrowserWindowOptions: {
        autoHideMenuBar: true,
        icon: localPath("public/icon.ico"),
        title: "PTZ Control",
        minWidth: 900,
        minHeight: 600,
      },
    };
  });
});
