import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Legge la versione da package.json
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "package.json"), "utf8"),
);
const appVersion = packageJson.version || "1.0.0";
const versionCode = packageJson.versionCode || 1;

export default function () {
  return {
    version: appVersion,

    android: {
      versionName: appVersion,
      versionCode: versionCode,
    },

    build: {
      target: {
        browser: ["es2019", "edge88", "firefox78", "chrome87", "safari13.1"],
        node: "node16",
      },
      vueRouterMode: "hash",
    },

    css: ["app.scss"],

    devServer: {
      https: false,
      port: 9000,
      open: false,
    },

    framework: {
      config: {},
      plugins: ["Notify"],
      boot: ["app-version", "firebase", "android-back-button", "status-bar"],
    },

    extras: ["material-icons"],
    animations: [],

    pwa: {
      workboxMode: "generateSW",
      injectPwaMetaTags: true,
      swFilename: "sw.js",
      manifestFilename: "manifest.json",
      useCredentialsForManifestTag: false,
    },

    capacitor: {
      hideSplashscreen: true,
      appName: "Milano Relay Marathon",
      appId: "com.prinapo.relaymarathon",
      plugins: {
        SocialLogin: {
          providers: {
            google: true,
          },
        },
      },
      iconPaths: {
        ios: "src/assets/icona_app_safe.png",
        android: "src/assets/icona_app_safe.png",
      },
    },
  };
}
