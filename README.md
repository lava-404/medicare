# Vishranti Ghar Foundation — Inventory System

A production-ready inventory management system for a Senior Citizen Caring Centre in Thane.

## Tech Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **MongoDB** + Mongoose
- **Tailwind CSS**

## Setup

### 1. Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`) or a MongoDB Atlas URI

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
Edit `.env.local` and set your MongoDB URI:
```
MONGODB_URI=mongodb://localhost:27017/vishranti_inventory
```

For MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/vishranti_inventory
```

### 4. (Optional) Seed sample data
```bash
MONGODB_URI=mongodb://localhost:27017/vishranti_inventory node scripts/seed.mjs
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

### Dashboard
- Summary cards: Ration items, Medicine items, Low stock alerts, Near expiry, 7-day / 30-day transaction counts
- Active alerts for low stock and near-expiry medicines
- Recent transactions table

### Inventory
- Full CRUD for items (Add, Edit, Delete)
- Categories: Ration & Medicine
- Fields: name, category, stock, unit, threshold, expiry date
- Status badges: OK / Low Stock / Near Expiry / Expired
- Search and category filter
- Export to CSV

### Transactions
- Record incoming and outgoing stock
- Stock auto-updates on each transaction
- Filter by type (IN/OUT) and category
- Full transaction history

## Folder Structure
```
vishranti-inventory/
├── app/
│   ├── api/
│   │   ├── dashboard/route.ts
│   │   ├── items/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── export/route.ts
│   │   └── transactions/route.ts
│   ├── inventory/page.tsx
│   ├── transactions/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AddItemModal.tsx
│   ├── CategoryBadge.tsx
│   ├── ConfirmDialog.tsx
│   ├── Modal.tsx
│   ├── Navbar.tsx
│   ├── StatusBadge.tsx
│   └── TransactionModal.tsx
├── lib/
│   └── db.ts
├── models/
│   ├── Item.ts
│   └── Transaction.ts
├── scripts/
│   └── seed.mjs
├── types/
│   └── index.ts
├── .env.local
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```
