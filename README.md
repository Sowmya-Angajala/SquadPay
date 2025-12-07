# SquadPay

Live backend (deployed on Aiven Console and Render):

> **Base URL:** `https://squadpay-3.onrender.com`

---

## Table of Contents

1. [Tech Stack & Architecture](#tech-stack--architecture)
2. [High-Level Features](#high-level-features)
3. [Setup Instructions](#setup-instructions)
   - [Environment variables](#environment-variables)
   - [Local run](#local-run)
4. [Firebase Authentication & Getting Tokens](#firebase-authentication--getting-tokens)
   - [Sign up user (Firebase REST)](#1-sign-up-user-firebase-rest)
   - [Sign in user (Firebase REST)](#2-sign-in-user-firebase-rest)
5. [Authentication in SquadPay](#authentication-in-squadpay)
6. [Data Model Overview](#data-model-overview)
7. [API Documentation](#api-documentation)
   - [Users](#users)
   - [Groups](#groups)
   - [Expenses](#expenses)
   - [Balances](#balances)
   - [Debt Simplification](#debt-simplification)
   - [Settlements](#settlements)
8. [End-to-End Example Flow with cURL](#end-to-end-example-flow-with-curl)
   - [Happy path: signup → signin → create group → add members → create expenses → view balances → simplify debts](#happy-path)
   - [Wrong / failure examples](#wrong--failure-examples)
9. [Assumptions](#assumptions)

---

## Tech Stack & Architecture

- **Backend**: Node.js, Express
- **Database**: MySQL (via Sequelize ORM)
- **Auth**: Firebase Authentication (ID tokens)
- **Deployment**: Render (backend), managed MySQL (Aiven/Cloud)
- **Structure**:
  - `src/server.js` – server entrypoint
  - `src/config` – DB & Firebase config
  - `src/middleware` – auth middleware
  - `src/models` – Sequelize models
  - `src/controllers` – route handlers
  - `src/services` – business logic
  - `src/routes` – API routes
  - `src/utils` – helpers (e.g., debt simplification algorithm)

---

## High-Level Features

- Firebase Authentication **required for every protected route**
- Users stored in MySQL, linked to Firebase UID
- Groups:
  - Create group, add/remove members
  - Role: **admin** (creator) vs **member**
  - Only admins can add/remove members
- Expenses:
  - In a group or standalone
  - Split types: **EQUAL, EXACT, PERCENT**
  - Validates that participants are valid users and group members
- Balances:
  - Track who owes whom and how much
  - Per-user and optional per-group
- Debt Simplification:
  - Minimizes number of transactions to settle all debts
  - Works globally and per-group
- Settlements:
  - Record payments between users
  - Update balances accordingly

---

## Setup Instructions

# Step 1 – Prerequisites

    -Install Node.js (LTS).
    -Install MySQL (Workbench or CLI).
    -Have a Google account for Firebase.

# Step 2 – Create Project Folder

    -mkdir rudo-backend
    -cd rudo-backend

# Step 3 – Initialize Node Project

    -npm init -y
    -npm install express cors dotenv firebase-admin mysql2 sequelize
    -npm install --save-dev nodemon

# Step 4 – Setup MySQL Database

     -Open MySQL client / Workbench.
     -Create database:
     ```
      CREATE DATABASE rudo_db;

     ```
     -In .env, keep:
     ```

        DB_HOST=localhost
        DB_USER=your_mysql_username
        DB_PASSWORD=your_mysql_password
        DB_NAME=rudo_db
        DB_DIALECT=mysql

     ```
# Step 5 – Setup Firebase Project 

   -Keep the firebase configurations in .env
    ```
      FIREBASE_PROJECT_ID=...
      FIREBASE_CLIENT_EMAIL=...
      FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

    ```  

# Step 6 – Run Migrations via Sequelize Sync
   
  -Start dev server:
   ``` 
      npm run dev
   ``` 
  -You should see:

   ```
    DB connected

    Server running on port 4000 
   ```

<!-- # Step 7 - Deployment (Render + Managed MySQL) -->


       
      

### Environment variables

Create a `.env` in the project root:

```env
PORT=4000

# Database
DB_HOST=<your-db-host>
DB_PORT=<your-db-port>
DB_USER=<your-db-user>
DB_PASSWORD=<your-db-password>
DB_NAME=<your-db-name>
DB_DIALECT=mysql

# Firebase
FIREBASE_PROJECT_ID=<your-firebase-project-id>
FIREBASE_CLIENT_EMAIL=<service-account-client-email>
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...yourkey...\n-----END PRIVATE KEY-----\n
```



## API Documentation
  
   # 1. Sign up user (Firebase REST)
    ```  
        curl --location 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=YOUR_FIREBASE_WEB_API_KEY' \
        --header 'Content-Type: application/json' \
        --data '{
            "email": "testuser1@gmail.com",
            "password": "Password123",
            "returnSecureToken": true
        }'
    ```
    # Example response (truncated): 
      
    ```    
      {
        "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6...",
        "email": "testuser1@gmail.com",
        "refreshToken": "AEu4IL2...",
        "expiresIn": "3600",
        "localId": "EQX2MXIb8QbIR4Q7RGkalb1uCFI1"
      }
    ```
  # 2. Sign in user (Firebase REST)
    ```
            curl --location 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=YOUR_FIREBASE_WEB_API_KEY' \
        --header 'Content-Type: application/json' \
        --data '{
            "email": "testuser1@gmail.com",
            "password": "Password123",
            "returnSecureToken": true
        }'
    ```  

    Use the idToken from this response as the Bearer token in SquadPay requests.

  # Authentication in SquadPay  
     - Every protected endpoint requires:


   
