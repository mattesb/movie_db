import React, { useState, useEffect } from 'react';

function MovieModal({ movie, onClose, onDelete, onUpdate }) {
  const [notes, setNotes] = useState(movie.notes || '');
  const [tags, setTags] = useState(movie.tags || '');
  const [sources, setSources] = useState(movie.sources || []);
  const [isEditing, setIsEditing] = useState(false);
  const [enhancedData, setEnhancedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch enhanced movie data on component mount
  useEffect(() => {
    const fetchEnhancedData = async () => {
      try {
        // Dynamic API URL detection
        const getApiBaseUrl = () => {
          if (process.env.REACT_APP_API_URL) {
            return process.env.REACT_APP_API_URL;
          }
          const protocol = window['location']['protocol'];
          const hostname = window['location']['hostname'];
          return `${protocol}//${hostname}:5001`;
        };
        const API_BASE_URL = getApiBaseUrl();
        const response = await fetch(`${API_BASE_URL}/movies/${movie.id}/enhanced`);
        if (response.ok) {
          const data = await response.json();
          // Extract TMDB data from the movie object
          setEnhancedData({
            tmdb_id: data.tmdb_id,
            backdrop_url: data.backdrop_url,
            tmdb_rating: data.tmdb_rating,
            tmdb_vote_count: data.tmdb_vote_count,
            cast: data.cast_data || [],
            trailers: data.trailers_data || [],
            similar_movies: data.similar_movies_data || []
          });
        }
      } catch (error) {
        console.error('Failed to fetch enhanced movie data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnhancedData();
  }, [movie.id]);

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
      const lentTo = prompt("Who are you lending this movie to?");
      if (lentTo === null) return;
      
      await onUpdate(movie.id, { 
        lent_out: true,
        lent_to: lentTo.trim() || "Unknown",
        date_lent: new Date().toISOString()
      });
    } else {
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
            marginRight: '3px',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (i <= (movie.personal_rating || 0)) return;
            e.target.style.color = '#ffed4e';
          }}
          onMouseLeave={(e) => {
            if (i <= (movie.personal_rating || 0)) return;
            e.target.style.color = '#444';
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📖' },
    { id: 'cast', label: 'Cast & Crew', icon: '🎭' },
    { id: 'media', label: 'Trailers', icon: '🎬' },
    { id: 'similar', label: 'Similar', icon: '🎯' },
    { id: 'manage', label: 'Manage', icon: '⚙️' }
  ];

  return (
    <div 
      className="modal-overlay" 
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
    >
      <div 
        className="modal"
        style={{
          background: '#1a1a1a',
          borderRadius: '20px',
          maxWidth: '1000px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid #333',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8)'
        }}
      >
        {/* Hero Section with Backdrop */}
        <div style={{ position: 'relative', height: '300px', overflow: 'hidden' }}>
          {enhancedData?.backdrop_url && !loading ? (
            <div
              style={{
                backgroundImage: `url(${enhancedData.backdrop_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '100%',
                width: '100%',
                position: 'absolute',
                top: 0,
                left: 0
              }}
            />
          ) : (
            <div
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                height: '100%',
                width: '100%',
                position: 'absolute',
                top: 0,
                left: 0
              }}
            />
          )}
          
          {/* Overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to top, rgba(26, 26, 26, 0.95) 0%, rgba(26, 26, 26, 0.7) 50%, rgba(26, 26, 26, 0.3) 100%)'
            }}
          />

          {/* Close Button */}
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(0, 0, 0, 0.7)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 69, 58, 0.8)';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(0, 0, 0, 0.7)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            ×
          </button>

          {/* Hero Content */}
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '30px',
              right: '30px',
              zIndex: 5
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '25px' }}>
              {/* Poster */}
              <img 
                src={movie.poster_url && movie.poster_url !== 'N/A' ? movie.poster_url : defaultPoster}
                alt={`${movie.title} poster`}
                style={{
                  width: '120px',
                  height: '180px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  border: '3px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)'
                }}
                onError={(e) => {
                  e.target.src = defaultPoster;
                }}
              />
              
              {/* Title and Info */}
              <div style={{ flex: 1, paddingBottom: '10px' }}>
                <h1 style={{
                  margin: '0 0 8px 0',
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: 'white',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                  lineHeight: '1.2'
                }}>
                  {movie.title}
                </h1>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '12px' }}>
                  {movie.year && (
                    <span style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1.1rem',
                      fontWeight: '500'
                    }}>
                      {movie.year}
                    </span>
                  )}
                  {movie.runtime && (
                    <>
                      <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>•</span>
                      <span style={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '1rem'
                      }}>
                        {movie.runtime}
                      </span>
                    </>
                  )}
                </div>

                {/* Ratings Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  {movie.imdb_score && movie.imdb_score !== 'N/A' && (
                    <div style={{
                      background: 'rgba(245, 197, 24, 0.9)',
                      color: '#1a1a1a',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      ⭐ {movie.imdb_score}
                    </div>
                  )}
                  {enhancedData?.tmdb_rating && (
                    <div style={{
                      background: 'rgba(3, 37, 65, 0.9)',
                      color: '#01d277',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: '700'
                    }}>
                      TMDB {enhancedData.tmdb_rating}/10
                    </div>
                  )}
                  {movie.rotten_tomatoes_score && movie.rotten_tomatoes_score !== 'N/A' && (
                    <div style={{
                      background: 'rgba(250, 50, 50, 0.9)',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      🍅 {movie.rotten_tomatoes_score}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          borderBottom: '1px solid #333',
          padding: '0 30px'
        }}>
          <div style={{
            display: 'flex',
            gap: '0'
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? '#333' : 'transparent',
                  border: 'none',
                  color: activeTab === tab.id ? 'white' : '#888',
                  padding: '15px 20px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  borderBottom: activeTab === tab.id ? '2px solid #0A84FF' : '2px solid transparent',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.color = '#ccc';
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.color = '#888';
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '1rem' }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div style={{
          maxHeight: 'calc(90vh - 400px)',
          overflowY: 'auto',
          padding: '30px'
        }}>
          {loading && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              fontSize: '1rem',
              color: '#666'
            }}>
              <div style={{ marginBottom: '15px', fontSize: '2rem' }}>🎬</div>
              Loading enhanced movie data...
            </div>
          )}

          {!loading && (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                  {/* Genre and Director */}
                  <div style={{ marginBottom: '25px' }}>
                    {movie.genre && (
                      <div style={{ marginBottom: '10px' }}>
                        <span style={{ color: '#888', fontSize: '0.9rem', fontWeight: '600' }}>GENRE</span>
                        <div style={{ color: '#e5e5e7', fontSize: '1.1rem', marginTop: '5px' }}>
                          {movie.genre}
                        </div>
                      </div>
                    )}
                    {movie.director && movie.director !== 'N/A' && (
                      <div style={{ marginBottom: '10px' }}>
                        <span style={{ color: '#888', fontSize: '0.9rem', fontWeight: '600' }}>DIRECTOR</span>
                        <div style={{ color: '#e5e5e7', fontSize: '1.1rem', marginTop: '5px' }}>
                          {movie.director}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Plot */}
                  {movie.plot && movie.plot !== 'N/A' && (
                    <div style={{ marginBottom: '25px' }}>
                      <h3 style={{ 
                        color: 'white', 
                        fontSize: '1.3rem', 
                        fontWeight: '600', 
                        marginBottom: '12px' 
                      }}>
                        Overview
                      </h3>
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        lineHeight: '1.7',
                        fontSize: '1rem',
                        margin: 0
                      }}>
                        {movie.plot}
                      </p>
                    </div>
                  )}

                  {/* Sources */}
                  <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ 
                      color: 'white', 
                      fontSize: '1.3rem', 
                      fontWeight: '600', 
                      marginBottom: '12px' 
                    }}>
                      Available On
                    </h3>
                    {sources.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {sources.map((source, index) => (
                          <div
                            key={index}
                            style={{
                              background: source === 'Apple TV' ? '#007AFF' : '#8A2BE2',
                              color: 'white',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              fontSize: '0.9rem',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            {source === 'Apple TV' && '📺'}
                            {source === 'UHD Disk' && '💿'}
                            {source}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: '#666', fontStyle: 'italic' }}>
                        No sources specified
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cast Tab */}
              {activeTab === 'cast' && (
                <div>
                  {enhancedData?.cast && enhancedData.cast.length > 0 ? (
                    <div>
                      <h3 style={{ 
                        color: 'white', 
                        fontSize: '1.3rem', 
                        fontWeight: '600', 
                        marginBottom: '20px' 
                      }}>
                        Main Cast
                      </h3>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '20px'
                      }}>
                        {enhancedData.cast.map((actor, index) => (
                          <div key={index} style={{
                            textAlign: 'center',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '12px',
                            padding: '15px',
                            transition: 'transform 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                          >
                            {actor.profile_path ? (
                              <img
                                src={actor.profile_path}
                                alt={actor.name}
                                style={{
                                  width: '100px',
                                  height: '150px',
                                  objectFit: 'cover',
                                  borderRadius: '8px',
                                  marginBottom: '10px'
                                }}
                              />
                            ) : (
                              <div style={{
                                width: '100px',
                                height: '150px',
                                background: '#333',
                                borderRadius: '8px',
                                marginBottom: '10px',
                                margin: '0 auto 10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem'
                              }}>
                                🎭
                              </div>
                            )}
                            <div style={{
                              fontSize: '0.9rem',
                              fontWeight: 'bold',
                              color: 'white',
                              marginBottom: '5px'
                            }}>
                              {actor.name}
                            </div>
                            {actor.character && (
                              <div style={{
                                fontSize: '0.8rem',
                                color: '#888'
                              }}>
                                as {actor.character}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '60px 20px',
                      color: '#666'
                    }}>
                      <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎭</div>
                      <div>No cast information available</div>
                    </div>
                  )}
                </div>
              )}

              {/* Media/Trailers Tab */}
              {activeTab === 'media' && (
                <div>
                  {enhancedData?.trailers && enhancedData.trailers.length > 0 ? (
                    <div>
                      <h3 style={{ 
                        color: 'white', 
                        fontSize: '1.3rem', 
                        fontWeight: '600', 
                        marginBottom: '20px' 
                      }}>
                        Trailers & Videos
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {enhancedData.trailers.map((trailer, index) => (
                          <div key={index} style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '12px',
                            padding: '20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'background 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                          >
                            <div>
                              <div style={{
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                color: 'white',
                                marginBottom: '5px'
                              }}>
                                {trailer.name}
                              </div>
                              <div style={{
                                fontSize: '0.9rem',
                                color: '#888'
                              }}>
                                {trailer.type} • {trailer.site}
                              </div>
                            </div>
                            {trailer.url && (
                              <a
                                href={trailer.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  background: '#ff0000',
                                  color: 'white',
                                  padding: '10px 20px',
                                  borderRadius: '25px',
                                  textDecoration: 'none',
                                  fontSize: '0.9rem',
                                  fontWeight: '600',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.background = '#cc0000';
                                  e.target.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.background = '#ff0000';
                                  e.target.style.transform = 'scale(1)';
                                }}
                              >
                                <span>▶</span> Watch on YouTube
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '60px 20px',
                      color: '#666'
                    }}>
                      <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎬</div>
                      <div>No trailers available</div>
                    </div>
                  )}
                </div>
              )}

              {/* Similar Movies Tab */}
              {activeTab === 'similar' && (
                <div>
                  {enhancedData?.similar_movies && enhancedData.similar_movies.length > 0 ? (
                    <div>
                      <h3 style={{ 
                        color: 'white', 
                        fontSize: '1.3rem', 
                        fontWeight: '600', 
                        marginBottom: '20px' 
                      }}>
                        Similar Movies
                      </h3>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: '20px'
                      }}>
                        {enhancedData.similar_movies.map((similarMovie, index) => (
                          <div key={index} style={{
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'transform 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            {similarMovie.poster_path ? (
                              <img
                                src={similarMovie.poster_path}
                                alt={similarMovie.title}
                                style={{
                                  width: '100%',
                                  aspectRatio: '2/3',
                                  objectFit: 'cover',
                                  borderRadius: '10px',
                                  marginBottom: '10px',
                                  border: '2px solid rgba(255, 255, 255, 0.1)'
                                }}
                              />
                            ) : (
                              <div style={{
                                width: '100%',
                                aspectRatio: '2/3',
                                background: '#333',
                                borderRadius: '10px',
                                marginBottom: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem'
                              }}>
                                🎬
                              </div>
                            )}
                            <div style={{
                              fontSize: '0.9rem',
                              fontWeight: 'bold',
                              color: 'white',
                              marginBottom: '5px'
                            }}>
                              {similarMovie.title}
                            </div>
                            {similarMovie.release_date && (
                              <div style={{
                                fontSize: '0.8rem',
                                color: '#888'
                              }}>
                                {new Date(similarMovie.release_date).getFullYear()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '60px 20px',
                      color: '#666'
                    }}>
                      <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎯</div>
                      <div>No similar movies available</div>
                    </div>
                  )}
                </div>
              )}

              {/* Manage Tab */}
              {activeTab === 'manage' && (
                <div>
                  <h3 style={{ 
                    color: 'white', 
                    fontSize: '1.3rem', 
                    fontWeight: '600', 
                    marginBottom: '20px' 
                  }}>
                    Personal Management
                  </h3>
                  
                  <div style={{ display: 'grid', gap: '20px' }}>
                    {/* Personal Rating */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      padding: '20px'
                    }}>
                      <div style={{ 
                        fontSize: '1rem', 
                        fontWeight: '600', 
                        color: 'white', 
                        marginBottom: '12px' 
                      }}>
                        Your Rating
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {renderStars()}
                        </div>
                        {movie.personal_rating && (
                          <span style={{ 
                            color: '#ffd700', 
                            fontSize: '1rem',
                            fontWeight: '600'
                          }}>
                            {movie.personal_rating}/5 stars
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Watch Status */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      padding: '20px'
                    }}>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: 'white'
                      }}>
                        <input
                          type="checkbox"
                          checked={movie.watched || false}
                          onChange={toggleWatched}
                          style={{ 
                            marginRight: '12px',
                            transform: 'scale(1.2)'
                          }}
                        />
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>✅</span> Watched
                        </span>
                        {movie.date_watched && (
                          <span style={{ 
                            marginLeft: '15px', 
                            fontSize: '0.9rem', 
                            color: '#999',
                            fontWeight: '400'
                          }}>
                            on {new Date(movie.date_watched).toLocaleDateString()}
                          </span>
                        )}
                      </label>
                    </div>

                    {/* Lending Status */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      padding: '20px'
                    }}>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: 'white'
                      }}>
                        <input
                          type="checkbox"
                          checked={movie.lent_out || false}
                          onChange={toggleLentOut}
                          style={{ 
                            marginRight: '12px',
                            transform: 'scale(1.2)'
                          }}
                        />
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>📤</span> Lent Out
                        </span>
                        {movie.lent_out && movie.lent_to && (
                          <span style={{ 
                            marginLeft: '15px', 
                            fontSize: '0.9rem', 
                            color: '#ff9500',
                            fontWeight: '400'
                          }}>
                            to {movie.lent_to}
                            {movie.date_lent && ` on ${new Date(movie.date_lent).toLocaleDateString()}`}
                          </span>
                        )}
                      </label>
                    </div>

                    {/* Notes and Tags */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      padding: '20px'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '15px' 
                      }}>
                        <div style={{ 
                          fontSize: '1rem', 
                          fontWeight: '600', 
                          color: 'white' 
                        }}>
                          Notes & Tags
                        </div>
                        <button 
                          onClick={() => setIsEditing(!isEditing)}
                          style={{
                            background: isEditing ? '#ff3b30' : '#007AFF',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {isEditing ? 'Cancel' : 'Edit'}
                        </button>
                      </div>
                      
                      {isEditing ? (
                        <div style={{ display: 'grid', gap: '15px' }}>
                          <div>
                            <label style={{ 
                              display: 'block', 
                              marginBottom: '8px', 
                              fontSize: '0.9rem',
                              color: '#ccc',
                              fontWeight: '500'
                            }}>
                              Notes:
                            </label>
                            <textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Add your personal notes about this movie..."
                              style={{
                                width: '100%',
                                minHeight: '80px',
                                padding: '12px',
                                background: '#333',
                                color: '#e5e5e7',
                                border: '1px solid #555',
                                borderRadius: '8px',
                                resize: 'vertical',
                                fontSize: '0.9rem',
                                lineHeight: '1.5'
                              }}
                            />
                          </div>
                          
                          <div>
                            <label style={{ 
                              display: 'block', 
                              marginBottom: '8px', 
                              fontSize: '0.9rem',
                              color: '#ccc',
                              fontWeight: '500'
                            }}>
                              Tags (comma-separated):
                            </label>
                            <input
                              type="text"
                              value={tags}
                              onChange={(e) => setTags(e.target.value)}
                              placeholder="e.g., favorite, action, must-watch"
                              style={{
                                width: '100%',
                                padding: '12px',
                                background: '#333',
                                color: '#e5e5e7',
                                border: '1px solid #555',
                                borderRadius: '8px',
                                fontSize: '0.9rem'
                              }}
                            />
                            <div style={{ 
                              marginTop: '10px', 
                              display: 'flex', 
                              flexWrap: 'wrap', 
                              gap: '8px' 
                            }}>
                              <span style={{ fontSize: '0.8rem', color: '#999' }}>Quick tags:</span>
                              {['favorite', 'must-watch', 'rewatchable', 'classic'].map(tag => (
                                <button
                                  key={tag}
                                  onClick={() => addQuickTag(tag)}
                                  style={{
                                    padding: '4px 8px',
                                    fontSize: '0.8rem',
                                    background: 'transparent',
                                    color: '#667eea',
                                    border: '1px solid #667eea',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.background = '#667eea';
                                    e.target.style.color = 'white';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.background = 'transparent';
                                    e.target.style.color = '#667eea';
                                  }}
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <button 
                            onClick={handleSaveNotes}
                            style={{
                              background: '#34C759',
                              color: 'white',
                              border: 'none',
                              padding: '12px 20px',
                              borderRadius: '8px',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'background 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#2fb344'}
                            onMouseLeave={(e) => e.target.style.background = '#34C759'}
                          >
                            Save Changes
                          </button>
                        </div>
                      ) : (
                        <div>
                          {notes && (
                            <div style={{ marginBottom: '12px' }}>
                              <div style={{ 
                                fontSize: '0.9rem', 
                                color: '#ccc', 
                                marginBottom: '5px' 
                              }}>
                                Notes:
                              </div>
                              <div style={{ 
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontSize: '0.95rem',
                                lineHeight: '1.5',
                                fontStyle: 'italic'
                              }}>
                                {notes}
                              </div>
                            </div>
                          )}
                          {formatTags(tags).length > 0 && (
                            <div>
                              <div style={{ 
                                fontSize: '0.9rem', 
                                color: '#ccc', 
                                marginBottom: '8px' 
                              }}>
                                Tags:
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {formatTags(tags).map((tag, index) => (
                                  <span
                                    key={index}
                                    style={{
                                      padding: '4px 12px',
                                      background: '#667eea',
                                      color: 'white',
                                      borderRadius: '15px',
                                      fontSize: '0.8rem',
                                      fontWeight: '500'
                                    }}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {!notes && formatTags(tags).length === 0 && (
                            <div style={{ 
                              color: '#666', 
                              fontStyle: 'italic',
                              fontSize: '0.9rem'
                            }}>
                              No notes or tags added
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{
                      background: 'rgba(255, 69, 58, 0.1)',
                      border: '1px solid rgba(255, 69, 58, 0.3)',
                      borderRadius: '12px',
                      padding: '20px'
                    }}>
                      <div style={{ 
                        fontSize: '1rem', 
                        fontWeight: '600', 
                        color: 'white', 
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span>⚠️</span> Danger Zone
                      </div>
                      <button 
                        onClick={handleDelete}
                        style={{
                          background: '#FF453A',
                          color: 'white',
                          border: 'none',
                          padding: '12px 20px',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'background 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#ff3b30'}
                        onMouseLeave={(e) => e.target.style.background = '#FF453A'}
                      >
                        Delete Movie
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieModal;