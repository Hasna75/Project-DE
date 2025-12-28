-- CreateTable
CREATE TABLE "projets" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT '',
    "type_projet" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "date_debut" DATETIME NOT NULL,
    "date_fin_prevue" DATETIME,
    "statut" TEXT NOT NULL DEFAULT 'En cours',
    "etape_actuelle" TEXT,
    "priorite" TEXT NOT NULL DEFAULT 'Moyenne',
    "secteur_economique" TEXT,
    "date_creation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "formateurs" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT '',
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "specialite" TEXT,
    "email" TEXT,
    "telephone" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'Actif',
    "date_creation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "etapes_programme" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projet_id" TEXT NOT NULL,
    "etape1_date_debut" DATETIME,
    "etape1_date_fin" DATETIME,
    "etape1_statut" TEXT,
    "etape2_date_debut" DATETIME,
    "etape2_date_fin" DATETIME,
    "etape2_statut" TEXT,
    "etape2_validation" TEXT,
    "etape3_date_debut" DATETIME,
    "etape3_date_fin" DATETIME,
    "etape3_statut" TEXT,
    "etape3_validation" TEXT,
    "etape4_date_debut" DATETIME,
    "etape4_date_fin" DATETIME,
    "etape4_statut" TEXT,
    "etape4_validation" TEXT,
    "etape5_date_debut" DATETIME,
    "etape5_date_fin" DATETIME,
    "etape5_statut" TEXT,
    "etape5_validation" TEXT,
    "etape6_date_debut" DATETIME,
    "etape6_date_fin" DATETIME,
    "etape6_statut" TEXT,
    "etape6_validation" TEXT,
    CONSTRAINT "etapes_programme_projet_id_fkey" FOREIGN KEY ("projet_id") REFERENCES "projets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "etapes_manuel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projet_id" TEXT NOT NULL,
    "etape1_date_debut" DATETIME,
    "etape1_date_fin" DATETIME,
    "etape1_statut" TEXT,
    "etape2_date_debut" DATETIME,
    "etape2_date_fin" DATETIME,
    "etape2_statut" TEXT,
    "etape3_date_debut" DATETIME,
    "etape3_date_fin" DATETIME,
    "etape3_statut" TEXT,
    "etape4_date_debut" DATETIME,
    "etape4_date_fin" DATETIME,
    "etape4_statut" TEXT,
    "etape5_date_debut" DATETIME,
    "etape5_date_fin" DATETIME,
    "etape5_statut" TEXT,
    "etape6_date_debut" DATETIME,
    "etape6_date_fin" DATETIME,
    "etape6_statut" TEXT,
    CONSTRAINT "etapes_manuel_projet_id_fkey" FOREIGN KEY ("projet_id") REFERENCES "projets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "affectations" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT '',
    "projet_id" TEXT NOT NULL,
    "formateur_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "date_affectation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "charge_travail" INTEGER,
    CONSTRAINT "affectations_projet_id_fkey" FOREIGN KEY ("projet_id") REFERENCES "projets" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "affectations_formateur_id_fkey" FOREIGN KEY ("formateur_id") REFERENCES "formateurs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "validations" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT '',
    "projet_id" TEXT NOT NULL,
    "etape" TEXT NOT NULL,
    "date_demande" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validateur" TEXT,
    "date_validation" DATETIME,
    "statut" TEXT NOT NULL DEFAULT 'En attente',
    "commentaires" TEXT,
    "rep_ifep" TEXT,
    "rep_infep" TEXT,
    "insp" TEXT,
    "rep_sect_eco" TEXT,
    CONSTRAINT "validations_projet_id_fkey" FOREIGN KEY ("projet_id") REFERENCES "projets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "historique" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projet_id" TEXT,
    "action" TEXT NOT NULL,
    "utilisateur" TEXT DEFAULT 'Système',
    "details" TEXT,
    "date_action" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "historique_projet_id_fkey" FOREIGN KEY ("projet_id") REFERENCES "projets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "etapes_programme_projet_id_key" ON "etapes_programme"("projet_id");

-- CreateIndex
CREATE UNIQUE INDEX "etapes_manuel_projet_id_key" ON "etapes_manuel"("projet_id");
