import React from 'react';

function MovieFilters({ filters, onFilterChange, onClearFilters }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 }, (_, i) => currentYear - i);

  const hasActiveFilters = Object.values(filters).some(filter => filter.trim() !== '');

  return (
    <div className="search-section">
      <h2 style={{ marginBottom: '20px', fontSize: '1.8rem' }}>
        🔍 Advanced Filters
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Title</label>
          <input
            type="text"
            value={filters.title}
            onChange={(e) => onFilterChange('title', e.target.value)}
            placeholder="Search by title..."
            className="search-input"
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Genre</label>
          <input
            type="text"
            value={filters.genre}
            onChange={(e) => onFilterChange('genre', e.target.value)}
            placeholder="e.g., Action, Drama..."
            className="search-input"
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Director</label>
          <input
            type="text"
            value={filters.director}
            onChange={(e) => onFilterChange('director', e.target.value)}
            placeholder="Director name..."
            className="search-input"
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Actor</label>
          <input
            type="text"
            value={filters.actor}
            onChange={(e) => onFilterChange('actor', e.target.value)}
            placeholder="Actor name..."
            className="search-input"
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Year</label>
          <select
            value={filters.year}
            onChange={(e) => onFilterChange('year', e.target.value)}
            className="search-input"
            style={{ width: '100%' }}
          >
            <option value="">All years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Min Rating</label>
          <select
            value={filters.min_rating}
            onChange={(e) => onFilterChange('min_rating', e.target.value)}
            className="search-input"
            style={{ width: '100%' }}
          >
            <option value="">Any rating</option>
            <option value="9.0">9.0+ (Masterpiece)</option>
            <option value="8.0">8.0+ (Excellent)</option>
            <option value="7.0">7.0+ (Good)</option>
            <option value="6.0">6.0+ (Decent)</option>
            <option value="5.0">5.0+ (Average)</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={onClearFilters}
            className="btn btn-secondary"
          >
            Clear All Filters
          </button>
          <span style={{ opacity: 0.8, fontSize: '0.9rem' }}>
            Active filters applied
          </span>
        </div>
      )}

      {!hasActiveFilters && (
        <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
          <strong>Tips:</strong> Use filters to find specific movies in your collection. You can combine multiple filters for precise results.
        </div>
      )}
    </div>
  );
}

export default MovieFilters;