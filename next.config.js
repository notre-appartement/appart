/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Ajoutez votre base path si vous déployez sur un sous-dossier de GitHub Pages
  basePath: '/nom-du-repo',
  assetPrefix: '/nom-du-repo/',
}

module.exports = nextConfig
