import React, { useState } from 'react';

function MovieSearch({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('title'); // 'title' or 'imdb'
  const [sources, setSources] = useState([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      const errorText = searchType === 'imdb' ? 'Please enter an IMDB ID' : 'Please enter a movie title';
      setMessage({ type: 'error', text: errorText });
      return;
    }

    // Validate IMDB ID format if searching by IMDB ID
    if (searchType === 'imdb') {
      const imdbPattern = /^(tt)?\d{7,}$/;
      if (!imdbPattern.test(searchTerm.trim())) {
        setMessage({ 
          type: 'error', 
          text: 'Please enter a valid IMDB ID (e.g., tt0816692 or 0816692)' 
        });
        return;
      }
    }

    setSearching(true);
    setMessage(null);

    const result = await onSearch(searchTerm.trim(), sources, searchType);
    
    if (result.success) {
      setMessage({ 
        type: 'success', 
        text: `Successfully added "${result.movie.title}" to your collection!` 
      });
      setSearchTerm('');
    } else {
      // Make duplicate error more user-friendly
      let errorText = result.error || 'Failed to find movie';
      if (errorText.includes('already exists')) {
        errorText = `${errorText}. Check your collection to view this movie's details.`;
      }
      setMessage({ 
        type: 'error', 
        text: errorText 
      });
    }
    
    setSearching(false);

    // Clear message after 5 seconds
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="search-section">
      <h2 style={{ marginBottom: '20px', fontSize: '1.8rem' }}>
        🔍 Search & Add Movies
      </h2>
      <p style={{ marginBottom: '20px', opacity: 0.9 }}>
        Search for movies by title or IMDB ID to add them to your collection with rich metadata from TMDB and OMDB.
      </p>
      
      <form onSubmit={handleSubmit} className="search-form">
        {/* Search Type Selection */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>
            Search Method
          </label>
          <div style={{ display: 'flex', gap: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input
                type="radio"
                name="searchType"
                value="title"
                checked={searchType === 'title'}
                onChange={(e) => setSearchType(e.target.value)}
                disabled={searching}
                style={{ marginRight: '6px' }}
              />
              📝 By Title
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input
                type="radio"
                name="searchType"
                value="imdb"
                checked={searchType === 'imdb'}
                onChange={(e) => setSearchType(e.target.value)}
                disabled={searching}
                style={{ marginRight: '6px' }}
              />
              🎬 By IMDB ID
            </label>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'end' }}>
          <div style={{ flex: '2', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>
              {searchType === 'imdb' ? 'IMDB ID' : 'Movie Title'}
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchType === 'imdb' 
                ? "Enter IMDB ID (e.g., tt0816692 or 0816692)" 
                : "Enter movie title (e.g., Inception, The Matrix)"}
              className="search-input"
              disabled={searching}
            />
          </div>
          
          <div style={{ flex: '1', minWidth: '150px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
              Sources (select all that apply)
            </label>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px',
              padding: '8px',
              background: '#333',
              border: '1px solid #555',
              borderRadius: '4px',
              minHeight: '48px',
              justifyContent: 'center'
            }}>
              {['Apple TV', 'UHD Disk'].map(sourceOption => (
                <label key={sourceOption} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}>
                  <input
                    type="checkbox"
                    checked={sources.includes(sourceOption)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSources([...sources, sourceOption]);
                      } else {
                        setSources(sources.filter(s => s !== sourceOption));
                      }
                    }}
                    disabled={searching}
                    style={{ marginRight: '8px' }}
                  />
                  {sourceOption === 'Apple TV' && '📺 '}
                  {sourceOption === 'UHD Disk' && '💿 '}
                  {sourceOption}
                </label>
              ))}
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={searching || !searchTerm.trim()}
            style={{ height: '48px', minWidth: '120px' }}
          >
            {searching ? 'Searching...' : 'Add Movie'}
          </button>
        </div>
      </form>

      {message && (
        <div className={message.type}>
          {message.text}
        </div>
      )}

      <div style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '15px' }}>
        <strong>Search Tips:</strong>
        <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
          {searchType === 'title' ? (
            <>
              <li>Use exact movie titles for best results</li>
              <li>Include the year if multiple movies have the same title</li>
              <li>Try different variations if the movie isn't found</li>
            </>
          ) : (
            <>
              <li>IMDB IDs can be found on movie pages at imdb.com</li>
              <li>Format: tt0816692 or just 0816692 (both work)</li>
              <li>IMDB ID search is more precise than title search</li>
            </>
          )}
          <li>Movie data is fetched from TMDB and OMDB databases</li>
          <li>Rich metadata includes cast, trailers, and similar movies</li>
        </ul>
      </div>
    </div>
  );
}

export default MovieSearch;