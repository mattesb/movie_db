# app.py
import json
import os

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

load_dotenv()

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL", "postgresql://postgres:postgres@db:5432/moviedb"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Enable CORS for all routes
CORS(app)

db = SQLAlchemy(app)
migrate = Migrate(app, db)


class Movie(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    year = db.Column(db.String(4))
    genre = db.Column(db.String(255))
    director = db.Column(db.String(255))
    actors = db.Column(db.Text)
    imdb_score = db.Column(db.String(10))
    rotten_tomatoes_score = db.Column(db.String(10))
    metacritic_score = db.Column(db.String(10))  # Added Metacritic support
    plot = db.Column(db.Text)
    poster_url = db.Column(db.String(512))
    runtime = db.Column(db.String(10))  # Runtime in minutes, e.g., "148 min"

    # New fields for enhanced functionality
    personal_rating = db.Column(db.Float)  # 1-5 stars
    tags = db.Column(db.Text)  # JSON string of tags ["favorite", "watchlist", etc.]
    notes = db.Column(db.Text)  # Personal notes/review
    watched = db.Column(db.Boolean, default=False)
    date_added = db.Column(db.DateTime, default=db.func.current_timestamp())
    date_watched = db.Column(db.DateTime)

    # Lending tracking
    lent_out = db.Column(db.Boolean, default=False)
    lent_to = db.Column(db.String(255))  # Who borrowed it
    date_lent = db.Column(db.DateTime)  # When it was lent

    # TMDB enhanced data storage
    tmdb_id = db.Column(db.Integer)  # TMDB movie ID
    backdrop_url = db.Column(db.String(512))  # High-res backdrop image
    tmdb_rating = db.Column(db.Float)  # TMDB community rating
    tmdb_vote_count = db.Column(db.Integer)  # Number of votes
    cast_data = db.Column(db.Text)  # JSON string of cast info
    trailers_data = db.Column(db.Text)  # JSON string of trailers
    similar_movies_data = db.Column(db.Text)  # JSON string of similar movies

    # Movie sources (JSON array)
    sources = db.Column(db.Text)  # JSON string of sources ["Apple TV", "UHD Disk"]

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "year": self.year,
            "genre": self.genre,
            "director": self.director,
            "actors": self.actors,
            "imdb_score": self.imdb_score,
            "rotten_tomatoes_score": self.rotten_tomatoes_score,
            "metacritic_score": self.metacritic_score,
            "plot": self.plot,
            "poster_url": self.poster_url,
            "runtime": self.runtime,
            "personal_rating": self.personal_rating,
            "tags": self.tags,
            "notes": self.notes,
            "watched": self.watched,
            "date_added": self.date_added.isoformat() if self.date_added else None,
            "date_watched": self.date_watched.isoformat()
            if self.date_watched
            else None,
            "lent_out": self.lent_out,
            "lent_to": self.lent_to,
            "date_lent": self.date_lent.isoformat() if self.date_lent else None,
            "sources": json.loads(self.sources) if self.sources else [],
            # TMDB enhanced data
            "tmdb_id": self.tmdb_id,
            "backdrop_url": self.backdrop_url,
            "tmdb_rating": self.tmdb_rating,
            "tmdb_vote_count": self.tmdb_vote_count,
            "cast_data": json.loads(self.cast_data) if self.cast_data else [],
            "trailers_data": json.loads(self.trailers_data)
            if self.trailers_data
            else [],
            "similar_movies_data": json.loads(self.similar_movies_data)
            if self.similar_movies_data
            else [],
        }


