# 🛡️ SafeLink

### Connecting people when every second matters.

```{=html}
<p align="center">
```
`<b>`{=html}A web-based emergency response and disaster-safety
platform`</b>`{=html}`<br/>`{=html} helping people quickly share their
location, contact trusted people, find nearby help, and access official
safety alerts.
```{=html}
</p>
```
```{=html}
<p align="center">
```
`<a href="https://safelink-ten-rouge.vercel.app">`{=html}🌐 Live
Demo`</a>`{=html} •
`<a href="https://github.com/theviping/safelink">`{=html}💻
GitHub`</a>`{=html}
```{=html}
</p>
```

------------------------------------------------------------------------

## 🚨 Why SafeLink?

During an emergency, people often need several things at once:

-   **Where am I?**
-   **How do I share my location?**
-   **Who should I contact?**
-   **Where is the nearest hospital or police station?**
-   **Are there any official disaster warnings?**
-   **Can I keep a record of what happened?**

SafeLink brings these emergency-support actions together in a single
dashboard.

> ⚠️ **Important:** SafeLink is a safety-support application. It does
> not replace police, ambulance, fire services, disaster-management
> authorities, or other official emergency services.

------------------------------------------------------------------------

## ✨ Features

  -----------------------------------------------------------------------
  Feature                             What it does
  ----------------------------------- -----------------------------------
  🆘 **Emergency SOS**                Registers an SOS event with the
                                      user's current location and opens
                                      WhatsApp with a pre-filled
                                      emergency message.

  📍 **Current Location**             Gets the user's browser GPS
                                      position and generates a Google
                                      Maps location link.

  👥 **Trusted Contacts**             Stores emergency contacts for quick
                                      SOS communication.

  🗺️ **Live Location Sharing**        Creates a temporary share link with
                                      live map updates, accuracy and
                                      expiry handling.

  🏥 **Nearby Emergency Help**        Finds hospitals, clinics, police
                                      stations, fire stations and
                                      shelters around the user.

  ⚠️ **Safety Alerts**                Surfaces official NDMA SACHET
                                      disaster-alert information.

  📜 **SOS History**                  Stores and displays authenticated
                                      users' previous SOS events.

  🔐 **Authentication**               Registration and login through
                                      Supabase Auth.

  📱 **Responsive UI**                Emergency-focused dashboard
                                      designed for desktop and mobile
                                      screens.
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 🧭 User Flow

``` text
                 ┌───────────────────┐
                 │   SafeLink Web App │
                 └─────────┬─────────┘
                           │
                    Sign up / Login
                           │
                           ▼
                 ┌───────────────────┐
                 │     Dashboard     │
                 └─────────┬─────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   Get Location       Add Contacts       Check Alerts
        │                  │                  │
        └──────────────┬───┴──────────────────┘
                       ▼
                 ┌─────────────┐
                 │  Emergency  │
                 │    SOS      │
                 └──────┬──────┘
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
       Backend API            WhatsApp
             │                     │
             ▼                     ▼
        Supabase DB        Pre-filled SOS
             │                 message
             ▼                     │
        SOS History          User taps Send
```

------------------------------------------------------------------------

## 🆘 Emergency SOS --- How It Works

1.  The user signs in.
2.  SafeLink gets the current GPS location.
3.  The user adds at least one trusted contact.
4.  The user presses **Send SOS**.
5.  The frontend sends the location data to the protected backend API.
6.  The backend verifies the request and registers the SOS event.
7.  The SOS record is stored in Supabase.
8.  SafeLink creates a Google Maps location link.
9.  WhatsApp opens with a pre-filled emergency message for the first
    trusted contact.
10. The user manually presses **Send** in WhatsApp.

### Important

SafeLink does **not** silently send a WhatsApp message. WhatsApp
requires the user to confirm/send the message.

------------------------------------------------------------------------

## 📍 Live Location Sharing

SafeLink supports temporary location sharing for emergency situations.

### Included

-   Unique share links
-   Interactive map view
-   Live location updates
-   Location accuracy display
-   Last-updated information
-   Automatic expiry
-   Manual stop-sharing control
-   Protected owner actions

This allows a trusted person to open a shared link and see the latest
available location while sharing is active.

------------------------------------------------------------------------

## 🏥 Nearby Emergency Help

The dashboard can search for nearby:

