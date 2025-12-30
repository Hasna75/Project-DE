'use client'

import { useState, useEffect } from 'react'

interface Programme {
  id_prog: string
  titre: string
  type_prog: string
  mode_prog: string | null
  duree: string | null
  sect_eco: string | null
  code_spec: string | null
  Niv: string | null
}

interface Manuel {
  id_man: string
  titre: string
  dat_deb: string | null
  dat_fin: string | null
  duree: string | null
  cod_spec: string | null
  MQ: string | null
  Niv: string | null
}

interface Projet {
  id: string
  type_projet: string
  titre: string
  date_debut: string
  date_fin_prevue: string | null
  statut: string
  etape_actuelle: string | null
  priorite: string
  date_creation: string
  programme?: Programme
  manuel?: Manuel
}

export default function Projets() {
  const [projets, setProjets] = useState<Projet[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProjet, setEditingProjet] = useState<Projet | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    type_projet: "Programme d'Études",
    titre: '',
    code_spec: '',
    date_debut: '',
    date_fin_prevue: '',
    statut: 'En cours',
    priorite: 'Moyenne',
    secteur_economique: '',
    // Nouveaux champs
    type_prog: '',
    mode_prog: '',
    duree: '',
    Niv: '',
    MQ: ''
  })

  useEffect(() => {
    loadProjets()
  }, [])

  const loadProjets = async () => {
    try {
      const response = await fetch('/api/projets')
      const data = await response.json()
      setProjets(data)
      setLoading(false)
    } catch (error) {
      console.error('Erreur:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const submitData = {
        ...formData,
        code_spec: formData.code_spec || null,
        date_fin_prevue: formData.date_fin_prevue || null,
        secteur_economique: formData.type_projet === "Programme d'Études" ? formData.secteur_economique : null,
        type_prog: formData.type_projet === "Programme d'Études" ? formData.type_prog : null,
        mode_prog: formData.type_projet === "Programme d'Études" ? formData.mode_prog : null,
        duree: formData.duree || null,
        Niv: formData.Niv || null,
        MQ: formData.type_projet === "Manuel" ? formData.MQ : null
      }

      if (editingProjet) {
        await fetch('/api/projets', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProjet.id, ...submitData })
        })
      } else {
        await fetch('/api/projets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        })
      }

      setShowModal(false)
      setEditingProjet(null)
      resetForm()
      loadProjets()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (projet: Projet) => {
    setEditingProjet(projet)
    setFormData({
      type_projet: projet.type_projet,
      titre: projet.titre,
      code_spec: projet.programme?.code_spec || projet.manuel?.cod_spec || '',
      date_debut: projet.date_debut.split('T')[0],
      date_fin_prevue: projet.date_fin_prevue ? projet.date_fin_prevue.split('T')[0] : '',
      statut: projet.statut,
      priorite: projet.priorite,
      secteur_economique: projet.programme?.sect_eco || '',
      type_prog: projet.programme?.type_prog || '',
      mode_prog: projet.programme?.mode_prog || '',
      duree: projet.programme?.duree || projet.manuel?.duree || '',
      Niv: projet.programme?.Niv || projet.manuel?.Niv || '',
      MQ: projet.manuel?.MQ || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/projets?id=${id}`, {
        method: 'DELETE'
      })
      setShowDeleteConfirm(null)
      loadProjets()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const resetForm = () => {
    setFormData({
      type_projet: "Programme d'Études",
      titre: '',
      code_spec: '',
      date_debut: '',
      date_fin_prevue: '',
      statut: 'En cours',
      priorite: 'Moyenne',
      secteur_economique: '',
      type_prog: '',
      mode_prog: '',
      duree: '',
      Niv: '',
      MQ: ''
    })
  }

  const openCreateModal = () => {
    setEditingProjet(null)
    resetForm()
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProjet(null)
    resetForm()
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Terminé':
        return 'bg-green-100 text-green-800'
      case 'En cours':
        return 'bg-blue-100 text-blue-800'
      case 'En attente':
        return 'bg-yellow-100 text-yellow-800'
      case 'Annulé':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'Haute':
        return 'bg-red-100 text-red-800'
      case 'Moyenne':
        return 'bg-yellow-100 text-yellow-800'
      case 'Basse':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredProjets = projets.filter(projet => {
    const matchesSearch =
      (projet.titre && projet.titre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      projet.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatut = !filterStatut || projet.statut === filterStatut
    const matchesType = !filterType || projet.type_projet === filterType

    return matchesSearch && matchesStatut && matchesType
  })

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="text-center">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">📁 Gestion des Projets</h2>
        <button
          onClick={openCreateModal}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
        >
          ➕ Nouveau Projet
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="🔍 Rechercher par titre, ID ou description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les statuts</option>
          <option value="En cours">En cours</option>
          <option value="Terminé">Terminé</option>
          <option value="En attente">En attente</option>
          <option value="Annulé">Annulé</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les types</option>
          <option value="Programme d'Études">Programme d&apos;Études</option>
          <option value="Manuel">Manuel</option>
        </select>
      </div>

      {/* Liste des projets */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Titre</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Date Début</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Date Fin Prévue</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Statut</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Priorité</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Étape Actuelle</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjets.length === 0 ? (
              <tr>
                <td colSpan={9} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                  Aucun projet trouvé
                </td>
              </tr>
            ) : (
              filteredProjets.map((projet) => (
                <tr key={projet.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-mono font-semibold">{projet.id}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {projet.type_projet === "Programme d'Études" ? '📚 Programme' : '📖 Manuel'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="font-semibold">{projet.titre}</div>
                    {(projet.programme?.code_spec || projet.manuel?.cod_spec) && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">{projet.programme?.code_spec || projet.manuel?.cod_spec}</div>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(projet.date_debut).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {projet.date_fin_prevue ? new Date(projet.date_fin_prevue).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatutColor(projet.statut)}`}>
                      {projet.statut}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPrioriteColor(projet.priorite)}`}>
                      {projet.priorite}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm">
                    {projet.etape_actuelle || '-'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(projet)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm"
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(projet.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Total: {filteredProjets.length} projet(s) sur {projets.length}
      </div>

      {/* Modal de création/édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingProjet ? '✏️ Modifier le Projet' : '➕ Nouveau Projet'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type de Projet *</label>
                <select
                  value={formData.type_projet}
                  onChange={(e) => setFormData({ ...formData, type_projet: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Programme d'Études">Programme d&apos;Études</option>
                  <option value="Manuel">Manuel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Titre *</label>
                <input
                  type="text"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Code Spécifique</label>
                <input
                  type="text"
                  value={formData.code_spec}
                  onChange={(e) => setFormData({ ...formData, code_spec: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: CODE-001"
                />
              </div>

              <div>
                {/* Space filler or remove description entirely */}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date de Début *</label>
                  <input
                    type="date"
                    value={formData.date_debut}
                    onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date de Fin Prévue</label>
                  <input
                    type="date"
                    value={formData.date_fin_prevue}
                    onChange={(e) => setFormData({ ...formData, date_fin_prevue: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Statut *</label>
                  <select
                    value={formData.statut}
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="En cours">En cours</option>
                    <option value="Terminé">Terminé</option>
                    <option value="En attente">En attente</option>
                    <option value="Annulé">Annulé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priorité *</label>
                  <select
                    value={formData.priorite}
                    onChange={(e) => setFormData({ ...formData, priorite: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Haute">Haute</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Basse">Basse</option>
                  </select>
                </div>
              </div>

              {formData.type_projet === "Programme d'Études" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Type Programme</label>
                      <input
                        type="text"
                        value={formData.type_prog}
                        onChange={(e) => setFormData({ ...formData, type_prog: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Mode Programme</label>
                      <input
                        type="text"
                        value={formData.mode_prog}
                        onChange={(e) => setFormData({ ...formData, mode_prog: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Secteur Économique</label>
                    <input
                      type="text"
                      value={formData.secteur_economique}
                      onChange={(e) => setFormData({ ...formData, secteur_economique: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Technologies de l'Information"
                    />
                  </div>
                </>
              )}

              {formData.type_projet === "Manuel" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">MQ</label>
                    <input
                      type="text"
                      value={formData.MQ}
                      onChange={(e) => setFormData({ ...formData, MQ: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Durée</label>
                  <input
                    type="text"
                    value={formData.duree}
                    onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Niveau (Niv)</label>
                  <input
                    type="text"
                    value={formData.Niv}
                    onChange={(e) => setFormData({ ...formData, Niv: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  {editingProjet ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">⚠️ Confirmer la suppression</h3>
            <p className="mb-6">
              Êtes-vous sûr de vouloir supprimer le projet <strong>{showDeleteConfirm}</strong> ?
              Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