def search_movie_comprehensive(title):
    """
    Search for a movie using both TMDB and OMDB APIs to get comprehensive data
    Returns enriched movie data or None if not found
    """
    # Get API keys
    tmdb_api_key = os.getenv("TMDB_API_KEY")
    omdb_api_key = os.getenv("OMDB_API_KEY", "3e2ed480")

    if not tmdb_api_key:
        print("Warning: TMDB_API_KEY not found, falling back to OMDB only")
        return search_movie_omdb_only(title, omdb_api_key)

    # Step 1: Search TMDB for the movie
    tmdb_search_url = "https://api.themoviedb.org/3/search/movie"
    tmdb_params = {"api_key": tmdb_api_key, "query": title, "language": "en-US"}

    try:
        tmdb_search_resp = requests.get(tmdb_search_url, params=tmdb_params)
        tmdb_search_resp.raise_for_status()
        tmdb_search_data = tmdb_search_resp.json()

        if not tmdb_search_data.get("results"):
            print(f"TMDB: No results found for '{title}'")
            return search_movie_omdb_only(title, omdb_api_key)

        # Get the first (most relevant) result
        tmdb_movie = tmdb_search_data["results"][0]
        movie_id = tmdb_movie["id"]

        # Step 2: Get detailed movie information from TMDB
        tmdb_details_url = f"https://api.themoviedb.org/3/movie/{movie_id}"
        tmdb_details_params = {
            "api_key": tmdb_api_key,
            "language": "en-US",
            "append_to_response": "credits,videos,similar",
        }

        tmdb_details_resp = requests.get(tmdb_details_url, params=tmdb_details_params)
        tmdb_details_resp.raise_for_status()
        tmdb_details = tmdb_details_resp.json()

        # Step 3: Try to get additional ratings from OMDB (for Rotten Tomatoes, etc.)
        omdb_data = None
        if omdb_api_key:
            try:
                omdb_resp = requests.get(
                    "http://www.omdbapi.com/",
                    params={"t": tmdb_details["title"], "apikey": omdb_api_key},
                )
                omdb_resp.raise_for_status()
                omdb_result = omdb_resp.json()
                if omdb_result.get("Response") == "True":
                    omdb_data = omdb_result
            except Exception as e:
                print(f"OMDB lookup failed: {e}")

        # Step 4: Combine the data
        return combine_movie_data(tmdb_details, omdb_data)

    except Exception as e:
        print(f"TMDB lookup failed: {e}")
        return search_movie_omdb_only(title, omdb_api_key)


def search_movie_omdb_only(title, omdb_api_key):
    """Fallback to OMDB-only search"""
    if not omdb_api_key:
        return None

    try:
        resp = requests.get(
            "http://www.omdbapi.com/", params={"t": title, "apikey": omdb_api_key}
        )
        resp.raise_for_status()
        data = resp.json()

        if data.get("Response") != "True":
            return None

        # Convert OMDB data to our format
        return {
            "title": data.get("Title"),
            "year": data.get("Year"),
            "genre": data.get("Genre"),
            "director": data.get("Director"),
            "actors": data.get("Actors"),
            "plot": data.get("Plot"),
            "poster_url": data.get("Poster") if data.get("Poster") != "N/A" else None,
            "runtime": data.get("Runtime"),
            "imdb_score": data.get("imdbRating")
            if data.get("imdbRating") != "N/A"
            else None,
            "rotten_tomatoes_score": extract_rating(
                data.get("Ratings", []), "Rotten Tomatoes"
            ),
            "metacritic_score": extract_rating(data.get("Ratings", []), "Metacritic"),
            "tmdb_id": None,
            "backdrop_url": None,
            "trailers": [],
            "cast": [],
            "similar_movies": [],
        }
    except Exception as e:
        print(f"OMDB search failed: {e}")
        return None


