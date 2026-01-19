'use client';

import { useState } from 'react';
import { FaPlus, FaMapMarkerAlt, FaBriefcase, FaHome, FaShoppingCart, FaUsers } from 'react-icons/fa';

export default function EmplacementsView() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            📍 Nos Emplacements Préférés
          </h2>
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-lg">
            <FaPlus />
            <span>Ajouter un emplacement</span>
          </button>
        </div>

        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <p className="text-green-800">
            <strong>À faire :</strong> Configurez Firebase pour commencer à ajouter vos emplacements importants.
            <br />
            Voir le fichier README.md pour les instructions.
          </p>
        </div>

        {/* Liste des emplacements (placeholder) */}
        <div className="text-center text-gray-500 py-12">
          <FaMapMarkerAlt className="text-6xl mx-auto mb-4 text-gray-300" />
          <p className="text-xl">Aucun emplacement défini pour le moment</p>
          <p className="text-sm mt-2">Ajoutez vos lieux importants (travail, famille, commerces...)</p>
        </div>
      </div>

      {/* Types d'emplacements */}
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          📌 Types d'emplacements
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <FaBriefcase className="text-2xl text-blue-600 mb-2" />
            <h4 className="font-bold text-gray-800">Travail</h4>
            <p className="text-sm text-gray-600">Vos lieux de travail</p>
          </div>
          <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
            <FaUsers className="text-2xl text-pink-600 mb-2" />
            <h4 className="font-bold text-gray-800">Famille</h4>
            <p className="text-sm text-gray-600">Proches de la famille</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <FaHome className="text-2xl text-purple-600 mb-2" />
            <h4 className="font-bold text-gray-800">Loisirs</h4>
            <p className="text-sm text-gray-600">Activités et hobbies</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <FaShoppingCart className="text-2xl text-green-600 mb-2" />
            <h4 className="font-bold text-gray-800">Commerces</h4>
            <p className="text-sm text-gray-600">Magasins essentiels</p>
          </div>
        </div>
      </div>
    </div>
  );
}
