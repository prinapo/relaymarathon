const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const projectRoot = path.resolve(__dirname);

// Helper per simulare pushd/popd del PowerShell
let originalDir = null;

function pushDir(dir) {
  originalDir = process.cwd();
  process.chdir(dir);
}

function popDir() {
  if (originalDir) {
    process.chdir(originalDir);
    originalDir = null;
  }
}

function readPackageJson() {
  const packageJsonPath = path.join(projectRoot, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  if (!packageJson.version) {
    throw new Error("Versione non trovata in package.json");
  }

  return {
    version: packageJson.version,
    versionCode: packageJson.versionCode || 1,
  };
}

function updatePackageJson(version, versionCode) {
  const packageJsonPath = path.join(projectRoot, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  packageJson.version = version;
  packageJson.versionCode = versionCode;
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + "\n",
  );
}

function updateBuildGradle(version, versionCode) {
  const buildGradlePath = path.join(
    projectRoot,
    "src-capacitor",
    "android",
    "app",
    "build.gradle",
  );
  let content = fs.readFileSync(buildGradlePath, "utf8");

  content = content.replace(
    /versionName\s+"[\d.]+"/,
    `versionName "${version}"`,
  );
  content = content.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);

  fs.writeFileSync(buildGradlePath, content);
}

function updateBootFile(version) {
  const bootPath = path.join(projectRoot, "src", "boot", "app-version.js");
  let content = fs.readFileSync(bootPath, "utf8");
  content = content.replace(
    /const APP_VERSION = ["'][\d.]+["']/,
    `const APP_VERSION = "${version}"`,
  );
  fs.writeFileSync(bootPath, content);
}

function incrementVersion(currentVersion, type) {
  const parts = currentVersion.split(".");
  let major = parseInt(parts[0], 10);
  let minor = parseInt(parts[1], 10);
  let patch = parseInt(parts[2], 10);

  if (type === "major") {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (type === "minor") {
    minor += 1;
    patch = 0;
  } else if (type === "patch") {
    patch += 1;
  }

  return `${major}.${minor}.${patch}`;
}

const args = process.argv.slice(2);
const command = args[0];

if (command === "get") {
  const config = readPackageJson();
  console.log(`${config.version} (versionCode: ${config.versionCode})`);
} else if (command === "set") {
  const newVersion = args[1];
  const newVersionCode = args[2] ? parseInt(args[2], 10) : null;

  if (!newVersion) {
    console.error("Usage: node version.js set <version> [versionCode]");
    process.exit(1);
  }

  const config = readPackageJson();
  const versionCode =
    newVersionCode !== null ? newVersionCode : config.versionCode;

  updatePackageJson(newVersion, versionCode);
  updateBootFile(newVersion);
  updateBuildGradle(newVersion, versionCode);

  console.log(
    `✓ Versione aggiornata a ${newVersion} (versionCode: ${versionCode})`,
  );
} else if (command === "release") {
  const releaseType = args[1] || "minor";

  const config = readPackageJson();
  const newVersion = incrementVersion(config.version, releaseType);
  const newVersionCode = config.versionCode + 1;

  console.log(
    `Versione corrente: ${config.version} (versionCode: ${config.versionCode})`,
  );
  console.log(
    `Nuova versione (${releaseType}): ${newVersion} (versionCode: ${newVersionCode})`,
  );

  updatePackageJson(newVersion, newVersionCode);
  updateBootFile(newVersion);
  updateBuildGradle(newVersion, newVersionCode);

  console.log(
    `\n✓ Release ${newVersion} pronta! (versionCode ${newVersionCode})`,
  );
} else if (command === "dev") {
  const buildType = args[1] || "debug";
  const installApk = args.includes("--install");

  const config = readPackageJson();

  console.log(`Build Android ${buildType} in corso...`);
  console.log(
    `Versione: ${config.version} (versionCode: ${config.versionCode})`,
  );
  console.log("");

  pushDir(projectRoot);
  try {
    if (buildType === "release") {
      console.log("");
      console.log("Esecuzione: quasar build -m capacitor -T android");
      console.log("");
      console.log("==========================================");
      console.log(
        `Release build ${config.version} (versionCode: ${config.versionCode})`,
      );
      console.log("==========================================");
      execSync("quasar build -m capacitor -T android", { stdio: "inherit" });

      pushDir(path.join(projectRoot, "src-capacitor", "android"));
      try {
        console.log("");
        console.log("Esecuzione: gradlew.bat bundleRelease");
        console.log("");
        console.log("==========================================");
        console.log(
          `Release ${config.version} (versionCode: ${config.versionCode}) completata!`,
        );
        console.log("==========================================");
        execSync(".\\gradlew.bat bundleRelease", { stdio: "inherit" });
      } finally {
        popDir();
      }

      console.log("");
      console.log("==========================================");
      console.log(`Release ${config.version} completata!`);
      console.log("==========================================");
    } else {
      console.log("Esecuzione: quasar build -m capacitor -T android -debug");
      console.log("");
      console.log("==========================================");
      console.log(
        `Debug build ${config.version} (versionCode: ${config.versionCode})`,
      );
      console.log("==========================================");
      execSync("quasar build -m capacitor -T android -debug", {
        stdio: "inherit",
      });

      if (installApk) {
        console.log("");
        console.log("Ricerca device Android collegato...");

        try {
          const devices = execSync("adb devices").toString();
          const lines = devices
            .split(/\r?\n/)
            .filter((line) => line.trim() && !line.startsWith("List"));

          if (lines.length === 0) {
            console.log("Nessun device Android collegato.");
            console.log("");
            console.log("APK generato in:");
            console.log("  dist/capacitor/android/apk/debug/app-debug.apk");
          } else {
            const deviceLine = lines[0];
            const deviceId = deviceLine.split("\t")[0];
            const apkPath = path.join(
              projectRoot,
              "dist",
              "capacitor",
              "android",
              "apk",
              "debug",
              "app-debug.apk",
            );

            console.log(`Installazione su device: ${deviceId}`);
            console.log(`APK: ${apkPath}`);
            console.log("");

            execSync(`adb -s ${deviceId} install -r "${apkPath}"`, {
              stdio: "inherit",
            });

            console.log("");
            console.log("==========================================");
            console.log("Debug APK installato sul device!");
            console.log("==========================================");
            console.log("");
            console.log("Avvio app sul device...");
            execSync(
              `adb -s ${deviceId} shell am start -n com.prinapo.relaymarathon/com.prinapo.relaymarathon.MainActivity`,
              { stdio: "inherit" },
            );
          }
        } catch (adbError) {
          console.log("Errore ADB: assicurati che il telefono sia collegato");
          console.log("APK generato in:");
          console.log("  dist/capacitor/android/apk/debug/app-debug.apk");
        }
      } else {
        console.log("");
        console.log("==========================================");
        console.log(`Debug build ${config.version} completata!`);
        console.log("==========================================");
        console.log("");
        console.log("Per installare sul telefono:");
        console.log("  npm run dev:build -- --install");
      }
    }
  } finally {
    popDir();
  }
} else {
  console.log("Usage:");
  console.log(
    "  node version.js get                    # Leggi versione + versionCode",
  );
  console.log(
    "  node version.js set <version> [code]   # Imposta versione e versionCode",
  );
  console.log(
    "  node version.js release [type]         # Incrementa versione (minor/major/patch)",
  );
  console.log(
    "  node version.js dev [type]             # Build Android (debug/release)",
  );
  console.log("");
  console.log("Esempi:");
  console.log("  node version.js get");
  console.log("  node version.js set 1.4.0");
  console.log(
    "  node version.js set 1.4.0 10           # Setta anche versionCode",
  );
  console.log("  node version.js release minor          # 1.3.0 -> 1.4.0");
  console.log("  node version.js release major          # 1.3.0 -> 2.0.0");
  console.log("  node version.js release patch          # 1.3.0 -> 1.3.1");
  console.log(
    "  node version.js dev debug --install    # Build + install + avvia",
  );
  process.exit(1);
}
