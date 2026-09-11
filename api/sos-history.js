// SafeLink SOS History API
// NOTE: This version keeps the existing userName-based database schema so it
// remains compatible with the current sos_events table. Supabase Auth/user_id
// can replace this filter later for true account-level isolation.

const json = (res, status, body) => {
  res.status(status).json(body);
};

export default async function handler(req, res) {
  const allowedOrigin = process.env.APP_ORIGIN || "*";

  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return json(res, 405, { error: "Method not allowed. Use GET." });
  }

  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
      console.error("[SafeLink SOS History] Missing Supabase environment variables");
      return json(res, 500, { error: "Server configuration error." });
    }

    const userName =
      typeof req.query?.userName === "string"
        ? req.query.userName.trim().slice(0, 100)
        : "";

    if (!userName) {
      return json(res, 400, { error: "userName is required." });
    }

    const url =
      `${process.env.SUPABASE_URL}/rest/v1/sos_events` +
      `?user_name=eq.${encodeURIComponent(userName)}` +
      `&select=event_id,user_name,latitude,longitude,accuracy,timestamp,status,created_at` +
      `&order=created_at.desc` +
      `&limit=20`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        apikey: process.env.SUPABASE_SECRET_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error("[SafeLink SOS History] Supabase error:", responseText);
      return json(res, 500, { error: "Could not load SOS history." });
    }

    let events = [];
    try {
      const parsed = JSON.parse(responseText);
      events = Array.isArray(parsed) ? parsed : [];
    } catch {
      events = [];
    }

    return json(res, 200, {
      success: true,
      events,
    });
  } catch (error) {
    console.error("[SafeLink SOS History] Unexpected error:", error);
    return json(res, 500, { error: "Could not load SOS history." });
  }
}
