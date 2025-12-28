import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const projets_en_cours = await prisma.projet.count({
      where: { statut: 'En cours' }
    })
    
    const projets_termines = await prisma.projet.count({
      where: { statut: 'Terminé' }
    })
    
    const formateurs_actifs = await prisma.formateur.count({
      where: { statut: 'Actif' }
    })
    
    const validations_attente = await prisma.validation.count({
      where: { statut: 'En attente' }
    })
    
    const aujourdhui = new Date()
    const projets_retard = await prisma.projet.count({
      where: {
        statut: 'En cours',
        date_fin_prevue: {
          lt: aujourdhui
        }
      }
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

