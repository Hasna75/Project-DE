import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enregistrerHistorique } from '@/lib/historique'

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

    // Convertir les dates
    const processedData: any = {}
    for (const [key, value] of Object.entries(etapesData)) {
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
      
      return NextResponse.json(etapes)
    }
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des étapes' },
      { status: 500 }
    )
  }
}

