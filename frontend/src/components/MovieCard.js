import React from 'react';

function MovieCard({ movie, onClick, onDelete, onUpdateMovie }) {
  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent triggering onClick when delete is clicked
    if (window.confirm(`Are you sure you want to delete "${movie.title}"?`)) {
      onDelete();
    }
  };


  const renderRatingStars = () => {
    if (!movie.personal_rating) return null;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          style={{
            color: i <= movie.personal_rating ? '#ffd700' : '#333',
            fontSize: '0.9rem',
            marginRight: '1px'
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const defaultPoster = "https://via.placeholder.com/300x400/333/fff?text=No+Poster";

  return (
    <div 
      className="movie-card" 
      onClick={onClick}
      style={{
        background: '#2a2a2a',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        border: '1px solid #3a3a3a'
      }}
      onMouseEnter={(e) => {
        e.target.style.boxShadow = '0 8px 32px rgba(0,0,0,0.6)';
        e.target.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
        e.target.style.transform = 'translateY(0)';
      }}
    >
      {/* Poster */}
      <div style={{ position: 'relative', aspectRatio: '2/3', background: '#1a1a1a' }}>
        <img 
          src={movie.poster_url && movie.poster_url !== 'N/A' ? movie.poster_url : defaultPoster}
          alt={`${movie.title} poster`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            e.target.src = defaultPoster;
          }}
        />
        
        {/* Status indicators overlay */}
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          display: 'flex',
          gap: '4px'
        }}>
          {movie.watched && (
            <span style={{
              background: 'rgba(34, 197, 94, 0.9)',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '6px',
              fontSize: '0.7rem',
              fontWeight: '500'
            }}>
              ✓
            </span>
          )}
          {movie.lent_out && (
            <span style={{
              background: 'rgba(234, 179, 8, 0.9)',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '6px',
              fontSize: '0.7rem',
              fontWeight: '500'
            }}>
              📤
            </span>
          )}
        </div>

        {/* Rating badges */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          display: 'flex',
          gap: '6px'
        }}>
          {movie.imdb_score && movie.imdb_score !== 'N/A' && (
            <div style={{
              background: 'rgba(0,0,0,0.8)',
              color: '#ffd700',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}>
              ★ {movie.imdb_score}
            </div>
          )}
          {movie.rotten_tomatoes_score && movie.rotten_tomatoes_score !== 'N/A' && (
            <div style={{
              background: 'rgba(0,0,0,0.8)',
              color: '#ff6347',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}>
              🍅 {movie.rotten_tomatoes_score}
            </div>
          )}
        </div>
      </div>

      {/* Movie Info */}
      <div style={{ padding: '16px' }}>
        {/* Title & Year */}
        <h3 style={{
          margin: '0 0 6px 0',
          fontSize: '1.1rem',
          fontWeight: '600',
          color: '#e5e5e7',
          lineHeight: '1.3',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {movie.title}
        </h3>

        {/* Year & Runtime */}
        <div style={{
          marginBottom: '8px',
          fontSize: '0.85rem',
          color: '#a8a8aa',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {movie.year && <span>{movie.year}</span>}
          {movie.year && movie.runtime && <span>•</span>}
          {movie.runtime && <span>{movie.runtime}</span>}
        </div>

        {/* Sources */}
        {movie.sources && movie.sources.length > 0 && (
          <div style={{ 
            marginBottom: '8px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px'
          }}>
            {movie.sources.map((source, index) => (
              <span
                key={index}
                style={{
                  background: source === 'Apple TV' ? '#007AFF' : '#8A2BE2',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '0.7rem',
                  fontWeight: '500'
                }}
              >
                {source === 'Apple TV' && '📺 '}
                {source === 'UHD Disk' && '💿 '}
                {source}
              </span>
            ))}
          </div>
        )}

        {/* Genre */}
        {movie.genre && (
          <div style={{
            fontSize: '0.8rem',
            color: '#888',
            marginBottom: '8px',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {movie.genre}
          </div>
        )}

        {/* Personal Rating */}
        {movie.personal_rating && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '0.8rem', color: '#888' }}>Your rating:</span>
            {renderRatingStars()}
          </div>
        )}

        {/* Quick actions - hidden, shown on hover via CSS or state */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '12px',
          opacity: 0.7
        }}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#0A84FF',
              fontSize: '0.8rem',
              cursor: 'pointer',
              padding: '4px 0',
              fontWeight: '500'
            }}
          >
            View Details →
          </button>
          <button 
            onClick={handleDelete}
            style={{
              background: 'none',
              border: 'none',
              color: '#FF453A',
              fontSize: '0.8rem',
              cursor: 'pointer',
              padding: '4px 0',
              fontWeight: '500'
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;