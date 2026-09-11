// SafeLink Live Location Sharing backend
// Creates, updates and stops live location shares in Supabase

const json = (res, status, body) => {
  res.status(status).json(body);
};

const isFiniteNumber = (value) =>
  typeof value === "number" && Number.isFinite(value);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    // Check environment variables
    if (!process.env.SUPABASE_URL) {
      console.error(
        "[SafeLink Location] Missing SUPABASE_URL"
      );

      return json(res, 500, {
        error:
          "Server configuration error: SUPABASE_URL is missing.",
      });
    }

    if (!process.env.SUPABASE_SECRET_KEY) {
      console.error(
        "[SafeLink Location] Missing SUPABASE_SECRET_KEY"
      );

      return json(res, 500, {
        error:
          "Server configuration error: SUPABASE_SECRET_KEY is missing.",
      });
    }

    // --------------------------------------------------
    // GET - Fetch active live location
    // Example:
    // /api/location-share?shareId=SL-XXXX
    // --------------------------------------------------

    if (req.method === "GET") {
      const shareId =
        typeof req.query?.shareId === "string"
          ? req.query.shareId.trim()
          : "";

      if (!shareId) {
        return json(res, 400, {
          error: "shareId is required.",
        });
      }

      const supabaseResponse = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/location_shares?share_id=eq.${encodeURIComponent(
          shareId
        )}&select=share_id,user_name,latitude,longitude,accuracy,is_active,created_at,updated_at,expires_at`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.SUPABASE_SECRET_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
          },
        }
      );

      const responseText = await supabaseResponse.text();

      if (!supabaseResponse.ok) {
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

      // Check if share has expired
      if (
        share.expires_at &&
        new Date(share.expires_at).getTime() <= Date.now()
      ) {
        return json(res, 200, {
          success: true,
          active: false,
          message: "This location sharing link has expired.",
        });
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
        share: share,
      });
    }

    // --------------------------------------------------
    // POST - Create / Update / Stop
    // --------------------------------------------------

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

    // --------------------------------------------------
    // CREATE SHARE
    // --------------------------------------------------

    if (action === "create") {
      const userName =
        typeof body.userName === "string" &&
        body.userName.trim()
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

      const shareId =
        `SL-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 10)
          .toUpperCase()}`;

      const event = {
        share_id: shareId,
        user_name: userName,
        latitude: Number(latitude.toFixed(6)),
        longitude: Number(longitude.toFixed(6)),
        accuracy: Math.round(accuracy),
        is_active: true,
      };

      console.log(
        "[SafeLink Location] Creating share:",
        JSON.stringify(event)
      );

      const supabaseResponse = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/location_shares`,
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
          "[SafeLink Location] Supabase create error:",
          responseText
        );

        return json(res, 500, {
          error: "Could not create location share.",
        });
      }

      console.log(
        "[SafeLink Location] Share created:",
        shareId
      );

      return json(res, 200, {
        success: true,
        shareId,
        message: "Live location sharing started.",
      });
    }

    // --------------------------------------------------
    // UPDATE LOCATION
    // --------------------------------------------------

    if (action === "update") {
      const shareId =
        typeof body.shareId === "string"
          ? body.shareId.trim()
          : "";

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

      const updateData = {
        latitude: Number(latitude.toFixed(6)),
        longitude: Number(longitude.toFixed(6)),
        accuracy: Math.round(accuracy),
        updated_at: new Date().toISOString(),
      };

      console.log(
        "[SafeLink Location] Updating share:",
        shareId
      );

      const supabaseResponse = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/location_shares?share_id=eq.${encodeURIComponent(
          shareId
        )}&is_active=eq.true`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.SUPABASE_SECRET_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
            Prefer: "return=representation",
          },
          body: JSON.stringify(updateData),
        }
      );

      const responseText = await supabaseResponse.text();

      if (!supabaseResponse.ok) {
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
        message: "Live location updated.",
      });
    }

    // --------------------------------------------------
    // STOP SHARE
    // --------------------------------------------------

    if (action === "stop") {
      const shareId =
        typeof body.shareId === "string"
          ? body.shareId.trim()
          : "";

      if (!shareId) {
        return json(res, 400, {
          error: "shareId is required.",
        });
      }

      console.log(
        "[SafeLink Location] Stopping share:",
        shareId
      );

      const supabaseResponse = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/location_shares?share_id=eq.${encodeURIComponent(
          shareId
        )}`,
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

      const responseText = await supabaseResponse.text();

      if (!supabaseResponse.ok) {
        console.error(
          "[SafeLink Location] Supabase stop error:",
          responseText
        );

        return json(res, 500, {
          error: "Could not stop location sharing.",
        });
      }

      return json(res, 200, {
        success: true,
        shareId,
        message: "Live location sharing stopped.",
      });
    }

    return json(res, 400, {
      error:
        "Invalid action. Use create, update or stop.",
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