'use client'

import { useState, useEffect } from 'react'

interface Statistiques {
  projets_en_cours: number
  projets_termines: number
  formateurs_actifs: number
  validations_attente: number
  projets_retard: number
}

interface DashboardProps {
  setActiveTab: (tab: 'dashboard' | 'projets' | 'etapes' | 'formateurs' | 'validations' | 'rapports' | 'utilitaires') => void
}

export default function Dashboard({ setActiveTab }: DashboardProps) {
  const [stats, setStats] = useState<Statistiques>({
    projets_en_cours: 0,
    projets_termines: 0,
    formateurs_actifs: 0,
    validations_attente: 0,
    projets_retard: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/statistiques')
      .then((res) => res.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Erreur:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="bg-white p-6 rounded-lg shadow-lg">Chargement...</div>
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-5 rounded-lg border-l-4 border-blue-500">
          <div className="text-3xl font-bold text-blue-600">{stats.projets_en_cours}</div>
          <div className="text-gray-600">Projets en cours</div>
        </div>
        <div className="bg-green-100 p-5 rounded-lg border-l-4 border-green-500">
          <div className="text-3xl font-bold text-green-600">{stats.projets_termines}</div>
          <div className="text-gray-600">Projets terminés</div>
        </div>
        <div className="bg-orange-100 p-5 rounded-lg border-l-4 border-orange-500">
          <div className="text-3xl font-bold text-orange-600">{stats.formateurs_actifs}</div>
          <div className="text-gray-600">Formateurs actifs</div>
        </div>
        <div className="bg-red-100 p-5 rounded-lg border-l-4 border-red-500">
          <div className="text-3xl font-bold text-red-600">{stats.validations_attente}</div>
          <div className="text-gray-600">Validations en attente</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setActiveTab('projets')}
          className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition"
        >
          ➕ Créer un Nouveau Projet
        </button>
        <button
          onClick={() => setActiveTab('projets')}
          className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition"
        >
          📋 Lister Tous les Projets
        </button>
        <button
          onClick={() => setActiveTab('formateurs')}
          className="bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-600 transition"
        >
          👤 Ajouter un Formateur
        </button>
        <button
          onClick={() => setActiveTab('validations')}
          className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition"
        >
          ✔️ Validations en Attente
        </button>
      </div>
    </div>
  )
}

