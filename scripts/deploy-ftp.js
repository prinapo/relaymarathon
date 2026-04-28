const ftp = require("basic-ftp");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const configPath = path.join(__dirname, "..", "ftp-config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const projectRoot = path.join(__dirname, "..");
const distPath = path.join(projectRoot, "dist", "spa");

async function deploy() {
  console.log("\n==========================================");
  console.log("Build e Upload Web (FTP SSL)");
  console.log("==========================================\n");

  console.log("[1/2] Build web in corso...\n");

  try {
    execSync("npm run build", { cwd: projectRoot, stdio: "inherit" });
  } catch {
    console.error("Build fallito!");
    process.exit(1);
  }

  console.log("\n[2/2] Upload FTP in corso...\n");
  console.log(`Host: ${config.host}`);
  console.log(`Port: ${config.port || 21}`);
  console.log(`Path: ${config.remotePath || "/"}`);
  console.log("");

  if (!fs.existsSync(distPath)) {
    throw new Error("Cartella dist/spa non trovata dopo il build");
  }

  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host: config.host,
      port: config.port || 21,
      user: config.username,
      password: config.password,
      secure: true,
      secureOptions: { rejectUnauthorized: false },
    });

    console.log("Connesso al server FTP!\n");

    if (config.remotePath) {
      try {
        await client.ensureDir(config.remotePath);
        await client.cd(config.remotePath);
      } catch {
        console.log(
          `Nota: non posso cambiare directory ${config.remotePath}, uso root`,
        );
      }
    }

    const files = getAllFiles(distPath);
    console.log(`Trovati ${files.length} file da caricare\n`);

    let currentDir = "";

    for (const file of files) {
      let relativePath = path.relative(distPath, file).replace(/\\/g, "/");
      const dir = path.dirname(relativePath).replace(/\\/g, "/");

      if (dir !== currentDir) {
        if (dir && dir !== ".") {
          try {
            await client.ensureDir(dir);
          } catch {
            // Ignore directory creation errors
          }
        }
        if (dir && dir !== ".") {
          await client.cd("/");
          await client.cd(dir);
          currentDir = dir;
        } else {
          await client.cd("/");
          currentDir = "";
        }
      }

      const filename = path.basename(relativePath);
      process.stdout.write(`Upload: ${relativePath} ... `);
      await client.uploadFrom(file, filename);
      console.log("OK");
    }

    console.log("\n==========================================");
    console.log("Upload completato!");
    console.log("==========================================\n");
    console.log("Sito pubblico: https://relaymarathon.sostienilsostegno.com\n");
  } catch (err) {
    console.error("Errore FTP:", err.message);
    process.exit(1);
  } finally {
    client.close();
  }
}

function getAllFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

deploy();
