// SafeLink SOS backend
// Stores SOS events in Supabase.

import { randomUUID } from "node:crypto";

const json = (res, status, body) => {
  res.status(status).json(body);
};

const isFiniteNumber = (value) =>
  typeof value === "number" && Number.isFinite(value);

export default async function handler(req, res) {
  const allowedOrigin = process.env.APP_ORIGIN || "*";

  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed. Use POST." });
  }

  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
      console.error("[SafeLink SOS] Missing Supabase environment variables");
      return json(res, 500, { error: "Server configuration error." });
    }

    const body = req.body || {};

    const userName =
      typeof body.userName === "string" && body.userName.trim()
        ? body.userName.trim().slice(0, 100)
        : "User";

    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);
    const accuracy = Number(body.accuracy);

    if (!isFiniteNumber(latitude) || latitude < -90 || latitude > 90) {
      return json(res, 400, { error: "Invalid latitude." });
    }

    if (!isFiniteNumber(longitude) || longitude < -180 || longitude > 180) {
      return json(res, 400, { error: "Invalid longitude." });
    }

    if (!isFiniteNumber(accuracy) || accuracy < 0 || accuracy > 100000) {
      return json(res, 400, { error: "Invalid location accuracy." });
    }

    const parsedTimestamp =
      typeof body.timestamp === "string" ? Date.parse(body.timestamp) : NaN;

    const timestamp = Number.isNaN(parsedTimestamp)
      ? new Date().toISOString()
      : new Date(parsedTimestamp).toISOString();

    const eventId = `SOS-${randomUUID()}`;

    const event = {
      event_id: eventId,
      user_name: userName,
      latitude: Number(latitude.toFixed(6)),
      longitude: Number(longitude.toFixed(6)),
      accuracy: Math.round(accuracy),
      timestamp,
      status: "REGISTERED",
    };

    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/sos_events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.SUPABASE_SECRET_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify(event),
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      console.error("[SafeLink SOS] Supabase error:", responseText);
      return json(res, 500, { error: "Could not save SOS event." });
    }

    return json(res, 200, {
      success: true,
      eventId,
      message: "SOS event saved successfully.",
      receivedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[SafeLink SOS] Unexpected error:", error);
    return json(res, 500, { error: "Could not save SOS event." });
  }
}
