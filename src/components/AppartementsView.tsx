'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function AppartementsView() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            🏢 Nos Appartements
          </h2>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-lg">
            <FaPlus />
            <span>Ajouter un appartement</span>
          </button>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p className="text-blue-800">
            <strong>À faire :</strong> Configurez Firebase pour commencer à ajouter des appartements.
            <br />
            Voir le fichier README.md pour les instructions.
          </p>
        </div>

        {/* Liste des appartements (placeholder) */}
        <div className="text-center text-gray-500 py-12">
          <FaPlus className="text-6xl mx-auto mb-4 text-gray-300" />
          <p className="text-xl">Aucun appartement pour le moment</p>
          <p className="text-sm mt-2">Cliquez sur "Ajouter un appartement" pour commencer</p>
        </div>
      </div>
    </div>
  );
}
