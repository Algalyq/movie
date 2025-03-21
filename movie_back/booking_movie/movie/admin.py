from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Actor, CinemaTheater, Film, MovieSession, Booking, Hall

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'phone_number', 'date_of_birth', 'is_staff')
    search_fields = ('username', 'email', 'phone_number')
    list_filter = ('is_staff', 'is_active', 'date_joined')

@admin.register(Actor)
class ActorAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(CinemaTheater)
class CinemaTheaterAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'contact_number')
    search_fields = ('name', 'address')

@admin.register(Hall)
class HallAdmin(admin.ModelAdmin):
    list_display = ('name', 'cinema', 'capacity')
    list_filter = ('cinema',)
    search_fields = ('name', 'cinema__name')

@admin.register(Film)
class FilmAdmin(admin.ModelAdmin):
    list_display = ('title', 'release_date', 'runtime', 'vote_average')
    search_fields = ('title', 'overview')
    list_filter = ('release_date', 'genres')
    filter_horizontal = ('actors',)

@admin.register(MovieSession)
class MovieSessionAdmin(admin.ModelAdmin):
    list_display = ('film', 'cinema', 'hall', 'date', 'time', 'language', 'available_seats')
    list_filter = ('date', 'cinema', 'language', 'hall')
    search_fields = ('film__title', 'cinema__name', 'hall__name')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'session', 'seats', 'booking_time', 'status', 'total_price')
    list_filter = ('status', 'booking_time')
    search_fields = ('user__username', 'session__film__title')
