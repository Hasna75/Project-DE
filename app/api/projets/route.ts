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

export async function GET() {
  try {
    const projets = await prisma.projet.findMany({
      orderBy: { date_creation: 'desc' },
      include: {
        etapes_programme: true,
        etapes_manuel: true,
        programme: true,
        manuel: true
      }
    })

    // Calculer l'étape actuelle pour chaque projet et préparer les mises à jour
    const misesAJour: Promise<any>[] = []
    const projetsAvecEtapeActuelle = projets.map(projet => {
      const etapes = projet.type_projet === "Programme d'Études"
        ? projet.etapes_programme
        : projet.etapes_manuel

      const etapeActuelle = etapes ? calculerEtapeActuelle(etapes, projet.type_projet) : "Collection des données"

      // Mettre à jour l'étape_actuelle dans la base de données si elle a changé
      if (projet.etape_actuelle !== etapeActuelle) {
        misesAJour.push(
          prisma.projet.update({
            where: { id: projet.id },
            data: { etape_actuelle: etapeActuelle }
          }).catch(err => {
            console.error(`Erreur lors de la mise à jour de l'étape actuelle pour ${projet.id}:`, err)
            return null
          })
        )
      }

      return {
        ...projet,
        titre: projet.programme?.titre || projet.manuel?.titre || '',
        etape_actuelle: etapeActuelle
      }
    })

    // Attendre toutes les mises à jour en arrière-plan (ne bloque pas la réponse)
    if (misesAJour.length > 0) {
      Promise.all(misesAJour).catch(err =>
        console.error('Erreur lors des mises à jour des étapes actuelles:', err)
      )
    }

    return NextResponse.json(projetsAvecEtapeActuelle)
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

    // Créer le projet et l'entité liée
    let projet;
    if (data.type_projet === "Programme d'Études") {
      projet = await prisma.projet.create({
        data: {
          id: projet_id,
          type_projet: data.type_projet,
          date_debut: new Date(data.date_debut),
          date_fin_prevue: data.date_fin_prevue ? new Date(data.date_fin_prevue) : null,
          statut: data.statut || 'En cours',
          etape_actuelle: "Collection des données",
          priorite: data.priorite || 'Moyenne',
          programme: {
            create: {
              titre: data.titre,
              type_prog: data.type_prog || '',
              mode_prog: data.mode_prog || null,
              duree: data.duree || null,
              sect_eco: data.secteur_economique || null,
              code_spec: data.code_spec || null,
              Niv: data.Niv || null
            }
          }
        }
      });
      await prisma.etapeProgramme.create({
        data: { projet_id }
      })
    } else {
      projet = await prisma.projet.create({
        data: {
          id: projet_id,
          type_projet: data.type_projet,
          date_debut: new Date(data.date_debut),
          date_fin_prevue: data.date_fin_prevue ? new Date(data.date_fin_prevue) : null,
          statut: data.statut || 'En cours',
          etape_actuelle: "Collection des données",
          priorite: data.priorite || 'Moyenne',
          manuel: {
            create: {
              titre: data.titre,
              dat_deb: new Date(data.date_debut),
              dat_fin: data.date_fin_prevue ? new Date(data.date_fin_prevue) : null,
              duree: data.duree || null,
              cod_spec: data.code_spec || null,
              MQ: data.MQ || null,
              Niv: data.Niv || null
            }
          }
        }
      });
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

    const projetExistant = await prisma.projet.findUnique({
      where: { id },
      include: { programme: true, manuel: true }
    });

    if (!projetExistant) {
      throw new Error("Project not found");
    }

    const { titre, code_spec, secteur_economique, type_prog, mode_prog, duree, Niv, MQ, ...baseData } = updateData;

    let projet;
    if (projetExistant.type_projet === "Programme d'Études") {
      projet = await prisma.projet.update({
        where: { id },
        data: {
          ...baseData,
          date_debut: updateData.date_debut ? new Date(updateData.date_debut) : undefined,
          date_fin_prevue: updateData.date_fin_prevue ? new Date(updateData.date_fin_prevue) : updateData.date_fin_prevue === null ? null : undefined,
          programme: {
            update: {
              titre: titre,
              code_spec: code_spec,
              sect_eco: secteur_economique,
              type_prog: type_prog,
              mode_prog: mode_prog,
              duree: duree,
              Niv: Niv
            }
          }
        }
      });
    } else {
      projet = await prisma.projet.update({
        where: { id },
        data: {
          ...baseData,
          date_debut: updateData.date_debut ? new Date(updateData.date_debut) : undefined,
          date_fin_prevue: updateData.date_fin_prevue ? new Date(updateData.date_fin_prevue) : updateData.date_fin_prevue === null ? null : undefined,
          manuel: {
            update: {
              titre: titre,
              cod_spec: code_spec,
              duree: duree, // Assuming Manuel also has duree based on request "duree"
              MQ: MQ,
              Niv: Niv
            }
          }
        }
      });
    }

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
      include: { programme: true, manuel: true }
    })

    const titre = projet?.programme?.titre || projet?.manuel?.titre || "Inconnu"

    await prisma.projet.delete({
      where: { id }
    })

    // Enregistrer dans l'historique
    await enregistrerHistorique({
      projet_id: null,
      action: 'Suppression de projet',
      details: projet ? `Projet ${projet.id} - ${titre} supprimé` : `Projet ${id} supprimé`
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

