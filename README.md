# Order Manajemen API

## Tech Stack

- **Runtime:** Node.js
- **Bahasa:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Autentikasi:** JWT (JSON Web Token)
- **Upload File:** Multer
- **Logging:** Winston
- **Validasi:** Zod

## Setup Proyek

### 1. Clone Repository

```bash
git clone https://github.com/ahitabisma/order-management-api.git
cd order-management-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Environment

Copy .env.example dan rename menjadi .env

### 4. Database

#### Jalankan Migrasi Database

```bash
# Generate Prisma client
npx prisma generate

# Migrasi database
npx prisma migrate dev

# Seed Database
npx prisma db seed -- --all
```

### 7. Run Aplikasi

```bash
npm run dev
```

## Daftar Route API

### Base URL

```
http://localhost:3000/api/v1
```

### Route Autentikasi

| Method | Endpoint         | Deskripsi               | Akses         |
| ------ | ---------------- | ----------------------- | ------------- |
| POST   | `/auth/register` | Daftar pengguna baru    | Public        |
| POST   | `/auth/login`    | Login pengguna          | Public        |
| POST   | `/auth/refresh`  | Refresh access token    | Public        |
| POST   | `/auth/logout`   | Logout pengguna         | Authenticated |
| POST   | `/auth/profile`  | Update profile pengguna | Authenticated |

### Route Produk

| Method | Endpoint        | Deskripsi                   | Akses  |
| ------ | --------------- | --------------------------- | ------ |
| GET    | `/products`     | Ambil semua produk          | Public |
| GET    | `/products/:id` | Ambil produk berdasarkan ID | Public |
| POST   | `/products`     | Buat produk baru            | Admin  |
| PUT    | `/products/:id` | Update produk               | Admin  |
| DELETE | `/products/:id` | Hapus produk                | Admin  |

### Route Order

| Method | Endpoint          | Deskripsi                    | Akses    |
| ------ | ----------------- | ---------------------------- | -------- |
| POST   | `/orders`         | Buat pesanan baru            | Customer |
| GET    | `/orders/history` | Ambil riwayat pesanan        | Customer |
| GET    | `/orders/:id`     | Ambil pesanan berdasarkan ID | Customer |
