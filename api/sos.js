// SafeLink SOS backend
// Vercel Serverless Function: /api/sos

const json = (res, status, body) => {
  res.status(status).json(body);
};

const isFiniteNumber = (value) =>
  typeof value === "number" && Number.isFinite(value);

export default function handler(req, res) {
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
      eventId,
      type: "EMERGENCY_SOS",
      userName,
      latitude: Number(latitude.toFixed(6)),
      longitude: Number(longitude.toFixed(6)),
      accuracy: Math.round(accuracy),
      timestamp,
      receivedAt: new Date().toISOString(),
    };

    console.log(
      "[SafeLink SOS]",
      JSON.stringify(event)
    );

    return json(res, 200, {
      success: true,
      eventId,
      message: "SOS event registered successfully.",
      receivedAt: event.receivedAt,
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