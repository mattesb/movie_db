# 🎬 Movie Database Application

A full-stack movie database application built with React, Flask, and PostgreSQL. Search for movies using the OMDB API and manage your personal movie collection.

## Features

- 🔍 **Movie Search**: Find movies by title using the OMDB API
- 📚 **Personal Collection**: Build and manage your movie library
- 🎥 **Rich Details**: View comprehensive movie information including ratings, cast, plot, and posters
- 📱 **Responsive Design**: Modern, mobile-friendly interface
- 🐳 **Containerized**: Easy deployment with Docker Compose

## Tech Stack

### Frontend
- **React 18** - Modern component-based UI
- **CSS Grid/Flexbox** - Responsive layout design
- **Fetch API** - HTTP client for backend communication

### Backend
- **Python 3.11** - Runtime environment
- **Flask** - Web framework
- **SQLAlchemy** - ORM for database operations
- **PostgreSQL** - Database for movie storage
- **OMDB API** - External movie data source

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **Gunicorn** - WSGI HTTP server

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Internet connection (for OMDB API)

### Quick Verification
After starting the services, verify everything is working:
```bash
# Check container status
docker-compose ps

# Test backend API
curl http://localhost:5001/movies

# Test frontend
curl -I http://localhost:3001
```

### Running the Application

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd movie_db
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Initialize the database** (first run only)
   ```bash
   docker-compose exec backend flask db upgrade
   ```

4. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:5001

## API Documentation

### Base URL
`http://localhost:5001`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/movies` | Get all movies in collection |
| POST | `/movies` | Add a new movie manually |
| GET | `/movies/<id>` | Get specific movie details |
| PUT | `/movies/<id>` | Update movie information |
| DELETE | `/movies/<id>` | Delete a movie |
| GET | `/movies/search?title=<title>` | Search and add from OMDB |

### Example API Usage

```bash
# Get all movies
curl http://localhost:5001/movies

# Search and add a movie
curl "http://localhost:5001/movies/search?title=Inception"

# Delete a movie
curl -X DELETE http://localhost:5001/movies/1
```

## Development

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### Backend Development
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Database Migrations
```bash
# Create migration
docker-compose exec backend flask db migrate -m "Description"

# Apply migration
docker-compose exec backend flask db upgrade
```

## Project Structure

```
movie_db/
├── backend/
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile         # Backend container config
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.js        # Main application
│   │   └── index.js      # Entry point
│   ├── public/           # Static assets
│   └── package.json      # Node.js dependencies
├── docker-compose.yml    # Multi-container setup
└── README.md            # This file
```

## Environment Variables

**IMPORTANT: For security, create a `.env` file from `.env.example` before running:**

```bash
cp .env.example .env
# Edit .env with your actual values
```

The application uses the following environment variables:

### Database
- `POSTGRES_USER` - PostgreSQL username (default: postgres)
- `POSTGRES_PASSWORD` - PostgreSQL password (default: postgres) 
- `POSTGRES_DB` - Database name (default: moviedb)

### Backend
- `DATABASE_URL` - PostgreSQL connection string (auto-generated from above)
- `OMDB_API_KEY` - API key for OMDB (get from http://www.omdbapi.com/apikey.aspx)

### Frontend
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5001)

## Features Overview

### Movie Search
- Search movies by title using OMDB API
- Automatic addition to your collection
- Rich movie metadata retrieval

### Movie Management
- View all movies in a beautiful grid layout
- Click for detailed movie information
- Delete movies from your collection

### Movie Details Modal
- High-quality movie posters
- Comprehensive information display
- IMDb and Rotten Tomatoes ratings
- Full cast and crew information
- Plot summaries

## Recent Fixes & Current Setup

### Database Initialization
The application now automatically handles database setup. On first run, the database will be initialized with the proper schema for the movie collection.

### Port Configuration
- **Frontend**: Port 3001 (updated from 3000)
- **Backend**: Port 5001 (updated from 5000)
- **Database**: Port 5432 (internal, not exposed)

### Container Status
All services run in Docker containers:
- `movie_db-frontend-1`: React app on port 3001
- `movie_db-backend-1`: Flask API on port 5001  
- `movie_db-db-1`: PostgreSQL database

### What Was Fixed
- **Database Schema**: Initialized PostgreSQL with proper movie table structure
- **Port Mismatch**: Updated frontend from port 3000 to 3001, backend from 5000 to 5001
- **Container Issues**: Resolved frontend build and serve problems
- **API Connectivity**: Frontend now successfully connects to backend API

## Troubleshooting

### Common Issues

1. **Frontend can't connect to backend**
   - Ensure both containers are running: `docker-compose ps`
   - Check if ports 3001 and 5001 are available

2. **Database connection errors**
   - Wait for PostgreSQL to fully start (may take 30-60 seconds)
   - Run database migrations: `docker-compose exec backend flask db upgrade`

3. **Movie search not working**
   - Check internet connectivity
   - Verify OMDB API key is valid

### Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs db
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests and ensure the app works
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [OMDB API](http://www.omdbapi.com/) for movie data
- [React](https://reactjs.org/) for the frontend framework
- [Flask](https://flask.palletsprojects.com/) for the backend framework