# Phoo Bakery Order System

Customer ordering form + staff Order Management System built with the Next.js App Router, Prisma, PostgreSQL, and Cloudinary image storage.

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Cloudinary account for media uploads

## Environment Variables

Create a `.env` file in the project root:

```
DATABASE_URL="postgresql://phoo:bakery@localhost:5432/phoo_bakery_db?schema=public"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

## Setup

```bash
npm install
npx prisma migrate dev --name init_phoo_bakery_schema
npm run dev
```

Visit `http://localhost:3000` to view the customer order form and OMS dashboard.

## Features

- Customer form with dynamic pricing, Cloudinary uploads, optional address & remarks
- Staff dashboard grouped by delivery date with status controls and detailed modal
- Prisma PostgreSQL backend with migrations and RESTful API routes

## Scripts

- `npm run dev` – start Next.js in development
- `npm run build` – production build
- `npm run start` – run production server
- `npm run lint` – lint with ESLint
