// SafeLink SOS History API
// Returns SOS events belonging only to the authenticated user.

import { createClient } from "@supabase/supabase-js";

const json = (res, status, body) => {
  res.status(status).json(body);
};

const getAccessToken = (req) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice(7).trim() || null;
};

export default async function handler(req, res) {
  const allowedOrigin = process.env.APP_ORIGIN || "*";

  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return json(res, 405, {
      error: "Method not allowed. Use GET.",
    });
  }

  try {
    // --------------------------------
    // SERVER CONFIG
    // --------------------------------

    if (
      !process.env.SUPABASE_URL ||
      !process.env.SUPABASE_SECRET_KEY
    ) {
      console.error(
        "[SafeLink SOS History] Missing Supabase environment variables"
      );

      return json(res, 500, {
        error: "Server configuration error.",
      });
    }

    // --------------------------------
    // AUTHENTICATION
    // --------------------------------

    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return json(res, 401, {
        error: "Authentication required.",
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify access token with Supabase Auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      console.error(
        "[SafeLink SOS History] Authentication failed:",
        authError
      );

      return json(res, 401, {
        error: "Invalid or expired authentication token.",
      });
    }

    // --------------------------------
    // FETCH ONLY THIS USER'S EVENTS
    // --------------------------------

    const url =
      `${process.env.SUPABASE_URL}/rest/v1/sos_events` +
      `?user_id=eq.${encodeURIComponent(user.id)}` +
      `&select=event_id,user_id,user_name,latitude,longitude,accuracy,timestamp,status,created_at` +
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
      console.error(
        "[SafeLink SOS History] Supabase error:",
        responseText
      );

      return json(res, 500, {
        error: "Could not load SOS history.",
      });
    }

    // --------------------------------
    // SAFE JSON PARSING
    // --------------------------------

    let events = [];

    try {
      const parsed = JSON.parse(responseText);

      events = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error(
        "[SafeLink SOS History] Invalid JSON from Supabase:",
        error
      );

      events = [];
    }

    return json(res, 200, {
      success: true,
      events,
    });
  } catch (error) {
    console.error(
      "[SafeLink SOS History] Unexpected error:",
      error
    );

    return json(res, 500, {
      error: "Could not load SOS history.",
    });
  }
}