'use client'

import { useState, useEffect } from 'react'
import { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'

interface Statistiques {
  projets_en_cours: number
  projets_termines: number
  formateurs_actifs: number
  validations_attente: number
  projets_retard: number
}

interface Projet {
  id: string
  titre: string
  type_projet: string
  statut: string
  date_debut: string
  date_fin_prevue: string | null
  priorite: string
}

interface Formateur {
  id: string
  nom: string
  prenom: string
  statut: string
  affectations?: any[]
}

interface Validation {
  id: string
  projet_id: string
  etape: string
  statut: string
  date_demande: string
}

export default function Rapports() {
  const [stats, setStats] = useState<Statistiques>({
    projets_en_cours: 0,
    projets_termines: 0,
    formateurs_actifs: 0,
    validations_attente: 0,
    projets_retard: 0
  })
  const [projets, setProjets] = useState<Projet[]>([])
  const [formateurs, setFormateurs] = useState<Formateur[]>([])
  const [validations, setValidations] = useState<Validation[]>([])
  const [loading, setLoading] = useState(true)
  const [reportType, setReportType] = useState<string>('general')
  const [filterStatut, setFilterStatut] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsRes, projetsRes, formateursRes, validationsRes] = await Promise.all([
        fetch('/api/statistiques'),
        fetch('/api/projets'),
        fetch('/api/formateurs'),
        fetch('/api/validations')
      ])

      const [statsData, projetsData, formateursData, validationsData] = await Promise.all([
        statsRes.json(),
        projetsRes.json(),
        formateursRes.json(),
        validationsRes.json()
      ])

      setStats(statsData)
      setProjets(projetsData)
      setFormateurs(formateursData)
      setValidations(validationsData)
      setLoading(false)
    } catch (error) {
      console.error('Erreur:', error)
      setLoading(false)
    }
  }

  const filteredProjets = projets.filter(projet => {
    const matchesStatut = !filterStatut || projet.statut === filterStatut
    const matchesType = !filterType || projet.type_projet === filterType
    return matchesStatut && matchesType
  })

  const generateGeneralReport = async () => {
    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                text: "RAPPORT GÉNÉRAL - DIRECTION DES ÉTUDES",
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
              }),
              
              new Paragraph({
                text: `Date du rapport: ${new Date().toLocaleDateString('fr-FR')}`,
                spacing: { after: 200 }
              }),

              new Paragraph({
                text: "STATISTIQUES GÉNÉRALES",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 200 }
              }),

              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph("Indicateur")] }),
                      new TableCell({ children: [new Paragraph("Valeur")] })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph("Projets en cours")] }),
                      new TableCell({ children: [new Paragraph(stats.projets_en_cours.toString())] })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph("Projets terminés")] }),
                      new TableCell({ children: [new Paragraph(stats.projets_termines.toString())] })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph("Formateurs actifs")] }),
                      new TableCell({ children: [new Paragraph(stats.formateurs_actifs.toString())] })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph("Validations en attente")] }),
                      new TableCell({ children: [new Paragraph(stats.validations_attente.toString())] })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph("Projets en retard")] }),
                      new TableCell({ children: [new Paragraph(stats.projets_retard.toString())] })
                    ]
                  })
                ]
              }),

              new Paragraph({ text: "", spacing: { after: 400 } }),

              new Paragraph({
                text: "RÉPARTITION DES PROJETS PAR STATUT",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 200 }
              }),

              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph("Statut")] }),
                      new TableCell({ children: [new Paragraph("Nombre")] })
                    ]
                  }),
                  ...['En cours', 'Terminé', 'En attente', 'Annulé'].map(statut => {
                    const count = projets.filter(p => p.statut === statut).length
                    return new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph(statut)] }),
                        new TableCell({ children: [new Paragraph(count.toString())] })
                      ]
                    })
                  })
                ]
              }),

              new Paragraph({ text: "", spacing: { after: 400 } }),

              new Paragraph({
                text: "RÉPARTITION DES PROJETS PAR TYPE",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 200 }
              }),

              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph("Type")] }),
                      new TableCell({ children: [new Paragraph("Nombre")] })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph("Programme d'Études")] }),
                      new TableCell({ children: [new Paragraph(projets.filter(p => p.type_projet === "Programme d'Études").length.toString())] })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph("Manuel")] }),
                      new TableCell({ children: [new Paragraph(projets.filter(p => p.type_projet === "Manuel").length.toString())] })
                    ]
                  })
                ]
              })
            ]
          }
        ]
      })

      const blob = await Packer.toBlob(doc)
      saveAs(blob, `Rapport_General_${new Date().toISOString().split('T')[0]}.docx`)
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la génération du rapport')
    }
  }

  const generateProjectsReport = async () => {
    try {
      const projetsToReport = filteredProjets.length > 0 ? filteredProjets : projets

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                text: "RAPPORT SUR LES PROJETS",
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
              }),

              new Paragraph({
                text: `Date du rapport: ${new Date().toLocaleDateString('fr-FR')}`,
                spacing: { after: 200 }
              }),

              new Paragraph({
                text: `Nombre total de projets: ${projetsToReport.length}`,
                spacing: { after: 400 }
              }),

              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph("ID")] }),
                      new TableCell({ children: [new Paragraph("Titre")] }),
                      new TableCell({ children: [new Paragraph("Type")] }),
                      new TableCell({ children: [new Paragraph("Statut")] }),
                      new TableCell({ children: [new Paragraph("Priorité")] }),
                      new TableCell({ children: [new Paragraph("Date Début")] }),
                      new TableCell({ children: [new Paragraph("Date Fin Prévue")] })
                    ]
                  }),
                  ...projetsToReport.map(projet => new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(projet.id)] }),
                      new TableCell({ children: [new Paragraph(projet.titre)] }),
                      new TableCell({ children: [new Paragraph(projet.type_projet)] }),
                      new TableCell({ children: [new Paragraph(projet.statut)] }),
                      new TableCell({ children: [new Paragraph(projet.priorite)] }),
                      new TableCell({ children: [new Paragraph(new Date(projet.date_debut).toLocaleDateString('fr-FR'))] }),
                      new TableCell({ children: [new Paragraph(projet.date_fin_prevue ? new Date(projet.date_fin_prevue).toLocaleDateString('fr-FR') : '-')] })
                    ]
                  }))
                ]
              })
            ]
          }
        ]
      })

      const blob = await Packer.toBlob(doc)
      saveAs(blob, `Rapport_Projets_${new Date().toISOString().split('T')[0]}.docx`)
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la génération du rapport')
    }
  }

  const generateFormateursReport = async () => {
    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                text: "RAPPORT SUR LES FORMATEURS",
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
              }),

              new Paragraph({
                text: `Date du rapport: ${new Date().toLocaleDateString('fr-FR')}`,
                spacing: { after: 200 }
              }),

              new Paragraph({
                text: `Nombre total de formateurs: ${formateurs.length}`,
                spacing: { after: 400 }
              }),

              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph("ID")] }),
                      new TableCell({ children: [new Paragraph("Nom")] }),
                      new TableCell({ children: [new Paragraph("Prénom")] }),
                      new TableCell({ children: [new Paragraph("Statut")] }),
                      new TableCell({ children: [new Paragraph("Nombre de projets")] })
                    ]
                  }),
                  ...formateurs.map(formateur => new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(formateur.id)] }),
                      new TableCell({ children: [new Paragraph(formateur.nom)] }),
                      new TableCell({ children: [new Paragraph(formateur.prenom)] }),
                      new TableCell({ children: [new Paragraph(formateur.statut)] }),
                      new TableCell({ children: [new Paragraph((formateur.affectations?.length || 0).toString())] })
                    ]
                  }))
                ]
              })
            ]
          }
        ]
      })

      const blob = await Packer.toBlob(doc)
      saveAs(blob, `Rapport_Formateurs_${new Date().toISOString().split('T')[0]}.docx`)
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la génération du rapport')
    }
  }

  const generateValidationsReport = async () => {
    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                text: "RAPPORT SUR LES VALIDATIONS",
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
              }),

              new Paragraph({
                text: `Date du rapport: ${new Date().toLocaleDateString('fr-FR')}`,
                spacing: { after: 200 }
              }),

              new Paragraph({
                text: `Nombre total de validations: ${validations.length}`,
                spacing: { after: 400 }
              }),

              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph("ID")] }),
                      new TableCell({ children: [new Paragraph("Projet ID")] }),
                      new TableCell({ children: [new Paragraph("Étape")] }),
                      new TableCell({ children: [new Paragraph("Statut")] }),
                      new TableCell({ children: [new Paragraph("Date Demande")] })
                    ]
                  }),
                  ...validations.map(validation => new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(validation.id)] }),
                      new TableCell({ children: [new Paragraph(validation.projet_id)] }),
                      new TableCell({ children: [new Paragraph(validation.etape)] }),
                      new TableCell({ children: [new Paragraph(validation.statut)] }),
                      new TableCell({ children: [new Paragraph(new Date(validation.date_demande).toLocaleDateString('fr-FR'))] })
                    ]
                  }))
                ]
              })
            ]
          }
        ]
      })

      const blob = await Packer.toBlob(doc)
      saveAs(blob, `Rapport_Validations_${new Date().toISOString().split('T')[0]}.docx`)
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la génération du rapport')
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="text-center">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">📈 Rapports et Statistiques</h2>

      {/* Statistiques générales */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Statistiques Générales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
          <div className="bg-yellow-100 p-5 rounded-lg border-l-4 border-yellow-500">
            <div className="text-3xl font-bold text-yellow-600">{stats.validations_attente}</div>
            <div className="text-gray-600">Validations en attente</div>
          </div>
          <div className="bg-red-100 p-5 rounded-lg border-l-4 border-red-500">
            <div className="text-3xl font-bold text-red-600">{stats.projets_retard}</div>
            <div className="text-gray-600">Projets en retard</div>
          </div>
        </div>
      </div>

      {/* Filtres pour les rapports */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-bold mb-4">Filtres pour les Rapports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Statut</label>
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="En cours">En cours</option>
              <option value="Terminé">Terminé</option>
              <option value="En attente">En attente</option>
              <option value="Annulé">Annulé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type de Projet</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les types</option>
              <option value="Programme d'Études">Programme d&apos;Études</option>
              <option value="Manuel">Manuel</option>
            </select>
          </div>
        </div>
      </div>

      {/* Génération de rapports */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-4">Générer un Rapport</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={generateGeneralReport}
            className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition"
          >
            📊 Rapport Général
          </button>
          <button
            onClick={generateProjectsReport}
            className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition"
          >
            📁 Rapport Projets
          </button>
          <button
            onClick={generateFormateursReport}
            className="bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-600 transition"
          >
            👥 Rapport Formateurs
          </button>
          <button
            onClick={generateValidationsReport}
            className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition"
          >
            ✔️ Rapport Validations
          </button>
        </div>
      </div>

      {/* Résumé des filtres */}
      {filteredProjets.length !== projets.length && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Filtres actifs:</strong> {filteredProjets.length} projet(s) sur {projets.length} correspondent aux critères sélectionnés.
          </p>
        </div>
      )}
    </div>
  )
}
