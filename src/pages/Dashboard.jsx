import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  Shield,
  MapPin,
  Radio,
  Users,
  Bell,
  LogOut,
  HeartPulse,
  Plus,
  Trash2,
  Navigation,
  Copy,
  Check,
  AlertTriangle,
  Phone,
  Siren,
  Flame,
  Hospital,
  PhoneCall,
  ExternalLink,
  LoaderCircle,
  ShieldAlert,
  RefreshCw,
  History,
  Clock,
} from "lucide-react";

const RecenterMap = ({ latitude, longitude }) => {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], 16);
  }, [map, latitude, longitude]);

  return null;
};

const Dashboard = () => {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("safelinkUser")
  );

  const [contacts, setContacts] = useState(() => {
    return JSON.parse(
      localStorage.getItem("safelinkContacts") || "[]"
    );
  });

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const [copied, setCopied] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [sosError, setSosError] = useState("");

  const [sosHistory, setSosHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  // -----------------------------
  // LIVE LOCATION SHARING
  // -----------------------------

  const [liveSharing, setLiveSharing] = useState(false);
  const [liveShareId, setLiveShareId] = useState("");
  const [liveShareLoading, setLiveShareLoading] = useState(false);
  const [liveShareError, setLiveShareError] = useState("");
  const [liveShareCopied, setLiveShareCopied] = useState(false);

  const liveWatchIdRef = useRef(null);

  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState("");

  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertStatus, setAlertStatus] = useState(
    "Get your location first, then check the official alert sources."
  );
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [lastAlertCheck, setLastAlertCheck] = useState(null);

  // -----------------------------
  // AUTH CHECK
  // -----------------------------

  useEffect(() => {
    const loggedIn =
      localStorage.getItem("safelinkLoggedIn");

    if (loggedIn !== "true") {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
  if (user?.name) {
    loadSosHistory();
  }
}, [user?.name]);

  // -----------------------------
  // SAVE CONTACTS
  // -----------------------------

  useEffect(() => {
    localStorage.setItem(
      "safelinkContacts",
      JSON.stringify(contacts)
    );
  }, [contacts]);

  // -----------------------------
  // ADD CONTACT
  // -----------------------------

  const addContact = (e) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      return;
    }

    const newContact = {
      id: Date.now(),
      name: name.trim(),
      phone: phone.trim(),
    };

    setContacts((prev) => [
      ...prev,
      newContact,
    ]);

    setName("");
    setPhone("");
  };

  // -----------------------------
  // DELETE CONTACT
  // -----------------------------

  const deleteContact = (id) => {
    setContacts((prev) =>
      prev.filter((contact) => contact.id !== id)
    );
  };

  // -----------------------------
  // GET LOCATION
  // -----------------------------

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat =
          position.coords.latitude;

        const lng =
          position.coords.longitude;

        setLocation({
          latitude: lat,
          longitude: lng,
          accuracy: Math.round(
            position.coords.accuracy
          ),
        });

        setLocationLoading(false);
      },
      (error) => {
        console.log(error);

        setLocationLoading(false);

        alert(
          "Unable to get your location. Please allow location permission."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // -----------------------------
  // COPY LOCATION
  // -----------------------------

  const copyLocation = async () => {
    if (!location) return;

    const locationText =
      `https://www.google.com/maps?q=` +
      `${location.latitude},${location.longitude}`;

    try {
      await navigator.clipboard.writeText(
        locationText
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.log(error);
      alert("Could not copy location.");
    }
  };

  // -----------------------------
  // SEND SOS
  // -----------------------------

  const normalizePhone = (phone) => {
    const digits = phone.replace(/\D/g, "");

    if (digits.length === 10) {
      return `91${digits}`;
    }

    if (digits.length === 12 && digits.startsWith("91")) {
      return digits;
    }

    return digits;
  };
// -----------------------------
  // handleSOS
  // -----------------------------
  
  const handleSOS = async () => {
  if (sosLoading) return;

  if (!contacts.length) {
    setSosError("Please add at least one trusted contact first.");
    return;
  }

  if (!location) {
    setSosError("Your live location is not available yet.");
    return;
  }

  const phoneNumber = normalizePhone(contacts[0].phone);

  if (!phoneNumber) {
    setSosError("Trusted contact has an invalid phone number.");
    return;
  }

  setSosLoading(true);
  setSosError("");
  setSosSent(false);

  const mapLink =
    `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;

  const timestamp = new Date().toISOString();

  const message = `🚨 SAFELINK EMERGENCY SOS

${user?.name || "User"} has triggered an emergency SOS.

LIVE LOCATION:
${mapLink}

TIME:
${new Date().toLocaleString()}

Please reach out immediately or contact emergency services if needed.

Sent via SafeLink`;

  try {
    const response = await fetch("/api/sos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userName: user?.name || "User",
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        timestamp,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data?.success) {
      throw new Error(
        data?.error || "Could not register the SOS."
      );
    }

    await loadSosHistory();
    setSosSent(true);

    // Open WhatsApp in the same tab.
    const whatsappUrl =
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    window.location.href = whatsappUrl;

    setTimeout(() => {
      setSosSent(false);
    }, 5000);
  } catch (error) {
    setSosError(
      error?.message ||
        "Could not register the SOS. Please try again or call emergency services."
    );
  } finally {
    setSosLoading(false);
  }
};

// -----------------------------
// SOS HISTORY
// -----------------------------

const loadSosHistory = async () => {
  if (!user?.name) return;

  setHistoryLoading(true);
  setHistoryError("");

  try {
    const response = await fetch(
      `/api/sos-history?userName=${encodeURIComponent(user.name)}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok || !data?.success) {
      throw new Error(
        data?.error || "Could not load SOS history."
      );
    }

    setSosHistory(
      Array.isArray(data.events) ? data.events : []
    );
  } catch (error) {
    console.error("SOS history failed:", error);

    setHistoryError(
      error?.message || "Could not load SOS history."
    );
  } finally {
    setHistoryLoading(false);
  }
};

  // -----------------------------
  // LIVE LOCATION SHARING
  // -----------------------------

  const startLiveLocationSharing = async () => {
    if (liveSharing || liveShareLoading) return;

    if (!navigator.geolocation) {
      setLiveShareError(
        "Live location is not supported by your browser."
      );
      return;
    }

    if (!location) {
      setLiveShareError(
        "Your current location is not available yet. Please get your location first."
      );
      return;
    }

    setLiveShareLoading(true);
    setLiveShareError("");
    setLiveShareCopied(false);

    try {
      const response = await fetch("/api/location-share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create",
          userName: user?.name || "User",
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success || !data?.shareId) {
        throw new Error(
          data?.error || "Could not start live location sharing."
        );
      }

      const shareId = data.shareId;

      setLiveShareId(shareId);
      setLiveSharing(true);

      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const accuracy = position.coords.accuracy;

          // Keep the dashboard's own location/map in sync too.
          setLocation({
            latitude,
            longitude,
            accuracy: Math.round(accuracy),
          });

          try {
            const updateResponse = await fetch(
              "/api/location-share",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  action: "update",
                  shareId,
                  latitude,
                  longitude,
                  accuracy,
                }),
              }
            );

            if (!updateResponse.ok) {
              console.error(
                "[SafeLink Location] Live location update failed."
              );
            }
          } catch (error) {
            console.error(
              "[SafeLink Location] Live location update failed:",
              error
            );
          }
        },
        (error) => {
          console.error(
            "[SafeLink Location] Geolocation watch error:",
            error
          );

          setLiveShareError(
            "Live location started, but the browser could not update your position."
          );
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 15000,
        }
      );

      liveWatchIdRef.current = watchId;
    } catch (error) {
      console.error(
        "[SafeLink Location] Start sharing failed:",
        error
      );

      setLiveShareError(
        error?.message ||
          "Could not start live location sharing."
      );
    } finally {
      setLiveShareLoading(false);
    }
  };

  const stopLiveLocationSharing = async () => {
    if (!liveShareId || liveShareLoading) return;

    setLiveShareLoading(true);
    setLiveShareError("");

    try {
      if (liveWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(
          liveWatchIdRef.current
        );
        liveWatchIdRef.current = null;
      }

      const response = await fetch("/api/location-share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "stop",
          shareId: liveShareId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.error || "Could not stop live location sharing."
        );
      }

      setLiveSharing(false);
      setLiveShareId("");
      setLiveShareCopied(false);
    } catch (error) {
      console.error(
        "[SafeLink Location] Stop sharing failed:",
        error
      );

      setLiveShareError(
        error?.message ||
          "Could not stop live location sharing."
      );
    } finally {
      setLiveShareLoading(false);
    }
  };

  const copyLiveLocationLink = async () => {
    if (!liveShareId) return;

    const shareUrl =
      `${window.location.origin}/live-location/${liveShareId}`;

    try {
      await navigator.clipboard.writeText(shareUrl);

      setLiveShareCopied(true);

      setTimeout(() => {
        setLiveShareCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "[SafeLink Location] Could not copy share link:",
        error
      );

      setLiveShareError(
        "Could not copy the live location link."
      );
    }
  };

  const shareLiveLocationOnWhatsApp = () => {
    if (!liveShareId) return;

    const shareUrl =
      `${window.location.origin}/live-location/${liveShareId}`;

    const message = `📍 SAFELINK LIVE LOCATION

${user?.name || "User"} is sharing their live location with you.

Open the link to view the latest location:
${shareUrl}

Sent via SafeLink`;

    window.location.href =
      `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  useEffect(() => {
    return () => {
      if (liveWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(
          liveWatchIdRef.current
        );
      }
    };
  }, []);

  // -----------------------------
  // FIND NEARBY EMERGENCY HELP
  // -----------------------------

  const findNearbyPlaces = async () => {
  if (!location) {
    alert("Please get your current location first.");
    return;
  }

  setNearbyLoading(true);
  setNearbyError("");
  setNearbyPlaces([]);

  const { latitude, longitude } = location;

  const query = `
    [out:json][timeout:30];

    (
      nwr["amenity"="hospital"](around:20000,${latitude},${longitude});
      nwr["healthcare"="hospital"](around:20000,${latitude},${longitude});
      nwr["healthcare"="clinic"](around:20000,${latitude},${longitude});
      nwr["amenity"="clinic"](around:20000,${latitude},${longitude});

      nwr["amenity"="police"](around:20000,${latitude},${longitude});

      nwr["amenity"="fire_station"](around:20000,${latitude},${longitude});

      nwr["amenity"="shelter"](around:20000,${latitude},${longitude});
      nwr["social_facility"="shelter"](around:20000,${latitude},${longitude});
    );

    out center tags;
  `;

  const servers = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
  ];

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  try {
    let data = null;

    for (const server of servers) {
      try {
        const response = await fetch(
          `${server}?data=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
          continue;
        }

        data = await response.json();

        if (data?.elements?.length) {
          break;
        }
      } catch (error) {
        console.log("Overpass server failed:", server);
      }
    }

    if (!data?.elements?.length) {
      setNearbyError(
        "No emergency services found within 20 km. Try refreshing your location."
      );
      return;
    }

    const places = data.elements
      .map((item) => {
        const tags = item.tags || {};

        const lat = item.lat ?? item.center?.lat;
        const lon = item.lon ?? item.center?.lon;

        if (lat == null || lon == null) {
          return null;
        }

        let type = "Emergency Help";
        let icon = "HELP";

        if (
          tags.amenity === "hospital" ||
          tags.healthcare === "hospital"
        ) {
          type = "Hospital";
          icon = "HOSPITAL";
        } else if (
          tags.amenity === "clinic" ||
          tags.healthcare === "clinic"
        ) {
          type = "Clinic";
          icon = "CLINIC";
        } else if (tags.amenity === "police") {
          type = "Police Station";
          icon = "POLICE";
        } else if (tags.amenity === "fire_station") {
          type = "Fire Station";
          icon = "FIRE";
        } else if (
          tags.amenity === "shelter" ||
          tags.social_facility === "shelter"
        ) {
          type = "Shelter";
          icon = "SHELTER";
        }

        const distance = getDistance(
          latitude,
          longitude,
          lat,
          lon
        );

        return {
          id: `${item.type}-${item.id}`,
          name: tags.name || type,
          type,
          icon,
          latitude: lat,
          longitude: lon,
          distance: distance.toFixed(1),
          phone:
            tags.phone ||
            tags["contact:phone"] ||
            tags["contact:mobile"] ||
            "",
        };
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          Number(a.distance) - Number(b.distance)
      )
      .slice(0, 30);

    setNearbyPlaces(places);

    if (places.length === 0) {
      setNearbyError(
        "No emergency services found within 20 km."
      );
    }
  } catch (error) {
    console.error(error);

    setNearbyError(
      "Could not load nearby emergency services. Please try again."
    );
  } finally {
    setNearbyLoading(false);
  }
};

  // -----------------------------
  // SAFETY ALERTS
  // -----------------------------

  const getAlertLevel = (colorCode) => {
    const code = Number(colorCode);

    if (code === 1) {
      return {
        label: "Warning",
        className:
          "border-red-500/30 bg-red-500/10 text-red-300",
      };
    }

    if (code === 2) {
      return {
        label: "Alert",
        className:
          "border-orange-500/30 bg-orange-500/10 text-orange-300",
      };
    }

    if (code === 3) {
      return {
        label: "Watch",
        className:
          "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
      };
    }

    return {
  label: "Information",
  className:
    "border-blue-500/30 bg-blue-500/10 text-blue-300",
};
  };

  const checkSafetyAlerts = async () => {
    if (!location) {
      setAlertStatus(
        "Get your current location first so SafeLink can check nearby official alerts."
      );
      return;
    }

    setAlertsLoading(true);
    setLiveAlerts([]);
    setAlertStatus("Checking the official NDMA SACHET live alert feed...");

    try {
      const response = await fetch(
        `/api/alerts?lat=${encodeURIComponent(
          location.latitude
        )}&lng=${encodeURIComponent(location.longitude)}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Live alert API failed");
      }

      const alerts = Array.isArray(data?.alerts) ? data.alerts : [];

      setLiveAlerts(alerts);
      setLastAlertCheck(new Date());

      if (alerts.length === 0) {
        setAlertStatus(
          "No active official NDMA SACHET alerts were returned for your current area."
        );
      } else if (data.nearbyCount > 0) {
        setAlertStatus(
          `${data.nearbyCount} nearby official alert${
            data.nearbyCount === 1 ? "" : "s"
          } found from the NDMA SACHET feed.`
        );
      } else {
        setAlertStatus(
          "No alert centroid appears close to your location. Active official SACHET alerts are shown below for awareness."
        );
      }
    } catch (error) {
      console.error("Safety alert source check failed:", error);

      setLiveAlerts([]);
      setLastAlertCheck(new Date());
      setAlertStatus(
        "Could not reach the SafeLink live-alert proxy. Check your deployment/API route and use the official SACHET source below for authoritative warnings."
      );
    } finally {
      setAlertsLoading(false);
    }
  };

  const openSafetyAlerts = () => {
    if (!location) {
      alert("Please get your current location first.");
      return;
    }

    checkSafetyAlerts();
  };

  // -----------------------------
  // LOGOUT
  // -----------------------------

  const handleLogout = () => {
    localStorage.removeItem(
      "safelinkLoggedIn"
    );

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white">

      {/* ================= NAVBAR ================= */}

      <nav className="border-b border-white/10 bg-[#0b0f19]/95">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

          {/* Logo */}

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <Shield size={23} />
            </div>

            <span className="text-xl font-bold">
              Safe<span className="text-red-500">
                Link
              </span>
            </span>

          </div>

          {/* Logout */}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm transition hover:bg-white/5"
          >
            <LogOut size={17} />
            Logout
          </button>

        </div>

      </nav>

      {/* ================= MAIN ================= */}

      <main className="mx-auto max-w-7xl px-6 py-12">

        {/* Welcome */}

        <div className="mb-10">

          <p className="text-sm font-semibold tracking-widest text-red-400">
            SAFELINK DASHBOARD
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Welcome, {user?.name || "User"} 👋
          </h1>

          <p className="mt-3 text-slate-400">
            Keep your emergency network ready.
          </p>

        </div>



        {/* ================= SOS ================= */}

        <section className="mb-8 rounded-3xl border border-red-500/20 bg-red-500/[0.05] p-8">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                  <HeartPulse size={25} />
                </div>

                <div>

                  <h2 className="text-2xl font-bold">
                    Emergency SOS
                  </h2>

                  <p className="text-sm text-slate-400">
                    One tap emergency alert
                  </p>

                </div>

              </div>

              <p className="mt-5 max-w-xl leading-7 text-slate-400">
                Send an emergency signal using your
                trusted network and current location.
              </p>

            </div>


            <button
              onClick={handleSOS}
              disabled={sosLoading}
              className="flex w-full min-w-0 items-center justify-center gap-3 rounded-2xl bg-red-500 px-6 py-5 text-lg font-bold shadow-lg shadow-red-500/20 transition hover:scale-[1.02] hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:min-w-[210px]"
            >
              {sosLoading ? (
                <>
                  <LoaderCircle size={22} className="animate-spin" />
                  REGISTERING SOS...
                </>
              ) : sosSent ? (
                <>
                  <Check size={22} />
                  SOS SENT!
                </>
              ) : (
                <>
                  <Radio size={22} />
                  SEND SOS
                </>
              )}
            </button>

          </div>

          {sosSent && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-green-400">
              <Check size={20} className="mt-0.5 shrink-0" />

              <div>
                <p className="font-semibold">SOS registered successfully.</p>
                <p className="mt-1 text-sm text-green-300/80">
                  Your emergency event was registered and WhatsApp was opened
                  with your live location for the first trusted contact.
                </p>
              </div>
            </div>
          )}

          {sosError && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
              <AlertTriangle size={20} className="mt-0.5 shrink-0" />

              <div>
                <p className="font-semibold">SOS could not be completed.</p>
                <p className="mt-1 text-sm text-red-200/80">
                  {sosError}
                </p>
              </div>
            </div>
          )}

        </section>

        {/* ================= SOS HISTORY ================= */}

<section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.03] p-7">
  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
        <History size={22} />
      </div>

      <div>
        <h2 className="text-xl font-bold">
          SOS History
        </h2>

        <p className="text-sm text-slate-400">
          Your recent emergency SOS events
        </p>
      </div>
    </div>

    <button
      onClick={loadSosHistory}
      disabled={historyLoading}
      className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <RefreshCw
        size={16}
        className={historyLoading ? "animate-spin" : ""}
      />

      {historyLoading ? "Loading..." : "Refresh"}
    </button>
  </div>

  {historyError && (
    <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
      {historyError}
    </div>
  )}

  {!historyLoading &&
    !historyError &&
    sosHistory.length === 0 && (
      <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center">
        <History
          size={35}
          className="mx-auto mb-3 text-slate-500"
        />

        <p className="font-medium text-slate-300">
          No SOS events yet
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Your emergency SOS activity will appear here.
        </p>
      </div>
    )}

  {sosHistory.length > 0 && (
    <div className="mt-6 space-y-3">
      {sosHistory.map((event) => (
        <div
          key={event.event_id}
          className="rounded-2xl border border-white/10 bg-black/20 p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                <Radio size={19} />
              </div>

              <div>
                <p className="font-semibold">
                  Emergency SOS
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {event.event_id}
                </p>
              </div>
            </div>

            <span className="w-fit rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
              {event.status || "REGISTERED"}
            </span>
          </div>

          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">

            <div className="flex items-center gap-2 text-slate-400">
              <Clock size={15} />

              <span>
                {new Date(event.timestamp).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <MapPin size={15} />

              <span>
                Accuracy ±{event.accuracy}m
              </span>
            </div>

          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">

            <a
              href={`https://www.google.com/maps?q=${event.latitude},${event.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium transition hover:bg-white/5"
            >
              <MapPin size={16} />
              View Location
            </a>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
            >
              <Navigation size={16} />
              Directions
            </a>

          </div>
        </div>
      ))}
    </div>
  )}
