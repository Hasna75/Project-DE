'use client'

import { useState, useEffect } from 'react'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'

interface Projet {
  id: string
  titre: string
  type_projet: string
  secteur_economique: string | null
}

interface Validation {
  id: string
  projet_id: string
  etape: string
  date_demande: string
  validateur: string | null
  date_validation: string | null
  statut: string
  commentaires: string | null
  rep_ifep: string | null
  rep_infep: string | null
  insp: string | null
  rep_sect_eco: string | null
  projet?: {
    id: string
    titre: string
    type_projet: string
  }
}

const ETAPES_PROGRAMME = [
  "Collection des données",
  "AST",
  "RAP+RC",
  "PE",
  "Plan d'équipement",
  "Publication"
]

const ETAPES_MANUEL = [
  "Collection des données",
  "Rédaction",
  "Mise en forme",
  "Validation interne",
  "Validation finale",
  "Publication"
]

export default function Validations() {
  const [validations, setValidations] = useState<Validation[]>([])
  const [projets, setProjets] = useState<Projet[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingValidation, setEditingValidation] = useState<Validation | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState<string>('')
  const [filterProjet, setFilterProjet] = useState<string>('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    projet_id: '',
    etape: '',
    validateur: '',
    date_validation: '',
    statut: 'En attente',
    commentaires: '',
    rep_ifep: '',
    rep_infep: '',
    insp: '',
    rep_sect_eco: ''
  })

  useEffect(() => {
    loadValidations()
    loadProjets()
  }, [])

  // Mettre à jour Rep. Sect. Éco quand un projet est sélectionné (uniquement pour Programme d'Études)
  useEffect(() => {
    if (formData.projet_id && !editingValidation) {
      const selectedProjet = projets.find(p => p.id === formData.projet_id)
      // Ne mettre à jour que si c'est un Programme d'Études
      if (selectedProjet && selectedProjet.type_projet === "Programme d'Études") {
        if (selectedProjet.secteur_economique) {
          // Si le champ est vide ou commence par le secteur économique, on le met à jour
          const secteur = selectedProjet.secteur_economique
          if (!formData.rep_sect_eco || formData.rep_sect_eco.startsWith(secteur)) {
            setFormData(prev => ({
              ...prev,
              rep_sect_eco: `${secteur}:-----------`
            }))
          }
        } else {
          // Si pas de secteur économique, vider le champ
          setFormData(prev => ({
            ...prev,
            rep_sect_eco: ''
          }))
        }
      } else if (selectedProjet && selectedProjet.type_projet === 'Manuel') {
        // Pour les manuels, vider le champ
        setFormData(prev => ({
          ...prev,
          rep_sect_eco: ''
        }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.projet_id, projets, editingValidation])

  const loadValidations = async () => {
    try {
      const response = await fetch('/api/validations')
      const data = await response.json()
      setValidations(data)
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
      // Vérifier le type de projet pour déterminer si on doit inclure rep_sect_eco
      const selectedProjet = projets.find(p => p.id === formData.projet_id)
      const isManuel = selectedProjet?.type_projet === 'Manuel'
      
      const submitData = {
        ...formData,
        validateur: formData.validateur || null,
        date_validation: formData.date_validation || null,
        commentaires: formData.commentaires || null,
        rep_ifep: formData.rep_ifep || null,
        rep_infep: formData.rep_infep || null,
        insp: formData.insp || null,
        rep_sect_eco: isManuel ? null : (formData.rep_sect_eco || null)
      }

      if (editingValidation) {
        await fetch('/api/validations', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingValidation.id, ...submitData })
        })
      } else {
        await fetch('/api/validations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        })
      }

      setShowModal(false)
      setEditingValidation(null)
      resetForm()
      loadValidations()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (validation: Validation) => {
    setEditingValidation(validation)
    setFormData({
      projet_id: validation.projet_id,
      etape: validation.etape,
      validateur: validation.validateur || '',
      date_validation: validation.date_validation ? new Date(validation.date_validation).toISOString().split('T')[0] : '',
      statut: validation.statut,
      commentaires: validation.commentaires || '',
      rep_ifep: validation.rep_ifep || '',
      rep_infep: validation.rep_infep || '',
      insp: validation.insp || '',
      rep_sect_eco: validation.rep_sect_eco || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/validations?id=${id}`, {
        method: 'DELETE'
      })
      setShowDeleteConfirm(null)
      loadValidations()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const resetForm = () => {
    setFormData({
      projet_id: '',
      etape: '',
      validateur: '',
      date_validation: '',
      statut: 'En attente',
      commentaires: '',
      rep_ifep: '',
      rep_infep: '',
      insp: '',
      rep_sect_eco: ''
    })
  }

  const openCreateModal = () => {
    setEditingValidation(null)
    resetForm()
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingValidation(null)
    resetForm()
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Validé':
        return 'bg-green-100 text-green-800'
      case 'Refusé':
        return 'bg-red-100 text-red-800'
      case 'En attente':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEtapesForProjet = (projetId: string): string[] => {
    const projet = projets.find(p => p.id === projetId)
    if (!projet) return []
    return projet.type_projet === "Programme d'Études" ? ETAPES_PROGRAMME : ETAPES_MANUEL
  }

  const generateWordDocument = async (validation: Validation) => {
    try {
      const projet = validation.projet || projets.find(p => p.id === validation.projet_id)
      
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                text: "FICHE DE VALIDATION",
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
              }),
              
              // Informations générales
              new Paragraph({
                text: "INFORMATIONS GÉNÉRALES",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 200 }
              }),
              
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph("ID Validation")],
                        width: { size: 30, type: WidthType.PERCENTAGE }
                      }),
                      new TableCell({
                        children: [new Paragraph(validation.id)],
                        width: { size: 70, type: WidthType.PERCENTAGE }
                      })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph("Projet")],
                        width: { size: 30, type: WidthType.PERCENTAGE }
                      }),
                      new TableCell({
                        children: [new Paragraph(projet ? `${projet.id} - ${projet.titre}` : validation.projet_id)],
                        width: { size: 70, type: WidthType.PERCENTAGE }
                      })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph("Type de Projet")],
                        width: { size: 30, type: WidthType.PERCENTAGE }
                      }),
                      new TableCell({
                        children: [new Paragraph(projet ? projet.type_projet : '-')],
                        width: { size: 70, type: WidthType.PERCENTAGE }
                      })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph("Étape")],
                        width: { size: 30, type: WidthType.PERCENTAGE }
                      }),
                      new TableCell({
                        children: [new Paragraph(validation.etape)],
                        width: { size: 70, type: WidthType.PERCENTAGE }
                      })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph("Date de Demande")],
                        width: { size: 30, type: WidthType.PERCENTAGE }
                      }),
                      new TableCell({
                        children: [new Paragraph(new Date(validation.date_demande).toLocaleDateString('fr-FR'))],
                        width: { size: 70, type: WidthType.PERCENTAGE }
                      })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph("Statut")],
                        width: { size: 30, type: WidthType.PERCENTAGE }
                      }),
                      new TableCell({
                        children: [new Paragraph(validation.statut)],
                        width: { size: 70, type: WidthType.PERCENTAGE }
                      })
                    ]
                  })
                ]
              }),
              
              new Paragraph({ text: "", spacing: { after: 200 } }),
              
              // Informations de validation
              new Paragraph({
                text: "INFORMATIONS DE VALIDATION",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 200 }
              }),
              
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph("Validateur")],
                        width: { size: 30, type: WidthType.PERCENTAGE }
                      }),
                      new TableCell({
                        children: [new Paragraph(validation.validateur || '-')],
                        width: { size: 70, type: WidthType.PERCENTAGE }
                      })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph("Date de Validation")],
                        width: { size: 30, type: WidthType.PERCENTAGE }
                      }),
                      new TableCell({
                        children: [new Paragraph(validation.date_validation ? new Date(validation.date_validation).toLocaleDateString('fr-FR') : '-')],
                        width: { size: 70, type: WidthType.PERCENTAGE }
                      })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph("Commentaires")],
                        width: { size: 30, type: WidthType.PERCENTAGE }
                      }),
                      new TableCell({
                        children: [new Paragraph(validation.commentaires || '-')],
                        width: { size: 70, type: WidthType.PERCENTAGE }
                      })
                    ]
                  })
                ]
              }),
              
              new Paragraph({ text: "", spacing: { after: 200 } }),
              
              // Représentants
              new Paragraph({
                text: "REPRÉSENTANTS",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 200 }
              }),
              
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph("Rep. IFEP")],
                        width: { size: 30, type: WidthType.PERCENTAGE }
                      }),
                      new TableCell({
                        children: [new Paragraph(validation.rep_ifep || '-')],
                        width: { size: 70, type: WidthType.PERCENTAGE }
                      })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph("Rep. INFEP")],
                        width: { size: 30, type: WidthType.PERCENTAGE }
                      }),
                      new TableCell({
                        children: [new Paragraph(validation.rep_infep || '-')],
                        width: { size: 70, type: WidthType.PERCENTAGE }
                      })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph("Inspecteur")],
                        width: { size: 30, type: WidthType.PERCENTAGE }
                      }),
                      new TableCell({
                        children: [new Paragraph(validation.insp || '-')],
                        width: { size: 70, type: WidthType.PERCENTAGE }
                      })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph("Rep. Sect. Éco")],
                        width: { size: 30, type: WidthType.PERCENTAGE }
                      }),
                      new TableCell({
                        children: [new Paragraph(validation.rep_sect_eco || '-')],
                        width: { size: 70, type: WidthType.PERCENTAGE }
                      })
                    ]
                  })
                ]
              })
            ]
          }
        ]
      })

      const blob = await Packer.toBlob(doc)
      const fileName = `Validation_${validation.id}_${new Date().toISOString().split('T')[0]}.docx`
      saveAs(blob, fileName)
    } catch (error) {
      console.error('Erreur lors de la génération du document:', error)
      alert('Erreur lors de la génération du document Word')
    }
  }

  const filteredValidations = validations.filter(validation => {
    const projet = validation.projet
    const matchesSearch = 
      (projet && projet.titre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      validation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      validation.etape.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (validation.commentaires && validation.commentaires.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatut = !filterStatut || validation.statut === filterStatut
    const matchesProjet = !filterProjet || validation.projet_id === filterProjet

    return matchesSearch && matchesStatut && matchesProjet
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
        <h2 className="text-2xl font-bold">✔️ Gestion des Validations</h2>
        <button
          onClick={openCreateModal}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
        >
          ➕ Nouvelle Validation
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="🔍 Rechercher par projet, étape, commentaires..."
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
          <option value="En attente">En attente</option>
          <option value="Validé">Validé</option>
          <option value="Refusé">Refusé</option>
        </select>
        <select
          value={filterProjet}
          onChange={(e) => setFilterProjet(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les projets</option>
          {projets.map((projet) => (
            <option key={projet.id} value={projet.id}>
              {projet.id} - {projet.titre}
            </option>
          ))}
        </select>
      </div>

      {/* Liste des validations */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Projet</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Étape</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Date Demande</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Validateur</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Date Validation</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Statut</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredValidations.length === 0 ? (
              <tr>
                <td colSpan={8} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                  Aucune validation trouvée
                </td>
              </tr>
            ) : (
              filteredValidations.map((validation) => (
                <tr key={validation.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-mono font-semibold">{validation.id}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {validation.projet ? (
                      <div>
                        <div className="font-semibold">{validation.projet.titre}</div>
                        <div className="text-xs text-gray-500">{validation.projet.id}</div>
                      </div>
                    ) : (
                      validation.projet_id
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{validation.etape}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(validation.date_demande).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {validation.validateur || '-'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {validation.date_validation ? new Date(validation.date_validation).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatutColor(validation.statut)}`}>
                      {validation.statut}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => generateWordDocument(validation)}
                        className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 transition text-sm"
                        title="Imprimer la validation"
                      >
                        🖨️ Imprimer
                      </button>
                      <button
                        onClick={() => handleEdit(validation)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm"
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(validation.id)}
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
        Total: {filteredValidations.length} validation(s) sur {validations.length}
      </div>

      {/* Modal de création/édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingValidation ? '✏️ Modifier la Validation' : '➕ Nouvelle Validation'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Projet *</label>
                  <select
                    value={formData.projet_id}
                    onChange={(e) => setFormData({ ...formData, projet_id: e.target.value, etape: '' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!!editingValidation}
                  >
                    <option value="">-- Sélectionner un projet --</option>
                    {projets.map((projet) => (
                      <option key={projet.id} value={projet.id}>
                        {projet.id} - {projet.titre} ({projet.type_projet})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Étape *</label>
                  <select
                    value={formData.etape}
                    onChange={(e) => setFormData({ ...formData, etape: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">-- Sélectionner une étape --</option>
                    {formData.projet_id && getEtapesForProjet(formData.projet_id).map((etape) => (
                      <option key={etape} value={etape}>
                        {etape}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Validateur</label>
                  <input
                    type="text"
                    value={formData.validateur}
                    onChange={(e) => setFormData({ ...formData, validateur: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nom du validateur"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date de Validation</label>
                  <input
                    type="date"
                    value={formData.date_validation}
                    onChange={(e) => setFormData({ ...formData, date_validation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <option value="En attente">En attente</option>
                  <option value="Validé">Validé</option>
                  <option value="Refusé">Refusé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Commentaires</label>
                <textarea
                  value={formData.commentaires}
                  onChange={(e) => setFormData({ ...formData, commentaires: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Commentaires sur la validation..."
                />
              </div>

              {/* Champs spécifiques pour les validations */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Informations de validation</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Rep. IFEP</label>
                    <textarea
                      value={formData.rep_ifep}
                      onChange={(e) => setFormData({ ...formData, rep_ifep: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Informations sur le représentant IFEP..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Rep. INFEP</label>
                    <textarea
                      value={formData.rep_infep}
                      onChange={(e) => setFormData({ ...formData, rep_infep: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Informations sur le représentant INFEP..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Inspecteur</label>
                    <input
                      type="text"
                      value={formData.insp}
                      onChange={(e) => setFormData({ ...formData, insp: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {(() => {
                    const selectedProjet = projets.find(p => p.id === formData.projet_id)
                    const isManuel = selectedProjet?.type_projet === 'Manuel'
                    if (isManuel) return null
                    return (
                      <div>
                        <label className="block text-sm font-medium mb-1">Rep. Sect. Éco</label>
                        <textarea
                          value={formData.rep_sect_eco}
                          onChange={(e) => setFormData({ ...formData, rep_sect_eco: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Informations sur le représentant secteur économique..."
                        />
                      </div>
                    )
                  })()}
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
                  {editingValidation ? 'Enregistrer' : 'Créer'}
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
              Êtes-vous sûr de vouloir supprimer la validation <strong>{showDeleteConfirm}</strong> ?
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
