import React from 'react';

function MovieStats({ stats }) {
  if (!stats) return null;

  const { total_movies, genres, decades, top_directors } = stats;

  return (
    <div className="search-section">
      <h2 style={{ marginBottom: '20px', fontSize: '1.8rem' }}>
        📊 Collection Statistics
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        
        {/* Total Movies */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '5px'
          }}>
            {total_movies}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>Total Movies</div>
        </div>

        {/* Top Genres */}
        <div>
          <h3 style={{ marginBottom: '10px', fontSize: '1.2rem' }}>🎭 Popular Genres</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {Object.entries(genres).slice(0, 5).map(([genre, count]) => (
              <div key={genre} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{genre}</span>
                <span className="rating-badge" style={{ minWidth: '30px', textAlign: 'center' }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Decades */}
        <div>
          <h3 style={{ marginBottom: '10px', fontSize: '1.2rem' }}>📅 By Decade</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {Object.entries(decades).map(([decade, count]) => (
              <div key={decade} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{decade}</span>
                <span className="rating-badge" style={{ minWidth: '30px', textAlign: 'center' }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Directors */}
        <div>
          <h3 style={{ marginBottom: '10px', fontSize: '1.2rem' }}>🎬 Top Directors</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {Object.entries(top_directors).slice(0, 5).map(([director, count]) => (
              <div key={director} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem' }}>{director}</span>
                <span className="rating-badge" style={{ minWidth: '30px', textAlign: 'center' }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: 'rgba(255, 255, 255, 0.05)', 
        borderRadius: '8px',
        fontSize: '0.9rem',
        opacity: 0.8
      }}>
        <strong>Collection Insights:</strong> Your collection spans {Object.keys(decades).length} decades 
        with {Object.keys(genres).length} different genres. 
        Most popular genre: <strong>{Object.keys(genres)[0]}</strong> ({Object.values(genres)[0]} movies)
      </div>
    </div>
  );
}

export default MovieStats;