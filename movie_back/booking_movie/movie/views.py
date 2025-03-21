from rest_framework import viewsets, permissions, status, views, authentication
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from django.contrib.auth import authenticate, login, logout
from django.utils import timezone
from django.db.models import Q, OuterRef, Subquery
from django.contrib.auth import get_user_model
from collections import defaultdict
from .models import Film, MovieSession, Booking, Actor, CinemaTheater, Vote
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

# Get the custom User model
User = get_user_model()
from .serializers import MyTokenObtainPairSerializer
from rest_framework.permissions import AllowAny
from rest_framework import generics
from rest_framework_simplejwt.views import TokenObtainPairView


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

from django.db.models import F, ExpressionWrapper, FloatField, Case, When, Value, Count
from datetime import timedelta

from collections import defaultdict

class FilmViewSet(viewsets.ModelViewSet):
    queryset = Film.objects.all()
    serializer_class = FilmSerializer

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search films by name"""
        query = request.query_params.get('query', '')
        if query:
            films = Film.objects.filter(title__icontains=query)
            serializer = self.get_serializer(films, many=True)
            return Response(serializer.data)
        return Response([])

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.request.user.is_authenticated:
            # Add user's vote to context if it exists
            vote_subquery = Vote.objects.filter(
                user=self.request.user,
                film=OuterRef('pk')
            ).values('rating')[:1]
            context['user_vote'] = Subquery(vote_subquery)
        return context

    @action(detail=True, methods=['POST']) #permission_classes=[IsAuthenticated]
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

    @action(detail=True, methods=['DELETE']) #, permission_classes=[IsAuthenticated]
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
    permission_classes = [permissions.AllowAny]
    
    @action(detail=True, methods=['get'])
    def film_details(self, request, pk=None):
        try:
            # Get the film
            film = self.get_object()
            
            # Serialize film data
            film_data = self.serializer_class(
                film,
                context={'request': request}
            ).data
            
            # Get current date
            current_date = timezone.now().date()
            
            # Get movie sessions for the next 7 days
            end_date = current_date + timezone.timedelta(days=7)
            sessions = film.moviesession_set.filter(
                date__gte=current_date,
                date__lte=end_date
            ).select_related('cinema', 'hall')
            
            # Organize sessions by date
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
            
            # Convert defaultdict to regular dict for JSON serialization
            sessions_data = dict(sessions_by_date)
            
            # Combine film data with sessions
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
        
        # Calculate days since release for each movie
        days_since_release = ExpressionWrapper(
            current_date - F('release_date'),
            output_field=FloatField()
        )
        
        # Get movies released within the last 180 days or future releases
        six_months_ago = current_date - timedelta(days=180)
        films = Film.objects.filter(release_date__gte=six_months_ago)
        
        # Calculate popularity score based on multiple factors:
        # 1. Vote average (weighted by vote count)
        # 2. Recency of release (newer movies get higher scores)
        # 3. Number of bookings (indicates actual viewer interest)
        films = films.annotate(
            days_since_release=days_since_release,
            # Weight vote average by vote count (using Bayesian average)
            vote_weight=Case(
                When(vote_count__gt=0, then=F('vote_count') / (F('vote_count') + 100)),
                default=0,
                output_field=FloatField()
            ),
            weighted_vote=F('vote_average') * F('vote_weight'),
            # Recency score (higher for newer movies)
            recency_score=Case(
                # Future releases get high recency score
                When(release_date__gt=current_date, then=1.0),
                # Recent releases get score based on days since release
                default=1.0 - F('days_since_release') / 180.0,
                output_field=FloatField()
            ),
            # Calculate booking count
            booking_count=Count('moviesession__booking'),
            # Normalize booking count (0 to 1)
            booking_score=ExpressionWrapper(
                F('booking_count') / 100.0,  # Assuming 100 bookings is a lot
                output_field=FloatField()
            ),
            # Final popularity score
            popularity_score=(
                F('weighted_vote') * 0.4 +    # 40% weight to votes
                F('recency_score') * 0.4 +    # 40% weight to recency
                F('booking_score') * 0.2      # 20% weight to bookings
            )
        ).order_by('-popularity_score')[:20]  # Get top 20 most popular movies
        
        serialized_films = self.serializer_class(
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
        # Get films with release dates in the future
        films = Film.objects.filter(
            release_date__gt=current_date
        ).order_by('release_date')[:20]  # Limit to 20 upcoming movies
        
        serialized_films = self.serializer_class(
            films, 
            many=True, 
            context={'request': request}
        ).data
        
        # Get the date range for upcoming movies
        max_date = current_date + timezone.timedelta(days=90)  # Show movies up to 3 months ahead
        
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
        current_date = timezone.now().date()
        films = Film.objects.filter(
            moviesession__date__gte=current_date,
            moviesession__date__lte=current_date + timezone.timedelta(days=30)
        ).distinct()
        print(films)
        serialized_films = self.serializer_class(
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
        """Get all cinema theaters where the given film is being shown"""
        film = self.get_object()
        cinemas = CinemaTheater.objects.filter(moviesession__film=film).distinct()
        serializer = CinemaTheaterSerializer(cinemas, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def sessions(self, request, pk=None):
        """Get all movie sessions for a given film"""
        film = self.get_object()
        sessions = MovieSession.objects.filter(film=film)
        serializer = MovieSessionSerializer(sessions, many=True)
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
            import requests

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
