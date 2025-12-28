# Guide d'Installation - Projet DE

## Prérequis

- Node.js 18+ installé
- npm ou yarn

## Étapes d'installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer la base de données

```bash
# Créer le fichier .env
echo 'DATABASE_URL="file:./prisma/direction_etudes.db"' > .env

# Générer le client Prisma
npx prisma generate

# Créer la base de données
npx prisma migrate dev --name init
```

### 3. Démarrer l'application

```bash
npm run dev
```

L'application sera accessible sur http://localhost:3000

## Commandes utiles

- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Construire pour la production
- `npm start` - Démarrer le serveur de production
- `npx prisma studio` - Ouvrir l'interface graphique de la base de données
- `npx prisma migrate dev` - Créer une nouvelle migration
- `npx prisma generate` - Régénérer le client Prisma après modification du schéma

## Dépannage

### Erreur "Prisma Client not generated"
```bash
npx prisma generate
```

### Erreur de base de données
```bash
# Supprimer la base et recréer
rm prisma/direction_etudes.db
npx prisma migrate dev --name init
```

