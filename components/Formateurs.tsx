'use client'

import { useState, useEffect } from 'react'

interface Affectation {
  id: string
  projet: {
    id: string
    titre: string
  }
  role: string
}

interface Projet {
  id: string
  titre: string
  type_projet: string
}

interface Formateur {
  id: string
  nom: string
  prenom: string
  specialite: string | null
  email: string | null
  telephone: string | null
  statut: string
  date_creation: string
  affectations?: Affectation[]
}

interface ProjetAffectation {
  projet_id: string
  role: string
}

export default function Formateurs() {
  const [formateurs, setFormateurs] = useState<Formateur[]>([])
  const [projets, setProjets] = useState<Projet[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingFormateur, setEditingFormateur] = useState<Formateur | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState<string>('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    specialite: '',
    email: '',
    telephone: '',
    statut: 'Actif'
  })

  const [projetsAffectes, setProjetsAffectes] = useState<ProjetAffectation[]>([])

  useEffect(() => {
    loadFormateurs()
    loadProjets()
  }, [])

  const loadFormateurs = async () => {
    try {
      const response = await fetch('/api/formateurs')
      const data = await response.json()
      setFormateurs(data)
      setLoading(false)
    } catch (error) {
      console.error('Erreur:', error)
      setLoading(false)
    }
  }

  const loadProjets = async () => {
    try {
      const response = await fetch('/api/projets')
      const data = await response.json()
      setProjets(data)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const submitData = {
        ...formData,
        specialite: formData.specialite || null,
        email: formData.email || null,
        telephone: formData.telephone || null
      }

      let formateurId: string

      if (editingFormateur) {
        const response = await fetch('/api/formateurs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingFormateur.id, ...submitData })
        })
        const updated = await response.json()
        formateurId = updated.id

        // Supprimer les anciennes affectations
        if (editingFormateur.affectations) {
          for (const affectation of editingFormateur.affectations) {
            try {
              await fetch(`/api/affectations?id=${affectation.id}`, {
                method: 'DELETE'
              })
            } catch (error) {
              console.error('Erreur lors de la suppression de l\'affectation:', error)
            }
          }
        }
      } else {
        const response = await fetch('/api/formateurs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        })
        const created = await response.json()
        formateurId = created.id
      }

      // Créer les nouvelles affectations pour les projets sélectionnés
      if (projetsAffectes.length > 0) {
        for (const projetAffecte of projetsAffectes) {
          if (projetAffecte.projet_id) { // Vérifier qu'un projet est sélectionné
            try {
              await fetch('/api/affectations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  formateur_id: formateurId,
                  projet_id: projetAffecte.projet_id,
                  role: projetAffecte.role
                })
              })
            } catch (error) {
              console.error('Erreur lors de la création de l\'affectation:', error)
            }
          }
        }
      }

      setShowModal(false)
      setEditingFormateur(null)
      resetForm()
      setProjetsAffectes([])
      loadFormateurs()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (formateur: Formateur) => {
    setEditingFormateur(formateur)
    setFormData({
      nom: formateur.nom,
      prenom: formateur.prenom,
      specialite: formateur.specialite || '',
      email: formateur.email || '',
      telephone: formateur.telephone || '',
      statut: formateur.statut
    })
    // Pré-remplir les projets affectés
    if (formateur.affectations) {
      setProjetsAffectes(
        formateur.affectations.map(aff => ({
          projet_id: aff.projet.id,
          role: aff.role
        }))
      )
    } else {
      setProjetsAffectes([])
    }
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/formateurs?id=${id}`, {
        method: 'DELETE'
      })
      setShowDeleteConfirm(null)
      loadFormateurs()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      specialite: '',
      email: '',
      telephone: '',
      statut: 'Actif'
    })
    setProjetsAffectes([])
  }

  const addProjetAffectation = () => {
    setProjetsAffectes([...projetsAffectes, { projet_id: '', role: 'Contributeur' }])
  }

  const removeProjetAffectation = (index: number) => {
    setProjetsAffectes(projetsAffectes.filter((_, i) => i !== index))
  }

  const updateProjetAffectation = (index: number, field: 'projet_id' | 'role', value: string) => {
    const updated = [...projetsAffectes]
    updated[index] = { ...updated[index], [field]: value }
    setProjetsAffectes(updated)
  }

  const openCreateModal = () => {
    setEditingFormateur(null)
    resetForm()
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingFormateur(null)
    resetForm()
  }

  const getStatutColor = (statut: string) => {
    return statut === 'Actif' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800'
  }

  const filteredFormateurs = formateurs.filter(formateur => {
    const fullName = `${formateur.prenom} ${formateur.nom}`.toLowerCase()
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      formateur.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (formateur.specialite && formateur.specialite.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (formateur.email && formateur.email.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatut = !filterStatut || formateur.statut === filterStatut

    return matchesSearch && matchesStatut
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
        <h2 className="text-2xl font-bold">👥 Gestion des Formateurs</h2>
        <button
          onClick={openCreateModal}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
        >
          ➕ Nouveau Formateur
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="🔍 Rechercher par nom, spécialité, email..."
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
          <option value="Actif">Actif</option>
          <option value="Inactif">Inactif</option>
        </select>
      </div>

      {/* Liste des formateurs */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Nom</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Prénom</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Spécialité</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Téléphone</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Statut</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Projets</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFormateurs.length === 0 ? (
              <tr>
                <td colSpan={9} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                  Aucun formateur trouvé
                </td>
              </tr>
            ) : (
              filteredFormateurs.map((formateur) => (
                <tr key={formateur.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-mono font-semibold">{formateur.id}</td>
                  <td className="border border-gray-300 px-4 py-2 font-semibold">{formateur.nom}</td>
                  <td className="border border-gray-300 px-4 py-2">{formateur.prenom}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {formateur.specialite || '-'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {formateur.email ? (
                      <a href={`mailto:${formateur.email}`} className="text-blue-600 hover:underline">
                        {formateur.email}
                      </a>
                    ) : '-'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {formateur.telephone ? (
                      <a href={`tel:${formateur.telephone}`} className="text-blue-600 hover:underline">
                        {formateur.telephone}
                      </a>
                    ) : '-'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatutColor(formateur.statut)}`}>
                      {formateur.statut}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {formateur.affectations && formateur.affectations.length > 0 ? (
                      <div className="text-sm">
                        <div className="font-semibold text-blue-600">{formateur.affectations.length} projet(s)</div>
                        <div className="text-gray-500 text-xs mt-1">
                          {formateur.affectations.slice(0, 2).map((aff, idx) => (
                            <div key={idx}>• {aff.projet.titre}</div>
                          ))}
                          {formateur.affectations.length > 2 && (
                            <div>... et {formateur.affectations.length - 2} autre(s)</div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Aucun</span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(formateur)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm"
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(formateur.id)}
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
        Total: {filteredFormateurs.length} formateur(s) sur {formateurs.length}
      </div>

      {/* Modal de création/édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingFormateur ? '✏️ Modifier le Formateur' : '➕ Nouveau Formateur'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom *</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prénom *</label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Spécialité</label>
                <input
                  type="text"
                  value={formData.specialite}
                  onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Développement Web, Base de données..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="exemple@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Statut *</label>
                <select
                  value={formData.statut}
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </div>

              {/* Section Projets */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Projets</label>
                  <button
                    type="button"
                    onClick={addProjetAffectation}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    ➕ Ajouter un projet
                  </button>
                </div>
                {projetsAffectes.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Aucun projet affecté</p>
                ) : (
                  <div className="space-y-2">
                    {projetsAffectes.map((projetAffecte, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-600 mb-1">Projet</label>
                          <select
                            value={projetAffecte.projet_id}
                            onChange={(e) => updateProjetAffectation(index, 'projet_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option value="">-- Sélectionner un projet --</option>
                            {projets
                              .filter(p => !projetsAffectes.some((pa, i) => i !== index && pa.projet_id === p.id))
                              .map((projet) => (
                                <option key={projet.id} value={projet.id}>
                                  {projet.id} - {projet.titre} ({projet.type_projet})
                                </option>
                              ))}
                          </select>
                        </div>
                        <div className="w-40">
                          <label className="block text-xs text-gray-600 mb-1">Rôle</label>
                          <select
                            value={projetAffecte.role}
                            onChange={(e) => updateProjetAffectation(index, 'role', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option value="Contributeur">Contributeur</option>
                            <option value="Responsable">Responsable</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeProjetAffectation(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                  {editingFormateur ? 'Enregistrer' : 'Créer'}
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
              Êtes-vous sûr de vouloir supprimer le formateur <strong>{showDeleteConfirm}</strong> ?
              Cette action est irréversible et supprimera également toutes ses affectations aux projets.
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
