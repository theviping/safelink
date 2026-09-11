import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import {
  MapPin,
  RefreshCw,
  Shield,
  AlertTriangle,
  Clock,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

const RecenterMap = ({ latitude, longitude }) => {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], 16);
  }, [map, latitude, longitude]);

  return null;
};

const LiveLocation = () => {
  const { shareId } = useParams();

  const [share, setShare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadLocation = async () => {
    if (!shareId) {
      setError("Invalid location sharing link.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/location-share?shareId=${encodeURIComponent(shareId)}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.error || "Could not load live location."
        );
      }

      if (!data.active) {
        setShare(null);
        setError(
          data?.message ||
            "Live location sharing is no longer active."
        );
        return;
      }

      setShare(data.share);
      setLastUpdated(new Date());
      setError("");
    } catch (error) {
      console.error(
        "[SafeLink] Live location fetch failed:",
        error
      );

      setError(
        error?.message ||
          "Could not load the live location."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocation();

    const interval = setInterval(() => {
      loadLocation();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [shareId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0f19] px-6 text-white">
        <div className="text-center">
          <RefreshCw
            size={38}
            className="mx-auto mb-4 animate-spin text-blue-400"
          />

          <h1 className="text-xl font-bold">
            Loading Live Location...
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Connecting to SafeLink.
          </p>
        </div>
      </div>
    );
  }

  if (error || !share) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0f19] px-6 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <AlertTriangle size={28} />
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            Location Unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            {error ||
              "This live location sharing link is no longer active."}
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
            <Shield size={16} />
            SafeLink Live Location
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-[#0b0f19]/95">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <Shield size={23} />
            </div>

            <span className="text-xl font-bold">
              Safe
              <span className="text-red-500">Link</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-green-400">
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            Live
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-sm font-semibold tracking-widest text-blue-400">
            SAFELINK LIVE LOCATION
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            {share.user_name}'s Live Location
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            This location is updating automatically.
          </p>
        </div>

        {/* Status */}
        <div className="mb-5 rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                <MapPin size={20} />
              </div>

              <div>
                <p className="font-semibold text-green-300">
                  Live location active
                </p>

                <p className="text-xs text-green-300/70">
                  Accuracy ±{share.accuracy}m
                </p>
              </div>
            </div>

            {lastUpdated && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock size={14} />
                Updated {lastUpdated.toLocaleTimeString("en-IN")}
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="overflow-hidden rounded-3xl border border-white/10">
          <MapContainer
            center={[
              share.latitude,
              share.longitude,
            ]}
            zoom={16}
            scrollWheelZoom={true}
            className="h-[65vh] min-h-[400px] w-full"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker
              position={[
                share.latitude,
                share.longitude,
              ]}
            >
              <Popup>
                <div className="text-sm">
                  <strong>
                    {share.user_name}
                  </strong>

                  <br />

                  Live Location

                  <br />

                  Accuracy: ±
                  {share.accuracy}m
                </div>
              </Popup>
            </Marker>

            <RecenterMap
              latitude={share.latitude}
              longitude={share.longitude}
            />
          </MapContainer>
        </div>

        {/* Coordinates */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-slate-500">
              Latitude
            </p>

            <p className="mt-2 font-mono text-lg">
              {Number(share.latitude).toFixed(6)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-slate-500">
              Longitude
            </p>

            <p className="mt-2 font-mono text-lg">
              {Number(share.longitude).toFixed(6)}
            </p>
          </div>
        </div>

        <div className="mt-5 text-center text-xs text-slate-600">
          Share ID: {share.share_id}
        </div>
      </main>
    </div>
  );
};

export default LiveLocation;