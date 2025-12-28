import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Récupérer les informations IFEP (il n'y en a qu'une seule)
    let ifepInfo = await prisma.ifepInfo.findFirst()
    
    // Si aucune information n'existe, créer une entrée par défaut
    if (!ifepInfo) {
      ifepInfo = await prisma.ifepInfo.create({
        data: {
          nom: '',
          adresse: '',
          telephone: '',
          fax: '',
          branches_professionnelles: ''
        }
      })
    }
    
    return NextResponse.json(ifepInfo)
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
    
    // Récupérer l'entrée existante ou créer une nouvelle
    let ifepInfo = await prisma.ifepInfo.findFirst()
    
    if (ifepInfo) {
      // Mettre à jour l'entrée existante
      ifepInfo = await prisma.ifepInfo.update({
        where: { id: ifepInfo.id },
        data: {
          nom: data.nom || '',
          adresse: data.adresse || '',
          telephone: data.telephone || '',
          fax: data.fax || '',
          branches_professionnelles: data.branches_professionnelles || '',
          date_mise_a_jour: new Date()
        }
      })
    } else {
      // Créer une nouvelle entrée
      ifepInfo = await prisma.ifepInfo.create({
        data: {
          nom: data.nom || '',
          adresse: data.adresse || '',
          telephone: data.telephone || '',
          fax: data.fax || '',
          branches_professionnelles: data.branches_professionnelles || ''
        }
      })
    }
    
    return NextResponse.json(ifepInfo)
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des informations IFEP' },
      { status: 500 }
    )
  }
}

