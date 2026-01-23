import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {getAuth} from "firebase-admin/auth";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import * as os from "os";
import {parseLeBonCoinFromDOM} from "./parsers/leboncoin";

// Utiliser le plugin stealth pour éviter la détection
puppeteer.use(StealthPlugin());

interface ImportRequest {
  url: string;
}

interface DOMData {
  titre: string;
  prixText: string;
  surfaceText: string;
  piecesText: string;
  adresseFull: string;
  description: string;
  photos: string[] | Array<{url: string; base64: string; mimeType: string}>;
}

/**
 * Cloud Function pour importer un appartement depuis une URL
 *
 * Utilise Puppeteer pour scraper la page et extrait les données
 * Accepte les requêtes HTTP directes avec authentification via header Authorization
 */
export const importAppartement = onRequest(
  {
    maxInstances: 5,
    timeoutSeconds: 60,
    memory: "1GiB",
    cors: true,
  },
  async (req, res) => {
    // Vérifier l'authentification
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({success: false, error: "Non authentifié"});
      return;
    }

    const token = authHeader.split("Bearer ")[1];

    // Vérifier le token (sauf en mode émulateur)
    const isEmulator = process.env.FUNCTIONS_EMULATOR === "true" ||
                       process.env.FIREBASE_AUTH_EMULATOR_HOST !== undefined;

    if (!isEmulator) {
      try {
        // Vérifier le token en production
        const adminAuth = getAuth();
        const decodedToken = await adminAuth.verifyIdToken(token);
        logger.info(`Token vérifié pour l'utilisateur: ${decodedToken.uid}`);
      } catch (error: any) {
        logger.error("Erreur de vérification du token:", error.message);
        res.status(401).json({success: false, error: `Token invalide: ${error.message}`});
        return;
      }
    } else {
      logger.info("Mode émulateur détecté, vérification du token ignorée");
    }

    // Récupérer l'URL depuis le body
    let requestData: ImportRequest;
    if (req.method === "POST") {
      if (typeof req.body === "string") {
        requestData = JSON.parse(req.body);
      } else if (req.body && req.body.data) {
        // Format callable: { data: { url } }
        requestData = req.body.data;
      } else {
        requestData = req.body;
      }
    } else {
      res.status(405).json({success: false, error: "Method not allowed"});
      return;
    }

    const {url} = requestData;

    if (!url) {
      res.status(400).json({success: false, error: "URL manquante"});
      return;
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
      res.status(400).json({
        success: false,
        error: "Site non supporté. Sites supportés : LeBonCoin, SeLoger, PAP",
      });
      return;
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

      // Ajouter des headers supplémentaires pour éviter la détection
      await page.setExtraHTTPHeaders({
        "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      });

      await page.setViewport({width: 1920, height: 1080});

      // Masquer les indicateurs WebDriver
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, "webdriver", {
          get: () => false,
        });
      });

      // Naviguer vers la page avec timeout
      logger.info(`Chargement de la page: ${url}`);
      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // Attendre que le contenu soit chargé (LeBonCoin charge dynamiquement)
      try {
        // Attendre qu'un élément clé soit présent (titre ou prix)
        await page.waitForSelector("h1, [data-qa-id*=\"title\"], [data-qa-id*=\"price\"], .price", {
          timeout: 10000,
        });
      } catch (e) {
        logger.warn("Sélecteurs spécifiques non trouvés, continuation...");
      }

      // Attendre un peu plus pour que le JavaScript se charge
      await page.waitForTimeout(5000);

      // Scroller plusieurs fois pour déclencher le chargement lazy
      for (let i = 0; i < 3; i++) {
        await page.evaluate((scrollIndex: number) => {
          window.scrollTo(0, (document.body.scrollHeight / 3) * (scrollIndex + 1));
        }, i);
        await page.waitForTimeout(1000);
      }

      // Attendre que le contenu soit visible
      await page.waitForTimeout(2000);

      // Logger ce que Puppeteer voit
      const initialPageTitle = await page.title();
      const initialPageUrl = page.url();
      logger.info(`Page chargée - Titre: ${initialPageTitle}, URL: ${initialPageUrl}`);

      // Prendre une capture d'écran pour déboguer
      try {
        // Utiliser un chemin compatible Windows/Linux
        const tmpDir = os.tmpdir();
        const timestamp = Date.now();
        const screenshotPath = `${tmpDir}/leboncoin-${timestamp}.png`;

        await page.screenshot({path: screenshotPath, fullPage: true});
        logger.info(`Capture d'écran sauvegardée: ${screenshotPath}`);

        // Prendre aussi une capture de la viewport
        const viewportPath = `${tmpDir}/leboncoin-viewport-${timestamp}.png`;
        await page.screenshot({path: viewportPath, fullPage: false});
        logger.info(`Capture viewport sauvegardée: ${viewportPath}`);
      } catch (screenshotError: any) {
        logger.warn(`Impossible de prendre une capture d'écran: ${screenshotError.message}`);
      }

      // Vérifier si on est sur une page de captcha ou d'erreur
      const bodyText = await page.evaluate(() => document.body.innerText || "");
      const currentPageTitle = await page.title();
      const currentPageUrl = page.url();

      // Détecter différents types de captcha LeBonCoin
      const captchaIndicators = [
        "Verification Required",
        "On s'assure qu'on s'adresse bien à vous",
        "Faites glisser vers la droite",
        "robot est sur le même réseau",
        "captcha",
        "bloqué",
        "Slide right to secure",
        "Pourquoi cette vérification",
        "quelque chose dans le comportement du navigateur",
        "surfez et cliquez à une vitesse surhumaine",
        "un robot est sur le même réseau",
      ];

      const hasCaptcha = captchaIndicators.some(indicator =>
        bodyText.includes(indicator) || currentPageTitle.includes(indicator)
      );

      if (hasCaptcha) {
        logger.warn("Page de captcha détectée - LeBonCoin bloque le scraping");
        logger.warn(`URL actuelle: ${currentPageUrl}, Titre: ${currentPageTitle}`);

        // Prendre une capture d'écran du captcha pour déboguer
        try {
          const tmpDir = os.tmpdir();
          const timestamp = Date.now();
          const captchaScreenshot = `${tmpDir}/captcha-${timestamp}.png`;
          await page.screenshot({path: captchaScreenshot, fullPage: true});
          logger.info(`Capture d'écran du captcha sauvegardée: ${captchaScreenshot}`);
        } catch (screenshotError: any) {
          logger.warn(`Impossible de prendre une capture du captcha: ${screenshotError.message}`);
        }

        res.status(400).json({
          success: false,
          error: "LeBonCoin a détecté le scraping et demande une vérification. Veuillez utiliser le formulaire manuel pour saisir les informations.",
          requiresManualInput: true,
          captchaDetected: true,
        });
        return;
      }

      // Logger un extrait du texte visible
      const textSample = bodyText.substring(0, 500);
      logger.info(`Texte visible (500 premiers caractères): ${textSample}`);

      // Logger aussi le HTML pour voir la structure
      const htmlLength = (await page.content()).length;
      logger.info(`Taille du HTML: ${htmlLength} caractères`);

      // Essayer d'extraire les données directement depuis le DOM JavaScript
      let parsedData;
      if (siteType === "leboncoin") {
        // Extraire les données depuis le DOM avec JavaScript
        const domData: DOMData = await page.evaluate(() => {
          const getText = (selector: string) => {
            const el = document.querySelector(selector);
            return el ? el.textContent?.trim() || "" : "";
          };

          const getAllText = (selectors: string[]) => {
            for (const selector of selectors) {
              const text = getText(selector);
              if (text) return text;
            }
            return "";
          };

          // Titre - Essayer de nombreux sélecteurs
          const titre = getAllText([
            "h1[data-qa-id=\"adview_title\"]",
            "h1[data-test-id=\"ad-title\"]",
            "h1",
            "[class*=\"title\"]",
            "[class*=\"Title\"]",
            "h1 span",
            ".ad-title",
          ]) || "Appartement à louer";

          // Prix - Chercher dans tout le document
          let prixText = getAllText([
            "[data-qa-id=\"adview_price\"]",
            "[data-test-id=\"ad-price\"]",
            ".price",
            "[class*=\"price\"]",
            "[class*=\"Price\"]",
            "[itemprop=\"price\"]",
          ]);

          // Si pas trouvé, chercher un pattern prix dans le texte visible
          if (!prixText) {
            const bodyText = document.body.innerText || "";
            // Chercher plusieurs patterns de prix
            const prixPatterns = [
              /(\d+[\s,.]?\d*)\s*€/i,
              /(\d+[\s,.]?\d*)\s*EUR/i,
              /prix[:\s]*(\d+[\s,.]?\d*)/i,
              /(\d+[\s,.]?\d*)\s*euros?/i,
            ];
            for (const pattern of prixPatterns) {
              const match = bodyText.match(pattern);
              if (match) {
                prixText = match[0];
                break;
              }
            }
          }

          // Surface - Chercher avec plusieurs méthodes
          let surfaceText = getAllText([
            "[data-qa-id=\"criteria_item_square\"]",
            "[class*=\"surface\"]",
            "[class*=\"Surface\"]",
            "[itemprop=\"floorSize\"]",
          ]);

          // Si pas trouvé, chercher dans le texte
          if (!surfaceText) {
            const bodyText = document.body.innerText || "";
            const surfaceMatch = bodyText.match(/(\d+)\s*m[²2]/i);
            if (surfaceMatch) surfaceText = surfaceMatch[0];
          }

          // Pièces - Chercher avec plusieurs méthodes
          let piecesText = getAllText([
            "[data-qa-id=\"criteria_item_rooms\"]",
            "[class*=\"rooms\"]",
            "[class*=\"Rooms\"]",
            "[class*=\"pieces\"]",
            "[itemprop=\"numberOfRooms\"]",
          ]);

          // Si pas trouvé, chercher dans le texte
          if (!piecesText) {
            const bodyText = document.body.innerText || "";
            const piecesMatch = bodyText.match(/(\d+)\s*pi[èe]ce/i);
            if (piecesMatch) piecesText = piecesMatch[0];
          }

          // Adresse - Chercher avec plusieurs méthodes
          const adresseFull = getAllText([
            "[data-qa-id=\"adview_location_informations\"]",
            "[class*=\"location\"]",
            "[class*=\"Location\"]",
            "[class*=\"address\"]",
            "[class*=\"Address\"]",
            "[itemprop=\"address\"]",
            "[itemprop=\"addressLocality\"]",
          ]);

          // Description - Chercher avec plusieurs méthodes
          const description = getAllText([
            "[data-qa-id=\"adview_description_container\"]",
            "[class*=\"description\"]",
            "[class*=\"Description\"]",
            "[itemprop=\"description\"]",
            ".ad-description",
          ]);

          // Photos - Chercher toutes les images possibles
          const photos: string[] = [];
          const imageSelectors = [
            "img[data-qa-id=\"slideshow_image\"]",
            "img[data-src]",
            "img[src*=\"leboncoin\"]",
            "img[src*=\"ad-image\"]",
            ".carousel img",
            ".gallery img",
            "[class*=\"photo\"] img",
            "[class*=\"image\"] img",
          ];

          imageSelectors.forEach((selector) => {
            document.querySelectorAll(selector).forEach((img) => {
              const src = (img as HTMLImageElement).src || img.getAttribute("data-src") || img.getAttribute("data-lazy-src") || "";
              if (src &&
                  !src.includes("placeholder") &&
                  !src.includes("logo") &&
                  !src.includes("icon") &&
                  (src.includes("leboncoin") || src.includes("ad-image") || src.startsWith("http"))) {
                if (!photos.includes(src)) {
                  photos.push(src);
                }
              }
            });
          });

          return {
            titre,
            prixText,
            surfaceText,
            piecesText,
            adresseFull,
            description,
            photos: photos.slice(0, 10),
          };
        });

        logger.info(`Données extraites du DOM: ${JSON.stringify(domData, null, 2)}`);

        // Télécharger les images depuis Puppeteer (avec les cookies/headers de la page)
        // Extraire uniquement les URLs (strings) depuis domData.photos
        const photoUrls: string[] = (domData.photos || []).filter((p): p is string => typeof p === "string");
        const photoBase64Data: Array<{url: string; base64: string; mimeType: string}> = [];

        logger.info(`Téléchargement de ${photoUrls.length} images depuis Puppeteer...`);

        for (const photoUrl of photoUrls.slice(0, 10)) {
          try {
            // Utiliser Puppeteer pour télécharger l'image avec les bons headers/cookies
            const imageBase64 = await page.evaluate(async (url: string) => {
              try {
                const response = await fetch(url);
                if (!response.ok) return null;
                const blob = await response.blob();
                if (blob.size > 5 * 1024 * 1024) return null; // Max 5MB

                // Convertir en base64
                return new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const result = reader.result as string;
                    // Extraire seulement les données base64 (sans le préfixe data:image/...)
                    const match = result.match(/^data:([^;]+);base64,(.+)$/);
                    if (match) {
                      resolve(JSON.stringify({base64: match[2], mimeType: match[1]}));
                    } else {
                      resolve(JSON.stringify({base64: result, mimeType: "image/jpeg"}));
                    }
                  };
                  reader.onerror = reject;
                  reader.readAsDataURL(blob);
                });
              } catch (error) {
                return null;
              }
            }, photoUrl);

            if (imageBase64) {
              const imageData = JSON.parse(imageBase64) as {base64: string; mimeType: string};
              photoBase64Data.push({
                url: photoUrl,
                base64: imageData.base64,
                mimeType: imageData.mimeType,
              });
              logger.info(`Image téléchargée en base64: ${photoUrl.substring(0, 50)}... (${Math.round(imageData.base64.length / 1024)}KB)`);
            } else {
              logger.warn(`Impossible de télécharger l'image: ${photoUrl}`);
            }
          } catch (error: any) {
            logger.warn(`Erreur lors du téléchargement de l'image ${photoUrl}: ${error.message}`);
          }
        }

        // Remplacer les URLs par les données base64 si disponibles
        if (photoBase64Data.length > 0) {
          domData.photos = photoBase64Data;
          logger.info(`${photoBase64Data.length} images téléchargées en base64 sur ${photoUrls.length} tentatives`);
        } else {
          logger.warn("Aucune image n'a pu être téléchargée en base64, utilisation des URLs");
        }

        // Parser les données extraites
        parsedData = parseLeBonCoinFromDOM(domData, url);
      } else {
        // TODO: Implémenter les autres parsers
        res.status(400).json({
          success: false,
          error: `Parser pour ${siteType} non encore implémenté`,
        });
        return;
      }

      if (!parsedData) {
        res.status(500).json({
          success: false,
          error: "Impossible d'extraire les données de la page",
        });
        return;
      }

      logger.info(`Données extraites avec succès: ${parsedData.titre}`);

      // Ne pas logger les données complètes si elles contiennent des images base64 (trop volumineux)
      const logData = {
        ...parsedData,
        photos: Array.isArray(parsedData.photos)
          ? (parsedData.photos as any[]).map((p: any) =>
              typeof p === "string" ? p : {url: p.url, hasBase64: !!p.base64}
            )
          : parsedData.photos,
      };
      logger.info(`Données extraites: ${JSON.stringify(logData, null, 2)}`);

      res.status(200).json({
        success: true,
        data: parsedData,
      });
    } catch (error: unknown) {
      logger.error("Erreur lors de l'import:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors du scraping de la page";
      res.status(500).json({
        success: false,
        error: errorMessage,
      });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
);
