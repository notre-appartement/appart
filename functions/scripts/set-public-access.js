#!/usr/bin/env node

/**
 * Script pour configurer les permissions IAM publiques pour la Cloud Function
 * À exécuter après le déploiement si invoker: "public" ne fonctionne pas automatiquement
 */

const {execSync} = require("child_process");

const PROJECT_ID = "notre-appart";
const FUNCTION_NAME = "importappartement";
const REGION = "us-central1";
const SERVICE_NAME = FUNCTION_NAME; // Le nom du service Cloud Run

console.log(`🔓 Configuration des permissions publiques pour ${FUNCTION_NAME}...`);

// Vérifier si gcloud est disponible
try {
  execSync("gcloud --version", {stdio: "ignore", shell: true});
} catch (error) {
  console.error("❌ gcloud CLI n'est pas installé ou pas dans le PATH.");
  console.error("\n📖 Instructions pour configurer les permissions via la console web :");
  console.error("\n1. Allez sur https://console.cloud.google.com/");
  console.error(`2. Sélectionnez le projet : ${PROJECT_ID}`);
  console.error("3. Allez dans Cloud Run");
  console.error(`4. Cliquez sur le service : ${SERVICE_NAME}`);
  console.error("5. Onglet PERMISSIONS → ADD PRINCIPAL");
  console.error("6. Principal : allUsers");
  console.error("7. Rôle : Cloud Run Invoker (roles/run.invoker)");
  console.error("8. Cliquez sur SAVE");
  console.error("\n📄 Voir CONFIGURATION_PERMISSIONS.md pour plus de détails.");
  process.exit(1);
}

try {
  // Donner le rôle invoker à allUsers (public)
  const command = `gcloud run services add-iam-policy-binding ${SERVICE_NAME} ` +
    `--region=${REGION} ` +
    `--member="allUsers" ` +
    `--role="roles/run.invoker" ` +
    `--project=${PROJECT_ID}`;

  console.log(`Exécution: ${command}`);
  execSync(command, {
    stdio: "inherit",
    shell: true,
  });

  console.log("✅ Permissions publiques configurées avec succès !");
} catch (error) {
  console.error("❌ Erreur lors de la configuration des permissions:", error.message);
  console.error("\n💡 Vous pouvez aussi configurer via la console web :");
  console.error("   https://console.cloud.google.com/run");
  console.error(`   Service: ${SERVICE_NAME}, Région: ${REGION}`);
  console.error("\n📄 Voir CONFIGURATION_PERMISSIONS.md pour les instructions détaillées.");
  process.exit(1);
}
