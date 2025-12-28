import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enregistrerHistorique } from '@/lib/historique'

export async function GET() {
  try {
    const validations = await prisma.validation.findMany({
      orderBy: { date_demande: 'desc' },
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
    return NextResponse.json(validations)
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
    
    // Générer l'ID séquentiel (val1, val2, val3...)
    const prefix = 'val'
    const dernierValidation = await prisma.validation.findFirst({
      where: { id: { startsWith: prefix } },
      orderBy: { id: 'desc' }
    })
    
    let numero = 1
    if (dernierValidation) {
      const numStr = dernierValidation.id.substring(prefix.length)
      const num = parseInt(numStr)
      if (!isNaN(num)) {
        numero = num + 1
      }
    }
    const validation_id = `${prefix}${numero}`
    
    const validation = await prisma.validation.create({
      data: {
        id: validation_id,
        projet_id: data.projet_id,
        etape: data.etape,
        validateur: data.validateur || null,
        date_validation: data.date_validation ? new Date(data.date_validation) : null,
        statut: data.statut || 'En attente',
        commentaires: data.commentaires || null,
        rep_ifep: data.rep_ifep || null,
        rep_infep: data.rep_infep || null,
        insp: data.insp || null,
        rep_sect_eco: data.rep_sect_eco || null
      },
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
    
    // Enregistrer dans l'historique
    await enregistrerHistorique({
      projet_id: data.projet_id,
      action: 'Création de validation',
      details: `Validation ${validation_id} créée pour l'étape "${data.etape}" du projet ${data.projet_id}`
    })
    
    return NextResponse.json(validation, { status: 201 })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la validation' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data
    
    const processedData: any = {}
    if (updateData.date_validation) {
      processedData.date_validation = new Date(updateData.date_validation)
    }
    if (updateData.validateur !== undefined) processedData.validateur = updateData.validateur
    if (updateData.statut !== undefined) processedData.statut = updateData.statut
    if (updateData.commentaires !== undefined) processedData.commentaires = updateData.commentaires
    if (updateData.rep_ifep !== undefined) processedData.rep_ifep = updateData.rep_ifep
    if (updateData.rep_infep !== undefined) processedData.rep_infep = updateData.rep_infep
    if (updateData.insp !== undefined) processedData.insp = updateData.insp
    if (updateData.rep_sect_eco !== undefined) processedData.rep_sect_eco = updateData.rep_sect_eco
    
    const validation = await prisma.validation.update({
      where: { id },
      data: processedData,
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
    
    // Enregistrer dans l'historique
    await enregistrerHistorique({
      projet_id: validation.projet_id,
      action: 'Modification de validation',
      details: `Validation ${id} modifiée - Statut: ${processedData.statut || validation.statut}`
    })
    
    return NextResponse.json(validation)
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la validation' },
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
        { error: 'ID de la validation requis' },
        { status: 400 }
      )
    }
    
    // Récupérer les infos de la validation avant suppression
    const validation = await prisma.validation.findUnique({
      where: { id },
      select: { id: true, projet_id: true, etape: true }
    })
    
    await prisma.validation.delete({
      where: { id }
    })
    
    // Enregistrer dans l'historique
    await enregistrerHistorique({
      projet_id: validation?.projet_id || null,
      action: 'Suppression de validation',
      details: validation ? `Validation ${id} pour l'étape "${validation.etape}" supprimée` : `Validation ${id} supprimée`
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la validation' },
      { status: 500 }
    )
  }
}

