/** @type {import('next').NextConfig} */
const nextConfig = {
  // Désactivé temporairement pour supporter les routes dynamiques [id]
  // À réactiver pour le déploiement sur GitHub Pages (sans routes dynamiques)
  // output: 'export',
  images: {
    unoptimized: true,
  },
  // Ajoutez votre base path si vous déployez sur un sous-dossier de GitHub Pages
  // basePath: '/nom-du-repo',
  // assetPrefix: '/nom-du-repo/',
}

module.exports = nextConfig
