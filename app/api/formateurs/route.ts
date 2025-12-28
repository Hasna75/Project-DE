import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enregistrerHistorique } from '@/lib/historique'

export async function GET() {
  try {
    const formateurs = await prisma.formateur.findMany({
      orderBy: { date_creation: 'desc' },
      include: {
        affectations: {
          include: {
            projet: {
              select: {
                id: true,
                titre: true
              }
            }
          }
        }
      }
    })
    return NextResponse.json(formateurs)
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
    
    // Générer l'ID
    const prefix = "FOR"
    const dernierFormateur = await prisma.formateur.findFirst({
      where: { id: { startsWith: prefix } },
      orderBy: { id: 'desc' }
    })
    
    let numero = 1
    if (dernierFormateur) {
      const numStr = dernierFormateur.id.substring(3)
      numero = parseInt(numStr) + 1
    }
    const formateur_id = `${prefix}${numero.toString().padStart(3, '0')}`
    
    // Créer le formateur
    const formateur = await prisma.formateur.create({
      data: {
        id: formateur_id,
        nom: data.nom,
        prenom: data.prenom,
        specialite: data.specialite || null,
        email: data.email || null,
        telephone: data.telephone || null,
        statut: data.statut || 'Actif'
      }
    })
    
    // Enregistrer dans l'historique
    await enregistrerHistorique({
      action: 'Création de formateur',
      details: `Formateur ${formateur_id} - ${data.prenom} ${data.nom} créé`
    })
    
    return NextResponse.json(formateur, { status: 201 })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du formateur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data
    
    const formateur = await prisma.formateur.update({
      where: { id },
      data: updateData
    })
    
    // Enregistrer dans l'historique
    await enregistrerHistorique({
      action: 'Modification de formateur',
      details: `Formateur ${id} modifié`
    })
    
    return NextResponse.json(formateur)
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du formateur' },
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
        { error: 'ID du formateur requis' },
        { status: 400 }
      )
    }
    
    // Récupérer les infos du formateur avant suppression
    const formateur = await prisma.formateur.findUnique({
      where: { id },
      select: { id: true, nom: true, prenom: true }
    })
    
    await prisma.formateur.delete({
      where: { id }
    })
    
    // Enregistrer dans l'historique
    await enregistrerHistorique({
      action: 'Suppression de formateur',
      details: formateur ? `Formateur ${formateur.id} - ${formateur.prenom} ${formateur.nom} supprimé` : `Formateur ${id} supprimé`
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du formateur' },
      { status: 500 }
    )
  }
}

