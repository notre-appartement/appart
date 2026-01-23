import * as cheerio from "cheerio";

export interface ParsedAppartement {
  titre: string;
  prix: number;
  charges?: number;
  surface: number;
  pieces: number;
  chambres?: number;
  adresse: string;
  ville: string;
  codePostal: string;
  description: string;
  photos: string[];
  etage?: number;
  ascenseur?: boolean;
  meuble?: boolean;
  lienAnnonce: string;
}

/**
 * Parse une page LeBonCoin et extrait les données de l'appartement
 * @param {string} html - Le HTML de la page à parser
 * @param {string} url - L'URL de la page à parser
 * @return {ParsedAppartement | null}
 */
export function parseLeBonCoin(html: string, url: string): ParsedAppartement | null {
  try {
    const $ = cheerio.load(html);

    // Logger pour déboguer
    console.log("Parsing LeBonCoin, taille HTML:", html.length);

    // Titre - Essayer plusieurs sélecteurs
    let titre = $("h1[data-qa-id=\"adview_title\"]").text().trim();
    if (!titre) titre = $("h1[data-test-id=\"ad-title\"]").text().trim();
    if (!titre) titre = $("h1").first().text().trim();
    if (!titre) titre = $("[class*=\"title\"]").first().text().trim();
    if (!titre) {
      // Chercher dans le texte avec regex
      const titreMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      if (titreMatch) titre = titreMatch[1].trim();
    }
    if (!titre) titre = "Appartement à louer";

    console.log("Titre trouvé:", titre);

    // Prix - Essayer plusieurs sélecteurs et formats
    let prixText = $("[data-qa-id=\"adview_price\"]").text().trim();
    if (!prixText) prixText = $("[data-test-id=\"ad-price\"]").text().trim();
    if (!prixText) prixText = $(".price").first().text().trim();
    if (!prixText) prixText = $("[class*=\"price\"]").first().text().trim();

    // Si pas trouvé, chercher dans le texte avec regex (plusieurs patterns)
    if (!prixText) {
      // Pattern 1: "850 €" ou "850€"
      const prixMatch1 = html.match(/(\d+[\s,.]?\d*)\s*€/i);
      if (prixMatch1) prixText = prixMatch1[0];

      // Pattern 2: Dans les attributs data
      if (!prixText) {
        const prixMatch2 = html.match(/data-price="(\d+)"/i) || html.match(/price["\s:=]+(\d+)/i);
        if (prixMatch2) prixText = prixMatch2[1] + " €";
      }
    }

    const prix = extractPrice(prixText);
    console.log("Prix trouvé:", prix, "depuis:", prixText);

    // Charges (optionnel)
    const chargesText = $("[data-qa-id=\"adview_charges\"]").text().trim() ||
                        $("[class*=\"charges\"]").text().trim();
    const charges = chargesText ? extractPrice(chargesText) : undefined;

    // Surface - Chercher avec plusieurs méthodes
    let surfaceText = $("[data-qa-id=\"criteria_item_square\"]").text().trim();
    if (!surfaceText) surfaceText = $("[class*=\"surface\"]").text().trim();
    if (!surfaceText) {
      // Regex pour trouver "50 m²" ou "50m2"
      const surfaceMatch = html.match(/(\d+)\s*m[²2]/i);
      if (surfaceMatch) surfaceText = surfaceMatch[0];
    }
    const surface = extractNumber(surfaceText) || 0;
    console.log("Surface trouvée:", surface, "depuis:", surfaceText);

    // Nombre de pièces
    let piecesText = $("[data-qa-id=\"criteria_item_rooms\"]").text().trim();
    if (!piecesText) piecesText = $("[class*=\"rooms\"]").text().trim();
    if (!piecesText) {
      const piecesMatch = html.match(/(\d+)\s*pi[èe]ce/i);
      if (piecesMatch) piecesText = piecesMatch[0];
    }
    const pieces = extractNumber(piecesText) || 0;
    console.log("Pièces trouvées:", pieces, "depuis:", piecesText);

    // Nombre de chambres (optionnel)
    const chambresText = $("[data-qa-id=\"criteria_item_bedrooms\"]").text().trim() ||
                         extractFromText(html, /(\d+)\s*chambre/i);
    const chambres = chambresText ? extractNumber(chambresText) : undefined;

    // Adresse complète
    const adresseFull = $("[data-qa-id=\"adview_location_informations\"]").text().trim() ||
                        $("[class*=\"location\"]").text().trim() ||
                        $("[class*=\"address\"]").text().trim() ||
                        "";

    // Extraire ville et code postal
    const {ville, codePostal, adresse} = parseAddress(adresseFull);

    // Description
    const description = $("[data-qa-id=\"adview_description_container\"]").text().trim() ||
                        $("[class*=\"description\"]").text().trim() ||
                        "";

    // Photos
    const photos: string[] = [];
    $("img[data-qa-id=\"slideshow_image\"]").each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src");
      if (src && !src.includes("placeholder") && !src.includes("logo")) {
        // Convertir les URLs relatives en absolues
        const photoUrl = src.startsWith("http") ? src : `https:${src}`;
        photos.push(photoUrl);
      }
    });

    // Si pas de photos trouvées avec le sélecteur, chercher dans les carrousels
    if (photos.length === 0) {
      $("[class*=\"carousel\"] img, [class*=\"gallery\"] img, [class*=\"photo\"] img").each((_, el) => {
        const src = $(el).attr("src") || $(el).attr("data-src");
        if (src && src.includes("leboncoin") && !src.includes("placeholder")) {
          const photoUrl = src.startsWith("http") ? src : `https:${src}`;
          if (!photos.includes(photoUrl)) {
            photos.push(photoUrl);
          }
        }
      });
    }

    // Étage (optionnel)
    const etageText = $("[data-qa-id=\"criteria_item_floor\"]").text().trim() ||
                      extractFromText(html, /(\d+)\s*[èe]tage/i);
    const etage = etageText ? extractNumber(etageText) : undefined;

    // Ascenseur (optionnel)
    const hasAscenseur = $("[data-qa-id=\"criteria_item_elevator\"]").length > 0 ||
                          /ascenseur/i.test(html);

    // Meublé (optionnel)
    const hasMeuble = $("[data-qa-id=\"criteria_item_furnished\"]").length > 0 ||
                      /meubl[ée]/i.test(html);

    return {
      titre: titre || "Appartement à louer",
      prix: prix || 0,
      charges,
      surface: surface || 0,
      pieces: pieces || 0,
      chambres,
      adresse: adresse || ville || "",
      ville: ville || "",
      codePostal: codePostal || "",
      description: description || "",
      photos: photos.slice(0, 10), // Limiter à 10 photos
      etage,
      ascenseur: hasAscenseur || undefined,
      meuble: hasMeuble || undefined,
      lienAnnonce: url,
    };
  } catch (error) {
    console.error("Erreur lors du parsing LeBonCoin:", error);
    return null;
  }
}

