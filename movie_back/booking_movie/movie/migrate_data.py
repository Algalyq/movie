from .models import Film, FilmTranslation, Actor

def populate_sample_data():
    # 1. Create multiple actors
    actors_data = [
        {"name": "Tom Hanks", "bio": "Famous Hollywood actor known for dramatic roles."},
        {"name": "Natalie Portman", "bio": "Acclaimed actress and film producer."},
        {"name": "Leonardo DiCaprio", "bio": "Renowned actor for intense performances."},
    ]

    actors = []
    for actor_data in actors_data:
        actor = Actor(name=actor_data["name"], bio=actor_data["bio"])
        actors.append(actor)
    Actor.objects.bulk_create(actors)

    # Fetch all actors to use their IDs later
    all_actors = Actor.objects.all()

    # 2. Create multiple films with translations
    films_data = [
        {
            "release_date": "1994-09-23",
            "runtime": 142,
            "vote_average": 9.3,
            "vote_count": 2500,
            "translations": [
                {
                    "language_code": "en",
                    "title": "The Shawshank Redemption",
                    "overview": "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
                    "tagline": "Fear can hold you prisoner. Hope can set you free."
                },
                {
                    "language_code": "ru",
                    "title": "Побег из Шоушенка",
                    "overview": "Два заключенных сближаются на протяжении многих лет, находя утешение и, наконец, искупление через акты обычной порядочности.",
                    "tagline": "Страх может держать тебя в плену. Надежда может освободить."
                },
                {
                    "language_code": "kz",
                    "title": "Шоушенктен қашу",
                    "overview": "Екі тұтқын көп жылдар бойы жақын болады, ортақ әділдік арқылы тыныштық пен соңында құтқарылуды табады.",
                    "tagline": "Қорқыныш сізді тұтқында ұстауы мүмкін. Үміт сізді босатуы мүмкін."
                },
            ],
            "actor_ids": [all_actors[0].id]  # Associate with Tom Hanks
        },
        {
            "release_date": "2010-07-16",
            "runtime": 148,
            "vote_average": 8.8,
            "vote_count": 1800,
            "translations": [
                {
                    "language_code": "en",
                    "title": "Inception",
                    "overview": "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
                    "tagline": "Your mind is the scene of the crime."
                },
                {
                    "language_code": "ru",
                    "title": "Начало",
                    "overview": "Вор, крадущий корпоративные тайны с помощью технологии совместных снов, получает обратную задачу: внедрить идею в разум гендиректора.",
                    "tagline": "Твой разум — место преступления."
                },
                {
                    "language_code": "kz",
                    "title": "Бастама",
                    "overview": "Технология арқылы корпоративтік құпияларды ұрлайтын ұрыға бас директордың ойына идея егу міндеті беріледі.",
                    "tagline": "Сіздің ойыңыз — қылмыстың орны."
                },
            ],
            "actor_ids": [all_actors[0].id, all_actors[1].id]  # Associate with Tom Hanks and Natalie Portman
        },
    ]

    # 3. Create films and their translations
    films = []
    for film_data in films_data:
        film = Film(
            release_date=film_data["release_date"],
            runtime=film_data["runtime"],
            vote_average=film_data["vote_average"],
            vote_count=film_data["vote_count"]
        )
        films.append(film)

    Film.objects.bulk_create(films)

    # Fetch all films to associate translations and actors
    all_films = Film.objects.all()

    # Create translations for each film
    for idx, film_data in enumerate(films_data):
        film = all_films[idx]
        translations = [
            FilmTranslation(
                film=film,
                language_code=trans["language_code"],
                title=trans["title"],
                overview=trans["overview"],
                tagline=trans["tagline"]
            )
            for trans in film_data["translations"]
        ]
        FilmTranslation.objects.bulk_create(translations)

        # Associate actors
        actor_instances = Actor.objects.filter(id__in=film_data["actor_ids"])
        film.actors.set(actor_instances)

    print("Successfully populated the database with multiple actors, films, and translations!")

# Run the function
if __name__ == "__main__":
    populate_sample_data()