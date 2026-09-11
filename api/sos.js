// SafeLink SOS backend
// Authenticated users can create SOS events in Supabase.

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
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return json(res, 405, {
      error: "Method not allowed. Use POST.",
    });
  }

  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
      console.error(
        "[SafeLink SOS] Missing Supabase environment variables"
      );

      return json(res, 500, {
        error: "Server configuration error.",
      });
    }

    // -----------------------------------------
    // 1. Read Authorization header
    // -----------------------------------------

    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return json(res, 401, {
        error: "Authentication required.",
      });
    }

    const accessToken = authHeader.slice("Bearer ".length).trim();

    if (!accessToken) {
      return json(res, 401, {
        error: "Authentication required.",
      });
    }

    // -----------------------------------------
    // 2. Verify Supabase user
    // -----------------------------------------

    const userResponse = await fetch(
      `${process.env.SUPABASE_URL}/auth/v1/user`,
      {
        method: "GET",
        headers: {
          apikey: process.env.SUPABASE_SECRET_KEY,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const userResponseText = await userResponse.text();

    if (!userResponse.ok) {
      console.error(
        "[SafeLink SOS] Auth verification failed:",
        userResponseText
      );

      return json(res, 401, {
        error: "Invalid or expired session.",
      });
    }

    let authUser;

    try {
      authUser = JSON.parse(userResponseText);
    } catch {
      return json(res, 401, {
        error: "Invalid authentication response.",
      });
    }

    if (!authUser?.id) {
      return json(res, 401, {
        error: "Invalid authenticated user.",
      });
    }

    // -----------------------------------------
    // 3. Read request body
    // -----------------------------------------

    const body = req.body || {};

    const userName =
      typeof body.userName === "string" && body.userName.trim()
        ? body.userName.trim().slice(0, 100)
        : authUser.user_metadata?.name ||
          authUser.email ||
          "User";

    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);
    const accuracy = Number(body.accuracy);

    // -----------------------------------------
    // 4. Validate location
    // -----------------------------------------

    if (!isFiniteNumber(latitude) || latitude < -90 || latitude > 90) {
      return json(res, 400, {
        error: "Invalid latitude.",
      });
    }

    if (!isFiniteNumber(longitude) || longitude < -180 || longitude > 180) {
      return json(res, 400, {
        error: "Invalid longitude.",
      });
    }

    if (!isFiniteNumber(accuracy) || accuracy < 0 || accuracy > 100000) {
      return json(res, 400, {
        error: "Invalid location accuracy.",
      });
    }

    // -----------------------------------------
    // 5. Validate timestamp
    // -----------------------------------------

    const parsedTimestamp =
      typeof body.timestamp === "string"
        ? Date.parse(body.timestamp)
        : NaN;

    const timestamp = Number.isNaN(parsedTimestamp)
      ? new Date().toISOString()
      : new Date(parsedTimestamp).toISOString();

    // -----------------------------------------
    // 6. Create SOS event
    // -----------------------------------------

    const eventId = `SOS-${randomUUID()}`;

    const event = {
      event_id: eventId,

      // Supabase Auth user ID
      user_id: authUser.id,

      user_name: userName,

      latitude: Number(latitude.toFixed(6)),
      longitude: Number(longitude.toFixed(6)),
      accuracy: Math.round(accuracy),

      timestamp,

      status: "REGISTERED",
    };

    // -----------------------------------------
    // 7. Save to Supabase
    // -----------------------------------------

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
      console.error(
        "[SafeLink SOS] Supabase error:",
        responseText
      );

      return json(res, 500, {
        error: "Could not save SOS event.",
      });
    }

    // -----------------------------------------
    // 8. Success
    // -----------------------------------------

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