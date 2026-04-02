// src/boot/app-version.js
import pkg from "../../package.json";
console.log("🚀 Initializing app version boot with version:", pkg.version);
export default () => {
  // Mostra sempre la versione in console
  console.log("🚀 App version boot:", pkg.version || "1.0.0");

  // Salva la versione globale se vuoi usarla altrove
  window.__APP_VERSION__ = pkg.version || "1.0.0";
};