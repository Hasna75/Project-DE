import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enregistrerHistorique } from '@/lib/historique'

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

function calculerEtapeActuelle(etapes: any, typeProjet: string): string {
  const etapesList = typeProjet === "Programme d'Études" ? ETAPES_PROGRAMME : ETAPES_MANUEL
  
  // Vérifier si toutes les étapes sont terminées
  let toutesTerminees = true
  for (let i = 1; i <= 6; i++) {
    const statut = etapes?.[`etape${i}_statut`]
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
    const statut = etapes?.[`etape${etape.num}_statut`]
    if (statut !== 'Terminée') {
      return etape.nom
    }
  }
  
  // Si aucune étape n'a de statut, retourner la première étape
  return etapesList[0].nom
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projet_id = searchParams.get('projet_id')
    
    if (!projet_id) {
      return NextResponse.json(
        { error: 'ID du projet requis' },
        { status: 400 }
      )
    }

    // Récupérer le projet pour connaître son type
    const projet = await prisma.projet.findUnique({
      where: { id: projet_id },
      select: { type_projet: true }
    })

    if (!projet) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer les étapes depuis la bonne table selon le type de projet :
    // - etapes_programme (table: etapes_programme) pour "Programme d'Études"
    // - etapes_manuel (table: etapes_manuel) pour "Manuel"
    if (projet.type_projet === "Programme d'Études") {
      let etapes = await prisma.etapeProgramme.findUnique({
        where: { projet_id },
        include: {
          projet: {
            select: {
              id: true,
              titre: true,
              type_projet: true
            }
          }
        }
      })
      
      // Si les étapes n'existent pas, les créer
      if (!etapes) {
        etapes = await prisma.etapeProgramme.create({
          data: { projet_id },
          include: {
            projet: {
              select: {
                id: true,
                titre: true,
                type_projet: true
              }
            }
          }
        })
      }
      
      return NextResponse.json(etapes)
    } else {
      let etapes = await prisma.etapeManuel.findUnique({
        where: { projet_id },
        include: {
          projet: {
            select: {
              id: true,
              titre: true,
              type_projet: true
            }
          }
        }
      })
      
      // Si les étapes n'existent pas, les créer
      if (!etapes) {
        etapes = await prisma.etapeManuel.create({
          data: { projet_id },
          include: {
            projet: {
              select: {
                id: true,
                titre: true,
                type_projet: true
              }
            }
          }
        })
      }
      
      return NextResponse.json(etapes)
    }
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { projet_id, type_projet, ...etapesData } = data
    
    if (!projet_id || !type_projet) {
      return NextResponse.json(
        { error: 'ID du projet et type de projet requis' },
        { status: 400 }
      )
    }

    // Convertir les dates et filtrer les champs invalides
    const processedData: any = {}
    for (const [key, value] of Object.entries(etapesData)) {
      // Pour "Programme d'Études", exclure etape1_validation (n'existe pas dans le schéma)
      if (type_projet === "Programme d'Études" && key === 'etape1_validation') {
        continue
      }
      // Pour "Manuel", exclure tous les champs validation (n'existent pas dans le schéma)
      if (type_projet === "Manuel" && key.includes('_validation')) {
        continue
      }
      
      if (key.includes('date') && value) {
        processedData[key] = new Date(value as string)
      } else {
        processedData[key] = value
      }
    }

    // Mettre à jour les étapes dans la bonne table selon le type :
    // - etapes_programme pour "Programme d'Études"
    // - etapes_manuel pour "Manuel"
    // Utilise upsert pour créer si n'existe pas
    if (type_projet === "Programme d'Études") {
      const etapes = await prisma.etapeProgramme.upsert({
        where: { projet_id },
        update: processedData,
        create: {
          projet_id,
          ...processedData
        }
      })
      
      // Enregistrer dans l'historique
      const etapesModifiees = Object.keys(processedData).filter(key => key.includes('etape') && (key.includes('date') || key.includes('statut')))
      if (etapesModifiees.length > 0) {
        await enregistrerHistorique({
          projet_id: projet_id,
          action: 'Modification d\'étapes',
          details: `Étapes du projet ${projet_id} modifiées`
        })
      }
      
      // Mettre à jour automatiquement l'étape_actuelle du projet
      const etapeActuelle = calculerEtapeActuelle(etapes, type_projet)
      await prisma.projet.update({
        where: { id: projet_id },
        data: { etape_actuelle: etapeActuelle }
      })
      
      return NextResponse.json(etapes)
    } else {
      const etapes = await prisma.etapeManuel.upsert({
        where: { projet_id },
        update: processedData,
        create: {
          projet_id,
          ...processedData
        }
      })
      
      // Enregistrer dans l'historique
      const etapesModifiees = Object.keys(processedData).filter(key => key.includes('etape') && (key.includes('date') || key.includes('statut')))
      if (etapesModifiees.length > 0) {
        await enregistrerHistorique({
          projet_id: projet_id,
          action: 'Modification d\'étapes',
          details: `Étapes du projet ${projet_id} modifiées`
        })
      }
      
      // Mettre à jour automatiquement l'étape_actuelle du projet
      const etapeActuelle = calculerEtapeActuelle(etapes, type_projet)
      await prisma.projet.update({
        where: { id: projet_id },
        data: { etape_actuelle: etapeActuelle }
      })
      
      return NextResponse.json(etapes)
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour des étapes:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json(
      { error: `Erreur lors de la mise à jour des étapes: ${errorMessage}` },
      { status: 500 }
    )
  }
}