</section>


        {/* ================= LIVE LOCATION SHARING ================= */}

        <section className="mb-8 rounded-3xl border border-blue-500/20 bg-blue-500/[0.04] p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <MapPin size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    Live Location Sharing
                  </h2>

                  <p className="text-sm text-slate-400">
                    Share your real-time location with people you trust.
                  </p>
                </div>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                SafeLink continuously updates your location while sharing is
                active. You can stop sharing at any time.
              </p>
            </div>

            {!liveSharing ? (
              <button
                onClick={startLiveLocationSharing}
                disabled={liveShareLoading || !location}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
              >
                {liveShareLoading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Radio size={18} />
                    Start Live Sharing
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={stopLiveLocationSharing}
                disabled={liveShareLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
              >
                {liveShareLoading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Stopping...
                  </>
                ) : (
                  <>
                    <Radio size={18} />
                    Stop Sharing
                  </>
                )}
              </button>
            )}
          </div>

          {!location && !liveSharing && (
            <div className="mt-5 rounded-xl border border-dashed border-white/10 bg-black/10 p-4 text-sm text-slate-500">
              Get your current location first, then start live sharing.
            </div>
          )}

          {liveSharing && liveShareId && (
            <div className="mt-6 rounded-2xl border border-green-500/20 bg-green-500/10 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-green-400">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-400" />
                    <p className="font-semibold">
                      Live location is active
                    </p>
                  </div>

                  <p className="mt-2 text-sm text-slate-400">
                    Your location is being updated while this sharing session
                    remains active.
                  </p>

                  <p className="mt-3 break-all font-mono text-xs text-slate-500">
                    Share ID: {liveShareId}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={copyLiveLocationLink}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/5"
                >
                  {liveShareCopied ? (
                    <>
                      <Check size={17} />
                      Link Copied
                    </>
                  ) : (
                    <>
                      <Copy size={17} />
                      Copy Live Link
                    </>
                  )}
                </button>

                <button
                  onClick={shareLiveLocationOnWhatsApp}
                  className="flex items-center justify-center gap-2 rounded-xl bg-green-500/10 px-4 py-3 text-sm font-semibold text-green-400 transition hover:bg-green-500/20"
                >
                  <ExternalLink size={17} />
                  Share on WhatsApp
                </button>
              </div>
            </div>
          )}

          {liveShareError && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              <AlertTriangle size={20} className="mt-0.5 shrink-0" />

              <div>
                <p className="font-semibold">
                  Live sharing issue
                </p>

                <p className="mt-1 text-red-200/80">
                  {liveShareError}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ================= EMERGENCY SERVICES ================= */}

        <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.03] p-7">

          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <Siren size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Emergency Services
              </h2>
              <p className="text-sm text-slate-400">
                Quickly contact emergency services when needed.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">

            <a
              href="tel:112"
              className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-red-500/40 hover:bg-red-500/5"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400 transition group-hover:scale-105">
                <Phone size={22} />
              </div>

              <div>
                <p className="font-semibold">Emergency</p>
                <p className="mt-1 text-2xl font-bold">112</p>
                <p className="text-xs text-slate-500">Call now</p>
              </div>
            </a>

            <a
              href="tel:108"
              className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-green-500/40 hover:bg-green-500/5"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-400 transition group-hover:scale-105">
                <HeartPulse size={22} />
              </div>

              <div>
                <p className="font-semibold">Ambulance</p>
                <p className="mt-1 text-2xl font-bold">108</p>
                <p className="text-xs text-slate-500">Call now</p>
              </div>
            </a>

            <a
              href="tel:101"
              className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-orange-500/40 hover:bg-orange-500/5"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 transition group-hover:scale-105">
                <Flame size={22} />
              </div>

              <div>
                <p className="font-semibold">Fire Service</p>
                <p className="mt-1 text-2xl font-bold">101</p>
                <p className="text-xs text-slate-500">Call now</p>
              </div>
            </a>

          </div>
        </section>

        {/* ================= LOCATION + CONTACTS ================= */}

        <div className="grid gap-8 lg:grid-cols-2">


          {/* ================= LOCATION ================= */}

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">

            <div className="mb-6 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <MapPin size={22} />
                </div>

                <div>

                  <h2 className="text-xl font-bold">
                    Live Location
                  </h2>

                  <p className="text-sm text-slate-400">
                    Your current position
                  </p>

                </div>

              </div>

              {location && (
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  Active
                </div>
              )}

            </div>


            {!location ? (

              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">

                <Navigation
                  size={38}
                  className="mx-auto mb-4 text-slate-500"
                />

                <h3 className="font-semibold">
                  Location not available
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Allow browser location access
                  to continue.
                </p>

                <button
                  onClick={getLocation}
                  disabled={locationLoading}
                  className="mt-6 rounded-xl bg-blue-500 px-6 py-3 font-semibold transition hover:bg-blue-600 disabled:opacity-50"
                >
                  {locationLoading
                    ? "Getting Location..."
                    : "Get My Location"}
                </button>

              </div>

            ) : (

              <div>

                {/* Coordinates */}

                <div className="rounded-2xl bg-black/20 p-5">

                  <div className="mb-4 flex items-center justify-between">

                    <span className="text-sm text-slate-400">
                      Coordinates
                    </span>

                    <span className="text-xs text-green-400">
                      ±{location.accuracy}m
                    </span>

                  </div>

                  <p className="font-mono text-sm text-white">
                    {location.latitude.toFixed(6)}
                  </p>

                  <p className="mt-2 font-mono text-sm text-white">
                    {location.longitude.toFixed(6)}
                  </p>

                </div>


                {/* Live Map */}
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
                  <MapContainer
                    center={[location.latitude, location.longitude]}
                    zoom={16}
                    scrollWheelZoom={true}
                    className="h-[300px] w-full"
                  >
                    <TileLayer
                      attribution='&copy; OpenStreetMap contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Marker position={[location.latitude, location.longitude]}>
                      <Popup>
                        <div className="text-sm">
                          <strong>SafeLink Current Location</strong>
                          <br />
                          Accuracy: ±{location.accuracy}m
                        </div>
                      </Popup>
                    </Marker>

                    <RecenterMap
                      latitude={location.latitude}
                      longitude={location.longitude}
                    />
                  </MapContainer>
                </div>


                {/* Buttons */}

                <div className="mt-4 flex gap-3">

                  <button
                    onClick={getLocation}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium transition hover:bg-white/5"
                  >
                    <Navigation size={17} />
                    Refresh
                  </button>

                  <button
                    onClick={copyLocation}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold transition hover:bg-blue-600"
                  >
                    {copied ? (
                      <>
                        <Check size={17} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={17} />
                        Copy Link
                      </>
                    )}
                  </button>

                </div>

                {/* Google Maps */}

                <a
                  href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 block rounded-xl border border-white/10 px-4 py-3 text-center text-sm text-slate-300 transition hover:bg-white/5"
                >
                  Open in Google Maps →
                </a>

              </div>

            )}

          </section>


          {/* ================= CONTACTS ================= */}

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">

            <div className="mb-6 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <Users size={22} />
              </div>

              <div>

                <h2 className="text-xl font-bold">
                  Trusted Contacts
                </h2>

                <p className="text-sm text-slate-400">
                  People you trust in an emergency
                </p>

              </div>

            </div>


            {/* Add Contact Form */}

            <form
              onSubmit={addContact}
              className="space-y-3"
            >

              <input
                type="text"
                placeholder="Contact name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-red-500/50"
              />

              <input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-red-500/50"
              />

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-black transition hover:bg-slate-200"
              >
                <Plus size={18} />
                Add Trusted Contact
              </button>

            </form>


            {/* Contacts */}

            <div className="mt-6 space-y-3">

              {contacts.length === 0 ? (

                <div className="rounded-xl border border-dashed border-white/10 p-6 text-center">

                  <AlertTriangle
                    size={25}
                    className="mx-auto mb-3 text-yellow-500"
                  />

                  <p className="text-sm text-slate-400">
                    No trusted contacts yet.
                  </p>

                </div>

              ) : (

                contacts.map((contact) => (

                  <div
                    key={contact.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-4"
                  >

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
                        <Users size={18} />
                      </div>

                      <div>

                        <p className="font-medium">
                          {contact.name}
                        </p>

                        <p className="text-sm text-slate-500">
                          {contact.phone}
                        </p>

                      </div>

                    </div>

                    <button
                      onClick={() =>
                        deleteContact(contact.id)
                      }
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>

                ))

              )}

            </div>

          </section>

        </div>


        {/* ================= NEARBY EMERGENCY HELP ================= */}

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                <Hospital size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold">Nearby Emergency Help</h2>
                <p className="text-sm text-slate-400">
                  Find hospitals, clinics, police stations, fire stations and shelters near you.
                </p>
              </div>
            </div>

            <button
              onClick={findNearbyPlaces}
              disabled={!location || nearbyLoading}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {nearbyLoading ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  Finding Nearby Help...
                </>
              ) : (
                <>
                  <Hospital size={17} />
                  Find Nearby Help
                </>
              )}
            </button>
          </div>

          {!location && (
            <div className="mt-5 rounded-xl border border-dashed border-white/10 p-5 text-center text-sm text-slate-500">
              Get your current location first to search nearby emergency services.
            </div>
          )}

          {nearbyError && (
            <div className="mt-5 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-300">
              {nearbyError}
            </div>
          )}

          {nearbyPlaces.length > 0 && (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {nearbyPlaces.map((place) => (
                <div
                  key={place.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                        <Hospital size={19} />
                      </div>
                      <div>
                        <p className="font-semibold">{place.name}</p>
                        <p className="text-xs text-slate-500">{place.type}</p>
                      </div>
                    </div>

                    <span className="whitespace-nowrap text-xs font-semibold text-green-400">
                      {place.distance} km
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium transition hover:bg-white/5"
                    >
                      <ExternalLink size={14} />
                      Directions
                    </a>

                    {place.phone && (
                      <a
                        href={`tel:${place.phone}`}
                        className="flex items-center justify-center gap-2 rounded-lg bg-green-500/10 px-3 py-2 text-xs font-medium text-green-400 transition hover:bg-green-500/20"
                      >
                        <PhoneCall size={14} />
                        Call
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ================= SAFETY ALERTS ================= */}

        <section
          id="safety-alerts"
          className="mt-8 scroll-mt-24 rounded-3xl border border-white/10 bg-white/[0.03] p-7"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Safety Alerts</h2>
                <p className="text-sm text-slate-400">
                  Check official disaster and weather warnings.
                </p>
              </div>
            </div>

            <button
              onClick={openSafetyAlerts}
              disabled={alertsLoading}
              className="flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={alertsLoading ? "animate-spin" : ""}
              />
              {alertsLoading ? "Checking..." : "Check Live Alerts"}
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
            <div className="flex items-start gap-3">
              <ShieldAlert
                size={20}
                className="mt-0.5 shrink-0 text-yellow-400"
              />
              <div>
                <p className="font-semibold text-yellow-300">
                  Official Alert Sources
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  {alertStatus}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">Live Alert Status</p>
                <p className="mt-1 text-sm text-slate-500">
                  Official-source check only. SafeLink never invents warning data.
                </p>
              </div>

              {lastAlertCheck && (
                <span className="text-xs text-slate-500">
                  Checked {lastAlertCheck.toLocaleTimeString("en-IN")}
                </span>
              )}
            </div>

            <div className="mt-4">
              {liveAlerts.length === 0 ? (
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-500/10 text-slate-400">
                    <ShieldAlert size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-300">
                      No active SafeLink alert cards
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      SafeLink only shows alert data received from the official
                      NDMA SACHET feed. It never invents warning data.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {liveAlerts.map((alert) => {
                    const level = getAlertLevel(alert.color);

                    return (
                      <div
                        key={alert.id}
                        className={`rounded-xl border p-4 ${level.className}`}
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold">{alert.title}</p>
                            {alert.severityLevel && (
                              <p className="mt-1 text-xs opacity-75">
                                {alert.severityLevel}
                              </p>
                            )}
                          </div>

                          <span className="w-fit rounded-full border border-current/20 px-2.5 py-1 text-xs font-bold">
                            {level.label}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-6">
                          {alert.message || alert.location}
                        </p>

                        <div className="mt-3 grid gap-1 text-xs opacity-75 sm:grid-cols-2">
                          <p>Affected area: {alert.location}</p>
                          <p>Source: {alert.source || "NDMA SACHET"}</p>
                          {alert.distanceKm != null && (
                            <p>
                              Approx. distance: {alert.distanceKm} km
                            </p>
                          )}
                          {alert.endsAt && (
                            <p>Valid until: {alert.endsAt}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <a
              href="https://sachet.ndma.gov.in/"
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-red-500/30 hover:bg-red-500/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">NDMA SACHET</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Official disaster alerts and early warnings from
                    the National Disaster Management Authority.
                  </p>
                </div>
                <ExternalLink
                  size={18}
                  className="shrink-0 text-slate-500 transition group-hover:text-red-400"
                />
              </div>
              <p className="mt-4 text-xs font-semibold text-red-400">
                Open SACHET →
              </p>
            </a>

            <a
              href="https://mausam.imd.gov.in/"
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-blue-500/30 hover:bg-blue-500/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    India Meteorological Department
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Official weather forecasts, warnings and
                    meteorological updates.
                  </p>
                </div>
                <ExternalLink
                  size={18}
                  className="shrink-0 text-slate-500 transition group-hover:text-blue-400"
                />
              </div>
              <p className="mt-4 text-xs font-semibold text-blue-400">
                Open IMD →
              </p>
            </a>
          </div>
        </section>

        {/* ================= QUICK ACTIONS ================= */}

        <section className="mt-8">

          <h2 className="mb-5 text-xl font-bold">
            Quick Actions
          </h2>

          <div className="grid gap-4 md:grid-cols-3">

            <QuickAction
              icon={<MapPin />}
              title="Share Location"
              text="Get and share your current location."
              onClick={getLocation}
            />

            <QuickAction
              icon={<Users />}
              title="Trusted Network"
              text="Manage your emergency contacts."
              onClick={() =>
                window.scrollTo({
                  top: 600,
                  behavior: "smooth",
                })
              }
            />

            <QuickAction
              icon={<Bell />}
              title="Safety Alerts"
              text="Stay ready for emergency updates."
              onClick={() =>
                document
                  .getElementById("safety-alerts")
                  ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
              }
            />

          </div>

        </section>

      </main>

    </div>
  );
};


// ============================================
// QUICK ACTION COMPONENT
// ============================================

const QuickAction = ({
  icon,
  title,
  text,
  onClick,
}) => {

  return (
    <button
      onClick={onClick}
      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left transition hover:border-white/20 hover:bg-white/[0.05]"
    >

      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400 transition group-hover:scale-110">
        {icon}
      </div>

      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>

      <p className="mt-4 text-sm font-medium text-red-400">
        Open →
      </p>

    </button>
  );
};


export default Dashboard;
