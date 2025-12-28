import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enregistrerHistorique } from '@/lib/historique'

export async function GET() {
  try {
    const projets = await prisma.projet.findMany({
      orderBy: { date_creation: 'desc' }
    })
    return NextResponse.json(projets)
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
    const prefix = data.type_projet === "Programme d'Études" ? "PRG" : "MAN"
    const dernierProjet = await prisma.projet.findFirst({
      where: { id: { startsWith: prefix } },
      orderBy: { id: 'desc' }
    })
    
    let numero = 1
    if (dernierProjet) {
      const numStr = dernierProjet.id.substring(3)
      numero = parseInt(numStr) + 1
    }
    const projet_id = `${prefix}${numero.toString().padStart(3, '0')}`
    
    // Créer le projet
    const projet = await prisma.projet.create({
      data: {
        id: projet_id,
        type_projet: data.type_projet,
        titre: data.titre,
        description: data.description || '',
        code_spec: data.code_spec || null,
        date_debut: new Date(data.date_debut),
        date_fin_prevue: data.date_fin_prevue ? new Date(data.date_fin_prevue) : null,
        statut: data.statut || 'En cours',
        etape_actuelle: "Collection des données",
        priorite: data.priorite || 'Moyenne',
        secteur_economique: data.secteur_economique || null
      }
    })
    
    // Créer les étapes
    if (data.type_projet === "Programme d'Études") {
      await prisma.etapeProgramme.create({
        data: { projet_id }
      })
    } else {
      await prisma.etapeManuel.create({
        data: { projet_id }
      })
    }
    
    // Enregistrer dans l'historique
    await enregistrerHistorique({
      projet_id: projet_id,
      action: 'Création de projet',
      details: `Projet ${projet_id} - ${data.titre} (${data.type_projet}) créé`
    })
    
    return NextResponse.json(projet, { status: 201 })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du projet' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data
    
    const projet = await prisma.projet.update({
      where: { id },
      data: {
        ...updateData,
        code_spec: updateData.code_spec !== undefined ? (updateData.code_spec || null) : undefined,
        date_debut: updateData.date_debut ? new Date(updateData.date_debut) : undefined,
        date_fin_prevue: updateData.date_fin_prevue ? new Date(updateData.date_fin_prevue) : updateData.date_fin_prevue === null ? null : undefined,
      }
    })
    
    // Enregistrer dans l'historique
    await enregistrerHistorique({
      projet_id: id,
      action: 'Modification de projet',
      details: `Projet ${id} modifié`
    })
    
    return NextResponse.json(projet)
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du projet' },
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
        { error: 'ID du projet requis' },
        { status: 400 }
      )
    }
    
    // Récupérer les infos du projet avant suppression
    const projet = await prisma.projet.findUnique({
      where: { id },
      select: { id: true, titre: true }
    })
    
    await prisma.projet.delete({
      where: { id }
    })
    
    // Enregistrer dans l'historique
    await enregistrerHistorique({
      projet_id: null,
      action: 'Suppression de projet',
      details: projet ? `Projet ${projet.id} - ${projet.titre} supprimé` : `Projet ${id} supprimé`
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du projet' },
      { status: 500 }
    )
  }
}

