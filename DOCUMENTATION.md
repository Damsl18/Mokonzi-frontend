# 📚 Documentation — ETS Mokonzi Frontend

## Table des matières
1. [Présentation](#présentation)
2. [Installation](#installation)
3. [Structure du projet](#structure)
4. [Architecture technique](#architecture)
5. [Sécurité](#sécurité)
6. [Rôles et permissions](#rôles)
7. [Détail des fichiers](#détail)

---

## 1. Présentation

Application React de gestion de stock et de ventes pour **ETS Mokonzi**.  
Elle se connecte à l'API Django REST Framework via des appels HTTP sécurisés par token.  
Deux interfaces distinctes : **Worker** (vendeur) et **Client** (administrateur).

---

## 2. Installation

### Prérequis
- Node.js v18 ou supérieur
- npm v9 ou supérieur
- L'API Django tournant sur `http://localhost:8000`

### Étapes

```bash
# 1. Décompresser le zip et entrer dans le dossier
cd ets-mokonzi-frontend

# 2. Installer les dépendances
npm install

# 3. Démarrer en développement
npm run dev

# 4. Ouvrir dans le navigateur
# http://localhost:3000
```

### Comptes de test (fournis par l'API)
| Rôle | Utilisateur | Mot de passe | Accès |
|------|-------------|--------------|-------|
| Worker | worker1 | worker123 | /login-worker |
| Worker | worker2 | worker123 | /login-worker |
| Client | client1 | client123 | /login-client |
| Client | client2 | client123 | /login-client |

---

## 3. Structure du projet

```
src/
├── api/               → Fonctions d'appel à l'API Django
├── context/           → Contexte global d'authentification
├── hooks/             → Hooks React personnalisés
├── components/common/ → Composants partagés (Sidebar, Navbar, etc.)
├── pages/worker/      → Pages de l'interface Worker
├── pages/client/      → Pages de l'interface Client
└── utils/             → Fonctions utilitaires (format, PDF)
```

---

## 4. Architecture technique

### Flux d'authentification
1. L'utilisateur entre ses identifiants sur la page login
2. `authAPI.login()` envoie une requête POST à `/api/auth/login/`
3. Le serveur retourne un token d'authentification
4. Le token est stocké dans `localStorage`
5. Chaque requête suivante inclut automatiquement `Authorization: Token xxx`
6. Si le serveur répond 401, l'utilisateur est déconnecté automatiquement

### Gestion d'état
- **AuthContext** : état global (user, token, rôle) partagé dans toute l'app
- **useState local** : données de chaque page (produits, ventes, etc.)
- Pas de Redux — l'app est simple, useState suffit

### Appels API
- Tous les appels passent par `src/api/axiosConfig.js`
- Timeout de 15 secondes par requête
- Gestion des erreurs centralisée dans l'intercepteur Axios

---

## 5. Sécurité

### Mesures implémentées

| Vulnérabilité | Protection mise en place |
|---------------|--------------------------|
| Token volé en XSS | Token stocké en localStorage (standard DRF). En production, préférer httpOnly cookie côté serveur |
| Accès non autorisé | `ProtectedRoute` vérifie le rôle avant chaque page |
| Session expirée | L'intercepteur Axios déconnecte automatiquement si 401 |
| Injections formulaire | Validation côté client sur tous les champs avant envoi |
| CSRF | Géré côté Django. Le frontend envoie uniquement du JSON (pas de formulaire HTML natif) |
| Exposition de routes | Un worker ne peut jamais accéder aux routes `/client/*` et vice versa |
| Mots de passe | Minimum 6 caractères imposé à la création |
| Données sensibles | Aucune donnée sensible (mot de passe) n'est jamais stockée en localStorage |

### Recommandations pour la production
- Activer HTTPS sur le serveur Django
- Configurer `CORS_ALLOWED_ORIGINS` dans Django pour n'autoriser que le domaine du frontend
- Ajouter un refresh token pour éviter les déconnexions fréquentes
- Configurer `TOKEN_EXPIRY` dans DRF pour expirer les tokens inactifs

---

## 6. Rôles et permissions

### Worker (`/worker/*`)
| Action | Autorisé |
|--------|----------|
| Voir les produits et prix du jour | ✅ |
| Enregistrer une vente | ✅ |
| Créer une facture | ✅ |
| Marquer une facture comme payée | ✅ |
| Réceptionner du stock | ✅ |
| Recevoir des alertes stock faible | ✅ |
| Modifier/supprimer un produit | ❌ |
| Voir les rapports globaux | ❌ |
| Gérer les workers | ❌ |

### Client (`/client/*`)
| Action | Autorisé |
|--------|----------|
| Voir toutes les ventes | ✅ |
| Enregistrer une vente | ✅ |
| Gérer les workers (CRUD) | ✅ |
| Gérer les produits (CRUD) | ✅ |
| Modifier le prix du jour | ✅ |
| Gérer les réductions (CRUD) | ✅ |
| Voir toutes les factures | ✅ |
| Marquer factures payées/émises | ✅ |
| Voir les rapports et statistiques | ✅ |
| Exporter rapport PDF | ✅ |
| Supprimer une vente | ❌ (protégé par l'API) |

---

## 7. Détail des fichiers

### `src/api/axiosConfig.js`
Configuration centrale Axios. Injecte le token dans toutes les requêtes. Redirige vers login si 401.

### `src/api/authAPI.js`
- `login(username, password)` → POST `/api/auth/login/`
- `logout()` → POST `/api/auth/logout/`
- `getMe()` → GET `/api/users/me/`
- `register(data)` → POST `/api/auth/register/`

### `src/api/productsAPI.js`
- `getProducts()` → GET `/api/products/`
- `createProduct(data)` → POST `/api/products/`
- `updateProduct(id, data)` → PATCH `/api/products/{id}/`
- `deleteProduct(id)` → DELETE `/api/products/{id}/`
- `setDailyPrice(id, price)` → POST `/api/products/{id}/set_daily_price/`
- `getLowStockProducts()` → GET `/api/products/low_stock/`
- `updateStock(id, quantity)` → POST `/api/products/{id}/update_stock/`

### `src/api/salesAPI.js`
- `getSales()` → GET `/api/sales/`
- `createSale(data)` → POST `/api/sales/`
- `getTodaySales()` → GET `/api/sales/today_sales/`
- `getSalesStatistics()` → GET `/api/sales/statistics/`

### `src/api/invoicesAPI.js`
- `getInvoices()` → GET `/api/invoices/`
- `createInvoice(data)` → POST `/api/invoices/`
- `markAsPaid(id)` → POST `/api/invoices/{id}/mark_as_paid/`
- `markAsIssued(id)` → POST `/api/invoices/{id}/mark_as_issued/`

### `src/api/discountsAPI.js`
- `getDiscounts()` → GET `/api/discounts/`
- `createDiscount(data)` → POST `/api/discounts/`
- `updateDiscount(id, data)` → PATCH `/api/discounts/{id}/`
- `deleteDiscount(id)` → DELETE `/api/discounts/{id}/`
- `getActiveDiscounts()` → GET `/api/discounts/active_discounts/`

### `src/api/usersAPI.js`
- `getUsers()` → GET `/api/users/`
- `updateUser(id, data)` → PATCH `/api/users/{id}/`
- `deleteUser(id)` → DELETE `/api/users/{id}/`

### `src/api/reportsAPI.js`
- `getWeeklyReport()` → GET `/api/reports/weekly/`
- `getDailyReport()` → GET `/api/reports/daily/`
- `getAverageSales()` → GET `/api/reports/average-sales/`

### `src/context/AuthContext.jsx`
Fournit `user`, `token`, `role`, `isAuthenticated`, `loading`, `login()`, `logout()` à toute l'application.

### `src/components/common/ProtectedRoute.jsx`
Composant HOC qui vérifie si l'utilisateur est connecté et a le bon rôle. Redirige sinon.

### `src/utils/formatCurrency.js`
`formatCDF(amount)` → Formate un nombre en franc congolais. Ex: `15000` → `15 000 CDF`

### `src/utils/formatDate.js`
- `formatDateLong(str)` → "23 mai 2025"
- `formatDateShort(str)` → "23/05/2025"
- `formatDateTime(str)` → "23/05/2025 à 14:30"

### `src/utils/pdfExport.js`
`exportWeeklyReportPDF(report)` → Génère et télécharge un PDF A4 complet du rapport hebdomadaire avec en-tête ETS Mokonzi, KPIs et tableau des ventes.

---

## Dépendances installées

| Package | Version | Utilité |
|---------|---------|---------|
| react | ^18.2.0 | Framework UI |
| react-dom | ^18.2.0 | Rendu DOM |
| react-router-dom | ^6.22.0 | Navigation entre pages |
| axios | ^1.6.7 | Requêtes HTTP vers l'API |
| bootstrap | ^5.3.2 | Styles CSS de base |
| bootstrap-icons | ^1.11.3 | Icônes |
| jspdf | ^2.5.1 | Génération de fichiers PDF |
| jspdf-autotable | ^3.8.2 | Tableaux dans les PDFs |
| react-toastify | ^10.0.4 | Notifications toast |
| date-fns | ^3.3.1 | Formatage des dates en FR |
| vite | ^5.1.4 | Bundler ultra-rapide |
