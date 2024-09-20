# NimeKu API

**NimeKu API** adalah API untuk menonton anime yang menyediakan berbagai endpoint untuk mengakses informasi tentang anime, termasuk daftar anime terbaru, rekomendasi, jadwal rilis, dan banyak lagi.

## URL Utama API

https://nimeku-api.vercel.app/api/$endpoint

Gunakan List Endpoint ini untuk menggantikan **$endpoint**


## Endpoint

### 1. Daftar Anime Terbaru
- **GET**: `/new`
- **Deskripsi**: Mendapatkan daftar anime terbaru.
- **Contoh Penggunaan**: [https://nimeku-api.vercel.app/api/new](https://nimeku-api.vercel.app/api/new)

### 2. Daftar Anime Rekomendasi
- **GET**: `/recommend`
- **Deskripsi**: Mendapatkan daftar anime rekomendasi.
- **Contoh Penggunaan**: [https://nimeku-api.vercel.app/api/recommend](https://nimeku-api.vercel.app/api/recommend)

### 3. Daftar Anime Ongoing
- **GET**: `/ongoing`
- **Deskripsi**: Mendapatkan daftar anime yang sedang ongoing.
- **Contoh Penggunaan**: [https://nimeku-api.vercel.app/api/ongoing](https://nimeku-api.vercel.app/api/ongoing)

### 4. Daftar Anime Completed
- **GET**: `/completed`
- **Deskripsi**: Mendapatkan daftar anime yang sudah complete/tamat.
- **Contoh Penggunaan**: [https://nimeku-api.vercel.app/api/completed](https://nimeku-api.vercel.app/api/completed)

### 5. Daftar Anime
- **GET**: `/anime-list`
- **Deskripsi**: Mendapatkan daftar semua anime.
- **Contoh Penggunaan**: [https://nimeku-api.vercel.app/api/anime-list](https://nimeku-api.vercel.app/api/anime-list)

### 6. Daftar Genre Anime
- **GET**: `/data`
- **Deskripsi**: Mendapatkan daftar genre anime.
- **Contoh Penggunaan**: [https://nimeku-api.vercel.app/api/data](https://nimeku-api.vercel.app/api/data)

### 7. Jadwal Rilis Anime
- **GET**: `/jadwal`
- **Deskripsi**: Mendapatkan jadwal rilis anime dalam 1 minggu.
- **Contoh Penggunaan**: [https://nimeku-api.vercel.app/api/jadwal](https://nimeku-api.vercel.app/api/jadwal)

### 8. Detail Anime
- **GET**: `/anime-details/:animeId`
- **Deskripsi**: Mendapatkan detail anime berdasarkan `animeId` (misalnya, one piece).
- **Contoh Penggunaan**: [https://nimeku-api.vercel.app/api/anime-details/one-piece](https://nimeku-api.vercel.app/api/anime-details/one-piece)

### 9. Pencarian Anime
- **GET**: `/search/:id`
- **Deskripsi**: Mendapatkan daftar anime berdasarkan pencarian dengan `id`.
- **Contoh Penggunaan**: [https://nimeku-api.vercel.app/api/search/one-piece](https://nimeku-api.vercel.app/api/search/one-piece)

### 10. Daftar Anime Berdasarkan Genre
- **GET**: `/api/genre/:id`
- **Deskripsi**: Mendapatkan daftar anime berdasarkan genre dengan `id` genre.
- **Contoh Penggunaan**: [https://nimeku-api.vercel.app/api/genre/action](https://nimeku-api.vercel.app/api/genre/action)

### 11. Detail Episode
- **GET**: `/episode-details/:episodeId`
- **Deskripsi**: Mendapatkan detail episode berdasarkan `episodeId`, termasuk URL/video stream episode.
- **Contoh Penggunaan**: [https://nimeku-api.vercel.app/api/episode-details/12345](https://nimeku-api.vercel.app/api/episode-details/12345)

