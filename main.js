const { app, BrowserWindow, shell, session, systemPreferences } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 400,
    title: "Kit Podcast",
    icon: path.join(__dirname, "build", "icon.png"),
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true }
  });

  // Liens externes et PDF : ouverts dans le navigateur ou le lecteur PDF du système
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("file:")) shell.openPath(decodeURI(new URL(url).pathname.replace(/^\/([A-Za-z]:)/, "$1")));
    else if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });

  win.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(async () => {
  // Micro (enregistrement), plein écran (mode borne) et maintien de l'écran allumé
  const allowed = new Set(["media", "fullscreen", "wake-lock", "screen-wake-lock"]);
  session.defaultSession.setPermissionRequestHandler((_wc, permission, cb) => cb(allowed.has(permission)));
  session.defaultSession.setPermissionCheckHandler((_wc, permission) => allowed.has(permission));
  if (process.platform === "darwin") {
    try { await systemPreferences.askForMediaAccess("microphone"); } catch (e) {}
  }
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
