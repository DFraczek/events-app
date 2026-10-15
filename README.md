
# EventsApp

EventsApp is a web application for discovering, creating, and managing events. Users can browse events, filter and sort them, join events, manage their profiles, and keep track of their activities through a personal calendar.

The application is built with React and TypeScript on the frontend and Java Spring Boot on the backend. Docker Compose provides a convenient way to run the entire application locally.

## Screenshots

<!-- todo. -->

<!-- ![Events list]-->
<!-- ![Event details]-->
<!-- ![Calendar]-->
<!-- ![User profile])-->

## Features

### Event Management
- Browse available events.
- Create, edit, and delete events.
- View event details, including descriptions, locations, dates, and images.
- Join events and leave events you have joined.
- Browse events by category.
- Filter events by status, including upcoming and completed events.
- Search for events and hide events that have reached their participant limit.
- Sort events by date, popularity, and name in alphabetical order.

### Personal Event Management
- View events organized by the current user.
- Browse events the user has joined.
- View registered events in a calendar.
- Select a calendar day to see the events scheduled for that day.

### User Accounts and Profiles
- Register and log in.
- View and edit profile information.
- Update the profile picture, first name, last name, bio, and address.

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Nginx

### Backend
- Java 17
- Spring Boot 3.4.1
- Spring Security
- JWT authentication
- Spring Data JPA and Hibernate
- Lombok

### Database and Storage
- PostgreSQL 17
- Flyway database migrations
- Local file storage for uploaded images
- Docker volumes for persistent database and image data

### Development and Deployment
- Docker
- Docker Compose
- Maven

## Architecture

The application consists of three services:

- **Frontend:** A React application built with Vite and served by Nginx.
- **Backend:** A Spring Boot REST API responsible for application logic, authentication, and database operations.
- **Database:** A PostgreSQL database initialized and updated through Flyway migrations.

Nginx serves the frontend and forwards API and uploaded-image requests to the backend. Uploaded images and database data are stored in separate Docker volumes to persist across container restarts.


## Getting Started

### Prerequisites

Make sure you have the following installed:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Configure environment variables

Create a `.env` file in the backend root directory:

```env
# Database Configuration
DB_URL=jdbc:postgresql://db:5432/eventsapp
DB_USER=eventsapp
DB_PASSWORD=your_database_password

# JWT Configuration
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRATION=86400000
```

### 2. Build and start the application

Run the following command from the project root directory:

```bash
docker compose up --build -d
```

Docker Compose builds the frontend and backend images, starts the PostgreSQL database, and launches all application services.

### 3. Open the application

Once the containers are running, open the frontend in your browser:

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8080](http://localhost:8080)

The PostgreSQL database is exposed on port `5433` on your local machine.

### 4. Stop the application

To stop the application without deleting persistent data, run:

```bash
docker compose down
```

To also remove the database and uploaded-image data stored in Docker volumes, run:

```bash
docker compose down -v
```

**Warning:** The `-v` option permanently deletes the data stored in the associated Docker volumes.
