// SafeLink SOS backend
// Stores SOS events in Supabase

const json = (res, status, body) => {
  res.status(status).json(body);
};

const isFiniteNumber = (value) =>
  typeof value === "number" && Number.isFinite(value);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return json(res, 405, {
      error: "Method not allowed. Use POST.",
    });
  }

  try {
    // Check environment variables
    if (!process.env.SUPABASE_URL) {
      console.error("[SafeLink SOS] Missing SUPABASE_URL");
      return json(res, 500, {
        error: "Server configuration error: SUPABASE_URL is missing.",
      });
    }

    if (!process.env.SUPABASE_SECRET_KEY) {
      console.error("[SafeLink SOS] Missing SUPABASE_SECRET_KEY");
      return json(res, 500, {
        error:
          "Server configuration error: SUPABASE_SECRET_KEY is missing.",
      });
    }

    const body = req.body || {};

    const userName =
      typeof body.userName === "string" && body.userName.trim()
        ? body.userName.trim().slice(0, 100)
        : "User";

    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);
    const accuracy = Number(body.accuracy);

    if (
      !isFiniteNumber(latitude) ||
      latitude < -90 ||
      latitude > 90
    ) {
      return json(res, 400, {
        error: "Invalid latitude.",
      });
    }

    if (
      !isFiniteNumber(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      return json(res, 400, {
        error: "Invalid longitude.",
      });
    }

    if (
      !isFiniteNumber(accuracy) ||
      accuracy < 0 ||
      accuracy > 100000
    ) {
      return json(res, 400, {
        error: "Invalid location accuracy.",
      });
    }

    const timestamp =
      typeof body.timestamp === "string" &&
      !Number.isNaN(Date.parse(body.timestamp))
        ? new Date(body.timestamp).toISOString()
        : new Date().toISOString();

    const eventId =
      `SOS-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`;

    const event = {
      event_id: eventId,
      user_name: userName,
      latitude: Number(latitude.toFixed(6)),
      longitude: Number(longitude.toFixed(6)),
      accuracy: Math.round(accuracy),
      timestamp,
      status: "REGISTERED",
    };

    console.log(
      "[SafeLink SOS] Saving event:",
      JSON.stringify(event)
    );

    // Direct Supabase REST API request
    const supabaseResponse = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/sos_events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.SUPABASE_SECRET_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify(event),
      }
    );

    const responseText = await supabaseResponse.text();

    if (!supabaseResponse.ok) {
      console.error(
        "[SafeLink SOS] Supabase error:",
        responseText
      );

      return json(res, 500, {
        error: "Could not save SOS event.",
      });
    }

    let savedEvent = null;

    try {
      savedEvent = JSON.parse(responseText);
    } catch {
      savedEvent = null;
    }

    console.log(
      "[SafeLink SOS] Saved successfully:",
      JSON.stringify(savedEvent)
    );

    return json(res, 200, {
      success: true,
      eventId,
      message: "SOS event saved successfully.",
      receivedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "[SafeLink SOS] Unexpected error:",
      error
    );

    return json(res, 500, {
      error: "Could not save SOS event.",
    });
  }
}