-   🏥 Hospitals
-   🩺 Clinics
-   👮 Police stations
-   🚒 Fire stations
-   🏠 Shelters

Results can include:

-   Approximate distance
-   Directions
-   Phone contact when available

The search uses **OpenStreetMap / Overpass** data, avoiding a paid maps
API for this feature.

------------------------------------------------------------------------

## ⚠️ Official Safety Alerts

SafeLink uses **NDMA SACHET** as its official disaster-alert source.

Depending on the available official alert data, the dashboard can
display:

-   Alert message/title
-   Severity information
-   Affected area
-   Approximate distance when available
-   Validity/timing information when available
-   Official source attribution

> 🛡️ SafeLink does not invent or fabricate disaster warnings. Official
> government sources remain authoritative.

------------------------------------------------------------------------

## 🔐 Authentication & Security

SafeLink uses **Supabase Auth** for user authentication and protected
application flows.

Security considerations include:

-   Authenticated frontend sessions
-   Bearer-token verification on protected APIs
-   Server-side Supabase secret-key usage
-   User-specific SOS history
-   Ownership checks for protected location-sharing actions
-   Environment variables for private credentials
-   `.env.local` excluded from Git
-   No secret credentials in frontend source

### 🔒 Never commit secrets

``` text
SUPABASE_SECRET_KEY
Supabase service-role credentials
Private API keys
Other production secrets
```

Use environment variables instead.

------------------------------------------------------------------------

## 🏗️ Architecture

``` text
┌──────────────────────────────┐
│          React + Vite        │
│                              │
│  Landing • Auth • Dashboard  │
│  Live Location • UI          │
└──────────────┬───────────────┘
               │
               │ HTTPS / Bearer Token
               ▼
┌──────────────────────────────┐
│     Vercel Serverless API    │
│                              │
│  /api/sos                    │
│  /api/sos-history            │
│  /api/location-share         │
│  /api/alerts                 │
└──────────────┬───────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌──────────────┐  ┌─────────────────┐
│   Supabase   │  │ Official / Open │
│ PostgreSQL   │  │ Data Sources    │
│ + Auth       │  │                 │
└──────────────┘  │ SACHET          │
                  │ Overpass        │
                  │ OpenStreetMap   │
                  └─────────────────┘
```

------------------------------------------------------------------------

## 🛠️ Tech Stack

### Frontend

-   React
-   Vite
-   React Router
-   Tailwind CSS
-   Lucide React
-   Leaflet
-   React Leaflet

### Backend

-   Node.js
-   Vercel Serverless Functions

### Database & Authentication

-   Supabase PostgreSQL
-   Supabase Auth

### APIs / Services

-   Browser Geolocation API
-   OpenStreetMap
-   Overpass API
-   NDMA SACHET
-   Google Maps
-   WhatsApp Click-to-Chat

### Deployment

-   GitHub
-   Vercel

------------------------------------------------------------------------

## 📂 Project Structure

``` text
safelink/
│
├── api/
│   ├── alerts.js
│   ├── location-share.js
│   ├── sos-history.js
│   └── sos.js
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── common/
│   │   └── landing/
│   │       ├── About.jsx
│   │       ├── EmergencyCTA.jsx
│   │       ├── Features.jsx
│   │       ├── Footer.jsx
│   │       ├── Hero.jsx
│   │       ├── HowItWorks.jsx
│   │       └── Navbar.jsx
│   │
│   ├── lib/
│   │   └── supabase.js
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── LiveLocation.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── .env.local
├── .gitignore
├── index.html
├── package.json
├── vercel.json
└── vite.config.js
```

------------------------------------------------------------------------

## ⚙️ Getting Started

### 1. Clone the repository

``` bash
git clone https://github.com/theviping/safelink.git
cd safelink
```

### 2. Install dependencies

``` bash
npm install
```

### 3. Configure environment variables

Create `.env.local` in the project root:

