-- CreateTable
CREATE TABLE "ifep_info" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL DEFAULT '',
    "adresse" TEXT NOT NULL DEFAULT '',
    "telephone" TEXT NOT NULL DEFAULT '',
    "fax" TEXT NOT NULL DEFAULT '',
    "branches_professionnelles" TEXT NOT NULL DEFAULT '',
    "date_mise_a_jour" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
