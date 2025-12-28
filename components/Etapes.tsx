'use client'

import { useState, useEffect } from 'react'

interface Projet {
  id: string
  titre: string
  type_projet: string
}

interface EtapeData {
  id?: number
  projet_id: string
  projet?: {
    id: string
    titre: string
    type_projet: string
  }
  etape1_date_debut?: string | null
  etape1_date_fin?: string | null
  etape1_statut?: string | null
  etape2_date_debut?: string | null
  etape2_date_fin?: string | null
  etape2_statut?: string | null
  etape2_validation?: string | null
  etape3_date_debut?: string | null
  etape3_date_fin?: string | null
  etape3_statut?: string | null
  etape3_validation?: string | null
  etape4_date_debut?: string | null
  etape4_date_fin?: string | null
  etape4_statut?: string | null
  etape4_validation?: string | null
  etape5_date_debut?: string | null
  etape5_date_fin?: string | null
  etape5_statut?: string | null
  etape5_validation?: string | null
  etape6_date_debut?: string | null
  etape6_date_fin?: string | null
  etape6_statut?: string | null
  etape6_validation?: string | null
}

const ETAPES_PROGRAMME = [
  { num: 1, nom: "Collection des données" },
  { num: 2, nom: "AST" },
  { num: 3, nom: "RAP+RC" },
  { num: 4, nom: "PE" },
  { num: 5, nom: "Plan d'équipement" },
  { num: 6, nom: "Publication" }
]

const ETAPES_MANUEL = [
  { num: 1, nom: "Collection des données" },
  { num: 2, nom: "Rédaction" },
  { num: 3, nom: "Mise en forme" },
  { num: 4, nom: "Validation interne" },
  { num: 5, nom: "Validation finale" },
  { num: 6, nom: "Publication" }
]

