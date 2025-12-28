import { prisma } from './prisma'

interface HistoriqueData {
  projet_id?: string | null
  action: string
  utilisateur?: string
  details?: string
}

export async function enregistrerHistorique(data: HistoriqueData) {
  try {
    await prisma.historique.create({
      data: {
        projet_id: data.projet_id || null,
        action: data.action,
        utilisateur: data.utilisateur || 'Système',
        details: data.details || null
      }
    })
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'historique:', error)
    // Ne pas faire échouer l'opération principale si l'historique échoue
  }
}