def combine_movie_data(tmdb_data, omdb_data):
    """Combine TMDB and OMDB data into our movie format"""

    # Extract cast (top 5 actors)
    cast = []
    if tmdb_data.get("credits", {}).get("cast"):
        cast = [
            {
                "name": actor["name"],
                "character": actor.get("character", ""),
                "profile_path": f"https://image.tmdb.org/t/p/w185{actor['profile_path']}"
                if actor.get("profile_path")
                else None,
            }
            for actor in tmdb_data["credits"]["cast"][:5]
        ]

    # Extract trailers (YouTube videos)
    trailers = []
    if tmdb_data.get("videos", {}).get("results"):
        trailers = [
            {
                "name": video["name"],
                "key": video["key"],
                "site": video["site"],
                "type": video["type"],
                "url": f"https://www.youtube.com/watch?v={video['key']}"
                if video["site"] == "YouTube"
                else None,
            }
            for video in tmdb_data["videos"]["results"]
            if video["type"] in ["Trailer", "Teaser"] and video["site"] == "YouTube"
        ][:3]  # Limit to 3 trailers

    # Extract similar movies (top 5)
    similar_movies = []
    if tmdb_data.get("similar", {}).get("results"):
        similar_movies = [
            {
                "id": movie["id"],
                "title": movie["title"],
                "poster_path": f"https://image.tmdb.org/t/p/w300{movie['poster_path']}"
                if movie.get("poster_path")
                else None,
                "release_date": movie.get("release_date"),
                "overview": movie.get("overview", "")[:200] + "..."
                if len(movie.get("overview", "")) > 200
                else movie.get("overview", ""),
            }
            for movie in tmdb_data["similar"]["results"][:5]
        ]

    # Get directors from crew
    directors = []
    if tmdb_data.get("credits", {}).get("crew"):
        directors = [
            person["name"]
            for person in tmdb_data["credits"]["crew"]
            if person.get("job") == "Director"
        ]

    # Combine genres
    genres = ", ".join([genre["name"] for genre in tmdb_data.get("genres", [])])

    # Build the combined data
    combined_data = {
        "title": tmdb_data.get("title"),
        "year": tmdb_data.get("release_date", "")[:4]
        if tmdb_data.get("release_date")
        else None,
        "genre": genres,
        "director": ", ".join(directors) if directors else None,
        "actors": ", ".join([actor["name"] for actor in cast]) if cast else None,
        "plot": tmdb_data.get("overview"),
        "poster_url": f"https://image.tmdb.org/t/p/w500{tmdb_data['poster_path']}"
        if tmdb_data.get("poster_path")
        else None,
        "backdrop_url": f"https://image.tmdb.org/t/p/w1280{tmdb_data['backdrop_path']}"
        if tmdb_data.get("backdrop_path")
        else None,
        "runtime": f"{tmdb_data.get('runtime')} min"
        if tmdb_data.get("runtime")
        else None,
        "imdb_score": None,  # Will be filled from OMDB if available
        "rotten_tomatoes_score": None,  # Will be filled from OMDB if available
        "metacritic_score": None,  # Will be filled from OMDB if available
        "tmdb_id": tmdb_data.get("id"),
        "tmdb_rating": tmdb_data.get("vote_average"),
        "tmdb_vote_count": tmdb_data.get("vote_count"),
        "trailers": trailers,
        "cast": cast,
        "similar_movies": similar_movies,
    }

    # Overlay OMDB data if available (for additional ratings)
    if omdb_data:
        combined_data["imdb_score"] = (
            omdb_data.get("imdbRating")
            if omdb_data.get("imdbRating") != "N/A"
            else None
        )
        combined_data["rotten_tomatoes_score"] = extract_rating(
            omdb_data.get("Ratings", []), "Rotten Tomatoes"
        )
        combined_data["metacritic_score"] = extract_rating(
            omdb_data.get("Ratings", []), "Metacritic"
        )

        # Use OMDB runtime if TMDB doesn't have it
        if not combined_data["runtime"] and omdb_data.get("Runtime") != "N/A":
            combined_data["runtime"] = omdb_data.get("Runtime")

    return combined_data


def extract_rating(ratings_array, source_name):
    """Extract rating from OMDB ratings array"""
    for rating in ratings_array:
        if source_name.lower() in rating.get("Source", "").lower():
            return rating.get("Value")
    return None


