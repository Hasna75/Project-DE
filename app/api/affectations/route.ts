import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enregistrerHistorique } from '@/lib/historique'

export async function GET() {
  try {
    const affectations = await prisma.affectation.findMany({
      include: {
        projet: {
          select: {
            id: true,
            titre: true
          }
        },
        formateur: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        }
      }
    })
    return NextResponse.json(affectations)
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { formateur_id, projet_id, role, charge_travail } = data
    
    if (!formateur_id || !projet_id || !role) {
      return NextResponse.json(
        { error: 'formateur_id, projet_id et role requis' },
        { status: 400 }
      )
    }

    // Générer l'ID de l'affectation
    const affectation_id = `AFF${Date.now()}${Math.random().toString(36).substring(2, 7)}`
    
    const affectation = await prisma.affectation.create({
      data: {
        id: affectation_id,
        formateur_id,
        projet_id,
        role,
        charge_travail: charge_travail || null
      },
      include: {
        projet: {
          select: {
            id: true,
            titre: true
          }
        },
        formateur: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        }
      }
    })
    
    // Enregistrer dans l'historique
    await enregistrerHistorique({
      projet_id: projet_id,
      action: 'Affectation de formateur',
      details: `Formateur ${formateur_id} affecté au projet ${projet_id} en tant que ${role}`
    })
    
    return NextResponse.json(affectation, { status: 201 })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'affectation' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de l\'affectation requis' },
        { status: 400 }
      )
    }
    
    // Récupérer les infos de l'affectation avant suppression
    const affectation = await prisma.affectation.findUnique({
      where: { id },
      select: { id: true, projet_id: true, formateur_id: true, role: true }
    })
    
    await prisma.affectation.delete({
      where: { id }
    })
    
    // Enregistrer dans l'historique
    if (affectation) {
      await enregistrerHistorique({
        projet_id: affectation.projet_id,
        action: 'Suppression d\'affectation',
        details: `Affectation ${id} - Formateur ${affectation.formateur_id} retiré du projet ${affectation.projet_id}`
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'affectation' },
      { status: 500 }
    )
  }
}
