from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Populates the database with sample data'

    def handle(self, *args, **options):
        populate_sample_data()
        self.stdout.write(self.style.SUCCESS('Successfully populated the database!'))