/**
 * Extrait un prix depuis un texte (ex: "850 €" -> 850)
 * @param {string} text - Le texte contenant le prix
 * @return {number} Le prix extrait ou 0 si non trouvé
 */
function extractPrice(text: string): number {
  if (!text) return 0;
  const match = text.match(/(\d+[\s,.]?\d*)/);
  if (match) {
    return parseInt(match[1].replace(/[\s,.]/g, ""), 10);
  }
  return 0;
}

/**
 * Extrait un nombre depuis un texte
 * @param {string} text - Le texte contenant le nombre
 * @return {number | undefined} Le nombre extrait ou undefined si non trouvé
 */
function extractNumber(text: string): number | undefined {
  if (!text) return undefined;
  const match = text.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
}

/**
 * Extrait un pattern depuis le texte HTML
 * @param {string} html - Le HTML à analyser
 * @param {RegExp} pattern - Le pattern regex à rechercher
 * @return {string} Le texte correspondant au pattern ou une chaîne vide
 */
function extractFromText(html: string, pattern: RegExp): string {
  const match = html.match(pattern);
  return match ? match[0] : "";
}

/**
 * Parse une adresse pour extraire ville, code postal et adresse
 * @param {string} addressText - Le texte de l'adresse à parser
 * @return {{ ville: string; codePostal: string; adresse: string }} Un objet avec ville, code postal et adresse
 */
function parseAddress(addressText: string): { ville: string; codePostal: string; adresse: string } {
  if (!addressText) {
    return {ville: "", codePostal: "", adresse: ""};
  }

  // Chercher un code postal (5 chiffres)
  const cpMatch = addressText.match(/\b(\d{5})\b/);
  const codePostal = cpMatch ? cpMatch[1] : "";

  // Extraire la ville (généralement après le code postal ou à la fin)
  let ville = "";
  if (cpMatch) {
    const afterCp = addressText.substring(cpMatch.index! + cpMatch[0].length).trim();
    ville = afterCp.split(/[,\n]/)[0].trim();
  } else {
    // Si pas de code postal, prendre le dernier mot (probablement la ville)
    const parts = addressText.split(/[,\n]/);
    ville = parts[parts.length - 1].trim();
  }

  // L'adresse complète
  const adresse = addressText.trim();

  return {ville, codePostal, adresse};
}

/**
 * Parse les données extraites depuis le DOM JavaScript
 * @param {any} domData - Les données extraites depuis le DOM
 * @param {string} url - L'URL de la page
 * @return {ParsedAppartement | null}
 */
export function parseLeBonCoinFromDOM(domData: any, url: string): ParsedAppartement | null {
  try {
    // Titre
    const titre = domData.titre || "Appartement à louer";

    // Prix
    const prix = extractPrice(domData.prixText || "");

    // Surface
    const surface = extractNumber(domData.surfaceText || "") || 0;

    // Pièces
    const pieces = extractNumber(domData.piecesText || "") || 0;

    // Adresse - Essayer d'abord depuis adresseFull, sinon depuis la description
    let adresseData = parseAddress(domData.adresseFull || "");

    // Si l'adresse n'est pas trouvée, essayer de l'extraire depuis la description
    if (!adresseData.ville && !adresseData.codePostal && domData.description) {
      // Chercher des patterns comme "VILLE - Quartier" ou "VILLE (Code Postal)"
      const villeMatch = domData.description.match(/([A-Z][A-Z\s-]+)\s*-\s*([A-Z][a-z\s]+)/);
      if (villeMatch) {
        adresseData.ville = villeMatch[1].trim();
        adresseData.adresse = villeMatch[2].trim();
      } else {
        // Chercher juste une ville en majuscules au début de la description
        const villeMatch2 = domData.description.match(/^([A-Z][A-Z\s-]{2,})\s/);
        if (villeMatch2) {
          adresseData.ville = villeMatch2[1].trim();
        }
      }

      // Chercher un code postal dans la description
      const cpMatch = domData.description.match(/\b(\d{5})\b/);
      if (cpMatch) {
        adresseData.codePostal = cpMatch[1];
      }
    }

    // Description
    const description = domData.description || "";

    // Photos
    const photos = domData.photos || [];

    return {
      titre,
      prix,
      surface,
      pieces,
      adresse: adresseData.adresse || adresseData.ville || "",
      ville: adresseData.ville || "",
      codePostal: adresseData.codePostal || "",
      description,
      photos,
      lienAnnonce: url,
    };
  } catch (error) {
    console.error("Erreur lors du parsing DOM:", error);
    return null;
  }
}
