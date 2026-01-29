// Script pour configurer Puppeteer pour Firebase Functions
// Définit PUPPETEER_SKIP_DOWNLOAD pour éviter de télécharger Chromium pendant le build
// Firebase Functions fournit Chromium, donc on n'a pas besoin de le télécharger

if (process.env.FUNCTION_TARGET || process.env.K_SERVICE) {
  // En production Firebase Functions, sauter le téléchargement
  process.env.PUPPETEER_SKIP_DOWNLOAD = "true";
  console.log("Firebase Functions détecté - PUPPETEER_SKIP_DOWNLOAD activé");
}
