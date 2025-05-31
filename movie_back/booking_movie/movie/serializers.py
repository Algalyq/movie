from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Actor, CinemaTheater, Film, MovieSession, Booking, EmotionRecognition
from django.utils.translation import get_language
User = get_user_model()


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        return token

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'date_of_birth')
        read_only_fields = ('id',)

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
            required=True,
            validators=[UniqueValidator(queryset=User.objects.all())]
            )

    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email']
        )

        
        user.set_password(validated_data['password'])
        user.save()

        return user


class ActorSerializer(serializers.ModelSerializer):
    photo = serializers.SerializerMethodField()

    def get_photo(self, obj):
        if obj.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo.url)
        return None

    class Meta:
        model = Actor
        fields = '__all__'

class CinemaTheaterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CinemaTheater
        fields = '__all__'


class FilmSerializer(serializers.ModelSerializer):
    actors = ActorSerializer(many=True, read_only=True)
    poster_image = serializers.SerializerMethodField()
    background_image = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    overview = serializers.SerializerMethodField()
    tagline = serializers.SerializerMethodField()

    def get_title(self, obj):
        request = self.context.get('request')
        language_code = get_language() if request else 'en'
        translation = obj.get_translation(language_code)
        return translation.title if translation else obj.title

    def get_overview(self, obj):
        request = self.context.get('request')
        language_code = get_language() if request else 'en'
        translation = obj.get_translation(language_code)
        return translation.overview if translation else ""

    def get_tagline(self, obj):
        request = self.context.get('request')
        language_code = get_language() if request else 'en'
        translation = obj.get_translation(language_code)
        return translation.tagline if translation else ""

    def get_poster_image(self, obj):
        if obj.poster_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.poster_image.url)
        return None

    def get_background_image(self, obj):
        if obj.background_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.background_image.url)
        return None

    class Meta:
        model = Film
        fields = '__all__' 

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return data

class MovieSessionSerializer(serializers.ModelSerializer):
    film = FilmSerializer(read_only=True)
    cinema = CinemaTheaterSerializer(read_only=True)
    film_id = serializers.IntegerField(write_only=True)
    cinema_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = MovieSession
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    session = MovieSessionSerializer(read_only=True)
    session_id = serializers.IntegerField(write_only=True)
    seats = serializers.JSONField()  # Allow JSON data for seats
    active = serializers.SerializerMethodField()

    def get_active(self, obj):
        # Get current date and time
        from django.utils import timezone
        now = timezone.localtime()
        session_datetime = timezone.make_aware(
            timezone.datetime.combine(obj.session.date, obj.session.time)
        )
        return obj.status == 'CONFIRMED' and session_datetime > now

    class Meta:
        model = Booking
        fields = ('id', 'user', 'session', 'session_id', 'seats', 'booking_time', 'status', 'total_price', 'active')
        read_only_fields = ('booking_time', 'total_price')


class EmotionRecognitionSerializer(serializers.ModelSerializer):
    image = serializers.ImageField()
    result = serializers.JSONField(read_only=True)
    
    class Meta:
        model = EmotionRecognition
        fields = ('id', 'image', 'result', 'created_at', 'user')
        read_only_fields = ('created_at', 'result', 'user')
