# 🛡️ SafeLink

### Connecting people when every second matters.

SafeLink is an emergency and disaster-safety platform designed to help people stay connected, share their live location, contact trusted people, find nearby emergency services, and receive official disaster alerts during critical situations.

---

## 🚨 Features

- 🆘 Emergency SOS with live location
- 📍 Live GPS location
- 👥 Trusted emergency contacts
- 🚑 Quick emergency service access
- 🏥 Nearby hospitals, clinics, police stations, fire stations and shelters
- ⚠️ Official disaster and weather alerts
- 🗺️ Interactive OpenStreetMap map
- 📱 Responsive dashboard
- 🔐 Local trusted-contact storage

---

## 🆘 Emergency SOS

SafeLink registers an emergency SOS event through the backend and creates a Google Maps location link.

The application then opens WhatsApp with a pre-filled emergency message for the first trusted contact.

> WhatsApp requires the user to manually press the Send button.

---

## 🚑 Emergency Services

| Service | Number |
|---|---:|
| Emergency | **112** |
| Ambulance | **108** |
| Fire Service | **101** |

---

## 🏥 Nearby Emergency Help

SafeLink can find nearby:

- Hospitals
- Clinics
- Police Stations
- Fire Stations
- Shelters

It also provides approximate distance, Google Maps directions, and phone numbers when available.

---

## ⚠️ Safety Alerts

SafeLink retrieves active alerts from official disaster-alert sources.

The dashboard can display:

- Disaster alerts
- Alert severity
- Affected area
- Approximate distance
- Alert validity
- Official source

Official sources include NDMA SACHET and the India Meteorological Department (IMD).

---

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Lucide React
- React Leaflet

### Backend
- Node.js
- Vercel Serverless Functions

### APIs & Services
- Browser Geolocation API
- OpenStreetMap
- Overpass API
- NDMA SACHET
- India Meteorological Department
- WhatsApp Click-to-Chat
- Google Maps

---

## 📂 Project Structure

```text
safelink/
├── api/
│   ├── alerts.js
│   └── sos.js
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   │   └── landing/
│   │       ├── Dashboard.jsx
│   │       ├── Login.jsx
│   │       └── Register.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── vercel.json
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/theviping/safelink.git
```

### 2. Open the project

```bash
cd safelink
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

---

## 🚀 Vercel Deployment

Install Vercel CLI:

```bash
npm install -g vercel
```

Run locally with Vercel:

```bash
vercel dev
```

Deploy to production:

```bash
vercel --prod
```

---

## 🔐 Privacy

- Trusted contacts are stored locally in the browser.
- Location is requested only when required.
- SOS events are validated through the backend.
- SafeLink does not automatically send WhatsApp messages.
- The user controls when the emergency message is sent.

---

## ⚠️ Safety Notice

SafeLink is a technology project designed to assist users during emergencies.

It should **not replace official emergency services**.

In a real emergency, contact the appropriate emergency service immediately.

### India Emergency Numbers

**112 — National Emergency Number**

**108 — Ambulance**

**101 — Fire Service**

---

## 🔮 Future Improvements

- [ ] Persistent SOS history
- [ ] Secure authentication
- [ ] SMS emergency alerts
- [ ] Push notifications
- [ ] Multiple trusted contacts for SOS
- [ ] Offline emergency mode
- [ ] Real-time family location sharing
- [ ] Disaster-specific emergency guidance
- [ ] Admin emergency response dashboard
- [ ] Database-backed emergency events
- [ ] Improved location-based alert filtering

---

## 👨‍💻 Author

### Vipin Gupta

**SafeLink — Emergency & Disaster Safety Platform**

---

## ⭐ Support

If you find SafeLink useful, consider giving the repository a ⭐ on GitHub.

---

> **Connecting people when every second matters.**
