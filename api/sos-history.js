// SafeLink SOS History API
// Returns the latest SOS events for a user

const json = (res, status, body) => {
  res.status(status).json(body);
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return json(res, 405, {
      error: "Method not allowed. Use GET.",
    });
  }

  try {
    if (!process.env.SUPABASE_URL) {
      return json(res, 500, {
        error: "SUPABASE_URL is missing.",
      });
    }

    if (!process.env.SUPABASE_SECRET_KEY) {
      return json(res, 500, {
        error: "SUPABASE_SECRET_KEY is missing.",
      });
    }

    const userName =
      typeof req.query?.userName === "string"
        ? req.query.userName.trim()
        : "";

    if (!userName) {
      return json(res, 400, {
        error: "userName is required.",
      });
    }

    const url =
      `${process.env.SUPABASE_URL}/rest/v1/sos_events` +
      `?select=event_id,user_name,latitude,longitude,accuracy,timestamp,status,created_at` +
      `&user_name=eq.${encodeURIComponent(userName)}` +
      `&order=created_at.desc` +
      `&limit=10`;

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

    let events = [];

    try {
      events = JSON.parse(responseText);
    } catch {
      events = [];
    }

    return json(res, 200, {
      success: true,
      events: Array.isArray(events) ? events : [],
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