``` env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

For Vercel serverless functions, configure:

``` env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SECRET_KEY=your_supabase_secret_key
```

> ❗ Never put `SUPABASE_SECRET_KEY` inside frontend code or commit it
> to GitHub.

### 4. Start the frontend

``` bash
npm run dev
```

Open:

``` text
http://localhost:5173
```

### 5. Create a production build

``` bash
npm run build
```

------------------------------------------------------------------------

## 🧪 Development API Note

Vite's normal development server does not execute Vercel serverless
functions under `/api/*`.

So:

``` text
npm run dev
```

is suitable for the frontend, but protected backend API testing should
be done against a Vercel deployment or an appropriate Vercel local
environment.

------------------------------------------------------------------------

## 🗄️ Database

SafeLink uses Supabase PostgreSQL for persistent emergency data.

### Main tables

#### `sos_events`

Stores emergency SOS records including:

-   Event ID
-   Authenticated user ID
-   User name
-   Latitude
-   Longitude
-   Location accuracy
-   Timestamp
-   Status
-   Creation time

#### `location_shares`

Stores temporary live-location sharing information including:

-   Share identifier
-   User ownership
-   Location data
-   Active/inactive state
-   Expiry information

Protected database operations use server-side credentials and
authenticated request context.

------------------------------------------------------------------------

## 🚀 Deployment

SafeLink is deployed on **Vercel**.

### Production

**Live application:**\
https://safelink-ten-rouge.vercel.app

**Repository:**\
https://github.com/theviping/safelink

### Deploy manually

``` bash
npm run build
npx vercel --prod
```

Or push to the connected Git repository and let Vercel create the
deployment automatically.

------------------------------------------------------------------------

## ✅ Production Testing Checklist

Before a release, verify:

### Authentication

-   [ ] Registration works
-   [ ] Email verification flow behaves correctly
-   [ ] Login works
-   [ ] Logout works
-   [ ] Unauthenticated users cannot access the dashboard

### Location

-   [ ] Browser location permission works
-   [ ] Current coordinates are displayed
-   [ ] Google Maps link opens correctly

### Contacts & SOS

-   [ ] Trusted contacts can be added
-   [ ] Contacts can be removed
-   [ ] SOS requires a valid contact
-   [ ] SOS requires a location
-   [ ] SOS creates a Supabase record
-   [ ] SOS History loads authenticated records
-   [ ] WhatsApp opens with the pre-filled emergency message

### Live Location

-   [ ] Share link is generated
-   [ ] Viewer displays the location
-   [ ] Location updates while sharing
-   [ ] Accuracy and last update are shown
-   [ ] Stop sharing works
-   [ ] Expired links become unavailable

### Emergency Help

-   [ ] Nearby emergency services load
-   [ ] Distances are shown
-   [ ] Directions links work
-   [ ] Phone links work when available

### Safety Alerts

-   [ ] Official SACHET data loads
-   [ ] Alert source is shown
-   [ ] Alert information is readable
-   [ ] Failed source access shows a safe fallback

### Security & Deployment

-   [ ] Production environment variables exist
-   [ ] Secret keys are not committed
-   [ ] Protected API requests include authentication
-   [ ] Production deployment is `Ready`
-   [ ] No critical runtime errors are present

------------------------------------------------------------------------

## 🇮🇳 Emergency Numbers --- India

  Service                      Number
  ------------------------- ---------
  🚨 Integrated Emergency     **112**
  🚑 Ambulance                **108**
  🚒 Fire Service             **101**

> Always follow the instructions of the appropriate official emergency
> authority.

------------------------------------------------------------------------

## 🔮 Future Scope

SafeLink can be extended with:

-   📲 Push notifications for critical alerts
-   📩 SMS-based emergency delivery
-   📡 Offline-first emergency support
-   🧑‍🚒 Emergency responder/admin dashboard
-   🌐 Multi-language support
-   ♿ Improved accessibility
-   📶 Low-bandwidth mode
-   📍 More advanced alert geofencing
-   📱 Progressive Web App (PWA) support
-   🔄 Automated incident-status tracking
-   📊 Emergency analytics and reporting
-   🔔 Background alert notifications

------------------------------------------------------------------------

## 🎯 Project Goals

SafeLink is designed around four core principles:

**Fast** --- reduce the number of steps required during an emergency.

**Connected** --- help users communicate location and emergency
information.

**Informative** --- surface nearby assistance and official warnings.

**Responsible** --- avoid fabricating emergency information and keep
sensitive credentials out of the client.

------------------------------------------------------------------------

## 👨‍💻 Project

**SafeLink --- Emergency Response & Disaster Safety Platform**

Built with ❤️ using:

**React • Vite • Supabase • Vercel**

### Connecting people when every second matters.