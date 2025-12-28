# Direction des Études - Système de Gestion

Application web de gestion des projets pédagogiques construite avec Next.js, React et TypeScript.

## 🚀 Installation

1. **Installer les dépendances :**
```bash
npm install
```

2. **Configurer la base de données :**
```bash
# Copier le fichier .env.example
cp .env.example .env

# Générer le client Prisma
npx prisma generate

# Créer la base de données et les tables
npx prisma migrate dev --name init
```

3. **Démarrer le serveur de développement :**
```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📦 Production

```bash
npm run build
npm start
```

## 🛠️ Technologies

- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Prisma** - ORM moderne pour la base de données
- **SQLite** - Base de données légère

## 📁 Structure du projet

```
projetDE/
├── app/              # Pages et routes API (App Router)
│   ├── api/         # Routes API
│   ├── page.tsx     # Page d'accueil
│   └── layout.tsx   # Layout principal
├── components/      # Composants React réutilisables
├── lib/             # Utilitaires et configuration
├── prisma/          # Schéma Prisma et migrations
└── public/          # Fichiers statiques
```

## 🔄 Migration depuis Flask

Ce projet est une réécriture complète de l'application Flask originale en Next.js/React. Toutes les fonctionnalités sont préservées avec une architecture moderne et performante.

