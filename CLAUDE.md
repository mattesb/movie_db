# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

This is a full-stack movie database application with React frontend, Flask backend, and PostgreSQL database. The application integrates both TMDB and OMDB APIs for comprehensive movie data and allows users to manage their personal movie collection.

### Backend Architecture (`backend/`)
- **Flask app** (`app.py`): Single-file application with SQLAlchemy ORM
- **Movie model**: Rich schema with TMDB data storage (cast, trailers, similar movies, backdrop images)
- **API endpoints**: RESTful design with CRUD operations, dual search methods, filtering, and statistics
- **Dual API integration**: TMDB for rich metadata + OMDB for ratings, prevents duplicate additions
- **Database**: PostgreSQL with enhanced schema for TMDB data storage

### Frontend Architecture (`frontend/src/`)
- **React 18** with functional components and hooks
- **Netflix-style UI**: Cinematic movie modal with tabbed interface
- **Component structure**: Modular design with separate views for collection, search, and statistics
- **State management**: Local React state with useEffect for API calls
- **API integration**: Environment-based API URL configuration

## Key Components

### Backend Routes
- `GET /movies` - List all movies
- `POST /movies` - Add movie manually
- `GET /movies/search?title=X` - Search by title using TMDB+OMDB and add to collection
- `GET /movies/search/imdb?imdb_id=X` - **NEW!** Search by IMDB ID for precise movie identification
- `GET /movies/<id>/enhanced` - Get movie with TMDB data (auto-fetches if missing)
- `GET /movies/filter` - Filter by genre, year, director, actor, title, min_rating
- `GET /movies/stats` - Collection statistics
- `PUT /movies/<id>` - Update movie details
- `DELETE /movies/<id>` - Remove from collection

### Frontend Components
- **App.js**: Main application with enhanced error handling and dual search support
- **CollectionView**: Grid display of movie collection
- **SearchView**: Dual search interface (title + IMDB ID) with dynamic validation
- **StatisticsView**: Collection analytics and charts
- **MovieModal**: **REDESIGNED!** Netflix-style cinematic layout with tabbed interface (Overview, Cast, Trailers, Similar, Manage)
- **MovieFilters**: Advanced filtering interface

## Development Commands

### Docker Development (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs [frontend|backend|db]

# Stop services
docker-compose down
```

### Database Operations
```bash
# Initialize database (first run)
docker-compose exec backend flask db upgrade

# Create migration
docker-compose exec backend flask db migrate -m "Description"

# Apply migrations
docker-compose exec backend flask db upgrade
```

### Local Development
```bash
# Frontend
cd frontend
npm install
npm start  # Development server on port 3000
npm run build  # Production build
npm run serve  # Serve built files

# Backend
cd backend
pip install -r requirements.txt
python app.py  # Development server on port 5000
```

### Testing & Verification
```bash
# Check container status
docker-compose ps

# Test backend API
curl http://localhost:5001/movies

# Test frontend
curl -I http://localhost:3001
```

## Configuration Notes

- **Ports**: Frontend (3001), Backend (5001), Database (5432 internal)
- **API Keys**: Securely configured via environment variables in `.env` file
  - `TMDB_API_KEY` - The Movie Database API key
  - `OMDB_API_KEY` - Open Movie Database API key
- **Database**: Auto-initializes with enhanced TMDB schema on container startup

## Database Schema

The Movie model includes standard metadata plus enhanced TMDB data storage:

### Core Movie Data
- Basic metadata (title, year, genre, director, actors, plot, poster)
- Multiple rating sources (IMDB, Rotten Tomatoes, Metacritic)
- Runtime information

### Personal Collection Management
- Personal ratings and notes
- Watch status and dates  
- Tags for organization
- Lending tracking (who borrowed, when)
- Multiple sources tracking (Apple TV, UHD Disk, etc.)

### TMDB Enhanced Data (NEW!)
- `tmdb_id` - TMDB movie identifier
- `backdrop_url` - High-resolution backdrop images
- `tmdb_rating` - TMDB community rating
- `tmdb_vote_count` - Number of votes
- `cast_data` - JSON array of cast information with profile images
- `trailers_data` - JSON array of movie trailers (YouTube links)
- `similar_movies_data` - JSON array of similar/recommended movies

## Recent Major Updates (2025-08-24)

### 🎬 TMDB API Integration & Database Enhancement
- **Comprehensive TMDB Integration**: Full integration with The Movie Database API alongside existing OMDB API
- **Enhanced Database Schema**: Added 7 new fields for TMDB data storage (tmdb_id, backdrop_url, tmdb_rating, tmdb_vote_count, cast_data, trailers_data, similar_movies_data)
- **Automatic Data Migration**: Enhanced endpoint automatically fetches and stores TMDB data for existing movies
- **Performance Optimization**: Movie data now stored in database to reduce external API calls

### 🔍 Dual Search Implementation
- **IMDB ID Search**: New precise search method using IMDB IDs (e.g., tt0816692)
- **Title Search Enhanced**: Existing title search now combines TMDB + OMDB data
- **Dynamic Frontend Interface**: Radio button selection between "By Title" and "By IMDB ID"
- **Smart Validation**: Different validation patterns and help tips for each search method
- **Improved Error Handling**: User-friendly duplicate detection and error messages

### 🎨 Netflix-Style Movie Modal Redesign
- **Cinematic Layout**: Hero section with high-resolution backdrop images from TMDB
- **Tabbed Interface**: 5 tabs - Overview, Cast, Trailers, Similar Movies, Manage
- **Rich Media Content**: 
  - Cast photos and character names
  - YouTube trailer integration
  - Similar movie recommendations with posters
  - High-quality backdrop images
- **Enhanced Manage Tab**: Personal ratings, notes, watch status, lending tracking

### 🔒 Security Improvements
- **Environment Variable Configuration**: API keys moved from docker-compose.yml to .env file
- **Git History Cleanup**: Removed exposed API keys from version control history
- **Secure Deployment**: Updated documentation for proper API key setup

### 🛠️ Technical Enhancements
- **Dual API Architecture**: Intelligent combination of TMDB (rich metadata) + OMDB (ratings) data
- **Database Performance**: TMDB data cached in PostgreSQL for faster access
- **Error Resilience**: Comprehensive fallback handling when APIs are unavailable
- **RESTful Expansion**: New `/movies/search/imdb` endpoint for IMDB ID searches

### Previous Features Maintained
- Multiple source tracking (Apple TV, UHD Disk, etc.)
- Runtime information display
- Personal collection management (ratings, notes, tags, watch status, lending)
- Advanced filtering and search
- Clean, minimal design with toast notifications
- Collection statistics and analytics

## Current Development Status
- ✅ **Fully Functional**: Dual search (title + IMDB ID) with comprehensive TMDB integration
- ✅ **Database Enhanced**: All existing movies can be automatically enriched with TMDB data
- ✅ **Security Compliant**: API keys properly configured via environment variables
- ✅ **UI Modernized**: Netflix-style interface with rich media content
- 📅 **Ready for Next Session**: Project state documented and ready for continued development