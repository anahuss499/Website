# Mahmood Masjid — Static Website

Simple modern static website for a mosque in Gujrat, Pakistan. Includes:

- Home page with live Pakistan clock (Asia/Karachi) and prayer times for Gujrat, Pakistan (auto-updates daily).
- About page
- Contact page with example Formspree form
- Quran page with searchable list of all 114 Surahs and on-demand Arabic (Uthmani) text via the Al-Quran Cloud API
- Map page showing Gujrat coordinates using Leaflet / OpenStreetMap
- Prayer Calendar page: monthly prayer times and downloadable CSV per month
- Azkar & Duas page: categorized daily azkar and short duas with references

Theme colours: #32cd32 (green), #fffafa (off-white), #8b4513 (brown) — updated with a more futuristic theme

---

## How it works

- Prayer times are fetched from AlAdhan API (https://aladhan.com/prayer-times-api) using Gujrat coordinates (latitude: 32.5734, longitude: 74.0781) and method=1 (University of Islamic Sciences, Karachi).
- Quran text is fetched from Al-Quran Cloud (https://alquran.cloud/). The page fetches the Uthmani edition.
- Live clock uses Intl with `timeZone: 'Asia/Karachi'` to show Pakistan local time and updates every second.

## Files

- `index.html` — Home with clock and prayer times
- `about.html`, `contact.html`, `map.html` — auxiliary pages
- `quran.html` — searchable Surah list and viewer
- `assets/css/style.css` — main styles
- `assets/js/main.js` — clock & prayer logic
- `assets/js/quran.js` — surah list + fetcher

## Customization

- To change the mosque coordinates (Map & prayer times), update `GUJRAT_LAT` and `GUJRAT_LON` in `assets/js/main.js` and the `lat`/`lon` constants in `map.html`.
- Replace `https://formspree.io/f/your-form-id` in `contact.html` with your actual Formspree endpoint (or use your own backend).

## Deployment

This is a static site — deploy to GitHub Pages, Netlify, Vercel, or any static-host provider.

## Notes & Credits

- Uses AlAdhan (prayer times) and Al-Quran Cloud (Quran content) APIs. Check their docs for rate limits and attribution.
- Timezone and Hijri date are provided by the APIs and the browser localizations.

If you'd like, I can:
- Add an optional automatic daily notifications banner
- Improve the mobile layout and fonts
- Add a backend contact endpoint or send-to-email integration
