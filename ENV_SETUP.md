# Configuration des Variables d'Environnement

## Variables Requises

### DATABASE_URL

La variable `DATABASE_URL` est requise pour connecter l'application à votre base de données PostgreSQL.

#### Format de la connection string:

```
postgresql://user:password@host:port/database?schema=public
```

#### Exemple:

```
postgresql://postgres:mypassword@db.example.com:5432/direction_etudes?schema=public
```

## Configuration Locale

1. Créez un fichier `.env.local` à la racine du projet
2. Ajoutez votre `DATABASE_URL`:

```env
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
```

**Important:** Le fichier `.env.local` est ignoré par Git et ne sera pas commité.

## Configuration sur Vercel

1. Allez dans votre projet Vercel
2. Cliquez sur **Settings** → **Environment Variables**
3. Ajoutez:
   - **Name**: `DATABASE_URL`
   - **Value**: Votre connection string PostgreSQL
   - **Environment**: Sélectionnez Production, Preview, et/ou Development selon vos besoins
4. Cliquez sur **Save**

## Où Obtenir une Connection String

### Vercel Postgres
- Allez dans votre projet Vercel → **Storage** → **Postgres**
- La connection string est automatiquement disponible via la variable `POSTGRES_URL` ou `DATABASE_URL`

### Supabase
1. Allez dans **Settings** → **Database**
2. Copiez la **Connection string** (URI)
3. Remplacez `[YOUR-PASSWORD]` par votre mot de passe

### Neon
1. Allez dans votre projet
2. Cliquez sur **Connection Details**
3. Copiez la connection string

### Railway
1. Allez dans votre service PostgreSQL
2. Cliquez sur l'onglet **Variables**
3. Copiez la valeur de `DATABASE_URL`

## Test de la Connection

Pour tester votre connection localement:

```bash
# Générer Prisma Client
npx prisma generate

# Tester la connection
npx prisma db pull

# Ou ouvrir Prisma Studio
npx prisma studio
```

## Sécurité

⚠️ **Ne commitez jamais vos variables d'environnement dans Git!**

- Utilisez `.env.local` pour le développement local
- Utilisez les variables d'environnement de Vercel pour la production
- Ne partagez jamais vos credentials de base de données

