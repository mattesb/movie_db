import React, { useState } from 'react';
import MovieSearch from './MovieSearch';

function SearchView({ onSearch }) {
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  const handleSearch = async (title, sources = []) => {
    const result = await onSearch(title, sources);
    
    if (result.success) {
      // Add to recent searches
      setRecentSearches(prev => {
        const filtered = prev.filter(search => search !== title);
        return [title, ...filtered].slice(0, 5);
      });
      
      // Add to search history with timestamp
      setSearchHistory(prev => [{
        title,
        success: true,
        movie: result.movie,
        timestamp: new Date().toLocaleString()
      }, ...prev].slice(0, 10));
    } else {
      // Add failed search to history
      setSearchHistory(prev => [{
        title,
        success: false,
        error: result.error,
        timestamp: new Date().toLocaleString()
      }, ...prev].slice(0, 10));
    }
    
    return result;
  };

  const searchSuggestions = [
    'The Dark Knight', 'Pulp Fiction', 'The Godfather', 'Forrest Gump',
    'The Shawshank Redemption', 'Fight Club', 'Goodfellas', 'The Lord of the Rings',
    'Star Wars', 'Jaws', 'Alien', 'Blade Runner', 'Casablanca', 'Citizen Kane'
  ];

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
          🔍 Add Movies to Your Collection
        </h2>
        <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
          Search for any movie by title and we'll fetch all the details from OMDB including ratings, 
          cast, plot, and poster. Start building your personal movie database!
        </p>
      </div>

      <MovieSearch onSearch={handleSearch} />

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '25px',
        marginTop: '30px'
      }}>
        
        {/* Quick Search Suggestions */}
        <div className="search-section">
          <h3 style={{ marginBottom: '15px', fontSize: '1.4rem' }}>
            🎬 Popular Movie Suggestions
          </h3>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '8px'
          }}>
            {searchSuggestions.map(movie => (
              <button
                key={movie}
                onClick={() => handleSearch(movie)}
                className="btn btn-secondary"
                style={{ 
                  fontSize: '0.9rem', 
                  padding: '6px 12px',
                  borderRadius: '20px'
                }}
              >
                {movie}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="search-section">
            <h3 style={{ marginBottom: '15px', fontSize: '1.4rem' }}>
              🕒 Recent Searches
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="btn btn-secondary"
                  style={{ 
                    textAlign: 'left',
                    justifyContent: 'flex-start'
                  }}
                >
                  🔍 {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="search-section">
            <h3 style={{ marginBottom: '15px', fontSize: '1.4rem' }}>
              📋 Search History
            </h3>
            <div style={{ 
              maxHeight: '300px', 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {searchHistory.map((entry, index) => (
                <div
                  key={index}
                  style={{
                    padding: '10px',
                    background: entry.success 
                      ? 'rgba(72, 187, 120, 0.1)' 
                      : 'rgba(255, 107, 107, 0.1)',
                    borderRadius: '6px',
                    border: `1px solid ${entry.success 
                      ? 'rgba(72, 187, 120, 0.3)' 
                      : 'rgba(255, 107, 107, 0.3)'}`,
                    fontSize: '0.9rem'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: '3px'
                  }}>
                    <strong>{entry.title}</strong>
                    <span style={{ opacity: 0.7, fontSize: '0.8rem' }}>
                      {entry.timestamp}
                    </span>
                  </div>
                  <div style={{ opacity: 0.8 }}>
                    {entry.success ? (
                      <span style={{ color: '#48bb78' }}>
                        ✅ Added: {entry.movie.title} ({entry.movie.year})
                      </span>
                    ) : (
                      <span style={{ color: '#ff6b6b' }}>
                        ❌ {entry.error}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <h4 style={{ marginBottom: '10px' }}>💡 Pro Tips for Adding Movies</h4>
        <ul style={{ 
          textAlign: 'left', 
          maxWidth: '600px', 
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          <li><strong>Use exact titles:</strong> "The Dark Knight" instead of "Dark Knight"</li>
          <li><strong>Include year for clarity:</strong> "Godzilla (1954)" vs "Godzilla (2014)"</li>
          <li><strong>Try alternate titles:</strong> Some movies have different international titles</li>
          <li><strong>Check spelling:</strong> Our search is powered by OMDB and requires exact matches</li>
        </ul>
      </div>
    </div>
  );
}

export default SearchView;