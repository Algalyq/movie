from django.core.management.base import BaseCommand
from movie.models import Film, FilmTranslation, Actor

class Command(BaseCommand):
    help = 'Populates the database with sample data for actors, films, and translations'

    def handle(self, *args, **options):
        # Step 4: Clear existing data (optional)
        Actor.objects.all().delete()
        Film.objects.all().delete()
        FilmTranslation.objects.all().delete()

        # Step 5: Define sample data
        actors_data = [
            {"name": "Tom Hanks", "bio": "Famous Hollywood actor known for dramatic roles."},
            {"name": "Natalie Portman", "bio": "Acclaimed actress and film producer."},
            {"name": "Leonardo DiCaprio", "bio": "Renowned actor for intense performances."},
            {"name": "Brad Pitt", "bio": "Iconic actor known for versatile roles."},
            {"name": "Morgan Freeman", "bio": "Veteran actor with a distinctive voice."},
            {"name": "Christian Bale", "bio": "Known for transformative roles."},
            {"name": "Scarlett Johansson", "bio": "Versatile actress in action and drama."},
            {"name": "Robert Downey Jr.", "bio": "Famous for Iron Man and Sherlock Holmes."},
            {"name": "Anne Hathaway", "bio": "Award-winning actress in various genres."},
            {"name": "Matt Damon", "bio": "Actor known for action and dramatic roles."},
            {"name": "Keanu Reeves", "bio": "Beloved actor in action and sci-fi films."},
            {"name": "Sandra Bullock", "bio": "Popular actress in comedy and drama."},
        ]


    # Step 6: Create actors
        actors = [Actor(name=data["name"], bio=data["bio"]) for data in actors_data]
        Actor.objects.bulk_create(actors)

        all_actors = list(Actor.objects.all())
        films_data = [
    {
        "release_date": "1994-09-23",
        "runtime": 142,
        "vote_average": 9.3,
        "vote_count": 2500,
        "poster_image": "https://www.impawards.com/1994/posters/shawshank_redemption_ver1.jpg",
        "background_image": "https://wallpapercat.com/the-shawshank-redemption-wallpapers/1.jpg",
        "translations": [
            {
                "language_code": "en",
                "title": "The Shawshank Redemption",
                "overview": "Two imprisoned men bond over years, finding solace and redemption.",
                "tagline": "Fear can hold you prisoner. Hope can set you free."
            },
            {
                "language_code": "ru",
                "title": "Побег из Шоушенка",
                "overview": "Два заключенных сближаются, находя утешение и искупление.",
                "tagline": "Страх может держать тебя в плену. Надежда может освободить."
            },
            {
                "language_code": "kk",
                "title": "Шоушенктен қашу",
                "overview": "Екі тұтқын жақын болады, тыныштық пен құтқарылуды табады.",
                "tagline": "Қорқыныш сізді тұтқында ұстауы мүмкін. Үміт босатуы мүмкін."
            }
        ],
        "actor_ids": [all_actors[0].id, all_actors[4].id]
    },
    {
        "release_date": "2010-07-16",
        "runtime": 148,
        "vote_average": 8.8,
        "vote_count": 1800,
        "poster_image": "https://www.amazon.com/inception-movie-poster/dp/B0047O2M5Q",
        "background_image": "https://wallpapercat.com/inception-wallpapers/1.jpg",
        "translations": [
            {
                "language_code": "en",
                "title": "Inception",
                "overview": "A thief plants an idea into a CEO’s mind using dream technology.",
                "tagline": "Your mind is the scene of the crime."
            },
            {
                "language_code": "ru",
                "title": "Начало",
                "overview": "Вор внедряет идею в разум гендиректора с помощью снов.",
                "tagline": "Твой разум — место преступления."
            },
            {
                "language_code": "kk",
                "title": "Бастама",
                "overview": "Ұры бас директордың ойына идея егеді.",
                "tagline": "Сіздің ойыңыз — қылмыстың орны."
            }
        ],
        "actor_ids": [all_actors[2].id, all_actors[3].id]
    },
    {
        "release_date": "1999-10-15",
        "runtime": 139,
        "vote_average": 8.8,
        "vote_count": 2200,
        "poster_image": "https://www.amazon.com/fight-club-poster/dp/B00005JLT9",
        "background_image": "https://wallpapercat.com/fight-club-wallpapers/1.jpg",
        "translations": [
            {
                "language_code": "en",
                "title": "Fight Club",
                "overview": "An insomniac and a soap maker form an underground fight club.",
                "tagline": "Mischief. Mayhem. Soap."
            },
            {
                "language_code": "ru",
                "title": "Бойцовский клуб",
                "overview": "Бессонный работник и мыловар создают бойцовский клуб.",
                "tagline": "Шалость. Хаос. Мыло."
            },
            {
                "language_code": "kk",
                "title": "Жекпе-жек клубы",
                "overview": "Ұйқысыздықтан зардап шегетін қызметкер клуб құрады.",
                "tagline": "Бұзақылық. Тәртіпсіздік. Сабын."
            }
        ],
        "actor_ids": [all_actors[5].id, all_actors[6].id]
    },
    {
        "release_date": "2008-07-18",
        "runtime": 152,
        "vote_average": 9.0,
        "vote_count": 2800,
        "poster_image": "https://www.allposters.com/-st/Dark-Knight-Posters_c103519_.htm",
        "background_image": "https://wallpapercat.com/the-dark-knight-wallpapers/1.jpg",
        "translations": [
            {
                "language_code": "en",
                "title": "The Dark Knight",
                "overview": "Batman faces the Joker in a battle for Gotham’s soul.",
                "tagline": "Why so serious?"
            },
            {
                "language_code": "ru",
                "title": "Темный рыцарь",
                "overview": "Бэтмен сталкивается с Джокером за душу Готэма.",
                "tagline": "Почему так серьезно?"
            },
            {
                "language_code": "kk",
                "title": "Қараңғы рыцарь",
                "overview": "Бэтмен Джокермен Готэмнің жаны үшін күреседі.",
                "tagline": "Неге сонша байсалды?"
            }
        ],
        "actor_ids": [all_actors[7].id]
    },
    {
        "release_date": "2012-11-02",
        "runtime": 143,
        "vote_average": 8.4,
        "vote_count": 1900,
        "poster_image": "https://www.impawards.com/2012/skyfall_ver11.html",
        "background_image": "https://wallpapersden.com/skyfall-5k-movie-wallpaper/2560x1600/",
        "translations": [
            {
                "language_code": "en",
                "title": "Skyfall",
                "overview": "James Bond's loyalty to M is tested as her past comes back to haunt her.",
                "tagline": "Think on your sins."
            },
            {
                "language_code": "ru",
                "title": "007: Координаты «Скайфолл»",
                "overview": "Лояльность Бонда к М подвергается испытанию, когда её прошлое возвращается, чтобы преследовать её.",
                "tagline": "Подумай о своих грехах."
            },
            {
                "language_code": "kk",
                "title": "Скайфолл",
                "overview": "Джеймс Бондтың М-ге деген адалдығы оның өткенінің қайта оралуымен сыналады.",
                "tagline": "Күнәларың туралы ойлан."
            }
        ],
        "actor_ids": [all_actors[6].id]
    },
    {
        "release_date": "2019-10-11",
        "runtime": 122,
        "vote_average": 8.2,
        "vote_count": 1700,
        "poster_image": "https://www.impawards.com/2019/joker_ver3_xlg.html",
        "background_image": "https://wall.alphacoders.com/big.php?i=1034301",
        "translations": [
            {
                "language_code": "en",
                "title": "Joker",
                "overview": "A mentally troubled stand-up comedian embarks on a downward spiral that leads to the creation of an iconic villain.",
                "tagline": "Put on a happy face."
            },
            {
                "language_code": "ru",
                "title": "Джокер",
                "overview": "Психически нестабильный стендап-комик начинает нисходящую спираль, которая приводит к созданию культового злодея.",
                "tagline": "Надень счастливое лицо."
            },
            {
                "language_code": "kk",
                "title": "Джокер",
                "overview": "Психикалық ауытқушылығы бар стендап-комик төмендеу спиральына түсіп, әйгілі зұлымның пайда болуына әкеледі.",
                "tagline": "Бақытты бетперде киіңіз."
            }
        ],
        "actor_ids": [all_actors[7].id]
    },
    {
        "release_date": "2014-10-24",
        "runtime": 169,
        "vote_average": 8.6,
        "vote_count": 2000,
        "poster_image": "https://www.impawards.com/2014/interstellar_ver3_xlg.html",
        "background_image": "https://wall.alphacoders.com/big.php?i=642317",
        "translations": [
            {
                "language_code": "en",
                "title": "Interstellar",
                "overview": "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
                "tagline": "Mankind was born on Earth. It was never meant to die here."
            },
            {
                "language_code": "ru",
                "title": "Интерстеллар",
                "overview": "Команда исследователей путешествует через червоточину в космосе, пытаясь обеспечить выживание человечества.",
                "tagline": "Человечество родилось на Земле. Оно не должно здесь умереть."
            },
            {
                "language_code": "kk",
                "title": "Интерстеллар",
                "overview": "Зерттеушілер тобы ғарыштағы құрт тесігі арқылы саяхаттап, адамзаттың өмір сүруін қамтамасыз етуге тырысады.",
                "tagline": "Адамзат Жерде туды. Ол мұнда өлуге арналмаған."
            }
        ],
        "actor_ids": [all_actors[8].id, all_actors[9].id]
    },
    {
        "release_date": "2001-07-20",
        "runtime": 152,
        "vote_average": 8.9,
        "vote_count": 2400,
        "poster_image": "http://www.impawards.com/2001/posters/lord_of_the_rings_the_fellowship_of_the_ring_ver1_xlg.jpg",
        "background_image": "https://wall.alphacoders.com/big.php?i=349895",
        "translations": [
            {
                "language_code": "en",
                "title": "The Lord of the Rings: The Fellowship of the Ring",
                "overview": "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth.",
                "tagline": "One ring to rule them all."
            },
            {
                "language_code": "ru",
                "title": "Властелин колец: Братство кольца",
                "overview": "Скромный хоббит из Шира и восемь спутников отправляются в путешествие, чтобы уничтожить могущественное Единственное Кольцо и спасти Средиземье.",
                "tagline": "Одно кольцо, чтобы править всеми."
            },
            {
                "language_code": "kk",
                "title": "Сақиналар әміршісі: Сақина бауырластығы",
                "overview": "Ширден келген қарапайым Хоббит және сегіз серігі қуатты Бір Сақинаны жою және Орта Жерді құтқару үшін сапарға шығады.",
                "tagline": "Бәріне билік ететін бір сақина."
            }
        ],
        "actor_ids": [all_actors[10].id]
    }]


 



        # Step 6: Create actors
        actors = [Actor(name=data["name"], bio=data["bio"]) for data in actors_data]
        Actor.objects.bulk_create(actors)

        # Step 7: Update actor_ids in films_data with actual IDs
        all_actors = Actor.objects.all()
        for idx, film_data in enumerate(films_data):
            if film_data["actor_ids"]:  # If IDs were pre-set
                continue
            # Assign actors based on index
            if idx == 0:
                film_data["actor_ids"] = [all_actors[0].id, all_actors[4].id]  # Tom Hanks, Morgan Freeman
            elif idx == 1:
                film_data["actor_ids"] = [all_actors[2].id, all_actors[1].id]  # Leonardo DiCaprio, Natalie Portman
            elif idx == 2:
                film_data["actor_ids"] = [all_actors[3].id, all_actors[2].id]  # Brad Pitt, Leonardo DiCaprio
            elif idx == 3:
                film_data["actor_ids"] = [all_actors[5].id]  # Christian Bale
            elif idx == 4:
                film_data["actor_ids"] = [all_actors[6].id]  # Scarlett Johansson
            elif idx == 5:
                film_data["actor_ids"] = [all_actors[7].id]  # Robert Downey Jr.
            elif idx == 6:
                film_data["actor_ids"] = [all_actors[8].id, all_actors[9].id]  # Anne Hathaway, Matt Damon
            elif idx == 7:
                film_data["actor_ids"] = [all_actors[10].id]  # Keanu Reeves
            elif idx == 8:
                film_data["actor_ids"] = [all_actors[10].id]  # Keanu Reeves
            elif idx == 9:
                film_data["actor_ids"] = [all_actors[11].id]  # Sandra Bullock
            elif idx == 10:
                film_data["actor_ids"] = [all_actors[7].id]  # Robert Downey Jr.
            elif idx == 11:
                film_data["actor_ids"] = [all_actors[11].id, all_actors[9].id]  # Sandra Bullock, Matt Damon

        # Step 8: Create films
        films = [
            Film(
                release_date=data["release_date"],
                runtime=data["runtime"],
                vote_average=data["vote_average"],
                vote_count=data["vote_count"],
                poster_image=data["poster_image"],
                background_image=data["background_image"],
            )
            for data in films_data
        ]
        Film.objects.bulk_create(films)

        # Step 9: Fetch all films to associate translations and actors
        all_films = Film.objects.all()

        # Step 10: Create translations for each film
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

            # Step 11: Associate actors with films
            actor_instances = Actor.objects.filter(id__in=film_data["actor_ids"])
            film.actors.set(actor_instances)

        self.stdout.write(self.style.SUCCESS('Successfully populated the database with 12 films, actors, and translations!'))