def search_movie_by_imdb_id(imdb_id):
    """
    Search for a movie using IMDB ID through both TMDB and OMDB APIs
    Returns enriched movie data or None if not found
    """
    # Get API keys
    tmdb_api_key = os.getenv("TMDB_API_KEY")
    omdb_api_key = os.getenv("OMDB_API_KEY")

    # Clean IMDB ID format (ensure it starts with 'tt')
    if not imdb_id.startswith("tt"):
        imdb_id = f"tt{imdb_id}"

    # Step 1: Get data from OMDB using IMDB ID (this is very reliable)
    omdb_data = None
    if omdb_api_key:
        try:
            omdb_resp = requests.get(
                "http://www.omdbapi.com/", params={"i": imdb_id, "apikey": omdb_api_key}
            )
            omdb_resp.raise_for_status()
            omdb_result = omdb_resp.json()
            if omdb_result.get("Response") == "True":
                omdb_data = omdb_result
        except Exception as e:
            print(f"OMDB lookup by IMDB ID failed: {e}")

    # Step 2: Try to get TMDB data using the IMDB ID
    tmdb_data = None
    if tmdb_api_key:
        try:
            # TMDB find endpoint can find movies by IMDB ID
            tmdb_find_url = f"https://api.themoviedb.org/3/find/{imdb_id}"
            tmdb_find_params = {"api_key": tmdb_api_key, "external_source": "imdb_id"}

            tmdb_find_resp = requests.get(tmdb_find_url, params=tmdb_find_params)
            tmdb_find_resp.raise_for_status()
            tmdb_find_data = tmdb_find_resp.json()

            # Check if we found movie results
            if tmdb_find_data.get("movie_results"):
                movie_result = tmdb_find_data["movie_results"][0]  # Get first result
                movie_id = movie_result["id"]

                # Get detailed movie information from TMDB
                tmdb_details_url = f"https://api.themoviedb.org/3/movie/{movie_id}"
                tmdb_details_params = {
                    "api_key": tmdb_api_key,
                    "language": "en-US",
                    "append_to_response": "credits,videos,similar",
                }

                tmdb_details_resp = requests.get(
                    tmdb_details_url, params=tmdb_details_params
                )
                tmdb_details_resp.raise_for_status()
                tmdb_data = tmdb_details_resp.json()

        except Exception as e:
            print(f"TMDB lookup by IMDB ID failed: {e}")

    # Step 3: Combine the data
    if tmdb_data or omdb_data:
        if tmdb_data and omdb_data:
            return combine_movie_data(tmdb_data, omdb_data)
        elif tmdb_data:
            # TMDB only - convert to our format
            return combine_movie_data(tmdb_data, None)
        else:
            # OMDB only - convert to our format
            return {
                "title": omdb_data.get("Title"),
                "year": omdb_data.get("Year"),
                "genre": omdb_data.get("Genre"),
                "director": omdb_data.get("Director"),
                "actors": omdb_data.get("Actors"),
                "plot": omdb_data.get("Plot"),
                "poster_url": omdb_data.get("Poster")
                if omdb_data.get("Poster") != "N/A"
                else None,
                "runtime": omdb_data.get("Runtime"),
                "imdb_score": omdb_data.get("imdbRating")
                if omdb_data.get("imdbRating") != "N/A"
                else None,
                "rotten_tomatoes_score": extract_rating(
                    omdb_data.get("Ratings", []), "Rotten Tomatoes"
                ),
                "metacritic_score": extract_rating(
                    omdb_data.get("Ratings", []), "Metacritic"
                ),
                "imdb_id": omdb_data.get("imdbID"),
                "tmdb_id": None,
                "backdrop_url": None,
                "tmdb_rating": None,
                "tmdb_vote_count": None,
                "cast": [],
                "trailers": [],
                "similar_movies": [],
            }

    return None


@app.route("/movies", methods=["GET", "POST"])
def movies():
    if request.method == "GET":
        movies = Movie.query.all()
        return jsonify([m.to_dict() for m in movies])
    if request.method == "POST":
        data = request.json
        # Handle sources field conversion
        if "sources" in data and isinstance(data["sources"], list):
            data["sources"] = json.dumps(data["sources"])
        movie = Movie(**data)
        db.session.add(movie)
        db.session.commit()
        return jsonify(movie.to_dict()), 201


@app.route("/movies/<int:movie_id>", methods=["GET", "PUT", "DELETE"])
def movie_detail(movie_id):
    movie = Movie.query.get_or_404(movie_id)
    if request.method == "GET":
        return jsonify(movie.to_dict())
    if request.method == "PUT":
        for key, value in request.json.items():
            # Handle sources field conversion
            if key == "sources" and isinstance(value, list):
                value = json.dumps(value)
            setattr(movie, key, value)
        db.session.commit()
        return jsonify(movie.to_dict())
    if request.method == "DELETE":
        db.session.delete(movie)
        db.session.commit()
        return jsonify({"message": "deleted"})


