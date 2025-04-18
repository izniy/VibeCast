# VibeCast3

A mood-based recommendation app that suggests music and movies based on your current emotional state.

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- Expo CLI
- Supabase account
- Spotify Developer account
- TMDB Developer account

### Environment Setup

1. Clone the repository
```bash
git clone <repository-url>
cd VibeCast3
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
# Copy the example environment file
cp .env.example .env
```

4. Set up your environment variables in `.env`:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=           # Your Supabase project URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=      # Your Supabase anonymous key

# Spotify API Configuration
EXPO_PUBLIC_SPOTIFY_CLIENT_ID=       # Your Spotify application client ID
EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET=   # Your Spotify application client secret

# TMDB API Configuration
EXPO_PUBLIC_TMDB_READ_ACCESS_TOKEN=  # Your TMDB read access token
```

### Getting API Keys

#### Supabase
1. Create a project at [Supabase](https://app.supabase.com)
2. Go to Project Settings → API
3. Copy the Project URL and anon/public key

#### Spotify
1. Create an app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Get your Client ID and Client Secret from the app settings

#### TMDB
1. Create an account at [TMDB](https://www.themoviedb.org)
2. Go to Settings → API
3. Generate a new Read Access Token (v4 auth)

### Running the App

```bash
npx expo start
```

## Development Guidelines

### Git Workflow
- Never commit the `.env` file
- Use `.env.example` to document any new environment variables
- Keep API keys and secrets confidential

### Adding New Features
- Update `.env.example` if adding new environment variables
- Document API integrations in this README
- Test all API integrations before committing

## API Integration Status
- Supabase: Authentication and user data storage
- Spotify: Music recommendations based on mood
- TMDB: Movie recommendations based on mood 