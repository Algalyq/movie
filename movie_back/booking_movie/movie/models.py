from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator

class User(AbstractUser):
    phone_number = models.CharField(max_length=15, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)

class Actor(models.Model):
    name = models.CharField(max_length=100)
    photo = models.ImageField(upload_to='actors/', null=True, blank=True)
    bio = models.TextField(blank=True)

    def __str__(self):
        return self.name

class CinemaTheater(models.Model):
    name = models.CharField(max_length=100)
    address = models.TextField()
    contact_number = models.CharField(max_length=15)

    def __str__(self):
        return self.name

class Hall(models.Model):
    name = models.CharField(max_length=50)  # e.g., 'Hall 1', 'IMAX Hall'
    cinema = models.ForeignKey(CinemaTheater, on_delete=models.CASCADE, related_name='halls')
    capacity = models.IntegerField()
    
    def __str__(self):
        return f"{self.cinema.name} - {self.name}"

class Film(models.Model):
    title = models.CharField(max_length=200)
    overview = models.TextField()
    release_date = models.DateField()
    runtime = models.IntegerField() 
    poster_image = models.ImageField(upload_to='posters/')
    background_image = models.ImageField(upload_to='backgrounds/')
    tagline = models.CharField(max_length=200, blank=True)
    genres = models.JSONField(default=list) 
    actors = models.ManyToManyField(Actor, related_name='films')
    vote_average = models.FloatField(default=0.0, validators=[MinValueValidator(0.0), MaxValueValidator(10.0)])
    vote_count = models.IntegerField(default=0)
    
    def update_rating(self):
        """Update the film's rating based on all votes"""
        votes = self.votes.all()
        if votes:
            total_rating = sum(vote.rating for vote in votes)
            self.vote_count = len(votes)
            self.vote_average = round(total_rating / self.vote_count, 1)
        else:
            self.vote_count = 0
            self.vote_average = 0.0
        self.save()

    def __str__(self):
        return self.title

class Vote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='votes')
    film = models.ForeignKey(Film, on_delete=models.CASCADE, related_name='votes')
    rating = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(10.0)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'film')  # One vote per user per film

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.film.update_rating()  # Update film rating when vote is saved

    def delete(self, *args, **kwargs):
        film = self.film  # Store reference before deletion
        super().delete(*args, **kwargs)
        film.update_rating()  # Update film rating when vote is deleted

class MovieSession(models.Model):
    LANGUAGE_CHOICES = [
        ('RU', 'Russian'),
        ('EN', 'English'),
        ('KZ', 'Kazakh'),
    ]
    
    film = models.ForeignKey(Film, on_delete=models.CASCADE)
    cinema = models.ForeignKey(CinemaTheater, on_delete=models.CASCADE)
    hall = models.ForeignKey(Hall, on_delete=models.CASCADE, null=True)
    date = models.DateField()
    time = models.TimeField()
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='RU', null=True)
    available_seats = models.IntegerField()
    
    # Price categories
    price_adult = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    price_student = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    price_child = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    
    # Night time prices (after 6 PM)
    price_adult_night = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    price_student_night = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    price_child_night = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    
    def get_prices(self):
        """Return different price categories based on time"""
        is_night = self.time.hour >= 18  # After 6 PM is night time
        
        # Default prices if not set
        default_prices = {
            'adult': 2000,
            'student': 1000,
            'child': 800
        }
        
        if is_night:
            if all([self.price_adult_night, self.price_student_night, self.price_child_night]):
                return {
                    'adult': float(self.price_adult_night),
                    'student': float(self.price_student_night),
                    'child': float(self.price_child_night)
                }
            # Default night prices (25% more)
            return {
                'adult': default_prices['adult'] * 1.25,
                'student': default_prices['student'] * 1.25,
                'child': default_prices['child'] * 1.25
            }
            
        if all([self.price_adult, self.price_student, self.price_child]):
            return {
                'adult': float(self.price_adult),
                'student': float(self.price_student),
                'child': float(self.price_child)
            }
        return default_prices
    
    class Meta:
        ordering = ['date', 'time']
    

class Booking(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session = models.ForeignKey(MovieSession, on_delete=models.CASCADE)
    seats = models.JSONField(default=list)  # Store seat details as JSON
    booking_time = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.user.username} - {self.session.film.title}"
