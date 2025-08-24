# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

This is a full-stack movie database application with React frontend, Flask backend, and PostgreSQL database. The application allows users to search for movies via OMDB API and manage their personal movie collection.

### Backend Architecture (`backend/`)
- **Flask app** (`app.py`): Single-file application with SQLAlchemy ORM
- **Movie model**: Rich schema supporting personal ratings, notes, tags, watch status, and lending tracking
- **API endpoints**: RESTful design with CRUD operations, search, filtering, and statistics
- **OMDB integration**: Searches external API and prevents duplicate additions
- **Database**: PostgreSQL with Flask-Migrate for schema management

### Frontend Architecture (`frontend/src/`)
- **React 18** with functional components and hooks
- **Component structure**: Modular design with separate views for collection, search, and statistics
- **State management**: Local React state with useEffect for API calls
- **API integration**: Hardcoded API base URL for backend communication

## Key Components

### Backend Routes
- `GET /movies` - List all movies
- `POST /movies` - Add movie manually
- `GET /movies/search?title=X` - Search OMDB and add to collection
- `GET /movies/filter` - Filter by genre, year, director, actor, title, min_rating
- `GET /movies/stats` - Collection statistics
- `PUT /movies/<id>` - Update movie details
- `DELETE /movies/<id>` - Remove from collection

### Frontend Components
- **App.js**: Main application with state management and API calls
- **CollectionView**: Grid display of movie collection
- **SearchView**: OMDB movie search interface
- **StatisticsView**: Collection analytics and charts
- **MovieModal**: Detailed view with edit/delete capabilities
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
- **API URL**: Currently hardcoded to `http://192.168.1.137:5001` in App.js
- **OMDB API**: Key provided in docker-compose.yml
- **Database**: Auto-initializes on container startup

## Database Schema

The Movie model includes standard metadata (title, year, genre, director, actors, plot, poster) plus enhanced fields for personal collection management:
- Personal ratings and notes
- Watch status and dates  
- Tags for organization
- Lending tracking (who borrowed, when)
- Source field (Apple TV, UHD Disk, etc.)
- Multiple rating sources (IMDB, Rotten Tomatoes, Metacritic)

## Recent Features Added

### Multiple Source Tracking
- Added `sources` field to track multiple sources (Apple TV, UHD Disk, etc.)
- Checkbox interface for selecting multiple sources when adding movies
- Multiple source badges displayed on movie cards and details

### Runtime Information
- Added `runtime` field automatically fetched from OMDB API
- Displayed on movie cards alongside year information
- Example: "2010 • 148 min"

### Enhanced Movie Editing
- Movies can be fully edited through the modal interface
- Personal ratings (1-5 stars), notes, and tags can be added/modified
- Watch status and lending status can be tracked
- Multiple sources can be selected/deselected in edit mode

### Minimal Clean Design
- Complete redesign with light, minimal theme
- Clean movie cards with better information hierarchy
- Hover effects and smooth transitions
- Toast notifications replace basic alert dialogs
- Status indicators overlaid on poster images
- Better typography and spacing consistency