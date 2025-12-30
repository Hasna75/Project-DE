# Guide de Déploiement sur Vercel

Ce guide vous explique comment déployer l'application sur Vercel avec une base de données PostgreSQL.

## Prérequis

- Un compte Vercel (gratuit)
- Un compte pour une base de données PostgreSQL cloud (voir options ci-dessous)

## Options de Base de Données PostgreSQL

### Option 1: Vercel Postgres (Recommandé - Intégration native)

1. Dans votre projet Vercel, allez dans l'onglet **Storage**
2. Cliquez sur **Create Database** → **Postgres**
3. Suivez les instructions pour créer la base de données
4. Vercel configurera automatiquement la variable `DATABASE_URL`

### Option 2: Supabase (Gratuit jusqu'à 500MB)

1. Créez un compte sur [Supabase](https://supabase.com)
2. Créez un nouveau projet
3. Allez dans **Settings** → **Database**
4. Copiez la **Connection string** (URI)
5. Utilisez-la comme `DATABASE_URL` dans Vercel

### Option 3: Neon (Gratuit avec limite généreuse)

1. Créez un compte sur [Neon](https://neon.tech)
2. Créez un nouveau projet
3. Copiez la connection string
4. Utilisez-la comme `DATABASE_URL` dans Vercel

### Option 4: Railway (Gratuit avec crédits)

1. Créez un compte sur [Railway](https://railway.app)
2. Créez un nouveau projet PostgreSQL
3. Copiez la connection string
4. Utilisez-la comme `DATABASE_URL` dans Vercel

## Étapes de Déploiement

### 1. Préparer le projet localement

```bash
# Installer les dépendances
npm install

# Créer un fichier .env.local avec votre DATABASE_URL
# (pour tester localement avant de déployer)
cp .env.example .env.local
# Éditez .env.local et ajoutez votre DATABASE_URL
```

### 2. Générer Prisma Client et exécuter les migrations

```bash
# Générer Prisma Client
npx prisma generate

# Créer les migrations
npx prisma migrate dev --name init

# (Optionnel) Visualiser la base de données
npx prisma studio
```

### 3. Déployer sur Vercel

#### Via l'interface Vercel:

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **Add New Project**
3. Importez votre repository Git (GitHub, GitLab, Bitbucket)
4. Configurez les variables d'environnement:
   - **DATABASE_URL**: Votre connection string PostgreSQL
5. Cliquez sur **Deploy**

#### Via la CLI Vercel:

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Ajouter la variable d'environnement
vercel env add DATABASE_URL
# Collez votre connection string quand demandé
```

### 4. Exécuter les migrations sur la base de données de production

Après le déploiement, vous devez exécuter les migrations sur la base de données de production:

```bash
# Exécuter les migrations sur la base de données de production
npx prisma migrate deploy

# Ou via Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy
```

**Note:** Vous pouvez aussi configurer Vercel pour exécuter automatiquement les migrations après chaque déploiement en ajoutant un script dans `package.json`:

```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

## Configuration des Variables d'Environnement sur Vercel

1. Allez dans votre projet Vercel
2. Cliquez sur **Settings** → **Environment Variables**
3. Ajoutez:
   - **Name**: `DATABASE_URL`
   - **Value**: Votre connection string PostgreSQL
   - **Environment**: Production, Preview, Development (selon vos besoins)
4. Cliquez sur **Save**

## Vérification du Déploiement

1. Après le déploiement, visitez votre URL Vercel
2. Vérifiez que l'application se charge correctement
3. Testez les fonctionnalités principales:
   - Création de projets
   - Gestion des étapes
   - Gestion des formateurs
   - etc.

## Migration depuis SQLite (si vous avez des données existantes)

Si vous avez des données dans SQLite et voulez les migrer vers PostgreSQL:

```bash
# 1. Exporter les données depuis SQLite
npx prisma db pull --schema=./prisma/schema.sqlite.prisma

# 2. Importer dans PostgreSQL (nécessite un outil de migration)
# Vous pouvez utiliser des outils comme:
# - pgloader (https://pgloader.readthedocs.io/)
# - Ou exporter en CSV et importer manuellement
```

## Dépannage

### Erreur: "Failed to collect page data"

- Vérifiez que `DATABASE_URL` est correctement configuré
- Vérifiez que les migrations ont été exécutées: `npx prisma migrate deploy`
- Vérifiez les logs Vercel pour plus de détails

### Erreur: "Prisma Client not generated"

- Assurez-vous que `postinstall` est dans `package.json`
- Vérifiez que `prisma generate` s'exécute pendant le build

### Connexion à la base de données échoue

- Vérifiez que votre base de données PostgreSQL accepte les connexions externes
- Vérifiez que l'IP de Vercel est autorisée (si nécessaire)
- Vérifiez que la connection string est correcte

## Support

Pour plus d'aide:
- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation Next.js](https://nextjs.org/docs)

