# Tugas-Akhir-6-Praktikum-Pemrograman-Web

<img width="2560" height="1600" alt="image" src="https://github.com/user-attachments/assets/d4343b20-f55e-48e5-a258-03ca153a877e" />

<img width="2560" height="1600" alt="image" src="https://github.com/user-attachments/assets/8f8561ef-c9d7-479c-a479-7bbe5f38bf50" />

## index.html
Berisi :
- Header (Theme toggle, °C/°F toggle, Refresh)
- Search bar + Auto-complete container
- Current weather card
- Today’s Highlights section
- Favorite cities container
- 5-Day Forecast section
- Temperature Trend Chart
- Script import (app.js) dan stylesheet import (styles.css)

## styles.css
Mengatur seluruh tampilan aplikasi :
- light & dark
- Responsiveness
- Search input design
- Forecast card design
- Favorites chip design
- Animations (fade in)
- Dark mode override
- Typography
Karena Tailwind dipakai via CDN, styling tambahan dilakukan sepenuhnya lewat CSS custom.

## app.js
File inti yang mengatur semua logic:

1. API Autocomplete (GeoDB Cities API)
Digunakan untuk :
  - Pencarian kota secara real-time
  - Menampilkan saran (suggestions)
  - Menghindari salah input kota
- Endpoint : https://wft-geo-db.p.rapidapi.com/v1/geo/cities
- API Key: RapidAPI
- Digunakan untuk: Search suggestions (CITY only)

2. Current Weather API (OpenWeatherMap)
Digunakan untuk:
  - Temperatur
  - Weather condition
  - Icon cuaca
  - Sunrise / sunset
  - Dew point (perhitungan manual)
  - Humidity, wind, clouds
  - Visibility
Endpoint : /data/2.5/weather

3. 5-Day / 3-Hour Forecast API (OpenWeatherMap)
Digunakan untuk :
  - Prediksi cuaca 5 hari
  - Min / max suhu per hari
  - Icon deskriptif
  - Hourly expansion (klik untuk mengembangkan detail)
- Endpoint: /data/2.5/forecast
Aplikasi melakukan grouping manual berdasarkan tanggal untuk membuat data menjadi format 5-day forecast yang rapi.

4. Temperature Trend Chart (Chart.js)
Digunakan untuk :
  - Line chart suhu dalam 30 jam ke depan (10 intervals)
  - Auto-coloring sesuai dark mode
  -  Auto-convert jika unit berubah (°C / °F)
  - Auto update setelah fetch baru

5. Favorites (LocalStorage)
Disimpan secara lokal pada browser :
  - Save city
  - Clear all favorites
  - Klik favorite untuk memuat ulang cuaca kota tersebut
Dibatasi hingga 10 kota terakhir

6. Unit Toggle (°C ↔ °F)
- Tidak memanggil API ulang.
- Semua data (current + forecast + chart) di-convert langsung.

7. Dark Mode Toggle
- Cards berubah menjadi glass-dark
- Background berubah ke luxury dark gradient
- Chart.js recolor otomatis
- Semua teks mengadopsi var(--text)

8. Auto-refresh 5 Menit
Aplikasi memanggil ulang API setiap 5 menit secara otomatis :

setInterval(() => {
  if (currentCity) fetchWeather();
}, 300000);

Tidak mengubah kota atau UI — hanya update data.

## API Key Requirements
Aplikasi membutuhkan dua API Key :
1. RapidAPI — GeoDB Cities API
Untuk autocomplete pencarian kota.
2. OpenWeatherMap API
Untuk :
- Current weather
- 5-day forecast

-
Keduanya dimasukkan ke dalam:

const GEO_API_KEY = "RAPIDAPI_KEY_MU";
const WEATHER_API_KEY = "OPENWEATHERMAP_KEY_MU";

## Cara Menjalankan
### Download semua file :
- index.html
- styles.css
- app.js

### Buka file app.js
Isi API Key :
- const GEO_API_KEY = "YOUR_RAPIDAPI_KEY";
- const WEATHER_API_KEY = "YOUR_OWM_KEY";

### Buka index.html
Langsung berjalan tanpa build.
