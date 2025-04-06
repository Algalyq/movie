from rest_framework import viewsets, permissions, status, views, authentication
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view
from rest_framework.authtoken.views import ObtainAuthToken
from django.contrib.auth import authenticate, login, logout
from django.utils import timezone
from django.db.models import OuterRef, Subquery, F, Count, Case, When, ExpressionWrapper, FloatField
from django.utils.translation import get_language
from django.contrib.auth import get_user_model
from collections import defaultdict
from .models import Film, MovieSession, Booking, Actor, CinemaTheater, Vote,FilmTranslation
from .serializers import (
    FilmSerializer, 
    MovieSessionSerializer, 
    BookingSerializer, 
    UserSerializer, 
    ActorSerializer, 
    CinemaTheaterSerializer,
    RegisterSerializer
)
from datetime import datetime
from bs4 import BeautifulSoup as SOUP
import requests as HTTP
import re
# Get the custom User model
User = get_user_model()
from .serializers import MyTokenObtainPairSerializer
from rest_framework.permissions import AllowAny
from rest_framework import generics
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication


TMDB_API_KEY = '3e1dcc4470d1875a881cc93cf37d3f92'  # Replace with your actual TMDB API key
TMDB_BASE_URL = 'https://api.themoviedb.org/3/discover/movie'


# Emotion-to-Genre Mapping (Map emotions to movie genres)
EMOTION_TO_GENRE = {
    "Sad": 18,  # Drama
    "Disgust": 27,  # Horror
    "Anger": 28,  # Action
    "Anticipation": 53,  # Thriller
    "Fear": 27,  # Horror
    "Enjoyment": 35,  # Comedy
    "Trust": 12,  # Adventure
    "Surprise": 9648,  # Mystery
}

def fetch_movies_from_tmdb(genre_id, language="en-US"):
    """Fetch movies from TMDB API based on genre with specified language."""
    url = f"{TMDB_BASE_URL}?api_key={TMDB_API_KEY}&with_genres={genre_id}&sort_by=popularity.desc&page=1&language={language}"
    # Rest of your code to make the API request and process the response would go here
    # For example:
    try:
        response = HTTP.get(url)
        response.raise_for_status()  # Raise an error for invalid responses
        data = response.json()
        movie_titles = [movie['title'] for movie in data['results'][:10]]  # Get top 10 movies
        return movie_titles
    except HTTP.exceptions.RequestException as e:
        return []

# API View to handle emotion input and return movie recommendations
@api_view(['GET'])
def recommend_movies(request):
    print("Headers:", request.headers)  # Check the headers to see if the token is passed correctly
    emotion = request.query_params.get('emotion', None)
    language = request.query_params.get('language',None)
    print("Emotion:", emotion)

    if not emotion:
        return Response({"error": "Emotion parameter is required"}, status=400)

    genre_id = EMOTION_TO_GENRE.get(emotion)
    print("Genre ID:", genre_id)

    if not genre_id:
        return Response({"error": f"No genre found for the emotion: {emotion}"}, status=404)

    movies = fetch_movies_from_tmdb(genre_id,language)
    if not movies:
        return Response({"error": "No movie recommendations found for the given emotion"}, status=404)

    return Response(movies)


class MyObtainTokenPairView(TokenObtainPairView):
    permission_classes = (AllowAny,)
    serializer_class = MyTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer


class CustomBearerAuthentication(authentication.TokenAuthentication):
    keyword = 'Bearer'

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return super().get_permissions()

class ActorViewSet(viewsets.ModelViewSet):
    queryset = Actor.objects.all()
    serializer_class = ActorSerializer
    permission_classes = [permissions.AllowAny]

class CinemaTheaterViewSet(viewsets.ModelViewSet):
    queryset = CinemaTheater.objects.all()
    serializer_class = CinemaTheaterSerializer
    permission_classes = [permissions.AllowAny]