@app.route("/movies/search", methods=["GET"])
def search_movie():
    title = request.args.get("title")
    movie_sources = request.args.getlist(
        "sources"
    )  # Get multiple sources from query params
    if not title:
        return jsonify({"error": "title query param required"}), 400

    # Check if movie already exists to prevent duplicates
    existing_movie = Movie.query.filter_by(title=title).first()
    if existing_movie:
        return jsonify(
            {
                "error": "Movie already exists in your collection",
                "movie": existing_movie.to_dict(),
            }
        ), 409

    # Search using both TMDB and OMDB for comprehensive data
    movie_data = search_movie_comprehensive(title)
    if not movie_data:
        return jsonify({"error": "movie not found"}), 404
    # Create movie from comprehensive data
    movie = Movie(
        title=movie_data.get("title"),
        year=movie_data.get("year"),
        genre=movie_data.get("genre"),
        director=movie_data.get("director"),
        actors=movie_data.get("actors"),
        imdb_score=movie_data.get("imdb_score"),
        rotten_tomatoes_score=movie_data.get("rotten_tomatoes_score"),
        metacritic_score=movie_data.get("metacritic_score"),
        plot=movie_data.get("plot"),
        poster_url=movie_data.get("poster_url"),
        runtime=movie_data.get("runtime"),
        sources=json.dumps(movie_sources) if movie_sources else None,
        # Store TMDB data directly in database
        tmdb_id=movie_data.get("tmdb_id"),
        backdrop_url=movie_data.get("backdrop_url"),
        tmdb_rating=movie_data.get("tmdb_rating"),
        tmdb_vote_count=movie_data.get("tmdb_vote_count"),
        cast_data=json.dumps(movie_data.get("cast", [])),
        trailers_data=json.dumps(movie_data.get("trailers", [])),
        similar_movies_data=json.dumps(movie_data.get("similar_movies", [])),
    )
    db.session.add(movie)
    db.session.commit()

    # Return the saved movie with all data (including TMDB data from database)
    return jsonify(movie.to_dict()), 201


@app.route("/movies/<int:movie_id>/enhanced", methods=["GET"])
def get_enhanced_movie_details(movie_id):
    """Get enhanced movie details - fetch and store TMDB data if not already present"""
    movie = Movie.query.get_or_404(movie_id)

    # Check if TMDB data is already stored
    if movie.tmdb_id is None:
        # TMDB data not stored yet, fetch and save it
        movie_data = search_movie_comprehensive(movie.title)
        if movie_data:
            # Update the movie with TMDB data
            movie.tmdb_id = movie_data.get("tmdb_id")
            movie.backdrop_url = movie_data.get("backdrop_url")
            movie.tmdb_rating = movie_data.get("tmdb_rating")
            movie.tmdb_vote_count = movie_data.get("tmdb_vote_count")
            movie.cast_data = json.dumps(movie_data.get("cast", []))
            movie.trailers_data = json.dumps(movie_data.get("trailers", []))
            movie.similar_movies_data = json.dumps(movie_data.get("similar_movies", []))
            db.session.commit()

    # Return movie data (now including stored TMDB data)
    return jsonify(movie.to_dict())


