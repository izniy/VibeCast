# 🎧 VibeCast

**VibeCast** is your personal emotional wellness companion — a beautifully crafted mobile app that helps you reflect, recharge, and rediscover yourself, one mood at a time.

Whether you're feeling joyful, reflective, focused, or overwhelmed, VibeCast curates a tailored experience just for you.

Link to try: https://vibecast.expo.app
---

## 🌟 What You Can Do with VibeCast

| 💡 | Feature |
|----|---------|
| ✨ | **Log your mood** using a smooth, emoji-based selector |
| 📝 | **Write a journal entry** to process your thoughts and experiences |
| 💬 | **Receive curated affirmations** based on how you're feeling |
| 🎧 | **Get personalized music suggestions** powered by Spotify |
| 🎬 | **Discover movies that match your mood** using TMDB data |
| 📅 | **View a timeline of past mood entries** organized by day |
| 📊 | **See your overall mood summary per day** to track emotional patterns |

> Empower your emotional journey with content that meets you where you are.

---

## 🔧 Tech Stack

### 🖥 Frontend
- [React Native](https://reactnative.dev/) with [Expo CLI](https://docs.expo.dev/)
- TypeScript
- [Expo Router](https://expo.github.io/router/docs)
- [NativeWind](https://www.nativewind.dev/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)

### 🗄 Backend & Services
- [Supabase](https://supabase.com/) (Auth, PostgreSQL DB, Storage)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [TMDB API](https://developer.themoviedb.org/)

### 🧰 Tools
- SecureStore (for securely storing tokens)
- Date-FNS (for clean date formatting)
- Cursor (AI-enhanced dev environment)

---

## 🚀 Features

- 🌈 Mood selection via emoji grid
- 📓 Optional journaling with motivational headers
- 🗓 View mood history by date
- 🎶 Music suggestions powered by Spotify genre seeds
- 🎥 Movie suggestions using TMDB + mood mapping
- 🌟 Affirmations that rotate based on your mood
- 🔒 Supabase authentication & data storage

---

## 📦 Developer Setup

### ✅ Prerequisites

- Node.js (v18+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- **Expo Go app** on iOS/Android
- Supabase account
- Spotify Developer credentials
- TMDB Developer account

---

### 🛠 Setup Guide

<details>
<summary>🔗 Clone the Repository</summary>

```bash
git clone https://github.com/your-username/VibeCast3
cd VibeCast3
```

</details>

<details>
<summary>📦 Install Dependencies</summary>

```bash
npm install
```

</details>

<details>
<summary>🔑 Configure Environment Variables</summary>

Create a `.env` file at the root and fill in the following values:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Spotify API Configuration
EXPO_PUBLIC_SPOTIFY_CLIENT_ID=your-client-id
EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET=your-client-secret

# TMDB API Configuration
EXPO_PUBLIC_TMDB_READ_ACCESS_TOKEN=your-tmdb-read-token
```

> ⚠️ **Important:** This app uses `.env`, not `.env.example`.

</details>

---

## 🔐 Supabase Setup (PostgreSQL)

1. Go to [Supabase](https://app.supabase.com) and **create a new project**
2. Create a table called `mood_entries`
3. **Disable Row Level Security (RLS)** on the `mood_entries` table
4. Add the following policy:

```sql
create policy "Enable insert for authenticated users only"
on "public"."mood_entries"
as PERMISSIVE
for INSERT
to public
with check (
  user_id = auth.uid()::text
);
```

5. Go to **Project Settings → API** and copy:
   - Project URL
   - anon/public API key  
   Add them to your `.env`

---

## 🎧 Spotify Setup

1. Visit the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Copy your **Client ID** and **Client Secret**
4. Paste them into `.env`

---

## 🎬 TMDB Setup

1. Register at [TMDB](https://www.themoviedb.org)
2. Go to **Settings → API Subscription**
3. Choose the **Free Developer Plan**
4. Generate a **Read Access Token (v4)**
5. Add it to `.env`

---

## ▶️ Run the App

```bash
npx expo start
```

1. Download the **Expo Go** app from the App Store or Google Play  
2. Scan the **QR code** shown in terminal or browser  
3. Enjoy VibeCast on your phone!

---

## 🧑‍💻 Development Guidelines

### 📁 Git & Environment
- ❌ Never commit `.env`
- 📄 Use `.env.example` to document keys (don’t run with it)
- 🔐 Use SecureStore to keep tokens safe on device

### 🧪 New Features
- Structure code clearly: `components/`, `hooks/`, `services/`
- Always test API calls end-to-end
- Keep this README updated with new services or API flows

---

## 🌐 API Integration Summary

| Service      | Purpose                                      |
|--------------|----------------------------------------------|
| Supabase     | Auth, mood & journal storage (PostgreSQL)    |
| Spotify API  | Mood-based music recommendations             |
| TMDB API     | Movie suggestions by mood mapping            |

---

## 📜 License

MIT © 2025 VibeCast Team  
Made with ❤️ to help you reflect, express, and vibe.
