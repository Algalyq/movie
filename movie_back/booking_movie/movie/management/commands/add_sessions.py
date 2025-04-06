from django.core.management.base import BaseCommand
from movie.models import CinemaTheater, Hall, MovieSession, Film
from datetime import date, time, timedelta
import random

class Command(BaseCommand):
    help = 'Populates the database with movie sessions using existing cinema theaters and halls in Almaty'

    def handle(self, *args, **options):
        # Step 1: Delete all existing MovieSession data
        MovieSession.objects.all().delete()

        # Step 2: Define existing cinema theater and hall data
        cinema_data = [
            {
                "name": "Silk Way City Cinema",
                "address": "Tole Bi Avenue, 71, Nauryzbai Batyr corner, Almaty, Kazakhstan",
                "contact_number": "+7 727 267 7477",
                "halls": [
                    {"name": "Hall 1", "capacity": 94},
                    {"name": "Hall 2", "capacity": 94},
                    {"name": "Hall 3", "capacity": 94},
                    {"name": "Hall 4", "capacity": 94},
                ]
            },
            {
                "name": "Arman Cinema",
                "address": "104 Dostyk Avenue, Almaty, Kazakhstan",
                "contact_number": "+7 727 264 5246",
                "halls": [
                    {"name": "Hall 1", "capacity": 200},
                    {"name": "Hall 2", "capacity": 150},
                    {"name": "Hall 3", "capacity": 150},
                    {"name": "Hall 4", "capacity": 100},
                ]
            },
            {
                "name": "Kinoplexx 6 Almaty Mall",
                "address": "Zhandosov str, 83, Almaty Mall, 3rd floor, Almaty, Kazakhstan",
                "contact_number": "+7 727 313 7580",
                "halls": [
                    {"name": "Hall 1", "capacity": 120},
                    {"name": "Hall 2", "capacity": 120},
                    {"name": "Hall 3", "capacity": 120},
                    {"name": "Hall 4", "capacity": 120},
                    {"name": "Hall 5", "capacity": 120},
                    {"name": "Hall 6", "capacity": 120},
                ]
            },
            {
                "name": "Chaplin Cinema",
                "address": "Sholokhov Str., 29, Almaty, Kazakhstan",
                "contact_number": "+7 727 313 7580",
                "halls": [
                    {"name": "Hall 1", "capacity": 100},
                    {"name": "Hall 2", "capacity": 100},
                    {"name": "Hall 3", "capacity": 100},
                    {"name": "Hall 4", "capacity": 100},
                ]
            },
            {
                "name": "Illusion Cinema",
                "address": "Rayimbek Ave., 239, Almaty, Kazakhstan",
                "contact_number": "+7 727 227 3323",
                "halls": [
                    {"name": "Hall 1", "capacity": 80},
                    {"name": "Hall 2", "capacity": 80},
                    {"name": "Hall 3", "capacity": 80},
                ]
            },
            {
                "name": "Kinopark 4 Cinema",
                "address": "Abay Ave., 109, Almaty, Kazakhstan",
                "contact_number": "+7 727 356 1010",
                "halls": [
                    {"name": "Hall 1", "capacity": 100},
                    {"name": "Hall 2", "capacity": 100},
                    {"name": "Hall 3", "capacity": 100},
                    {"name": "Hall 4", "capacity": 100},
                ]
            },
        ]

        # Step 3: Populate CinemaTheaters and Halls if they don’t exist
        for data in cinema_data:
            cinema, created = CinemaTheater.objects.get_or_create(
                name=data["name"],
                defaults={
                    "address": data["address"],
                    "contact_number": data["contact_number"]
                }
            )
            for hall_data in data["halls"]:
                Hall.objects.get_or_create(
                    name=hall_data["name"],
                    cinema=cinema,
                    defaults={"capacity": hall_data["capacity"]}
                )

        # Fetch all films and cinemas
        films = Film.objects.all()
        if not films.exists():
            self.stdout.write(self.style.ERROR('No films found in the database. Please populate films first.'))
            return

        cinemas = CinemaTheater.objects.all()
        LANGUAGE_CHOICES = ['RU', 'EN', 'KK']  # Use 'KK' for Kazakh
        today = date.today()

        # Step 4: Populate MovieSessions for 3 days
        for day_offset in range(3):  # Today, tomorrow, day after tomorrow
            session_date = today + timedelta(days=day_offset)
            for cinema in cinemas:
                for hall in cinema.halls.all():
                    # Randomly choose 5-6 sessions per day
                    num_sessions = random.randint(5, 6)
                    used_times = set()  # Track used times to avoid overlap

                    for _ in range(num_sessions):
                        # Generate a random time between 12:00 and 00:00
                        hour = random.randint(12, 23)  # 12 PM to 11 PM
                        minute = random.choice([0, 15, 30, 45])  # Random minutes: 00, 15, 30, 45
                        session_time = time(hour, minute)

                        # Ensure no exact time overlap in the same hall
                        while (session_time.hour, session_time.minute) in used_times:
                            hour = random.randint(12, 23)
                            minute = random.choice([0, 15, 30, 45])
                            session_time = time(hour, minute)
                        used_times.add((session_time.hour, session_time.minute))

                        # Randomly select a film and language
                        film = random.choice(films)
                        language = random.choice(LANGUAGE_CHOICES)

                        # Create the MovieSession
                        MovieSession.objects.create(
                            film=film,
                            cinema=cinema,
                            hall=hall,
                            date=session_date,
                            time=session_time,
                            language=language,
                            available_seats=hall.capacity,
                            price_adult=2000,
                            price_student=1500,
                            price_child=1000,
                            price_adult_night=2500 if session_time.hour >= 18 else 2000,
                            price_student_night=2000 if session_time.hour >= 18 else 1500,
                            price_child_night=1500 if session_time.hour >= 18 else 1000
                        )

        self.stdout.write(self.style.SUCCESS('Successfully populated the database with movie sessions using existing cinema theaters and halls!'))