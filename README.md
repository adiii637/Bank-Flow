# Bank Flow: Secure Double-Entry Ledger & Transaction Service

**Bank Flow** is a high-performance, production-ready financial backend system built with **Node.js, Express.js, and MongoDB (Mongoose)**. It implements a robust, double-entry bookkeeping ledger architecture to guarantee transaction consistency, immutability, auditability, and safety against common banking vulnerabilities such as race conditions and double-spending.

This project is specifically designed to showcase backend engineering best practices, data modeling, transaction isolation, security middleware patterns, and external service integrations.

---

## 🚀 Key Engineering & Architecture Highlights

### 1. Dynamic Ledger-Based Balance Calculation
Instead of storing a hardcoded `balance` attribute on the account document (which is highly vulnerable to concurrent updates, race conditions, and synchronization bugs), Bank Flow derives balances dynamically using **double-entry ledger rules**.
* **Formula:** $\text{Account Balance} = \sum \text{Credit Amounts} - \sum \text{Debit Amounts}$
* **Implementation:** Leverages MongoDB's aggregation pipeline to sum up all transaction records associated with the account.
* **Why this matters to Recruiters:** This design mirrors real-world core-banking systems, ensuring a bulletproof audit log of every penny that ever moves.

### 2. Ledger Immutability & Audit Trail
To comply with financial regulations and audit standards, records in the ledger must never be altered or deleted.
* **Security Control:** Pre-save/update/delete Mongoose hooks intercept any modifications targeting ledger entries and throw database errors.
* **Audit Trail:** Once a ledger entry is written, it is permanently locked, ensuring a single source of truth for the entire life of the system.

### 3. ACID-Compliant Transactions (10-Step Flow)
Money transfers involve multiple operations (debiting account A, crediting account B, registering the transaction status). To guarantee consistency, all movements are wrapped in a **MongoDB Session Transaction**.
1. **Validate request** payload structure.
2. **Enforce transaction safety** via `idempotencyKey` checking.
3. **Verify statuses** (both sender and receiver accounts must be `ACTIVE`).
4. **Derive sender balance** dynamically from ledger entries to prevent overdraft.
5. **Create transaction record** in `PENDING` state.
6. **Insert DEBIT ledger entry** for the sender's account.
7. **Simulate network latency** (a 15-second delay is introduced to mock real-world processing).
8. **Insert CREDIT ledger entry** for the receiver's account.
9. **Update transaction status** to `COMPLETED`.
10. **Commit the MongoDB Session** (if any step fails, the entire transaction rolls back, preventing orphaned debits or credits).

### 4. Idempotency & Double-Spend Prevention
In financial systems, network timeouts can cause clients to retry requests, potentially leading to duplicate payments.
* **Solution:** Every transfer request requires a unique `idempotencyKey`. The server checks this key before processing. If a duplicate key is detected:
  * If the transaction was completed, it immediately returns the original result without reprocessing.
  * If the transaction is pending, it informs the client that the transaction is still processing.
  * If it failed, the client is safely allowed to retry.

### 5. Secure Authentication & Token Blacklisting
* **Stateless Auth:** Uses JSON Web Tokens (JWT) for secure, stateless session management.
* **Logout Blacklist:** For high security, logging out blacklists the active token in the database. The auth middleware checks this blacklist for every incoming request.
* **Automatic Expiration (TTL):** Blacklisted tokens are pruned automatically using a MongoDB TTL Index set to expire after 3 days.

---

## 🛠 Tech Stack

* **Runtime Environment:** Node.js
* **Framework:** Express.js (v5.x)
* **Database:** MongoDB
* **ORM:** Mongoose (v9.x)
* **Authentication:** JSON Web Tokens (JWT), Bcrypt.js (Password hashing)
* **Email Client:** Nodemailer (Gmail SMTP with OAuth2 authentication)
* **Configuration:** Dotenv

---

## 📂 Project Structure

