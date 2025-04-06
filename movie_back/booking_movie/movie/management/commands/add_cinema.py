from django.core.management.base import BaseCommand
from movie.models import CinemaTheater, Hall

class Command(BaseCommand):
    help = 'Populates the database with sample data for cinema theaters and halls in Almaty'

    def handle(self, *args, **options):
        # Clear existing data (optional)
        Hall.objects.all().delete()
        CinemaTheater.objects.all().delete()

        # Sample data for cinema theaters and halls
        cinemas_data = [
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

        # Clear existing data (optional)
        Hall.objects.all().delete()
        CinemaTheater.objects.all().delete()

        # Create cinema theaters and associated halls
        for theater_data in cinemas_data:
            theater = CinemaTheater.objects.create(
                name=theater_data["name"],
                address=theater_data["address"],
                contact_number=theater_data["contact_number"],
            )
            for hall_data in theater_data["halls"]:
                Hall.objects.create(
                    name=hall_data["name"],
                    capacity=hall_data["capacity"],
                    cinema=theater,
                )

        self.stdout.write(self.style.SUCCESS('Successfully added cinema theaters and halls in Almaty'))
