import React from 'react';
import MovieCard from './MovieCard';

function MovieList({ movies, loading, onMovieClick, onDeleteMovie, onUpdateMovie }) {
  if (loading) {
    return <div className="loading">Loading movies...</div>;
  }

  if (movies.length === 0) {
    return (
      <div className="loading">
        <p>No movies in your database yet.</p>
        <p>Use the search above to add movies from OMDB!</p>
      </div>
    );
  }

  return (
    <div className="movies-section">
      <h2 style={{ marginBottom: '20px', fontSize: '2rem' }}>
        Your Movie Collection ({movies.length} movies)
      </h2>
      <div className="movies-grid">
        {movies.map(movie => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onClick={() => onMovieClick(movie)}
            onDelete={() => onDeleteMovie(movie.id)}
            onUpdateMovie={onUpdateMovie}
          />
        ))}
      </div>
    </div>
  );
}

export default MovieList;