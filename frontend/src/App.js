import React, { useState, useEffect } from 'react';
import MovieModal from './components/MovieModal';
import Navigation from './components/Navigation';
import CollectionView from './components/CollectionView';
import SearchView from './components/SearchView';
import StatisticsView from './components/StatisticsView';
import MovieFilters from './components/MovieFilters';
import AuthPage from './components/AuthPage';
import { ToastProvider, useToast } from './components/ToastContainer';
import { AuthProvider, useAuth } from './components/AuthContext';

// Dynamic API URL - uses the same host as the frontend with backend port
const API_BASE_URL = process.env.REACT_APP_API_URL || `${window.location.protocol}//${window.location.hostname}:5001`;

// User info component
function UserInfo() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="user-info">
      <span>Welcome, {user.username}</span>
      <span className={`user-role ${user.role}`}>
        {user.role}
      </span>
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
    </div>
  );
}

function AppContent() {
  const { showSuccess, showError } = useToast();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [currentView, setCurrentView] = useState('collection');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    genre: '',
    year: '',
    director: '',
    actor: '',
    title: '',
    min_rating: ''
  });

  // Fetch all movies on component mount
  useEffect(() => {
    fetchMovies();
    fetchStats();
  }, []);

  // Update filtered movies when movies or filters change
  useEffect(() => {
    applyFilters();
  }, [movies, filters]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/movies`, {
        credentials: 'include', // Include authentication cookies
      });
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      const data = await response.json();
      setMovies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/movies/stats`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const applyFilters = async () => {
    // If no filters are applied, show all movies
    const hasFilters = Object.values(filters).some(filter => filter.trim() !== '');
    
    if (!hasFilters) {
      setFilteredMovies(movies);
      return;
    }

    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value.trim()) {
          params.append(key, value);
        }
      });

      const response = await fetch(`${API_BASE_URL}/movies/filter?${params}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setFilteredMovies(data);
      }
    } catch (err) {
      console.error('Failed to apply filters:', err);
      setFilteredMovies(movies);
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      genre: '',
      year: '',
      director: '',
      actor: '',
      title: '',
      min_rating: ''
    });
  };

  const searchMovie = async (searchTerm, sources = [], searchType = 'title') => {
    try {
      setError(null);
      let url;
      
      if (searchType === 'imdb') {
        url = `${API_BASE_URL}/movies/search/imdb?imdb_id=${encodeURIComponent(searchTerm)}`;
      } else {
        url = `${API_BASE_URL}/movies/search?title=${encodeURIComponent(searchTerm)}`;
      }
      
      sources.forEach(source => {
        url += `&sources=${encodeURIComponent(source)}`;
      });
      
      const response = await fetch(url, {
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Movie not found');
      }
      const newMovie = await response.json();
      setMovies(prevMovies => [...prevMovies, newMovie]);
      fetchStats(); // Update stats after adding new movie
      showSuccess(`"${newMovie.title}" added to your collection!`);
      return { success: true, movie: newMovie };
    } catch (err) {
      showError(err.message);
      return { success: false, error: err.message };
    }
  };

  const updateMovie = async (movieId, updateData) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/movies/${movieId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        throw new Error('Failed to update movie');
      }
      const updatedMovie = await response.json();
      setMovies(prevMovies => 
        prevMovies.map(movie => movie.id === movieId ? updatedMovie : movie)
      );
      return { success: true, movie: updatedMovie };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteMovie = async (movieId) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/movies/${movieId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to delete movie');
      }
      setMovies(prevMovies => prevMovies.filter(movie => movie.id !== movieId));
      setShowModal(false);
      fetchStats(); // Update stats after deleting movie
      showSuccess('Movie deleted from collection');
      return { success: true };
    } catch (err) {
      showError(err.message);
      return { success: false, error: err.message };
    }
  };

  const viewMovieDetails = (movie) => {
    setSelectedMovie(movie);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMovie(null);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    // Show filters automatically when switching to filters view
    if (view === 'filters') {
      setShowFilters(true);
      setCurrentView('collection');
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'collection':
        return (
          <CollectionView
            filteredMovies={filteredMovies}
            loading={loading}
            onMovieClick={viewMovieDetails}
            onDeleteMovie={deleteMovie}
            onUpdateMovie={updateMovie}
            filters={filters}
            onFilterChange={updateFilter}
            onClearFilters={clearFilters}
            showFilters={showFilters}
            onToggleFilters={toggleFilters}
          />
        );
      case 'search':
        return <SearchView onSearch={searchMovie} />;
      case 'statistics':
        return <StatisticsView stats={stats} movies={movies} />;
      default:
        return (
          <CollectionView
            filteredMovies={filteredMovies}
            loading={loading}
            onMovieClick={viewMovieDetails}
            onDeleteMovie={deleteMovie}
            onUpdateMovie={updateMovie}
            filters={filters}
            onFilterChange={updateFilter}
            onClearFilters={clearFilters}
            showFilters={showFilters}
            onToggleFilters={toggleFilters}
          />
        );
    }
  };

  // Show loading screen during authentication check
  if (authLoading) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <h1>🎬 Movie Database</h1>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication page if not logged in
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="container">
      <header className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>🎬 Movie Database</h1>
            <p>Discover, search, and manage your favorite movies</p>
            {stats && (
              <div style={{
                marginTop: '15px',
                fontSize: '1rem',
                opacity: 0.9,
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                flexWrap: 'wrap'
              }}>
                <span>📚 {stats.total_movies} Movies</span>
                <span>🎭 {Object.keys(stats.genres).length} Genres</span>
                <span>🎬 {Object.keys(stats.top_directors).length} Directors</span>
                <span>📅 {Object.keys(stats.decades).length} Decades</span>
              </div>
            )}
          </div>
          <UserInfo />
        </div>
      </header>

      <Navigation 
        currentView={currentView}
        onViewChange={handleViewChange}
      />

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {renderCurrentView()}

      {showModal && selectedMovie && (
        <MovieModal 
          movie={selectedMovie}
          onClose={closeModal}
          onDelete={deleteMovie}
          onUpdate={updateMovie}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
