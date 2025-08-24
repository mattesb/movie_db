# app.py
import os
import json
import requests
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/moviedb")
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
            "date_watched": self.date_watched.isoformat() if self.date_watched else None,
            "lent_out": self.lent_out,
            "lent_to": self.lent_to,
            "date_lent": self.date_lent.isoformat() if self.date_lent else None,
            "sources": json.loads(self.sources) if self.sources else [],
        }

@app.route("/movies", methods=["GET", "POST"])
def movies():
    if request.method == "GET":
        movies = Movie.query.all()
        return jsonify([m.to_dict() for m in movies])
    if request.method == "POST":
        data = request.json
        # Handle sources field conversion
        if 'sources' in data and isinstance(data['sources'], list):
            data['sources'] = json.dumps(data['sources'])
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
            if key == 'sources' and isinstance(value, list):
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
    movie_sources = request.args.getlist("sources")  # Get multiple sources from query params
    if not title:
        return jsonify({"error": "title query param required"}), 400
    
    # Check if movie already exists to prevent duplicates
    existing_movie = Movie.query.filter_by(title=title).first()
    if existing_movie:
        return jsonify({"error": "Movie already exists in your collection", "movie": existing_movie.to_dict()}), 409
    
    # Call OMDB API
    api_key = os.getenv("OMDB_API_KEY", "3e2ed480")
    resp = requests.get("http://www.omdbapi.com/", params={"t": title, "apikey": api_key})
    data = resp.json()
    if data.get("Response") != "True":
        return jsonify({"error": "movie not found"}), 404
    # Extract ratings properly
    imdb_score = data.get("imdbRating")
    rotten_tomatoes_score = None
    metacritic_score = None
    
    # Search through ratings array for specific sources
    for rating in data.get("Ratings", []):
        source = rating.get("Source", "")
        value = rating.get("Value", "")
        
        if "Rotten Tomatoes" in source:
            rotten_tomatoes_score = value
        elif "Metacritic" in source:
            metacritic_score = value
    
    movie = Movie(
        title=data.get("Title"),
        year=data.get("Year"),
        genre=data.get("Genre"),
        director=data.get("Director"),
        actors=data.get("Actors"),
        imdb_score=imdb_score,
        rotten_tomatoes_score=rotten_tomatoes_score,
        metacritic_score=metacritic_score,
        plot=data.get("Plot"),
        poster_url=data.get("Poster"),
        runtime=data.get("Runtime"),
        sources=json.dumps(movie_sources) if movie_sources else None,  # Add sources as JSON
    )
    db.session.add(movie)
    db.session.commit()
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
    
    return jsonify({
        "total_movies": total_movies,
        "genres": dict(sorted(genres.items(), key=lambda x: x[1], reverse=True)[:10]),
        "decades": dict(sorted(years.items(), key=lambda x: x[1], reverse=True)),
        "top_directors": dict(sorted(directors.items(), key=lambda x: x[1], reverse=True)[:10])
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
