// SafeLink SOS backend
// Vercel Serverless Function: /api/sos

import { createClient } from "@supabase/supabase-js";

const json = (res, status, body) => {
  return res.status(status).json(body);
};

// Supabase server client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const isFiniteNumber = (value) =>
  typeof value === "number" && Number.isFinite(value);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Only POST allowed
  if (req.method !== "POST") {
    return json(res, 405, {
      error: "Method not allowed. Use POST.",
    });
  }

  try {
    const body = req.body || {};

    // -----------------------------
    // Validate user name
    // -----------------------------
    const userName =
      typeof body.userName === "string" && body.userName.trim()
        ? body.userName.trim().slice(0, 100)
        : "User";

    // -----------------------------
    // Validate location
    // -----------------------------
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

    // -----------------------------
    // Validate timestamp
    // -----------------------------
    const timestamp =
      typeof body.timestamp === "string" &&
      !Number.isNaN(Date.parse(body.timestamp))
        ? new Date(body.timestamp).toISOString()
        : new Date().toISOString();

    // -----------------------------
    // Generate unique event ID
    // -----------------------------
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

    // -----------------------------
    // Save SOS event to Supabase
    // -----------------------------
    const { data, error } = await supabase
      .from("sos_events")
      .insert(event)
      .select("event_id, created_at")
      .single();

    if (error) {
      console.error(
        "[SafeLink SOS] Supabase error:",
        error
      );

      return json(res, 500, {
        error: "Could not save SOS event.",
      });
    }

    // -----------------------------
    // Server log
    // -----------------------------
    console.log(
      "[SafeLink SOS] Saved:",
      JSON.stringify({
        eventId: data.event_id,
        userName,
        latitude: event.latitude,
        longitude: event.longitude,
        accuracy: event.accuracy,
        timestamp,
      })
    );

    // -----------------------------
    // Success response
    // -----------------------------
    return json(res, 200, {
      success: true,
      eventId: data.event_id,
      message: "SOS event saved successfully.",
      createdAt: data.created_at,
    });
  } catch (error) {
    console.error(
      "[SafeLink SOS] Unexpected error:",
      error
    );

    return json(res, 500, {
      error: "Could not register SOS event.",
    });
  }
}