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

    // Titre
    const titre = $("h1[data-qa-id=\"adview_title\"]").text().trim() ||
                   $("h1").first().text().trim() ||
                   "Appartement à louer";

    // Prix (peut être dans plusieurs endroits)
    const prixText = $("[data-qa-id=\"adview_price\"]").text().trim() ||
                     $(".price").first().text().trim() ||
                     $("[class*=\"price\"]").first().text().trim();
    const prix = extractPrice(prixText);

    // Charges (optionnel)
    const chargesText = $("[data-qa-id=\"adview_charges\"]").text().trim() ||
                        $("[class*=\"charges\"]").text().trim();
    const charges = chargesText ? extractPrice(chargesText) : undefined;

    // Surface
    const surfaceText = $("[data-qa-id=\"criteria_item_square\"]").text().trim() ||
                        $("[class*=\"surface\"]").text().trim() ||
                        extractFromText(html, /(\d+)\s*m[²2]/i);
    const surface = extractNumber(surfaceText) || 0;

    // Nombre de pièces
    const piecesText = $("[data-qa-id=\"criteria_item_rooms\"]").text().trim() ||
                       $("[class*=\"rooms\"]").text().trim() ||
                       extractFromText(html, /(\d+)\s*pi[èe]ce/i);
    const pieces = extractNumber(piecesText) || 0;

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
