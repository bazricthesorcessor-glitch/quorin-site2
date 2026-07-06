const { MedusaError } = require("@medusajs/utils");

const GET = async (req, res) => {
  const authModule = req.scope.resolve("auth");
  const { code, state } = req.query;

  if (!code || !state) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Missing code or state query parameters"
    );
  }

  try {
    const { success, error, authIdentity, token } =
      await authModule.validateCallback("google", {
        query: { code, state },
        actor_type: "customer",
      });

    if (!success) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        error || "Google authentication failed"
      );
    }

    const user = authIdentity.user_metadata ?? {};

    return res.json({
      token,
      user: {
        email: user.email || "",
        name: user.name || "",
        picture: user.picture || "",
      },
    });
  } catch (err) {
    if (err instanceof MedusaError) throw err;
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      err.message
    );
  }
};

module.exports = { GET };
