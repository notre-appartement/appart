import { FaHome, FaHeart, FaMapMarkerAlt, FaBuilding } from 'react-icons/fa';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
            🏠 Notre Recherche d'Appartement
          </h1>
          <p className="text-gray-600 text-center text-lg mb-8">
            Organisons ensemble notre futur chez nous !
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/appartements"
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 block"
            >
              <FaBuilding className="text-4xl mb-3 mx-auto" />
              <h2 className="text-xl font-bold mb-2">Appartements</h2>
              <p className="text-sm opacity-90">
                Gérer les appartements à visiter et visités
              </p>
            </Link>

            <Link
              href="/envies"
              className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 block"
            >
              <FaHeart className="text-4xl mb-3 mx-auto" />
              <h2 className="text-xl font-bold mb-2">Nos Envies</h2>
              <p className="text-sm opacity-90">
                Définir ce qui est important pour nous
              </p>
            </Link>

            <Link
              href="/emplacements"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 block"
            >
              <FaMapMarkerAlt className="text-4xl mb-3 mx-auto" />
              <h2 className="text-xl font-bold mb-2">Emplacements</h2>
              <p className="text-sm opacity-90">
                Nos lieux préférés et importants
              </p>
            </Link>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg opacity-75">
              <FaHome className="text-4xl mb-3 mx-auto" />
              <h2 className="text-xl font-bold mb-2">Statistiques</h2>
              <p className="text-sm opacity-90">
                Bientôt disponible
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            📋 Commencer maintenant
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Authentification sécurisée activée</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">→</span>
              <Link href="/envies" className="text-blue-600 hover:underline">
                Ajouter vos envies et critères importants
              </Link>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">→</span>
              <Link href="/emplacements" className="text-blue-600 hover:underline">
                Définir vos emplacements préférés
              </Link>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">→</span>
              <Link href="/appartements" className="text-blue-600 hover:underline">
                Commencer à ajouter des appartements
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
