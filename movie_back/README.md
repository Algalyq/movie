# Movie Booking Backend

This is a Django-based backend service for a movie booking system. It provides APIs for user authentication, movie listings, cinema management, and ticket booking.

## Features

- User authentication (registration, login, logout)
- Movie management with poster and background images
- Cinema theater management
- Movie session scheduling
- Ticket booking system
- User booking history

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register a new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/logout/` - Logout user
- `POST /api/auth/token/` - Get authentication token

### Movies
- `GET /api/films/` - List all movies
- `GET /api/films/{id}/` - Get movie details
- `GET /api/films/now_playing_movies/` - Get currently playing movies
- `GET /api/films/{id}/cinema_theaters/` - Get cinemas showing a specific movie
- `GET /api/films/{id}/sessions/` - Get all sessions for a specific movie

### Cinema Theaters
- `GET /api/theaters/` - List all cinema theaters
- `GET /api/theaters/{id}/` - Get cinema theater details

### Movie Sessions
- `GET /api/sessions/` - List all movie sessions
- `GET /api/sessions/{id}/` - Get session details
- `POST /api/sessions/{id}/book_session/` - Book a movie session

### Bookings
- `GET /api/bookings/` - List user's bookings
- `GET /api/bookings/{id}/` - Get booking details
- `GET /api/bookings/active_bookings/` - Get user's active bookings

### Actors
- `GET /api/actors/` - List all actors
- `GET /api/actors/{id}/` - Get actor details

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Apply migrations:
   ```bash
   cd booking_movie
   python manage.py migrate
   ```

4. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

5. Run the development server:
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/api/`

## Authentication

The API uses token-based authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## Media Files

Movie posters and background images are stored in the following directories:
- Posters: `/media/posters/`
- Background images: `/media/backgrounds/`
- Actor photos: `/media/actors/`
