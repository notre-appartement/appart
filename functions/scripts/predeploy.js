#!/usr/bin/env node

/**
 * Script predeploy pour compiler TypeScript avant le déploiement
 * Compatible Windows/Linux/Mac
 */

const {execSync} = require("child_process");
const path = require("path");

// Le répertoire des functions est passé comme argument ou on utilise le répertoire courant
const functionsDir = process.env.RESOURCE_DIR || path.join(__dirname, "..");

console.log(`🔨 Compilation TypeScript dans ${functionsDir}...`);

try {
  // Exécuter npm run build dans le répertoire des functions
  execSync("npm run build", {
    cwd: functionsDir,
    stdio: "inherit",
    shell: true,
  });
  console.log("✅ Compilation réussie !");
} catch (error) {
  console.error("❌ Erreur lors de la compilation:", error.message);
  process.exit(1);
}