@app.route("/movies/search/imdb", methods=["GET"])
def search_movie_by_imdb():
    """Search and add movie by IMDB ID"""
    imdb_id = request.args.get("imdb_id")
    movie_sources = request.args.getlist(
        "sources"
    )  # Get multiple sources from query params
    if not imdb_id:
        return jsonify({"error": "imdb_id query param required"}), 400

    # Clean IMDB ID and check if movie already exists by IMDB ID
    clean_imdb_id = imdb_id if imdb_id.startswith("tt") else f"tt{imdb_id}"
    existing_movie = Movie.query.filter(Movie.plot.contains(clean_imdb_id)).first()
    if not existing_movie:
        # Also check if we have this IMDB ID in our database (we'll need to add an imdb_id field later)
        # For now, we'll check by exact title match after fetching
        pass

    # Search using IMDB ID
    movie_data = search_movie_by_imdb_id(imdb_id)
    if not movie_data:
        return jsonify({"error": "Movie not found"}), 404

    # Check if movie already exists by title to prevent duplicates
    existing_movie = Movie.query.filter_by(title=movie_data.get("title")).first()
    if existing_movie:
        return jsonify(
            {
                "error": "Movie already exists in your collection",
                "movie": existing_movie.to_dict(),
            }
        ), 409

    # Create movie from comprehensive data
    movie = Movie(
        title=movie_data.get("title"),
        year=movie_data.get("year"),
        genre=movie_data.get("genre"),
        director=movie_data.get("director"),
        actors=movie_data.get("actors"),
        imdb_score=movie_data.get("imdb_score"),
        rotten_tomatoes_score=movie_data.get("rotten_tomatoes_score"),
        metacritic_score=movie_data.get("metacritic_score"),
        plot=movie_data.get("plot"),
        poster_url=movie_data.get("poster_url"),
        runtime=movie_data.get("runtime"),
        sources=json.dumps(movie_sources) if movie_sources else None,
        # Store TMDB data directly in database
        tmdb_id=movie_data.get("tmdb_id"),
        backdrop_url=movie_data.get("backdrop_url"),
        tmdb_rating=movie_data.get("tmdb_rating"),
        tmdb_vote_count=movie_data.get("tmdb_vote_count"),
        cast_data=json.dumps(movie_data.get("cast", [])),
        trailers_data=json.dumps(movie_data.get("trailers", [])),
        similar_movies_data=json.dumps(movie_data.get("similar_movies", [])),
    )
    db.session.add(movie)
    db.session.commit()

    # Return the saved movie with all data
    return jsonify(movie.to_dict()), 201


@app.route("/movies/filter", methods=["GET"])
def filter_movies():
    query = Movie.query

    # Filter by genre
    genre = request.args.get("genre")
    if genre:
        query = query.filter(Movie.genre.ilike(f"%{genre}%"))

    # Filter by year
    year = request.args.get("year")
    if year:
        query = query.filter(Movie.year == year)

    # Filter by director
    director = request.args.get("director")
    if director:
        query = query.filter(Movie.director.ilike(f"%{director}%"))

    # Filter by actor
    actor = request.args.get("actor")
    if actor:
        query = query.filter(Movie.actors.ilike(f"%{actor}%"))

    # Search by title
    title = request.args.get("title")
    if title:
        query = query.filter(Movie.title.ilike(f"%{title}%"))

    # Minimum rating filter
    min_rating = request.args.get("min_rating")
    if min_rating:
        try:
            min_rating = float(min_rating)
            query = query.filter(Movie.imdb_score.cast(db.Float) >= min_rating)
        except ValueError:
            pass

    movies = query.all()
    return jsonify([movie.to_dict() for movie in movies])


@app.route("/movies/stats", methods=["GET"])
def movie_stats():
    total_movies = Movie.query.count()

    # Genre distribution
    genres = {}
    for movie in Movie.query.all():
        if movie.genre:
            for genre in movie.genre.split(", "):
                genre = genre.strip()
                genres[genre] = genres.get(genre, 0) + 1

    # Year distribution
    years = {}
    for movie in Movie.query.all():
        if movie.year:
            decade = f"{movie.year[:3]}0s"
            years[decade] = years.get(decade, 0) + 1

    # Top directors
    directors = {}
    for movie in Movie.query.all():
        if movie.director:
            directors[movie.director] = directors.get(movie.director, 0) + 1

    return jsonify(
        {
            "total_movies": total_movies,
            "genres": dict(
                sorted(genres.items(), key=lambda x: x[1], reverse=True)[:10]
            ),
            "decades": dict(sorted(years.items(), key=lambda x: x[1], reverse=True)),
            "top_directors": dict(
                sorted(directors.items(), key=lambda x: x[1], reverse=True)[:10]
            ),
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
