import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import scrypt from "scrypt-kdf";

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  return res.status(200).end();
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const cache = req.scope.resolve("cache");
    const savedOtp = await cache.get(`otp:${email.toLowerCase()}`);

    if (!savedOtp || savedOtp !== code) {
      return res.status(400).json({ message: "Invalid or expired OTP code" });
    }

    const query = req.scope.resolve("query");
    const { data: providerIdentities } = await query.graph({
      entity: "provider_identity",
      fields: ["id", "provider_metadata"],
      filters: { 
        provider: "emailpass"
      }
    });

    const providerIdentity = providerIdentities.find(
      (i: any) => i.provider_metadata?.email === email.toLowerCase()
    );

    if (!providerIdentity) {
      return res.status(400).json({ message: "Account not found" });
    }

    // Hash the new password using scrypt (Medusa's default for emailpass)
    const buf = await scrypt.kdf(newPassword, { logN: 15, r: 8, p: 1 });
    const passwordHash = buf.toString("base64");

    const authModule = req.scope.resolve("auth");
    await authModule.updateProviderIdentities([
      {
        id: providerIdentity.id,
        provider_metadata: {
          ...providerIdentity.provider_metadata,
          password: passwordHash
        }
      }
    ]);

    // Invalidate OTP
    await cache.set(`otp:${email.toLowerCase()}`, null, 1);

    return res.json({ success: true });
  } catch (err: any) {
    console.error("OTP Verify Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