```bash
Bank-Flow/
├── server.js                     # Server entry point & DB connection initialization
├── Notes.md                      # Developer design notes on ledger logic
├── package.json                  # Dependencies and run scripts
├── src/
│   ├── app.js                    # Express app instantiation, global middleware, status dashboard
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic using Mongoose
│   ├── controllers/
│   │   ├── auth.controller.js    # Registration, Login, Logout controller
│   │   ├── account.controller.js # Account creation, fetching, and balance queries
│   │   └── transaction.controller.js # Ledger transfers and system funds controllers
│   ├── middleware/
│   │   └── auth.middleware.js    # JWT authorization and system user validation middleware
│   ├── models/
│   │   ├── user.model.js         # User schema, password hashing hooks, password verification
│   │   ├── account.model.js      # Account schema, currency controls, and getBalance() aggregation
│   │   ├── ledger.model.js       # Ledger entry schema and write-once immutability locks
│   │   ├── transaction.model.js  # Transaction schema and idempotency indices
│   │   └── blackList.model.js    # Token blacklist schema with TTL auto-purge indexing
│   ├── routes/
│   │   ├── auth.routes.js        # Auth routing rules (/api/auth)
│   │   ├── account.routes.js     # Account management routing rules (/api/accounts)
│   │   └── transaction.routes.js # Transaction ledger routing rules (/api/transactions)
│   └── services/
│       └── email.service.js      # Nodemailer SMTP email trigger configurations
```

---

## 🔗 API Endpoint Catalog

All routes reside under the `/api` prefix.

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Body Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/register` | Public | `{ "email": "...", "password": "...", "name": "..." }` | Registers a new user, hashes password, returns JWT, and triggers welcome email. |
| **POST** | `/login` | Public | `{ "email": "...", "password": "..." }` | Validates credentials, issues JWT via HTTP cookie & response JSON. |
| **POST** | `/logout` | Public | *None (Reads active token)* | Blacklists the JWT, clears local client cookies, and ends the session. |

### Account Endpoints (`/api/accounts`)

| Method | Endpoint | Access | Body Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/` | User Auth | `{ "currency": "INR" }` (Optional) | Spawns a new active bank account under the authenticated user. |
| **GET** | `/` | User Auth | *None* | Returns list of all accounts associated with the authenticated user. |
| **GET** | `/balance/:accountId` | User Auth | *None* | Aggregates credits vs debits in the ledger and returns the dynamic balance. |

### Transaction Endpoints (`/api/transactions`)

| Method | Endpoint | Access | Body Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/` | User Auth | `{ "fromAccount": "...", "toAccount": "...", "amount": 100, "idempotencyKey": "..." }` | Executes a secure, atomic transfer transaction between accounts. |
| **POST** | `/system/initial-funds` | System Auth | `{ "toAccount": "...", "amount": 10000, "idempotencyKey": "..." }` | Disburses starting capital from the central system reserve to a user account. |

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory and specify the following variables:

```env
# MongoDB Connection String
MONGO_URI="your_mongodb_connection_uri"

# JWT Token Secret for Encryption
JWT_SECRET="your_jwt_signing_secret"

# Nodemailer OAuth2 Settings (For Gmail SMTP)
EMAIL_USER="your_email@gmail.com"
CLIENT_ID="your_google_oauth_client_id"
CLIENT_SECRET="your_google_oauth_client_secret"
REFRESH_TOKEN="your_google_oauth_refresh_token"

# Port (Defaults to 3000)
PORT=3000
```

---

## 📦 Run Locally

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Bank-Flow
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Configure your local variables inside a `.env` file at the project root folder.

4. **Start in Development Mode:**
   ```bash
   npm run dev
   ```

5. **Start in Production Mode:**
   ```bash
   npm start
   ```

---

## 🛡️ Key Database Schema Validation & Constraints

* **`user.model.js`:** Enforces email regex formatting and unique index fields to prevent duplicates.
* **`account.model.js`:** Configures schema indexes on user IDs for fast queries. Restricts account statuses to `ACTIVE`, `FROZEN`, or `CLOSED`.
* **`ledger.model.js`:** Enforces `immutable: true` on fields. Employs Mongoose pre-hooks on standard update/delete operations to ensure ledger security.
* **`transaction.model.js`:** Defines a unique database index on the `idempotencyKey` field to guarantee cluster-level uniqueness.
* **`blackList.model.js`:** Implements `expireAfterSeconds: 259200` (3 days) on token documents for automatic space recycling.
