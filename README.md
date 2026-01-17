# EventsApp 

EventsApp is a comprehensive web application designed for creating, browsing, and participating in local events. The system features secure JWT-based authentication, cloud-native media storage, and interactive location previews.

---
## Tech Stack

### Backend

* **Java 17** with **Spring Boot 3.4.1**
* **Spring Security & JWT** – Stateless authentication and authorization.
* **Spring Data JPA** – Persistent data access layer utilizing Hibernate.
* **PostgreSQL** – Relational database hosted on **Supabase**.
* **Supabase Storage** – Cloud-based storage for user avatars and event banners.
* **Lombok** – Reduces boilerplate code and improves readability.

### Frontend

* **React 18** (Vite) + **TypeScript**
* **Tailwind CSS** & **Shadcn/UI** – Modern, accessible, and responsive UI components.
* **Axios** – API communication with custom interceptors for session management.
* **Lucide React** – A clean and consistent icon library.
* **Sonner** – Elegant toast notifications for user feedback.

---

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the backend root directory:

```env
# Database Configuration
DB_URL=jdbc:postgresql://<your-supabase-host>:5432/postgres
DB_USER=<your-database-user>
DB_PASSWORD=<your-database-password>

# JWT Security
JWT_SECRET=<your-64-character-secret-key>
JWT_EXPIRATION=86400000

# Supabase Storage Configuration
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_KEY=<your-service-role-or-anon-key>
```

---

## Getting Started

### Run the Backend

```bash
./mvnw spring-boot:run
```

### Run the Frontend

```bash
npm install
npm run dev
```

---

## API Endpoints

### Authentication

* `POST /api/auth/register` – Register a new account.
* `POST /api/auth/login` – Authenticate and receive a JWT token.

### Events Management

* `GET /api/events` – Fetch all available events.
* `POST /api/events` – Create a new event (supports Multipart/Form-data).
* `PUT /api/events/{id}` – Update event details (restricted to the Organizer).
* `DELETE /api/events/{id}` – Permanent removal of an event.
* `POST /api/events/{id}/join` – Sign up for an event.
* `DELETE /api/events/{id}/leave` – Cancel attendance.

### User & Statistics

* `GET /api/users/me` – Retrieve current authenticated user profile.
* `GET /api/events/organized/count` – Count events organized by the user.
* `GET /api/events/registered/count` – Count events the user is attending.

---