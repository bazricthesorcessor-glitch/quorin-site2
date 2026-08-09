import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";

const setCorsHeaders = (req: MedusaRequest, res: MedusaResponse) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-publishable-api-key");
  res.setHeader("Access-Control-Allow-Credentials", "true");
};

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  setCorsHeaders(req, res);
  return res.status(200).end();
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  setCorsHeaders(req, res);
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const query = req.scope.resolve("query");

    // Check if customer exists in provider identities
    const { data: providerIdentities } = await query.graph({
      entity: "provider_identity",
      fields: ["id", "provider_metadata"],
      filters: { 
        provider: "emailpass"
      }
    });

    const identity = providerIdentities.find(
      (i: any) => i.provider_metadata?.email === email.toLowerCase()
    );

    if (!identity) {
      // Don't leak whether email exists, just return success
      return res.json({ success: true, message: "If the email exists, an OTP was sent." });
    }

    // Generate 6 digit code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Cache the OTP mapped to the email
    const cache = req.scope.resolve("cache");
    await cache.set(`otp:${email.toLowerCase()}`, otp, 600); // 10 mins

    // Send email via Resend REST API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "QUORIN Support <onboarding@resend.dev>", // Must use onboarding@resend.dev until custom domain is verified
        to: email,
        subject: "Your QUORIN Password Reset Code",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your password for your QUORIN account.</p>
            <p>Your 6-digit reset code is:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 20px; background: #f4f4f4; border-radius: 8px; text-align: center; margin: 20px 0;">
              ${otp}
            </div>
            <p>This code expires in 10 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
          </div>
        `
      })
    });

    if (!resendResponse.ok) {
      console.warn("Resend API warning:", await resendResponse.text());
      // We still return success so we don't block if there's a minor config error during testing
    }

    return res.json({ success: true });
  } catch (err: any) {
    console.error("OTP Generate Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
