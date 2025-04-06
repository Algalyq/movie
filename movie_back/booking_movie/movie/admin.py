from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Actor, CinemaTheater, Film, MovieSession, Booking, Hall, FilmTranslation

# Register CustomUserAdmin for User model
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'phone_number', 'date_of_birth', 'is_staff')
    search_fields = ('username', 'email', 'phone_number')
    list_filter = ('is_staff', 'is_active', 'date_joined')

# Register ActorAdmin for Actor model
@admin.register(Actor)
class ActorAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

# Register CinemaTheaterAdmin for CinemaTheater model
@admin.register(CinemaTheater)
class CinemaTheaterAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'contact_number')
    search_fields = ('name', 'address')

# Register HallAdmin for Hall model
@admin.register(Hall)
class HallAdmin(admin.ModelAdmin):
    list_display = ('name', 'cinema', 'capacity')
    list_filter = ('cinema',)
    search_fields = ('name', 'cinema__name')

# Register FilmAdmin for Film model
@admin.register(Film)
class FilmAdmin(admin.ModelAdmin):
    list_display = ('title', 'get_actors', 'release_date', 'poster_image', 'background_image')
    search_fields = ('translations__title', 'translations__overview')  # Search FilmTranslation fields
    list_filter = ('release_date', 'genres')
    filter_horizontal = ('actors',)
    list_display_links = ('title',)
    list_editable = ('release_date', 'poster_image', 'background_image')

    def get_actors(self, obj):
        return ", ".join(actor.name for actor in obj.actors.all())
    get_actors.short_description = "Actors"

    def title(self, obj):
        # Display the title in the current language
        from django.utils.translation import get_language
        translation = obj.get_translation(get_language())
        print(translation)
        return translation.title if translation else "No Title"
    title.short_description = "Title"
# Register MovieSessionAdmin for MovieSession model
@admin.register(MovieSession)
class MovieSessionAdmin(admin.ModelAdmin):
    list_display = ('film', 'cinema', 'hall', 'date', 'time', 'language', 'available_seats')
    list_filter = ('date', 'cinema', 'language', 'hall')
    search_fields = ('film__title', 'cinema__name', 'hall__name')

# Register BookingAdmin for Booking model
@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'session', 'seats', 'booking_time', 'status', 'total_price')
    list_filter = ('status', 'booking_time')
    search_fields = ('user__username', 'session__film__title')

# Register FilmTranslationAdmin for FilmTranslation model
@admin.register(FilmTranslation)
class FilmTranslationAdmin(admin.ModelAdmin):
    list_display = ('film', 'language_code', 'title', 'overview')  # Changed 'language' to 'language_code' to match your model
