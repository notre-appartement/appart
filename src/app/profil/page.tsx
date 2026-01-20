'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { BudgetCategory } from '@/types';
import { FaSave, FaPlus, FaTrash, FaCalculator, FaPiggyBank, FaWallet, FaUser, FaEdit, FaCrown, FaRocket, FaArrowRight } from 'react-icons/fa';

export default function ProfilPage() {
  const { profile, loading, updateProfile } = useAuth();
  const { currentPlan, planConfig, isOnTrial, trialDaysRemaining, getPlanColor } = useSubscription();
  const [displayName, setDisplayName] = useState<string>('');
  const [prenom, setPrenom] = useState<string>('');
  const [nom, setNom] = useState<string>('');
  const [telephone, setTelephone] = useState<string>('');
  const [salaire, setSalaire] = useState<number>(0);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setPrenom(profile.prenom || '');
      setNom(profile.nom || '');
      setTelephone(profile.telephone || '');
      setSalaire(profile.salaireMensuel || 0);
      setCategories(profile.categoriesBudget || []);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfile({
        displayName,
        prenom,
        nom,
        telephone,
      });
      setSaveSuccess(true);
      setEditingProfile(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde du profil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBudget = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfile({
        salaireMensuel: salaire,
        categoriesBudget: categories,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde du budget');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCategory = () => {
    const newCategory: BudgetCategory = {
      id: Math.random().toString(36).substr(2, 9),
      nom: 'Nouvelle catégorie',
      pourcentage: 0,
      couleur: '#' + Math.floor(Math.random()*16777215).toString(16),
    };
    setCategories([...categories, newCategory]);
  };

  const handleRemoveCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const handleCategoryChange = (id: string, field: keyof BudgetCategory, value: string | number) => {
    setCategories(categories.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const totalPourcentage = categories.reduce((sum, c) => sum + (Number(c.pourcentage) || 0), 0);

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 text-gray-800">
          <FaUser className="text-blue-600" /> Profil & Gestion du Budget
        </h1>

        {/* Informations de profil */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-700 flex items-center gap-2">
              <FaUser className="text-blue-500" /> Informations personnelles
            </h2>
            <button
              onClick={() => setEditingProfile(!editingProfile)}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2 text-sm font-medium"
            >
              <FaEdit /> {editingProfile ? 'Annuler' : 'Modifier'}
            </button>
          </div>

          {editingProfile ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom d'affichage *
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Votre nom d'affichage"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Votre prénom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Votre nom"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setEditingProfile(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving || !displayName}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FaSave /> {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500 w-32">Nom d'affichage:</span>
                <span className="text-gray-800 font-medium">{profile?.displayName || 'Non défini'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500 w-32">Email:</span>
                <span className="text-gray-800">{profile?.email}</span>
              </div>
              {profile?.prenom && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 w-32">Prénom:</span>
                  <span className="text-gray-800">{profile.prenom}</span>
                </div>
              )}
              {profile?.nom && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 w-32">Nom:</span>
                  <span className="text-gray-800">{profile.nom}</span>
                </div>
              )}
              {profile?.telephone && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 w-32">Téléphone:</span>
                  <span className="text-gray-800">{profile.telephone}</span>
                </div>
              )}
              {/* Section abonnement déplacée ci-dessous */}
            </div>
          )}
        </div>

        {/* Abonnement */}
        <div className="mb-8">
          <div className={`bg-gradient-to-br ${
            currentPlan === 'pro' ? 'from-purple-50 to-pink-50 border-purple-300' :
            currentPlan === 'premium' ? 'from-yellow-50 to-orange-50 border-orange-300' :
            'from-gray-50 to-gray-100 border-gray-300'
          } rounded-xl shadow-md p-6 border-2`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {currentPlan === 'pro' && <FaRocket className="text-3xl text-purple-600" />}
                {currentPlan === 'premium' && <FaCrown className="text-3xl text-yellow-600" />}
                {currentPlan === 'free' && <FaUser className="text-3xl text-gray-600" />}
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {planConfig.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {planConfig.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-800">
                  {planConfig.price > 0 ? `${planConfig.price}€` : 'Gratuit'}
                </p>
                {planConfig.price > 0 && (
                  <p className="text-sm text-gray-500">par mois</p>
                )}
              </div>
            </div>

            {/* Badge période d'essai */}
            {isOnTrial() && (
              <div className="mb-4 bg-green-100 border border-green-300 rounded-lg p-3 flex items-center gap-2">
                <span className="text-green-700 font-medium">
                  🎁 Période d'essai active
                </span>
                <span className="text-sm text-green-600">
                  ({trialDaysRemaining()} jours restants)
                </span>
              </div>
            )}

            {/* Features */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Vos avantages :</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {planConfig.featuresList.slice(0, 6).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-500">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link
                href="/abonnement"
                className={`flex-1 text-center py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                  currentPlan === 'free'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl'
                    : currentPlan === 'premium'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {currentPlan === 'free' ? (
                  <>
                    <FaCrown />
                    Passer à Premium
                  </>
                ) : currentPlan === 'premium' ? (
                  <>
                    <FaRocket />
                    Passer à Pro
                  </>
                ) : (
                  <>
                    Gérer mon abonnement
                  </>
                )}
                <FaArrowRight className="text-sm" />
              </Link>
              {currentPlan === 'free' && (
                <Link
                  href="/analytics"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  Voir Analytics Premium
                </Link>
              )}
            </div>

            {currentPlan === 'free' && (
              <p className="text-xs text-gray-500 text-center mt-3">
                ✨ Essai gratuit de 14 jours • Sans engagement
              </p>
            )}
          </div>
        </div>

        {/* Budget */}
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <FaPiggyBank className="text-green-500" /> Gestion du budget
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Section Salaire */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-700">
                <FaWallet className="text-green-500" /> Mon Revenu
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Salaire mensuel net (€)
                  </label>
                  <input
                    type="number"
                    value={salaire}
                    onChange={(e) => setSalaire(Number(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-gray-900"
                    placeholder="Ex: 2500"
                  />
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">
                    Ce montant servira de base pour calculer vos capacités de loyer et d'épargne.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-700">
                <FaCalculator className="text-blue-500" /> Récapitulatif
              </h2>
              <div className="space-y-3">
                {categories.map(cat => (
                  <div key={cat.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{cat.nom}</span>
                    <span className="font-bold">
                      {Math.round((salaire * (cat.pourcentage / 100)))} €
                    </span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2 flex justify-between items-center font-bold text-gray-800">
                  <span>Total Alloué</span>
                  <span className={totalPourcentage > 100 ? 'text-red-500' : 'text-green-600'}>
                    {totalPourcentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section Répartition Budget */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-700">
                  <FaPiggyBank className="text-purple-500" /> Répartition du Budget
                </h2>
                <button
                  onClick={handleAddCategory}
                  className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-full font-medium transition-colors flex items-center gap-1"
                >
                  <FaPlus size={12} /> Ajouter
                </button>
              </div>

              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-xl hover:border-blue-200 transition-colors bg-gray-50/50">
                    <div className="flex-1 space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={category.nom}
                          onChange={(e) => handleCategoryChange(category.id, 'nom', e.target.value)}
                          className="flex-1 px-3 py-1 border rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm font-medium text-gray-900"
                          placeholder="Nom de la catégorie"
                        />
                        <input
                          type="color"
                          value={category.couleur}
                          onChange={(e) => handleCategoryChange(category.id, 'couleur', e.target.value)}
                          className="w-10 h-8 p-1 border rounded cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={category.pourcentage}
                          onChange={(e) => handleCategoryChange(category.id, 'pourcentage', Number(e.target.value))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex items-center gap-1 w-20">
                          <input
                            type="number"
                            value={category.pourcentage}
                            onChange={(e) => handleCategoryChange(category.id, 'pourcentage', Number(e.target.value))}
                            className="w-12 px-2 py-1 border rounded text-right text-sm text-gray-900"
                          />
                          <span className="text-sm text-gray-500">%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex sm:flex-col justify-center gap-2">
                      <button
                        onClick={() => handleRemoveCategory(category.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {categories.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-xl border-gray-200 text-gray-400">
                  <p>Aucune catégorie de budget définie.</p>
                  <button
                    onClick={handleAddCategory}
                    className="mt-2 text-blue-500 hover:underline"
                  >
                    Ajouter ma première catégorie
                  </button>
                </div>
              )}

              {totalPourcentage > 100 && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
                  <span>⚠️ Attention: Le total des pourcentages dépasse 100% ({totalPourcentage}%).</span>
                </div>
              )}

              <div className="mt-8 flex justify-end gap-4">
                {saveSuccess && (
                  <span className="flex items-center text-green-600 font-medium animate-fade-in">
                    ✅ Sauvegardé !
                  </span>
                )}
                <button
                  onClick={handleSaveBudget}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-white transition-all ${
                    isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl active:transform active:scale-95'
                  }`}
                >
                  <FaSave /> {isSaving ? 'Sauvegarde...' : 'Enregistrer mon profil'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
