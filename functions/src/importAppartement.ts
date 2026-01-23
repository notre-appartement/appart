import {onCall, CallableRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import puppeteer from "puppeteer";
import {parseLeBonCoin} from "./parsers/leboncoin";

interface ImportRequest {
  url: string;
}

interface ImportResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Cloud Function pour importer un appartement depuis une URL
 *
 * Utilise Puppeteer pour scraper la page et extrait les données
 */
export const importAppartement = onCall<ImportRequest, ImportResponse>(
  {
    maxInstances: 5,
    timeoutSeconds: 60,
    memory: "1GiB",
  },
  /**
   * @param {CallableRequest<ImportRequest>} request
   * @return {Promise<ImportResponse>}
   */
  (async (request: CallableRequest<ImportRequest>) => {
    const {url} = request.data;

    if (!url) {
      return {
        success: false,
        error: "URL manquante",
      };
    }

    // Détecter le site
    let siteType: "leboncoin" | "seloger" | "pap" | "unknown" = "unknown";
    if (url.includes("leboncoin.fr")) {
      siteType = "leboncoin";
    } else if (url.includes("seloger.com")) {
      siteType = "seloger";
    } else if (url.includes("pap.fr")) {
      siteType = "pap";
    } else {
      return {
        success: false,
        error: "Site non supporté. Sites supportés : LeBonCoin, SeLoger, PAP",
      };
    }

    logger.info(`Import depuis ${siteType}: ${url}`);

    let browser;
    try {
      // Lancer Puppeteer avec des options pour éviter la détection
      browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
        ],
      });

      const page = await browser.newPage();

      // Configurer les headers pour ressembler à un navigateur réel
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );
      await page.setViewport({width: 1920, height: 1080});

      // Naviguer vers la page avec timeout
      logger.info(`Chargement de la page: ${url}`);
      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // Attendre un peu pour que le contenu se charge
      await page.waitForTimeout(2000);

      // Récupérer le HTML
      const html = await page.content();

      // Parser selon le site
      let parsedData;
      if (siteType === "leboncoin") {
        parsedData = parseLeBonCoin(html, url);
      } else {
        // TODO: Implémenter les autres parsers
        return {
          success: false,
          error: `Parser pour ${siteType} non encore implémenté`,
        };
      }

      if (!parsedData) {
        return {
          success: false,
          error: "Impossible d'extraire les données de la page",
        };
      }

      logger.info(`Données extraites avec succès: ${parsedData.titre}`);

      return {
        success: true,
        data: parsedData,
      };
    } catch (error: unknown) {
      logger.error("Erreur lors de l'import:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors du scraping de la page";
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }) as unknown as (request: CallableRequest<ImportRequest>) => ImportResponse
);
