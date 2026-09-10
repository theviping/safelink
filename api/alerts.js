// SafeLink zero-cost live-alert proxy
// Vercel Serverless Function: /api/alerts.js
//
// Source: NDMA SACHET India CAP RSS feed.
// SACHET officially states that alerts are published through its India CAP RSS Feed.
//
// This function keeps the browser away from the XML feed (avoids browser CORS issues),
// parses the official RSS/CAP data, removes expired alerts, and returns a small
// normalized JSON response for the SafeLink dashboard.
//
// No paid API is used.

const SACHET_RSS_URL =
  "https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml";

const MAX_ALERTS = 20;

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Decode the most common XML entities without adding another npm dependency.
function decodeXml(value = "") {
  return String(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&#(\d+);/g, (_, code) => {
      try {
        return String.fromCodePoint(Number(code));
      } catch {
        return _;
      }
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => {
      try {
        return String.fromCodePoint(parseInt(code, 16));
      } catch {
        return _;
      }
    });
}

function cleanText(value = "") {
  return decodeXml(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

// Finds a tag by its local name, so both <severity> and <cap:severity>
// are supported.
function getTag(xml, tagName) {
  const escaped = tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const regex = new RegExp(
    `<(?:[A-Za-z0-9_-]+:)?${escaped}\\b[^>]*>([\\s\\S]*?)<\\/(?:[A-Za-z0-9_-]+:)?${escaped}>`,
    "i"
  );

  const match = xml.match(regex);
  return match ? cleanText(match[1]) : "";
}

function getAllBlocks(xml, tagName) {
  const escaped = tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const regex = new RegExp(
    `<(?:[A-Za-z0-9_-]+:)?${escaped}\\b[^>]*>[\\s\\S]*?<\\/(?:[A-Za-z0-9_-]+:)?${escaped}>`,
    "gi"
  );

  return xml.match(regex) || [];
}

function parseDate(value) {
  if (!value) return null;

  const raw = cleanText(value);
  const direct = new Date(raw);

  if (!Number.isNaN(direct.getTime())) {
    return direct;
  }

  // Some older feeds can contain IST in a non-standard position.
  const normalized = raw
    .replace(/\bIST\b/i, "+05:30")
    .replace(/\s+/g, " ");

  const fallback = new Date(normalized);

  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function numberOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseLatLngFromText(value) {
  if (!value) return null;

  const text = cleanText(value);

  // CAP circle format:
  // "28.6139,77.2090 25"
  const circleMatch = text.match(
    /(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)(?:\s+(\d+(?:\.\d+)?))?/ 
  );

  if (circleMatch) {
    const latitude = numberOrNull(circleMatch[1]);
    const longitude = numberOrNull(circleMatch[2]);
    const radiusKm = numberOrNull(circleMatch[3]);

    if (
      latitude != null &&
      longitude != null &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    ) {
      return {
        latitude,
        longitude,
        radiusKm,
      };
    }
  }

  // CAP point format or a simple "lat,lon" string.
  const pointMatch = text.match(
    /(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/ 
  );

  if (pointMatch) {
    const latitude = numberOrNull(pointMatch[1]);
    const longitude = numberOrNull(pointMatch[2]);

    if (
      latitude != null &&
      longitude != null &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    ) {
      return {
        latitude,
        longitude,
        radiusKm: null,
      };
    }
  }

  return null;
}

function parsePolygonCentroid(value) {
  if (!value) return null;

  const pairs = cleanText(value)
    .trim()
    .split(/\s+/)
    .map((pair) => pair.split(",").map(Number))
    .filter(
      ([lat, lng]) =>
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
    );

  if (!pairs.length) return null;

  const latitude =
    pairs.reduce((sum, [lat]) => sum + lat, 0) / pairs.length;

  const longitude =
    pairs.reduce((sum, [, lng]) => sum + lng, 0) / pairs.length;

  return {
    latitude,
    longitude,
    radiusKm: null,
  };
}

function extractLocation(itemXml) {
  // CAP circle is the best proximity signal.
  const circle = getTag(itemXml, "circle");
  const circlePoint = parseLatLngFromText(circle);

  if (circlePoint) {
    return circlePoint;
  }

  // Some feeds may expose a point.
  const point = getTag(itemXml, "point");
  const pointLocation = parseLatLngFromText(point);

  if (pointLocation) {
    return pointLocation;
  }

  // Polygon centroid as a fallback.
  const polygon = getTag(itemXml, "polygon");
  const polygonLocation = parsePolygonCentroid(polygon);

  if (polygonLocation) {
    return polygonLocation;
  }

  // Last-resort latitude/longitude-like fields if present.
  const latitude =
    numberOrNull(getTag(itemXml, "latitude")) ??
    numberOrNull(getTag(itemXml, "lat"));

  const longitude =
    numberOrNull(getTag(itemXml, "longitude")) ??
    numberOrNull(getTag(itemXml, "lon")) ??
    numberOrNull(getTag(itemXml, "lng"));

  if (
    latitude != null &&
    longitude != null &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  ) {
    return {
      latitude,
      longitude,
      radiusKm: null,
    };
  }

  return null;
}

function severityToColorCode(severity) {
  const value = String(severity || "").toLowerCase();

  if (value.includes("extreme") || value.includes("severe")) {
    return value.includes("extreme") ? 1 : 2;
  }

  if (value.includes("moderate")) {
    return 3;
  }

  if (value.includes("minor")) {
    return 4;
  }

  // If the source gives a direct colour, it is handled separately.
  return 4;
}

function getSeverityInfo(itemXml) {
  const severity = getTag(itemXml, "severity");
  const severityColor = getTag(itemXml, "severity_color");

  const colorValue = String(severityColor).toLowerCase();

  if (colorValue.includes("red")) {
    return {
      severity: severity || "WARNING",
      color: "red",
      colorCode: 1,
    };
  }

  if (colorValue.includes("orange")) {
    return {
      severity: severity || "ALERT",
      color: "orange",
      colorCode: 2,
    };
  }

  if (colorValue.includes("yellow")) {
    return {
      severity: severity || "WATCH",
      color: "yellow",
      colorCode: 3,
    };
  }

  if (colorValue.includes("green")) {
    return {
      severity: severity || "NO WARNING",
      color: "green",
      colorCode: 4,
    };
  }

  const colorCode = severityToColorCode(severity);

  return {
    severity: severity || "WATCH",
    color:
      colorCode === 1
        ? "red"
        : colorCode === 2
        ? "orange"
        : colorCode === 3
        ? "yellow"
        : "green",
    colorCode,
  };
}

function severityRank(alert) {
  const code = Number(alert?.colorCode);

  if (code === 1) return 4;
  if (code === 2) return 3;
  if (code === 3) return 2;

  return 1;
}

function extractItems(xml) {
  // RSS normally uses <item>. CAP feeds can also use <entry>, so support both.
  const items = getAllBlocks(xml, "item");

  if (items.length > 0) {
    return items;
  }

  return getAllBlocks(xml, "entry");
}

function normalizeItem(itemXml, userLat, userLng) {
  const severityInfo = getSeverityInfo(itemXml);
  const location = extractLocation(itemXml);

  const distanceKm =
    location &&
    Number.isFinite(location.latitude) &&
    Number.isFinite(location.longitude)
      ? haversineKm(
          userLat,
          userLng,
          location.latitude,
          location.longitude
        )
      : null;

  const startsAt =
    parseDate(
      getTag(itemXml, "effective") ||
        getTag(itemXml, "onset") ||
        getTag(itemXml, "pubDate") ||
        getTag(itemXml, "sent")
    ) || null;

  const endsAt =
    parseDate(
      getTag(itemXml, "expires") ||
        getTag(itemXml, "expiration") ||
        getTag(itemXml, "effective_end_time")
    ) || null;

  const title =
    getTag(itemXml, "event") ||
    getTag(itemXml, "title") ||
    "Official Disaster Alert";

  const area =
    getTag(itemXml, "areaDesc") ||
    getTag(itemXml, "area_description") ||
    getTag(itemXml, "location") ||
    "Affected area not specified";

  const description =
    getTag(itemXml, "description") ||
    getTag(itemXml, "warning_message") ||
    getTag(itemXml, "headline") ||
    getTag(itemXml, "instruction") ||
    "";

  const sender =
    getTag(itemXml, "senderName") ||
    getTag(itemXml, "sender") ||
    getTag(itemXml, "source") ||
    "NDMA SACHET";

  const identifier =
    getTag(itemXml, "identifier") ||
    getTag(itemXml, "guid") ||
    getTag(itemXml, "id") ||
    `${title}-${area}-${startsAt?.toISOString() || ""}`;

  // If the feed provides a circle radius, use it. Otherwise use a
  // conservative proximity hint of 25 km for point-only alerts.
  const proximityRadiusKm =
    location?.radiusKm != null && location.radiusKm > 0
      ? location.radiusKm
      : 25;

  const nearby =
    distanceKm != null &&
    distanceKm <= Math.max(25, proximityRadiusKm);

  return {
    id: String(identifier),
    title: cleanText(title),
    location: cleanText(area),
    message: cleanText(description),
    severity: severityInfo.severity,
    severityLevel: getTag(itemXml, "severity_level") || "",
    color: severityInfo.color,
    colorCode: severityInfo.colorCode,
    source: cleanText(sender) || "NDMA SACHET",
    distanceKm:
      distanceKm == null ? null : Number(distanceKm.toFixed(1)),
    nearby,
    startsAt: startsAt ? startsAt.toISOString() : null,
    endsAt: endsAt ? endsAt.toISOString() : null,
    latitude: location?.latitude ?? null,
    longitude: location?.longitude ?? null,
  };
}

function isActive(alert) {
  if (!alert.endsAt) return true;

  const endTime = new Date(alert.endsAt).getTime();

  return Number.isNaN(endTime) || endTime >= Date.now();
}

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Keep Vercel's cached response short because this is an emergency feed.
  res.setHeader(
    "Cache-Control",
    "s-maxage=60, stale-while-revalidate=120"
  );

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const lat = Number(req.query?.lat);
  const lng = Number(req.query?.lng);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return res.status(400).json({
      error: "Valid lat and lng query parameters are required.",
    });
  }

  try {
    const response = await fetch(SACHET_RSS_URL, {
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
        "User-Agent": "SafeLink-Emergency-App/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(
        `SACHET RSS returned HTTP ${response.status}`
      );
    }

    const xml = await response.text();

    if (!xml || !/<(?:rss|feed|rdf:RDF)\b/i.test(xml)) {
      throw new Error("SACHET returned an unexpected RSS/XML response.");
    }

    const sourceItems = extractItems(xml);

    const alerts = sourceItems
      .map((item) => normalizeItem(item, lat, lng))
      .filter(isActive);

    // Remove obvious duplicate entries.
    const uniqueAlerts = Array.from(
      new Map(
        alerts.map((alert) => [
          `${alert.id}|${alert.title}|${alert.location}`,
          alert,
        ])
      ).values()
    );

    const nearbyAlerts = uniqueAlerts
      .filter((alert) => alert.nearby)
      .sort(
        (a, b) =>
          severityRank(b) - severityRank(a) ||
          (a.distanceKm ?? 999999) -
            (b.distanceKm ?? 999999)
      );

    const remainingAlerts = uniqueAlerts
      .filter((alert) => !alert.nearby)
      .sort(
        (a, b) =>
          severityRank(b) - severityRank(a) ||
          (a.distanceKm ?? 999999) -
            (b.distanceKm ?? 999999)
      );

    const finalAlerts = [
      ...nearbyAlerts,
      ...remainingAlerts,
    ].slice(0, MAX_ALERTS);

    return res.status(200).json({
      source: "NDMA SACHET India CAP RSS Feed",
      sourceUrl: SACHET_RSS_URL,
      checkedAt: new Date().toISOString(),
      nearbyCount: nearbyAlerts.length,
      totalActive: uniqueAlerts.length,
      alerts: finalAlerts,
    });
  } catch (error) {
    console.error("SafeLink SACHET RSS proxy error:", error);

    return res.status(502).json({
      error:
        "Unable to fetch the official NDMA SACHET RSS alert feed.",
      source: "NDMA SACHET India CAP RSS Feed",
    });
  }
}