class FilmViewSet(viewsets.ModelViewSet):
    queryset = Film.objects.all()
    serializer_class = FilmSerializer
    permission_classes = [permissions.AllowAny]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.request.user.is_authenticated:
            vote_subquery = Vote.objects.filter(
                user=self.request.user,
                film=OuterRef('pk')
            ).values('rating')[:1]
            context['user_vote'] = Subquery(vote_subquery)
        return context

    @action(detail=False, methods=['get'])
    def recommend(self,request):
        print("Headers:", request.headers)  # Check the headers to see if the token is passed correctly
        emotion = request.query_params.get('emotion', None)
        print("Emotion:", emotion)

        if not emotion:
            return Response({"error": "Emotion parameter is required"}, status=400)

        genre_id = EMOTION_TO_GENRE.get(emotion)
        print("Genre ID:", genre_id)

        if not genre_id:
            return Response({"error": f"No genre found for the emotion: {emotion}"}, status=404)

        movies = fetch_movies_from_tmdb(genre_id)
        if not movies:
            return Response({"error": "No movie recommendations found for the given emotion"}, status=404)

        return Response(movies)


    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search films by name, including translations"""
        query = request.query_params.get('query', '').strip()
        
        if not query:
            return Response([])

        # Get the current language from the request
        language_code = get_language() or 'en'  # Default to English if not set

        # Search across FilmTranslation titles for the current language
        matching_translations = FilmTranslation.objects.filter(
            title__icontains=query,
            language_code=language_code
        )

        # Get unique film IDs from matching translations
        film_ids = matching_translations.values_list('film_id', flat=True).distinct()

        # Fetch the corresponding Film objects
        films = Film.objects.filter(id__in=film_ids)

        # If no matches in the current language, optionally search English as fallback
        if not films.exists() and language_code != 'en':
            matching_translations = FilmTranslation.objects.filter(
                title__icontains=query,
                language_code='en'
            )
            film_ids = matching_translations.values_list('film_id', flat=True).distinct()
            films = Film.objects.filter(id__in=film_ids)

        # Serialize the films with the request context
        serializer = self.get_serializer(films, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['POST'])
    def vote(self, request, pk=None):
        """Vote for a film or update existing vote"""
        film = self.get_object()
        rating = request.data.get('rating')

        if not isinstance(rating, (int, float)) or not (0 <= rating <= 10):
            return Response(
                {'error': 'Rating must be a number between 0 and 10'},
                status=status.HTTP_400_BAD_REQUEST
            )

        vote, created = Vote.objects.update_or_create(
            user=request.user,
            film=film,
            defaults={'rating': rating}
        )

        return Response({
            'rating': rating,
            'vote_average': film.vote_average,
            'vote_count': film.vote_count
        })

    @action(detail=True, methods=['DELETE'])
    def remove_vote(self, request, pk=None):
        """Remove user's vote for a film"""
        film = self.get_object()
        try:
            vote = Vote.objects.get(user=request.user, film=film)
            vote.delete()
            return Response({
                'vote_average': film.vote_average,
                'vote_count': film.vote_count
            })
        except Vote.DoesNotExist:
            return Response(
                {'error': 'Vote not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'])
    def film_details(self, request, pk=None):
        try:
            film = self.get_object()
            film_data = self.get_serializer(film, context={'request': request}).data
            
            current_date = timezone.now().date()
            end_date = current_date + timezone.timedelta(days=7)
            sessions = film.moviesession_set.filter(
                date__gte=current_date,
                date__lte=end_date
            ).select_related('cinema', 'hall')
            
            sessions_by_date = defaultdict(list)
            for session in sessions:
                prices = session.get_prices()
                sessions_by_date[session.date.isoformat()].append({
                    'id': session.id,
                    'time': session.time.strftime('%H:%M'),
                    'cinema': session.cinema.name,
                    'cinema_id': session.cinema.id,
                    'hall': session.hall.name,
                    'hall_id': session.hall.id,
                    'language': session.get_language_display(),
                    'language_code': session.language,
                    'prices': prices,
                    'available_seats': session.available_seats
                })
            
            sessions_data = dict(sessions_by_date)
            
            response_data = {
                'film': film_data,
                'sessions': sessions_data,
                'dates': {
                    'minimum': current_date.isoformat(),
                    'maximum': end_date.isoformat()
                }
            }
            
            return Response(response_data)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def popular_movies(self, request):
        current_date = timezone.now().date()
        days_since_release = ExpressionWrapper(
            current_date - F('release_date'),
            output_field=FloatField()
        )
        
        six_months_ago = current_date - timezone.timedelta(days=30)
        films = Film.objects.filter(release_date__gte=six_months_ago)
        
        films = films.annotate(
            days_since_release=days_since_release,
            vote_weight=Case(
                When(vote_count__gt=0, then=F('vote_count') / (F('vote_count') + 100)),
                default=0,
                output_field=FloatField()
            ),
            weighted_vote=F('vote_average') * F('vote_weight'),
            recency_score=Case(
                When(release_date__gt=current_date, then=1.0),
                default=1.0 - F('days_since_release') / 30.0,
                output_field=FloatField()
            ),
            booking_count=Count('moviesession__booking'),
            booking_score=ExpressionWrapper(
                F('booking_count') / 100.0,
                output_field=FloatField()
            ),
            popularity_score=(
                F('weighted_vote') * 0.4 +
                F('recency_score') * 0.4 +
                F('booking_score') * 0.2
            )
        ).order_by('-popularity_score')[:20]
        
        serialized_films = self.get_serializer(
            films, 
            many=True, 
            context={'request': request}
        ).data
        
        response_data = {
            "page": 1,
            "results": serialized_films
        }
        return Response(response_data)

    @action(detail=False, methods=['get'])
    def upcoming_movies(self, request):
        current_date = timezone.now().date()
        films = Film.objects.filter(
            release_date__gt=current_date
        ).order_by('release_date')[:20]
        
        serialized_films = self.get_serializer(
            films, 
            many=True, 
            context={'request': request}
        ).data
        
        max_date = current_date + timezone.timedelta(days=90)
        
        response_data = {
            "dates": {
                "maximum": max_date.isoformat(),
                "minimum": current_date.isoformat()
            },
            "page": 1,
            "results": serialized_films
        }
        return Response(response_data)

    @action(detail=False, methods=['get'])
    def now_playing_movies(self, request):
        print(get_language())
        current_date = timezone.now().date()
        films = Film.objects.filter(
            moviesession__date__gte=current_date,
            moviesession__date__lte=current_date + timezone.timedelta(days=30)
        ).distinct()
        
        serialized_films = self.get_serializer(
            films, 
            many=True, 
            context={'request': request}
        ).data
        
        response_data = {
            "dates": {
                "maximum": (current_date + timezone.timedelta(days=30)).isoformat(),
                "minimum": current_date.isoformat()
            },
            "page": 1,
            "results": serialized_films
        }
        return Response(response_data)

    @action(detail=True, methods=['get'])
    def cinema_theaters(self, request, pk=None):
        film = self.get_object()
        cinemas = CinemaTheater.objects.filter(moviesession__film=film).distinct()
        serializer = CinemaTheaterSerializer(cinemas, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def sessions(self, request, pk=None):
        film = self.get_object()
        sessions = MovieSession.objects.filter(film=film)
        serializer = MovieSessionSerializer(sessions, many=True, context={'request': request})
        return Response(serializer.data)

class MovieSessionViewSet(viewsets.ModelViewSet):
    queryset = MovieSession.objects.all()
    serializer_class = MovieSessionSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        """Optionally filter sessions by various parameters"""
        queryset = MovieSession.objects.all()
        film_id = self.request.query_params.get('film_id', None)
        cinema_id = self.request.query_params.get('cinema_id', None)
        date = self.request.query_params.get('date', None)

        if film_id:
            queryset = queryset.filter(film_id=film_id)
        if cinema_id:
            queryset = queryset.filter(cinema_id=cinema_id)
        if date:
            queryset = queryset.filter(date=date)

        return queryset

    @action(detail=True, methods=['POST'])
    def book_session(self, request, pk=None):
        """Book a movie session"""
        session = self.get_object()
        seats_requested = request.data.get('seats', 1)

        if session.available_seats < seats_requested:
            return Response(
                {'error': 'Not enough seats available'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        booking = Booking.objects.create(
            user=request.user,
            session=session,
            seats=seats_requested,
            total_price=session.price * seats_requested,
            status='CONFIRMED'
        )

        session.available_seats -= seats_requested
        session.save()

        serializer = BookingSerializer(booking)
        return Response(serializer.data)

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CustomBearerAuthentication]

    def get_queryset(self):
        """Return bookings for the current user"""
        return Booking.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """Create a booking with seat details"""
        # Get the session and validate it exists
        try:
            session = MovieSession.objects.get(pk=request.data.get('session_id'))
        except MovieSession.DoesNotExist:
            return Response(
                {'detail': 'Session not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Validate seats data
        seats_data = request.data.get('seats', [])
        if not seats_data:
            return Response(
                {'detail': 'No seats provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create booking with seat details
        booking_data = {
            'user': request.user,
            'session': session,
            'seats': seats_data,  # Store the complete seat details
            'total_price': request.data.get('total_price'),
            'status': 'CONFIRMED'
        }

        # Update available seats in session
        session.available_seats -= len(seats_data)
        if session.available_seats < 0:
            return Response(
                {'detail': 'Not enough seats available'},
                status=status.HTTP_400_BAD_REQUEST
            )
        session.save()

        # Create and save the booking
        booking = Booking.objects.create(**booking_data)
        serializer = self.get_serializer(booking)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['GET'])
    def active_bookings(self, request):
        """Get user's active bookings"""
        current_date = timezone.now().date()
        bookings = Booking.objects.filter(
            user=request.user,
            session__date__gte=current_date,
            status='CONFIRMED'
        )
        serializer = self.serializer_class(bookings, many=True)
        return Response(serializer.data)


class TMDBMoviesView(views.APIView):
    """View for fetching movies from TMDB API"""
    permission_classes = [permissions.AllowAny]

    TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzZTFkY2M0NDcwZDE4NzVhODgxY2M5M2NmMzdkM2Y5MiIsIm5iZiI6MTc0MjUzNzQ2NS4zMTMsInN1YiI6IjY3ZGQwMmY5MDQxNjg3NWFkYzY5NzgyNyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.UTQZa_iQj8c1kTtahb1R1RnDv4xhTk_tmsEmSfhcl7I'
    
    def get(self, request):
        """Get popular movies from TMDB"""
        try:
            

            url = 'https://api.themoviedb.org/3/movie/popular'
            headers = {
                'Authorization': f'Bearer {self.TMDB_TOKEN}',
                'accept': 'application/json'
            }
            params = {
                'language': request.GET.get('language', 'kz-KZ')
            }

            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()

            return Response(response.json())
        except requests.RequestException as e:
            return Response(
                {'error': f'TMDB API error: {str(e)}'}, 
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
