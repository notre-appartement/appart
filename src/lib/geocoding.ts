// Service de géocodage utilisant Nominatim (OpenStreetMap)
// Gratuit et sans clé API requise

interface GeocodeResult {
  latitude: number;
  longitude: number;
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  try {
    // Encoder l'adresse pour l'URL
    const encodedAddress = encodeURIComponent(address);

    // Appeler l'API Nominatim
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
      {
        headers: {
          'User-Agent': 'AppartApp/1.0', // Nominatim requiert un User-Agent
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la géolocalisation');
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.error('Erreur de géocodage:', error);
    return null;
  }
}

// Version avec retry pour plus de fiabilité
export async function geocodeAddressWithRetry(
  address: string,
  maxRetries: number = 2
): Promise<GeocodeResult | null> {
  for (let i = 0; i < maxRetries; i++) {
    const result = await geocodeAddress(address);
    if (result) return result;

    // Attendre un peu avant de réessayer
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return null;
}
