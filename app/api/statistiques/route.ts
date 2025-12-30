import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Récupérer tous les projets avec leurs étapes pour calculer l'étape actuelle
    const projets = await prisma.projet.findMany({
      include: {
        etapes_programme: true,
        etapes_manuel: true
      }
    })

    // Constantes pour les noms d'étapes
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

    // Fonction pour calculer l'étape actuelle
    const calculerEtapeActuelle = (etapes: any, isProgramme: boolean): string => {
      const etapesList = isProgramme ? ETAPES_PROGRAMME : ETAPES_MANUEL

      if (!etapes) {
        return etapesList[0].nom
      }

      // Vérifier si toutes les étapes sont terminées
      let toutesTerminees = true
      for (let i = 1; i <= 6; i++) {
        const statut = etapes[`etape${i}_statut`]
        if (statut !== 'Terminée') {
          toutesTerminees = false
          break
        }
      }

      if (toutesTerminees) {
        return 'Terminé'
      }

      // Trouver la première étape qui n'est pas terminée
      for (const etape of etapesList) {
        const statut = etapes[`etape${etape.num}_statut`]
        if (statut !== 'Terminée') {
          return etape.nom
        }
      }

      // Si aucune étape n'a de statut, retourner la première étape
      return etapesList[0].nom
    }

    // Calculer les statistiques basées sur l'étape actuelle
    let projets_en_cours = 0
    let projets_termines = 0
    const aujourdhui = new Date()
    let projets_retard = 0

    projets.forEach(projet => {
      const isProgramme = projet.type_projet.includes("Programme")

      const etapes = isProgramme
        ? projet.etapes_programme
        : projet.etapes_manuel

      const etapeActuelle = calculerEtapeActuelle(etapes, isProgramme)

      if (etapeActuelle === 'Terminé') {
        projets_termines++
      } else {
        projets_en_cours++
        // Vérifier si le projet est en retard
        if (projet.date_fin_prevue && new Date(projet.date_fin_prevue) < aujourdhui) {
          projets_retard++
        }
      }
    })

    const formateurs_actifs = await prisma.formateur.count({
      where: { statut: 'Actif' }
    })

    const validations_attente = await prisma.validation.count({
      where: { statut: 'En attente' }
    })

    return NextResponse.json({
      projets_en_cours,
      projets_termines,
      formateurs_actifs,
      validations_attente,
      projets_retard
    })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

