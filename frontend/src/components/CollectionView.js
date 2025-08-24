import React from 'react';
import MovieList from './MovieList';
import MovieFilters from './MovieFilters';

function CollectionView({ 
  filteredMovies, 
  loading, 
  onMovieClick, 
  onDeleteMovie, 
  onUpdateMovie,
  filters,
  onFilterChange,
  onClearFilters,
  showFilters,
  onToggleFilters
}) {
  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: 0, fontSize: '2rem' }}>
          🎬 Your Movie Collection
        </h2>
        <button
          onClick={onToggleFilters}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          🎛️ {showFilters ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      {showFilters && (
        <MovieFilters 
          filters={filters}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
        />
      )}

      <MovieList 
        movies={filteredMovies}
        loading={loading}
        onMovieClick={onMovieClick}
        onDeleteMovie={onDeleteMovie}
        onUpdateMovie={onUpdateMovie}
      />
    </div>
  );
}

export default CollectionView;