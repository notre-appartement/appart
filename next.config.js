/** @type {import('next').NextConfig} */
const nextConfig = {
  // Désactiver React Strict Mode pour éviter les erreurs Firebase transitoires en dev
  reactStrictMode: false,
  // Désactivé temporairement pour supporter les routes dynamiques [id]
  // À réactiver pour le déploiement sur GitHub Pages (sans routes dynamiques)
  // output: 'export',
  images: {
    unoptimized: true,
  },
  // Ajoutez votre base path si vous déployez sur un sous-dossier de GitHub Pages
  // basePath: '/nom-du-repo',
  // assetPrefix: '/nom-du-repo/',
  webpack: (config, { isServer }) => {
    // Exclure firebase-admin du bundle client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'firebase-admin': false,
      };
    }
    // Ignorer le dossier functions (Firebase Functions)
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/functions/**', '**/node_modules/**'],
    };
    return config;
  },
}

module.exports = nextConfig
