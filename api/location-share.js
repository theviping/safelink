import { randomUUID } from "node:crypto";

// SafeLink Live Location Sharing backend
// Creates, updates and stops live location shares in Supabase.
//
// IMPORTANT:
// - SUPABASE_SECRET_KEY must stay server-side in Vercel environment variables.
// - Shared links are intentionally readable by anyone who has the shareId.
// - Every share automatically expires after SHARE_TTL_MS, even if the browser
//   crashes or goes offline.

const SHARE_TTL_MS = 60 * 60 * 1000; // 1 hour

const json = (res, status, body) => {
  res.status(status).json(body);
};

const isFiniteNumber = (value) =>
  typeof value === "number" && Number.isFinite(value);

const getShareId = (value) =>
  typeof value === "string" ? value.trim().slice(0, 150) : "";

const getUserName = (value) =>
  typeof value === "string" && value.trim()
    ? value.trim().slice(0, 100)
    : "User";

export default async function handler(req, res) {
  const allowedOrigin = process.env.APP_ORIGIN || "*";

  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    if (!process.env.SUPABASE_URL) {
      console.error("[SafeLink Location] Missing SUPABASE_URL");
      return json(res, 500, {
        error: "Server configuration error: SUPABASE_URL is missing.",
      });
    }

    if (!process.env.SUPABASE_SECRET_KEY) {
      console.error("[SafeLink Location] Missing SUPABASE_SECRET_KEY");
      return json(res, 500, {
        error: "Server configuration error: SUPABASE_SECRET_KEY is missing.",
      });
    }

    if (req.method === "GET") {
      const shareId = getShareId(req.query?.shareId);

      if (!shareId) {
        return json(res, 400, { error: "shareId is required." });
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
        console.error("[SafeLink Location] Supabase GET error:", responseText);
        return json(res, 500, { error: "Could not fetch live location." });
      }

      let rows;
      try {
        rows = JSON.parse(responseText);
      } catch {
        rows = [];
      }

      if (!Array.isArray(rows) || rows.length === 0) {
        return json(res, 404, { error: "Location share not found." });
      }

      const share = rows[0];

      if (share.expires_at) {
        const expiry = new Date(share.expires_at).getTime();

        if (!Number.isNaN(expiry) && expiry <= Date.now()) {
          // Mark expired shares inactive when possible. GET remains successful
          // so the viewer can display a friendly expired-link message.
          await fetch(
            `${process.env.SUPABASE_URL}/rest/v1/location_shares?share_id=eq.${encodeURIComponent(shareId)}`,
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

    if (req.method !== "POST") {
      return json(res, 405, {
        error: "Method not allowed. Use GET or POST.",
      });
    }

    const body = req.body || {};
    const action =
      typeof body.action === "string"
        ? body.action.trim().toLowerCase()
        : "";

    if (action === "create") {
      const userName = getUserName(body.userName);
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

      const shareId = `SL-${Date.now()}-${randomUUID()}`;
      const expiresAt = new Date(Date.now() + SHARE_TTL_MS).toISOString();

      const event = {
        share_id: shareId,
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
        console.error("[SafeLink Location] Supabase create error:", responseText);
        return json(res, 500, { error: "Could not create location share." });
      }

      return json(res, 200, {
        success: true,
        shareId,
        expiresAt,
        message: "Live location sharing started.",
      });
    }

    if (action === "update") {
      const shareId = getShareId(body.shareId);
      const latitude = Number(body.latitude);
      const longitude = Number(body.longitude);
      const accuracy = Number(body.accuracy);

      if (!shareId) {
        return json(res, 400, { error: "shareId is required." });
      }

      if (!isFiniteNumber(latitude) || latitude < -90 || latitude > 90) {
        return json(res, 400, { error: "Invalid latitude." });
      }

      if (!isFiniteNumber(longitude) || longitude < -180 || longitude > 180) {
        return json(res, 400, { error: "Invalid longitude." });
      }

      if (!isFiniteNumber(accuracy) || accuracy < 0 || accuracy > 100000) {
        return json(res, 400, { error: "Invalid location accuracy." });
      }

      // First verify that the share exists, is active, and has not expired.
      const lookupResponse = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/location_shares?share_id=eq.${encodeURIComponent(shareId)}&select=share_id,is_active,expires_at&limit=1`,
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
        console.error("[SafeLink Location] Update lookup error:", lookupText);
        return json(res, 500, { error: "Could not update live location." });
      }

      let rows = [];
      try {
        rows = JSON.parse(lookupText);
      } catch {
        rows = [];
      }

      if (!rows.length) {
        return json(res, 404, { error: "Location share not found." });
      }

      const current = rows[0];
      const expiry = current.expires_at
        ? new Date(current.expires_at).getTime()
        : NaN;

      if (!current.is_active || (!Number.isNaN(expiry) && expiry <= Date.now())) {
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
        `${process.env.SUPABASE_URL}/rest/v1/location_shares?share_id=eq.${encodeURIComponent(shareId)}&is_active=eq.true`,
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
        console.error("[SafeLink Location] Supabase update error:", responseText);
        return json(res, 500, { error: "Could not update live location." });
      }

      return json(res, 200, {
        success: true,
        shareId,
        updatedAt: updateData.updated_at,
        message: "Live location updated.",
      });
    }

    if (action === "stop") {
      const shareId = getShareId(body.shareId);

      if (!shareId) {
        return json(res, 400, { error: "shareId is required." });
      }

      const response = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/location_shares?share_id=eq.${encodeURIComponent(shareId)}&is_active=eq.true`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.SUPABASE_SECRET_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            is_active: false,
            updated_at: new Date().toISOString(),
          }),
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        console.error("[SafeLink Location] Supabase stop error:", responseText);
        return json(res, 500, { error: "Could not stop location sharing." });
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
    console.error("[SafeLink Location] Unexpected error:", error);
    return json(res, 500, {
      error: "Could not process location sharing request.",
    });
  }
}
