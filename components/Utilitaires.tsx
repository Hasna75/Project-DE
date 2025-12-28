'use client'

import { useState, useEffect } from 'react'

interface Historique {
  id: number
  projet_id: string | null
  action: string
  utilisateur: string | null
  details: string | null
  date_action: string
  projet?: {
    id: string
    titre: string
  }
}

interface IfepInfo {
  nom: string
  adresse: string
  telephone: string
  fax: string
  branches_professionnelles: string
}

export default function Utilitaires() {
  const [historique, setHistorique] = useState<Historique[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [ifepInfo, setIfepInfo] = useState<IfepInfo>({
    nom: '',
    adresse: '',
    telephone: '',
    fax: '',
    branches_professionnelles: ''
  })
  const [showIfepForm, setShowIfepForm] = useState(false)

  useEffect(() => {
    loadHistorique()
    loadIfepInfo()
  }, [])

  const loadIfepInfo = async () => {
    try {
      const response = await fetch('/api/ifep-info')
      if (response.ok) {
        const data = await response.json()
        setIfepInfo(data)
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleIfepSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/ifep-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ifepInfo)
      })

      if (response.ok) {
        showMessage('success', 'Informations IFEP mises à jour avec succès')
        setShowIfepForm(false)
        // Recharger la page pour mettre à jour l'en-tête et le pied de page
        window.location.reload()
      } else {
        showMessage('error', 'Erreur lors de la mise à jour des informations IFEP')
      }
    } catch (error) {
      console.error('Erreur:', error)
      showMessage('error', 'Erreur lors de la mise à jour des informations IFEP')
    } finally {
      setLoading(false)
    }
  }

  const loadHistorique = async () => {
    try {
      const response = await fetch('/api/historique')
      if (response.ok) {
        const data = await response.json()
        setHistorique(data)
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const exportData = async () => {
    setLoading(true)
    try {
      const [projets, formateurs, validations, affectations] = await Promise.all([
        fetch('/api/projets').then(r => r.json()),
        fetch('/api/formateurs').then(r => r.json()),
        fetch('/api/validations').then(r => r.json()),
        fetch('/api/affectations').then(r => r.json())
      ])

      const data = {
        export_date: new Date().toISOString(),
        projets,
        formateurs,
        validations,
        affectations
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `export_donnees_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showMessage('success', 'Données exportées avec succès')
    } catch (error) {
      console.error('Erreur:', error)
      showMessage('error', 'Erreur lors de l\'export des données')
    } finally {
      setLoading(false)
    }
  }

  const clearHistorique = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer tout l\'historique ? Cette action est irréversible.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/historique', {
        method: 'DELETE'
      })

      if (response.ok) {
        setHistorique([])
        showMessage('success', 'Historique supprimé avec succès')
      } else {
        showMessage('error', 'Erreur lors de la suppression de l\'historique')
      }
    } catch (error) {
      console.error('Erreur:', error)
      showMessage('error', 'Erreur lors de la suppression de l\'historique')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setLoading(true)
    try {
      await loadHistorique()
      showMessage('success', 'Données actualisées')
    } catch (error) {
      console.error('Erreur:', error)
      showMessage('error', 'Erreur lors de l\'actualisation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">🔧 Utilitaires</h2>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Outils de gestion */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Outils de Gestion</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={exportData}
            disabled={loading}
            className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            💾 Exporter les Données
          </button>
          <button
            onClick={refreshData}
            disabled={loading}
            className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔄 Actualiser les Données
          </button>
          <button
            onClick={clearHistorique}
            disabled={loading}
            className="bg-red-500 text-white p-4 rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🗑️ Vider l&apos;Historique
          </button>
        </div>
      </div>

      {/* Configuration IFEP */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">🏛️ Informations IFEP</h3>
          <button
            onClick={() => setShowIfepForm(!showIfepForm)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm"
          >
            {showIfepForm ? 'Masquer' : 'Modifier'}
          </button>
        </div>
        
        {showIfepForm ? (
          <form onSubmit={handleIfepSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom de l&apos;IFEP *</label>
              <input
                type="text"
                value={ifepInfo.nom}
                onChange={(e) => setIfepInfo({ ...ifepInfo, nom: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Institut de Formation et d'Enseignement Professionnels"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Adresse *</label>
              <textarea
                value={ifepInfo.adresse}
                onChange={(e) => setIfepInfo({ ...ifepInfo, adresse: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Ex: 123 Rue de la Formation, 10000 Ville"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Téléphone</label>
                <input
                  type="text"
                  value={ifepInfo.telephone}
                  onChange={(e) => setIfepInfo({ ...ifepInfo, telephone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: +212 5XX XXX XXX"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Fax</label>
                <input
                  type="text"
                  value={ifepInfo.fax}
                  onChange={(e) => setIfepInfo({ ...ifepInfo, fax: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: +212 5XX XXX XXX"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Branches professionnelles</label>
              <textarea
                value={ifepInfo.branches_professionnelles}
                onChange={(e) => setIfepInfo({ ...ifepInfo, branches_professionnelles: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Ex: Informatique, Électricité, Mécanique, Commerce, etc."
              />
            </div>
            
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowIfepForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enregistrer
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {ifepInfo.nom && (
              <div>
                <strong>Nom:</strong> {ifepInfo.nom}
              </div>
            )}
            {ifepInfo.adresse && (
              <div>
                <strong>Adresse:</strong> {ifepInfo.adresse}
              </div>
            )}
            {ifepInfo.telephone && (
              <div>
                <strong>Téléphone:</strong> {ifepInfo.telephone}
              </div>
            )}
            {ifepInfo.fax && (
              <div>
                <strong>Fax:</strong> {ifepInfo.fax}
              </div>
            )}
            {ifepInfo.branches_professionnelles && (
              <div className="md:col-span-2">
                <strong>Branches professionnelles:</strong> {ifepInfo.branches_professionnelles}
              </div>
            )}
            {!ifepInfo.nom && !ifepInfo.adresse && !ifepInfo.telephone && !ifepInfo.fax && !ifepInfo.branches_professionnelles && (
              <div className="text-gray-500 italic">
                Aucune information IFEP configurée. Cliquez sur &quot;Modifier&quot; pour ajouter les informations.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Informations système */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-bold mb-4">Informations Système</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Version de l&apos;application:</strong> 1.0.0
          </div>
          <div>
            <strong>Base de données:</strong> SQLite
          </div>
          <div>
            <strong>Framework:</strong> Next.js 14
          </div>
          <div>
            <strong>Date actuelle:</strong> {new Date().toLocaleDateString('fr-FR')}
          </div>
        </div>
      </div>

      {/* Historique des actions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Historique des Actions</h3>
          <span className="text-sm text-gray-600">
            {historique.length} action(s) enregistrée(s)
          </span>
        </div>

        {historique.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun historique disponible
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Action</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Utilisateur</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Projet</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Détails</th>
                </tr>
              </thead>
              <tbody>
                {historique.slice(0, 50).map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(item.date_action).toLocaleString('fr-FR')}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{item.action}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.utilisateur || 'Système'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.projet ? (
                        <div>
                          <div className="font-semibold">{item.projet.id}</div>
                          <div className="text-xs text-gray-500">{item.projet.titre}</div>
                        </div>
                      ) : (
                        item.projet_id || '-'
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm">
                      {item.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {historique.length > 50 && (
              <div className="mt-2 text-sm text-gray-600 text-center">
                Affichage des 50 dernières actions sur {historique.length}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