export default function Etapes() {
  const [projets, setProjets] = useState<Projet[]>([])
  const [selectedProjetId, setSelectedProjetId] = useState<string>('')
  const [etapes, setEtapes] = useState<EtapeData | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingEtape, setEditingEtape] = useState<number | null>(null)
  const [editFormData, setEditFormData] = useState<Record<string, any>>({})

  useEffect(() => {
    loadProjets()
  }, [])

  useEffect(() => {
    if (selectedProjetId) {
      loadEtapes(selectedProjetId)
    } else {
      setEtapes(null)
    }
  }, [selectedProjetId])

  const loadProjets = async () => {
    try {
      const response = await fetch('/api/projets')
      const data = await response.json()
      setProjets(data)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const loadEtapes = async (projetId: string) => {
    // Charge les étapes depuis la bonne table selon le type de projet :
    // - etapes_programme pour les projets de type "Programme d'Études"
    // - etapes_manuel pour les projets de type "Manuel"
    setLoading(true)
    try {
      const response = await fetch(`/api/etapes?projet_id=${projetId}`)
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setEtapes(data)
        } else {
          console.error('Aucune donnée reçue')
          setEtapes(null)
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
        console.error('Erreur API:', errorData)
        alert(`Erreur lors du chargement des étapes: ${errorData.error || 'Erreur inconnue'}`)
        setEtapes(null)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors du chargement des étapes')
      setEtapes(null)
    } finally {
      setLoading(false)
    }
  }

  const handleEditStart = (etapeNum: number) => {
    if (!etapes) return
    const dateDebut = etapes[`etape${etapeNum}_date_debut` as keyof EtapeData] as string | null
    const dateFin = etapes[`etape${etapeNum}_date_fin` as keyof EtapeData] as string | null
    setEditFormData({
      [`etape${etapeNum}_date_debut`]: dateDebut ? new Date(dateDebut).toISOString().split('T')[0] : '',
      [`etape${etapeNum}_date_fin`]: dateFin ? new Date(dateFin).toISOString().split('T')[0] : '',
      [`etape${etapeNum}_statut`]: etapes[`etape${etapeNum}_statut` as keyof EtapeData] || '',
      [`etape${etapeNum}_validation`]: etapes[`etape${etapeNum}_validation` as keyof EtapeData] || ''
    })
    setEditingEtape(etapeNum)
  }

  const handleSaveEtape = async (etapeNum: number) => {
    if (!etapes || !selectedProjetId) return

    setSaving(true)
    try {
      const selectedProjet = projets.find(p => p.id === selectedProjetId)
      if (!selectedProjet) return

      const updates: any = {}
      const dateDebut = editFormData[`etape${etapeNum}_date_debut`]
      const dateFin = editFormData[`etape${etapeNum}_date_fin`]
      const statut = editFormData[`etape${etapeNum}_statut`]
      
      updates[`etape${etapeNum}_date_debut`] = dateDebut ? new Date(dateDebut + 'T00:00:00').toISOString() : null
      updates[`etape${etapeNum}_date_fin`] = dateFin ? new Date(dateFin + 'T00:00:00').toISOString() : null
      updates[`etape${etapeNum}_statut`] = statut || null

      // Pour "Programme d'Études", ajouter le champ validation uniquement pour les étapes 2-6 (pas l'étape 1)
      if (selectedProjet.type_projet === "Programme d'Études" && etapeNum > 1) {
        updates[`etape${etapeNum}_validation`] = editFormData[`etape${etapeNum}_validation`] || null
      }

      const response = await fetch('/api/etapes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projet_id: selectedProjetId,
          type_projet: selectedProjet.type_projet,
          ...updates
        })
      })

      if (response.ok) {
        await loadEtapes(selectedProjetId)
        setEditingEtape(null)
        setEditFormData({})
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
        console.error('Erreur API:', errorData)
        alert(`Erreur lors de la sauvegarde: ${errorData.error || 'Erreur inconnue'}`)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert(`Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    } finally {
      setSaving(false)
    }
  }

  const getEtapeStatus = (etapeNum: number): string => {
    if (!etapes) return 'Non démarrée'
    const statut = etapes[`etape${etapeNum}_statut` as keyof EtapeData] as string
    return statut || 'Non démarrée'
  }

  const getEtapeColor = (etapeNum: number): string => {
    const statut = getEtapeStatus(etapeNum)
    if (statut === 'Terminée') return 'bg-green-500'
    if (statut === 'En cours') return 'bg-blue-500'
    if (statut === 'En attente') return 'bg-yellow-500'
    return 'bg-gray-300'
  }

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return ''
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR')
    } catch {
      return ''
    }
  }

  const getSelectedProjet = () => {
    return projets.find(p => p.id === selectedProjetId)
  }

  const etapesList = getSelectedProjet()?.type_projet === "Programme d'Études" 
    ? ETAPES_PROGRAMME 
    : ETAPES_MANUEL

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">✅ Gestion des Étapes</h2>

      {/* Sélection du projet */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Sélectionner un projet</label>
        <select
          value={selectedProjetId}
          onChange={(e) => setSelectedProjetId(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Choisir un projet --</option>
          {projets.map((projet) => (
            <option key={projet.id} value={projet.id}>
              {projet.id} - {projet.titre} ({projet.type_projet})
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="text-center py-8">Chargement des étapes...</div>
      )}

      {!loading && selectedProjetId && etapes && (
        <div>
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-bold text-lg mb-2">
              {etapes.projet?.titre} ({etapes.projet?.type_projet})
            </h3>
            <p className="text-sm text-gray-600">ID: {etapes.projet?.id}</p>
          </div>

          {/* Timeline des étapes */}
          <div className="space-y-4">
            {etapesList.map((etape, index) => {
              const etapeNum = etape.num
              const isEditing = editingEtape === etapeNum
              const dateDebut = etapes[`etape${etapeNum}_date_debut` as keyof EtapeData] as string | null
              const dateFin = etapes[`etape${etapeNum}_date_fin` as keyof EtapeData] as string | null
              const statut = etapes[`etape${etapeNum}_statut` as keyof EtapeData] as string | null
              const validation = etapes[`etape${etapeNum}_validation` as keyof EtapeData] as string | null

              return (
                <div
                  key={etapeNum}
                  className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start gap-4">
                    {/* Indicateur de progression */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getEtapeColor(etapeNum)}`}
                      >
                        {etapeNum}
                      </div>
                      {index < etapesList.length - 1 && (
                        <div className={`w-1 h-16 ${getEtapeColor(etapeNum)}`}></div>
                      )}
                    </div>

                    {/* Contenu de l'étape */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg">{etape.nom}</h4>
                        {!isEditing && (
                          <button
                            onClick={() => handleEditStart(etapeNum)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            ✏️ Modifier
                          </button>
                        )}
                      </div>

                      {!isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-semibold">Date début:</span>{' '}
                            {formatDate(dateDebut) || '-'}
                          </div>
                          <div>
                            <span className="font-semibold">Date fin:</span>{' '}
                            {formatDate(dateFin) || '-'}
                          </div>
                          <div>
                            <span className="font-semibold">Statut:</span>{' '}
                            <span className={`px-2 py-1 rounded text-xs ${
                              statut === 'Terminée' ? 'bg-green-100 text-green-800' :
                              statut === 'En cours' ? 'bg-blue-100 text-blue-800' :
                              statut === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {statut || 'Non démarrée'}
                            </span>
                          </div>
                          {getSelectedProjet()?.type_projet === "Programme d'Études" && validation && (
                            <div className="md:col-span-3">
                              <span className="font-semibold">Validation:</span>{' '}
                              {validation}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Date de début</label>
                              <input
                                type="date"
                                value={editFormData[`etape${etapeNum}_date_debut`] || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, [`etape${etapeNum}_date_debut`]: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Date de fin</label>
                              <input
                                type="date"
                                value={editFormData[`etape${etapeNum}_date_fin`] || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, [`etape${etapeNum}_date_fin`]: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Statut</label>
                              <select
                                value={editFormData[`etape${etapeNum}_statut`] || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, [`etape${etapeNum}_statut`]: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Non démarrée</option>
                                <option value="En attente">En attente</option>
                                <option value="En cours">En cours</option>
                                <option value="Terminée">Terminée</option>
                              </select>
                            </div>
                            {getSelectedProjet()?.type_projet === "Programme d'Études" && etapeNum > 1 && (
                              <div>
                                <label className="block text-sm font-medium mb-1">Validation</label>
                                <input
                                  type="text"
                                  value={editFormData[`etape${etapeNum}_validation`] || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, [`etape${etapeNum}_validation`]: e.target.value })}
                                  placeholder="Détails de validation"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEtape(etapeNum)}
                              disabled={saving}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                            >
                              {saving ? 'Enregistrement...' : '💾 Enregistrer'}
                            </button>
                            <button
                              onClick={() => {
                                setEditingEtape(null)
                                setEditFormData({})
                              }}
                              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!loading && selectedProjetId && !etapes && (
        <div className="text-center py-8 text-gray-500">
          Aucune étape trouvée pour ce projet. Les étapes seront créées automatiquement lors de la création du projet.
        </div>
      )}

      {!selectedProjetId && (
        <div className="text-center py-8 text-gray-500">
          Veuillez sélectionner un projet pour voir ses étapes
        </div>
      )}
    </div>
  )
}
