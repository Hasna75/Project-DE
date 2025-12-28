import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const historique = await prisma.historique.findMany({
      orderBy: { date_action: 'desc' },
      include: {
        projet: {
          select: {
            id: true,
            titre: true
          }
        }
      },
      take: 100 // Limiter à 100 dernières entrées
    })
    return NextResponse.json(historique)
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    await prisma.historique.deleteMany({})
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'historique' },
      { status: 500 }
    )
  }
}

