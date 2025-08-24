import React, { useState } from 'react';

function MovieSearch({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sources, setSources] = useState([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setMessage({ type: 'error', text: 'Please enter a movie title' });
      return;
    }

    setSearching(true);
    setMessage(null);

    const result = await onSearch(searchTerm.trim(), sources);
    
    if (result.success) {
      setMessage({ 
        type: 'success', 
        text: `Successfully added "${result.movie.title}" to your collection!` 
      });
      setSearchTerm('');
    } else {
      setMessage({ 
        type: 'error', 
        text: result.error || 'Failed to find movie' 
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
        Search for movies by title to add them to your collection from the OMDB database.
      </p>
      
      <form onSubmit={handleSubmit} className="search-form">
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'end' }}>
          <div style={{ flex: '2', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>
              Movie Title
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter movie title (e.g., Inception, The Matrix)"
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
        <strong>Tips:</strong>
        <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
          <li>Use exact movie titles for best results</li>
          <li>Include the year if multiple movies have the same title</li>
          <li>Movie information is fetched from the OMDB database</li>
        </ul>
      </div>
    </div>
  );
}

export default MovieSearch;