import React from 'react';
import MovieStats from './MovieStats';

function StatisticsView({ stats, movies }) {
  if (!stats || !movies) {
    return (
      <div className="loading">
        Loading statistics...
      </div>
    );
  }

  const { total_movies, genres, decades, top_directors } = stats;

  // Calculate additional insights
  const totalGenres = Object.keys(genres).length;
  const totalDecades = Object.keys(decades).length;
  const averageRating = movies.length > 0 
    ? (movies.reduce((sum, movie) => {
        const rating = parseFloat(movie.imdb_score || 0);
        return sum + rating;
      }, 0) / movies.length).toFixed(1)
    : 0;

  const watchedCount = movies.filter(m => m.watched).length;
  const unwatchedCount = total_movies - watchedCount;
  
  const lentOutCount = movies.filter(m => m.lent_out).length;
  const atHomeCount = total_movies - lentOutCount;

  const personallyRated = movies.filter(m => m.personal_rating).length;
  const averagePersonalRating = personallyRated > 0
    ? (movies.reduce((sum, movie) => sum + (movie.personal_rating || 0), 0) / personallyRated).toFixed(1)
    : 0;

  const latestMovies = movies
    .sort((a, b) => new Date(b.date_added) - new Date(a.date_added))
    .slice(0, 5);

  const topRatedMovies = movies
    .filter(m => m.imdb_score && m.imdb_score !== 'N/A')
    .sort((a, b) => parseFloat(b.imdb_score) - parseFloat(a.imdb_score))
    .slice(0, 5);

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
          📊 Collection Statistics & Insights
        </h2>
        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
          Discover patterns and insights from your movie collection
        </p>
      </div>

      <MovieStats stats={stats} />

      {/* Extended Statistics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '25px',
        marginTop: '30px'
      }}>
        
        {/* Viewing Progress */}
        <div className="search-section">
          <h3 style={{ marginBottom: '15px', fontSize: '1.4rem' }}>
            📺 Viewing Progress
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Watched</span>
              <span className="rating-badge" style={{ background: 'rgba(72, 187, 120, 0.3)' }}>
                {watchedCount}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Not Watched</span>
              <span className="rating-badge" style={{ background: 'rgba(255, 107, 107, 0.3)' }}>
                {unwatchedCount}
              </span>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              height: '20px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                background: 'linear-gradient(90deg, #48bb78, #38a169)',
                height: '100%',
                width: `${total_movies > 0 ? (watchedCount / total_movies) * 100 : 0}%`,
                transition: 'width 0.3s ease'
              }} />
              <span style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                color: 'white',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
              }}>
                {total_movies > 0 ? Math.round((watchedCount / total_movies) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Lending Status */}
        <div className="search-section">
          <h3 style={{ marginBottom: '15px', fontSize: '1.4rem' }}>
            📤 Lending Status
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>At Home</span>
              <span className="rating-badge" style={{ background: 'rgba(72, 187, 120, 0.3)' }}>
                {atHomeCount}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Lent Out</span>
              <span className="rating-badge" style={{ background: 'rgba(255, 193, 7, 0.3)' }}>
                {lentOutCount}
              </span>
            </div>
            
            {lentOutCount > 0 && (
              <div style={{ marginTop: '10px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>Currently Lent:</h4>
                {movies.filter(m => m.lent_out).map(movie => (
                  <div key={movie.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '5px 8px',
                    background: 'rgba(255, 193, 7, 0.1)',
                    borderRadius: '4px',
                    marginBottom: '4px',
                    fontSize: '0.9rem'
                  }}>
                    <span>{movie.title}</span>
                    <span style={{ opacity: 0.8 }}>
                      → {movie.lent_to}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rating Analysis */}
        <div className="search-section">
          <h3 style={{ marginBottom: '15px', fontSize: '1.4rem' }}>
            ⭐ Rating Analysis
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Average IMDb Rating:</span>
              <span className="rating-badge">{averageRating}/10</span>
            </div>
            {personallyRated > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Your Average Rating:</span>
                <span className="rating-badge">{averagePersonalRating}/5 ⭐</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Movies You've Rated:</span>
              <span className="rating-badge">{personallyRated}/{total_movies}</span>
            </div>
          </div>
        </div>

        {/* Collection Insights */}
        <div className="search-section">
          <h3 style={{ marginBottom: '15px', fontSize: '1.4rem' }}>
            🔍 Collection Insights
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Genres:</span>
              <span className="rating-badge">{totalGenres}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Decades Covered:</span>
              <span className="rating-badge">{totalDecades}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Unique Directors:</span>
              <span className="rating-badge">{Object.keys(top_directors).length}</span>
            </div>
          </div>
        </div>

        {/* Latest Additions */}
        <div className="search-section">
          <h3 style={{ marginBottom: '15px', fontSize: '1.4rem' }}>
            🆕 Latest Additions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {latestMovies.map((movie, index) => (
              <div key={movie.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '6px'
              }}>
                <span style={{ fontSize: '0.9rem' }}>
                  {index + 1}. {movie.title}
                </span>
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                  {movie.year}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Rated Movies */}
        <div className="search-section">
          <h3 style={{ marginBottom: '15px', fontSize: '1.4rem' }}>
            🏆 Highest Rated (IMDb)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topRatedMovies.map((movie, index) => (
              <div key={movie.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px',
                background: 'rgba(255, 215, 0, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(255, 215, 0, 0.3)'
              }}>
                <span style={{ fontSize: '0.9rem' }}>
                  {index + 1}. {movie.title}
                </span>
                <span className="rating-badge">
                  {movie.imdb_score}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Collection Goals */}
        <div className="search-section">
          <h3 style={{ marginBottom: '15px', fontSize: '1.4rem' }}>
            🎯 Collection Goals
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              padding: '10px',
              background: total_movies >= 10 ? 'rgba(72, 187, 120, 0.2)' : 'rgba(255, 107, 107, 0.2)',
              borderRadius: '6px',
              border: `1px solid ${total_movies >= 10 ? 'rgba(72, 187, 120, 0.5)' : 'rgba(255, 107, 107, 0.5)'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Movie Collector</span>
                <span>{total_movies >= 10 ? '✅' : '⏳'}</span>
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                Collect 10+ movies ({total_movies}/10)
              </div>
            </div>
            
            <div style={{
              padding: '10px',
              background: watchedCount >= 5 ? 'rgba(72, 187, 120, 0.2)' : 'rgba(255, 107, 107, 0.2)',
              borderRadius: '6px',
              border: `1px solid ${watchedCount >= 5 ? 'rgba(72, 187, 120, 0.5)' : 'rgba(255, 107, 107, 0.5)'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Movie Watcher</span>
                <span>{watchedCount >= 5 ? '✅' : '⏳'}</span>
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                Watch 5+ movies ({watchedCount}/5)
              </div>
            </div>

            <div style={{
              padding: '10px',
              background: personallyRated >= 3 ? 'rgba(72, 187, 120, 0.2)' : 'rgba(255, 107, 107, 0.2)',
              borderRadius: '6px',
              border: `1px solid ${personallyRated >= 3 ? 'rgba(72, 187, 120, 0.5)' : 'rgba(255, 107, 107, 0.5)'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Movie Critic</span>
                <span>{personallyRated >= 3 ? '✅' : '⏳'}</span>
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                Rate 3+ movies ({personallyRated}/3)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatisticsView;