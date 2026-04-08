# build-a-full-stack-web-applica

Build a full-stack web application called "KosBill Reminder" (Bill Reminder for Boarding House Students).

Tech Stack:
- Frontend: React (Vite) + Tailwind CSS
- Backend: Node.js + Express
- Database: MySQL (or SQL Server if available)
- Architecture: REST API

Main Goal:
Create a simple CRUD-based application that helps boarding house (kos) students track and get reminders for their monthly bills (electricity, water, wifi, rent, etc).

Core Features:

1. Authentication:
- Register and login system
- Simple JWT-based authentication
- Each user only sees their own data

2. Bills Management (CRUD):
- Create, read, update, delete bills
- Fields:
  - id
  - user_id
  - bill_name (e.g., Electricity, Wifi, Rent)
  - amount
  - due_date
  - status (paid / unpaid)
  - created_at

3. Dashboard:
- Show total unpaid bills
- Show upcoming bills (due in next 3 days)
- Highlight overdue bills

4. Reminder System (IMPORTANT):
- Automatically detect bills that are:
  - Due in 3 days
  - Due tomorrow
  - Overdue
- Trigger browser notifications using Web Notification API
- Also show in-app alert notifications

5. Filters & UX:
- Filter bills by:
  - All
  - Paid
  - Unpaid
  - Overdue
- Sort by due date

6. UI/UX Design:
- Clean modern dashboard
- Mobile responsive
- Use card-based layout
- Use color indicators:
  - Red = overdue
  - Yellow = near due
  - Green = paid

7. PWA Support:
- Add manifest.json
- Add service worker
- Allow install as mobile app
- Enable basic offline capability

8. Database Schema:
Provide SQL schema including:
- users table
- bills table

9. API Endpoints:
Create complete REST API:
- /auth/register
- /auth/login
- /bills (GET, POST)
- /bills/:id (PUT, DELETE)

10. Dummy Data:
- Seed at least 5 sample bills:
  - Electricity
  - Water
  - Wifi
  - Rent
  - Laundry

11. Extra (Optional but preferred):
- Dark mode toggle
- Simple statistics (count of paid vs unpaid)

Constraints:
- DO NOT use any payment gateway
- DO NOT use third-party SaaS services
- Keep the app simple, fast, and focused on CRUD + reminders
- Code should be clean and beginner-friendly

Output:
- Full project structure (frontend + backend)
- Ready-to-run instructions
- Environment variables setup

## 🗄️ Turso Database Setup Instructions
1. Install Turso CLI:
   ```bash
   npm install -g turso
   ```

2. Login to Turso:
   ```bash
   turso auth login
   ```

3. Create database:
   ```bash
   turso db create kosbill
   ```

4. Get database URL:
   ```bash
   turso db show kosbill
   ```

   Copy the URL (example):
   ```bash
   libsql://kosbill-username.turso.io
   ```

5. Generate auth token:
   ```bash
   turso db tokens create kosbill
   ```

6. Create .env file:
   ```bash
   TURSO_DATABASE_URL=libsql://kosbill-username.turso.io
   TURSO_AUTH_TOKEN=your_token_here
   ```

## 🧱 Drizzle Setup

Run migration / push schema:
   ```bash
   npx drizzle-kit push
   ```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the URL shown in the terminal.
