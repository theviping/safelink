import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import {
  MapPin,
  RefreshCw,
  Shield,
  AlertTriangle,
  Clock,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

const liveLocationIcon = L.divIcon({
  className: "safelink-live-marker-wrapper",
  html: `
    <div class="safelink-live-marker">
      <div class="safelink-live-pulse"></div>
      <div class="safelink-live-dot"></div>
    </div>
  `,
  iconSize: [50, 50],
  iconAnchor: [25, 25],
  popupAnchor: [0, -25],
});

const RecenterMap = ({ latitude, longitude }) => {
  const map = useMap();

  useEffect(() => {
    map.panTo([latitude, longitude], { animate: true, duration: 0.5 });
  }, [map, latitude, longitude]);

  return null;
};

const LiveLocation = () => {
  const { shareId } = useParams();
  const [share, setShare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [pollError, setPollError] = useState("");
  const intervalRef = useRef(null);

  const fetchLocation = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setError("");
      }

      const response = await fetch(
        `/api/location-share?shareId=${encodeURIComponent(shareId || "")}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Could not load live location.");
      }

      if (!data?.active || !data?.share) {
        setShare(null);
        setError(data?.message || "Live location sharing is no longer active.");
        return;
      }

      const nextShare = data.share;
      setShare(nextShare);
      setPollError("");

      const sourceTime = nextShare.updated_at || nextShare.created_at;
      setLastUpdated(sourceTime ? new Date(sourceTime) : new Date());
    } catch (err) {
      console.error("[SafeLink Live Location] Fetch failed:", err);

      if (isInitial) {
        setError(err?.message || "Could not load live location.");
      } else {
        // Do not remove a working map just because one polling request failed.
        setPollError("Temporary connection issue. Retrying...");
      }
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!shareId) {
      setLoading(false);
      setError("Invalid live location link.");
      return undefined;
    }

    fetchLocation(true);

    intervalRef.current = window.setInterval(() => {
      fetchLocation(false);
    }, 3000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [shareId]);

  const retry = () => {
    fetchLocation(true);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white">
      <style>{`
        .safelink-live-marker-wrapper {
          background: transparent !important;
          border: none !important;
        }

        .safelink-live-marker {
          position: relative;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .safelink-live-pulse {
          position: absolute;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.30);
          border: 2px solid rgba(239, 68, 68, 0.65);
          animation: safelink-live-pulse 1.6s ease-out infinite;
        }

        .safelink-live-dot {
          position: relative;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          background: #ef4444;
          border: 3px solid white;
          box-shadow:
            0 0 0 3px rgba(239, 68, 68, 0.25),
            0 0 20px rgba(239, 68, 68, 0.85);
          animation: safelink-live-blink 1s ease-in-out infinite;
          z-index: 2;
        }

        @keyframes safelink-live-pulse {
          0% {
            transform: scale(0.3);
            opacity: 0.9;
          }
          70% {
            transform: scale(1.1);
            opacity: 0;
          }
          100% {
            transform: scale(1.1);
            opacity: 0;
          }
        }

        @keyframes safelink-live-blink {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.45;
            transform: scale(0.8);
          }
        }
      `}</style>

      <header className="border-b border-white/10 bg-[#0b0f19]/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <Shield size={22} />
            </div>
            <div>
              <p className="text-lg font-bold">
                Safe<span className="text-red-500">Link</span>
              </p>
              <p className="text-xs text-slate-500">Live location sharing</p>
            </div>
          </div>

          {share?.is_active && (
            <div className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              LIVE
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-6 sm:px-6 sm:py-8">
        {loading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <RefreshCw className="mx-auto mb-4 animate-spin text-red-500" size={34} />
              <p className="font-semibold">Loading live location...</p>
              <p className="mt-2 text-sm text-slate-500">Connecting to SafeLink.</p>
            </div>
          </div>
        ) : error || !share ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-7 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-400">
                <AlertTriangle size={27} />
              </div>
              <h1 className="mt-5 text-2xl font-bold">Location unavailable</h1>
              <p className="mt-3 text-sm leading-6 text-slate-400">{error}</p>
              <button
                onClick={retry}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold transition hover:bg-red-600"
              >
                <RefreshCw size={17} />
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-red-400">
                  <MapPin size={17} />
                  LIVE LOCATION
                </div>
                <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
                  {share.user_name || "SafeLink User"}
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  This location is being shared with you in real time.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock size={15} />
                  Last updated
                </div>
                <p className="mt-1 font-semibold text-white">
                  {lastUpdated && !Number.isNaN(lastUpdated.getTime())
                    ? lastUpdated.toLocaleTimeString()
                    : "Just now"}
                </p>
              </div>
            </div>

            {pollError && (
              <div className="mb-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
                {pollError}
              </div>
            )}

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl">
              <MapContainer
                center={[share.latitude, share.longitude]}
                zoom={16}
                scrollWheelZoom
                className="h-[55vh] min-h-[380px] w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <RecenterMap
                  latitude={share.latitude}
                  longitude={share.longitude}
                />

                <Marker
                  position={[share.latitude, share.longitude]}
                  icon={liveLocationIcon}
                >
                  <Popup>
                    <div className="min-w-[180px]">
                      <p className="font-semibold">{share.user_name || "SafeLink User"}</p>
                      <p className="mt-1 text-sm">Live location</p>
                      <p className="mt-1 text-xs text-gray-500">
                        Accuracy: {Math.round(share.accuracy || 0)} m
                      </p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500">Latitude</p>
                <p className="mt-1 font-mono text-sm">{Number(share.latitude).toFixed(6)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500">Longitude</p>
                <p className="mt-1 font-mono text-sm">{Number(share.longitude).toFixed(6)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500">Accuracy</p>
                <p className="mt-1 font-semibold">{Math.round(share.accuracy || 0)} m</p>
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-slate-600">
              SafeLink refreshes the shared location every few seconds while the share is active.
            </p>
          </>
        )}
      </main>
    </div>
  );
};

export default LiveLocation;
