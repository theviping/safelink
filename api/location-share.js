import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

// SafeLink Live Location Sharing backend
//
// Security:
// - GET is public because the share link is meant for trusted viewers.
// - POST create/update/stop requires a valid Supabase access token.
// - Only the authenticated owner can update or stop their share.
// - Share links automatically expire after 1 hour.

const SHARE_TTL_MS = 60 * 60 * 1000;

const json = (res, status, body) => {
  res.status(status).json(body);
};

const isFiniteNumber = (value) =>
  typeof value === "number" && Number.isFinite(value);

const getShareId = (value) =>
  typeof value === "string" ? value.trim().slice(0, 150) : "";

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
    "GET, POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    if (!process.env.SUPABASE_URL) {
      console.error("[SafeLink Location] Missing SUPABASE_URL");

      return json(res, 500, {
        error: "Server configuration error.",
      });
    }

    if (!process.env.SUPABASE_SECRET_KEY) {
      console.error("[SafeLink Location] Missing SUPABASE_SECRET_KEY");

      return json(res, 500, {
        error: "Server configuration error.",
      });
    }

    // --------------------------------
    // PUBLIC GET
    // --------------------------------
    // Anyone with the shareId can view
    // an active shared location.
    if (req.method === "GET") {
      const shareId = getShareId(req.query?.shareId);

      if (!shareId) {
        return json(res, 400, {
          error: "shareId is required.",
        });
      }

      const url =
        `${process.env.SUPABASE_URL}/rest/v1/location_shares` +
        `?share_id=eq.${encodeURIComponent(shareId)}` +
        `&select=share_id,user_name,latitude,longitude,accuracy,is_active,created_at,updated_at,expires_at` +
        `&limit=1`;

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
          "[SafeLink Location] Supabase GET error:",
          responseText
        );

        return json(res, 500, {
          error: "Could not fetch live location.",
        });
      }

      let rows = [];

      try {
        rows = JSON.parse(responseText);
      } catch {
        rows = [];
      }

      if (!Array.isArray(rows) || rows.length === 0) {
        return json(res, 404, {
          error: "Location share not found.",
        });
      }

      const share = rows[0];

      // Check automatic expiry.
      if (share.expires_at) {
        const expiry = new Date(share.expires_at).getTime();

        if (!Number.isNaN(expiry) && expiry <= Date.now()) {
          await fetch(
            `${process.env.SUPABASE_URL}/rest/v1/location_shares` +
              `?share_id=eq.${encodeURIComponent(shareId)}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                apikey: process.env.SUPABASE_SECRET_KEY,
                Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
              },
              body: JSON.stringify({
                is_active: false,
                updated_at: new Date().toISOString(),
              }),
            }
          ).catch(() => {});

          return json(res, 200, {
            success: true,
            active: false,
            message: "This location sharing link has expired.",
          });
        }
      }

      if (!share.is_active) {
        return json(res, 200, {
          success: true,
          active: false,
          message: "Live location sharing has been stopped.",
        });
      }

      return json(res, 200, {
        success: true,
        active: true,
        share,
      });
    }

    // --------------------------------
    // POST AUTHENTICATION
    // --------------------------------

    if (req.method !== "POST") {
      return json(res, 405, {
        error: "Method not allowed. Use GET or POST.",
      });
    }

    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return json(res, 401, {
        error: "Authentication required.",
      });
    }

    // Server-side Supabase client.
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

    // Verify the user's access token.
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      console.error(
        "[SafeLink Location] Authentication failed:",
        authError
      );

      return json(res, 401, {
        error: "Invalid or expired authentication token.",
      });
    }

    const body = req.body || {};

    const action =
      typeof body.action === "string"
        ? body.action.trim().toLowerCase()
        : "";

    // --------------------------------
    // CREATE
    // --------------------------------

    if (action === "create") {
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

      const userName =
        typeof user.user_metadata?.name === "string" &&
        user.user_metadata.name.trim()
          ? user.user_metadata.name.trim().slice(0, 100)
          : user.email || "User";

      const shareId = `SL-${Date.now()}-${randomUUID()}`;

      const expiresAt = new Date(
        Date.now() + SHARE_TTL_MS
      ).toISOString();

      const event = {
        share_id: shareId,
        user_id: user.id,
        user_name: userName,
        latitude: Number(latitude.toFixed(6)),
        longitude: Number(longitude.toFixed(6)),
        accuracy: Math.round(accuracy),
        is_active: true,
        expires_at: expiresAt,
      };

      const response = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/location_shares`,
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
          "[SafeLink Location] Supabase create error:",
          responseText
        );

        return json(res, 500, {
          error: "Could not create location share.",
        });
      }

      return json(res, 200, {
        success: true,
        shareId,
        expiresAt,
        message: "Live location sharing started.",
      });
    }

    // --------------------------------
    // UPDATE
    // --------------------------------

    if (action === "update") {
      const shareId = getShareId(body.shareId);
      const latitude = Number(body.latitude);
      const longitude = Number(body.longitude);
      const accuracy = Number(body.accuracy);

      if (!shareId) {
        return json(res, 400, {
          error: "shareId is required.",
        });
      }

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

      // Check ownership + active status + expiry.
      const lookupResponse = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/location_shares` +
          `?share_id=eq.${encodeURIComponent(shareId)}` +
          `&user_id=eq.${encodeURIComponent(user.id)}` +
          `&select=share_id,user_id,is_active,expires_at` +
          `&limit=1`,
        {
          method: "GET",
          headers: {
            apikey: process.env.SUPABASE_SECRET_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
          },
        }
      );

      const lookupText = await lookupResponse.text();

      if (!lookupResponse.ok) {
        console.error(
          "[SafeLink Location] Update lookup error:",
          lookupText
        );

        return json(res, 500, {
          error: "Could not update live location.",
        });
      }

      let rows = [];

      try {
        rows = JSON.parse(lookupText);
      } catch {
        rows = [];
      }

      if (!rows.length) {
        return json(res, 404, {
          error: "Location share not found or not owned by you.",
        });
      }

      const current = rows[0];

      const expiry = current.expires_at
        ? new Date(current.expires_at).getTime()
        : NaN;

      if (
        !current.is_active ||
        (!Number.isNaN(expiry) && expiry <= Date.now())
      ) {
        return json(res, 410, {
          error: "This live location share is no longer active.",
        });
      }

      const updateData = {
        latitude: Number(latitude.toFixed(6)),
        longitude: Number(longitude.toFixed(6)),
        accuracy: Math.round(accuracy),
        updated_at: new Date().toISOString(),
      };

      const response = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/location_shares` +
          `?share_id=eq.${encodeURIComponent(shareId)}` +
          `&user_id=eq.${encodeURIComponent(user.id)}` +
          `&is_active=eq.true`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.SUPABASE_SECRET_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify(updateData),
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        console.error(
          "[SafeLink Location] Supabase update error:",
          responseText
        );

        return json(res, 500, {
          error: "Could not update live location.",
        });
      }

      return json(res, 200, {
        success: true,
        shareId,
        updatedAt: updateData.updated_at,
        message: "Live location updated.",
      });
    }

    // --------------------------------
    // STOP
    // --------------------------------

    if (action === "stop") {
      const shareId = getShareId(body.shareId);

      if (!shareId) {
        return json(res, 400, {
          error: "shareId is required.",
        });
      }

      // Ownership check happens directly in the PATCH filter.
      const response = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/location_shares` +
          `?share_id=eq.${encodeURIComponent(shareId)}` +
          `&user_id=eq.${encodeURIComponent(user.id)}` +
          `&is_active=eq.true`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.SUPABASE_SECRET_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            is_active: false,
            updated_at: new Date().toISOString(),
          }),
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        console.error(
          "[SafeLink Location] Supabase stop error:",
          responseText
        );

        return json(res, 500, {
          error: "Could not stop location sharing.",
        });
      }

      let rows = [];

      try {
        rows = JSON.parse(responseText);
      } catch {
        rows = [];
      }

      if (!Array.isArray(rows) || rows.length === 0) {
        return json(res, 404, {
          error: "Location share not found or not owned by you.",
        });
      }

      return json(res, 200, {
        success: true,
        shareId,
        message: "Live location sharing stopped.",
      });
    }

    return json(res, 400, {
      error: "Invalid action. Use create, update or stop.",
    });
  } catch (error) {
    console.error(
      "[SafeLink Location] Unexpected error:",
      error
    );

    return json(res, 500, {
      error: "Could not process location sharing request.",
    });
  }
}