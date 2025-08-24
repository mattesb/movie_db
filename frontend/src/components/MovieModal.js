import React, { useState } from 'react';

function MovieModal({ movie, onClose, onDelete, onUpdate }) {
  const [notes, setNotes] = useState(movie.notes || '');
  const [tags, setTags] = useState(movie.tags || '');
  const [sources, setSources] = useState(movie.sources || []);
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${movie.title}"?`)) {
      const result = await onDelete(movie.id);
      if (result.success) {
        onClose();
      }
    }
  };

  const handleSaveNotes = async () => {
    await onUpdate(movie.id, { notes, tags, sources });
    setIsEditing(false);
  };

  const handleRatingChange = async (rating) => {
    await onUpdate(movie.id, { personal_rating: rating });
  };

  const toggleWatched = async () => {
    await onUpdate(movie.id, { 
      watched: !movie.watched, 
      date_watched: !movie.watched ? new Date().toISOString() : null 
    });
  };

  const toggleLentOut = async () => {
    const isLending = !movie.lent_out;
    
    if (isLending) {
      // If lending out, prompt for who it's lent to
      const lentTo = prompt("Who are you lending this movie to?");
      if (lentTo === null) return; // User cancelled
      
      await onUpdate(movie.id, { 
        lent_out: true,
        lent_to: lentTo.trim() || "Unknown",
        date_lent: new Date().toISOString()
      });
    } else {
      // If returning, clear lending info
      await onUpdate(movie.id, { 
        lent_out: false,
        lent_to: null,
        date_lent: null
      });
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          onClick={() => handleRatingChange(i)}
          style={{
            cursor: 'pointer',
            color: i <= (movie.personal_rating || 0) ? '#ffd700' : '#444',
            fontSize: '1.5rem',
            marginRight: '3px'
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const formatTags = (tagString) => {
    if (!tagString) return [];
    return tagString.split(',').map(tag => tag.trim()).filter(tag => tag);
  };

  const addQuickTag = (tag) => {
    const currentTags = formatTags(tags);
    if (!currentTags.includes(tag)) {
      setTags(currentTags.concat([tag]).join(', '));
    }
  };

  const removeTag = (tagToRemove) => {
    const currentTags = formatTags(tags);
    setTags(currentTags.filter(tag => tag !== tagToRemove).join(', '));
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const defaultPoster = "https://via.placeholder.com/300x400/333/fff?text=No+Poster";

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{movie.title}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-content">
          <div style={{ display: 'flex', gap: '30px', marginBottom: '20px' }}>
            <div style={{ flexShrink: 0 }}>
              <img 
                src={movie.poster_url && movie.poster_url !== 'N/A' ? movie.poster_url : defaultPoster}
                alt={`${movie.title} poster`}
                style={{ 
                  width: '200px', 
                  height: '300px', 
                  objectFit: 'cover', 
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.1)'
                }}
                onError={(e) => {
                  e.target.src = defaultPoster;
                }}
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '15px' }}>
                {movie.year && (
                  <div style={{ color: '#667eea', fontSize: '1.2rem', fontWeight: '600', marginBottom: '10px' }}>
                    {movie.year}
                  </div>
                )}
                
                {movie.genre && (
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Genre:</strong> {movie.genre}
                  </div>
                )}
                
                {movie.director && movie.director !== 'N/A' && (
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Director:</strong> {movie.director}
                  </div>
                )}
                
                {movie.actors && movie.actors !== 'N/A' && (
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Cast:</strong> {movie.actors}
                  </div>
                )}
                
                <div style={{ marginBottom: '10px' }}>
                  <strong>Sources:</strong> 
                  {isEditing ? (
                    <div style={{ 
                      marginTop: '8px',
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '8px',
                      padding: '8px',
                      background: '#333',
                      border: '1px solid #555',
                      borderRadius: '4px'
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
                            style={{ marginRight: '8px' }}
                          />
                          {sourceOption === 'Apple TV' && '📺 '}
                          {sourceOption === 'UHD Disk' && '💿 '}
                          {sourceOption}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div style={{ marginLeft: '10px', marginTop: '5px' }}>
                      {sources.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {sources.map((source, index) => (
                            <span
                              key={index}
                              style={{
                                background: source === 'Apple TV' ? '#007AFF' : '#8A2BE2',
                                color: 'white',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '0.85rem',
                                fontWeight: '500',
                                display: 'inline-block'
                              }}
                            >
                              {source === 'Apple TV' && '📺 '}
                              {source === 'UHD Disk' && '💿 '}
                              {source}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <em style={{ color: '#999' }}>Not specified</em>
                      )}
                    </div>
                  )}
                </div>
                
                {(movie.imdb_score || movie.rotten_tomatoes_score) && (
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Ratings:</strong>
                    <div className="movie-rating" style={{ marginTop: '5px' }}>
                      {movie.imdb_score && movie.imdb_score !== 'N/A' && (
                        <span className="rating-badge">
                          IMDb: {movie.imdb_score}
                        </span>
                      )}
                      {movie.rotten_tomatoes_score && movie.rotten_tomatoes_score !== 'N/A' && (
                        <span className="rating-badge">
                          Rotten Tomatoes: {movie.rotten_tomatoes_score}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {movie.plot && movie.plot !== 'N/A' && (
            <div style={{ marginBottom: '20px' }}>
              <strong>Plot:</strong>
              <p style={{ 
                marginTop: '8px', 
                lineHeight: '1.6', 
                color: 'rgba(255, 255, 255, 0.9)' 
              }}>
                {movie.plot}
              </p>
            </div>
          )}
          
          {/* Personal Rating and Management Section */}
          <div style={{ 
            marginBottom: '20px', 
            padding: '20px', 
            background: 'rgba(255, 255, 255, 0.05)', 
            borderRadius: '8px' 
          }}>
            <h4 style={{ marginBottom: '15px' }}>Personal Management</h4>
            
            {/* Personal Rating */}
            <div style={{ marginBottom: '15px' }}>
              <strong>Your Rating:</strong>
              <div style={{ marginTop: '5px' }}>
                {renderStars()}
                {movie.personal_rating && (
                  <span style={{ marginLeft: '10px', color: '#ffd700' }}>
                    {movie.personal_rating}/5 stars
                  </span>
                )}
              </div>
            </div>
            
            {/* Watch Status */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={movie.watched || false}
                  onChange={toggleWatched}
                  style={{ marginRight: '8px' }}
                />
                <strong>Watched</strong>
                {movie.date_watched && (
                  <span style={{ marginLeft: '10px', fontSize: '0.9rem', color: '#999' }}>
                    on {new Date(movie.date_watched).toLocaleDateString()}
                  </span>
                )}
              </label>
            </div>
            
            {/* Lending Status */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={movie.lent_out || false}
                  onChange={toggleLentOut}
                  style={{ marginRight: '8px' }}
                />
                <strong>Lent Out</strong>
                {movie.lent_out && movie.lent_to && (
                  <span style={{ marginLeft: '10px', fontSize: '0.9rem', color: '#ff9500' }}>
                    to {movie.lent_to}
                    {movie.date_lent && ` on ${new Date(movie.date_lent).toLocaleDateString()}`}
                  </span>
                )}
              </label>
            </div>
            
            {/* Notes and Tags Editing */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <strong>Notes & Tags:</strong>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setIsEditing(!isEditing)}
                  style={{ fontSize: '0.8rem', padding: '5px 10px' }}
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>
              
              {isEditing ? (
                <div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>
                      Notes:
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add your personal notes about this movie..."
                      style={{
                        width: '100%',
                        minHeight: '80px',
                        padding: '8px',
                        background: '#1a1a1a',
                        color: '#e5e5e7',
                        border: '1px solid #3a3a3a',
                        borderRadius: '4px',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>
                      Tags (comma-separated):
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g., favorite, action, must-watch"
                      style={{
                        width: '100%',
                        padding: '8px',
                        background: '#1a1a1a',
                        color: '#e5e5e7',
                        border: '1px solid #3a3a3a',
                        borderRadius: '4px'
                      }}
                    />
                    <div style={{ marginTop: '5px', fontSize: '0.8rem' }}>
                      Quick tags: {['favorite', 'must-watch', 'rewatchable', 'classic'].map(tag => (
                        <button
                          key={tag}
                          onClick={() => addQuickTag(tag)}
                          style={{
                            marginRight: '5px',
                            padding: '2px 6px',
                            fontSize: '0.8rem',
                            background: 'transparent',
                            color: '#667eea',
                            border: '1px solid #667eea',
                            borderRadius: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    className="btn btn-primary"
                    onClick={handleSaveNotes}
                    style={{ fontSize: '0.9rem' }}
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <div>
                  {notes && (
                    <div style={{ marginBottom: '10px' }}>
                      <em style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{notes}</em>
                    </div>
                  )}
                  {formatTags(tags).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {formatTags(tags).map((tag, index) => (
                        <span
                          key={index}
                          style={{
                            padding: '3px 8px',
                            background: '#667eea',
                            color: 'white',
                            borderRadius: '12px',
                            fontSize: '0.8rem'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {!notes && formatTags(tags).length === 0 && (
                    <em style={{ color: '#999' }}>No notes or tags added</em>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              Delete Movie
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieModal;