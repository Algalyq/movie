from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    UserViewSet, 
    ActorViewSet, 
    CinemaTheaterViewSet, 
    FilmViewSet, 
    MovieSessionViewSet, 
    BookingViewSet,
    TMDBMoviesView, MyObtainTokenPairView,RegisterView
)
from .auth import LoginView, LogoutView

# Create router and register viewset
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'actors', ActorViewSet)
router.register(r'theaters', CinemaTheaterViewSet)
router.register(r'films', FilmViewSet)
router.register(r'sessions', MovieSessionViewSet)
router.register(r'bookings', BookingViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('tmdb/popular/', TMDBMoviesView.as_view(), name='tmdb-popular'),
]
