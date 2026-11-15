const Stripe = require("stripe");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Méthode non autorisée." });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const configuredPrices = (process.env.STRIPE_PRICE_IDS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const siteUrl = (process.env.SITE_URL || "").replace(/\/$/, "");

  if (!secretKey || !siteUrl || configuredPrices.length === 0) {
    return res.status(503).json({
      error: "Le paiement n'est pas encore configuré par la boutique."
    });
  }

  const origin = req.headers.origin;
  if (origin && origin !== siteUrl) {
    return res.status(403).json({ error: "Origine non autorisée." });
  }

  let items;
  try {
    items = req.body && req.body.items;
    if (typeof items === "string") items = JSON.parse(items);
  } catch {
    return res.status(400).json({ error: "Panier invalide." });
  }

  if (!Array.isArray(items) || items.length === 0 || items.length > 20) {
    return res.status(400).json({ error: "Le panier est vide ou invalide." });
  }

  const allowed = new Set(configuredPrices);
  const lineItems = [];
  for (const item of items) {
    const price = item && item.priceId;
    const quantity = Number(item && item.quantity);
    if (
      typeof price !== "string" ||
      !allowed.has(price) ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 10
    ) {
      return res.status(400).json({ error: "Article ou quantité non autorisé." });
    }
    lineItems.push({ price, quantity });
  }

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: siteUrl + "/?paiement=succes&session_id={CHECKOUT_SESSION_ID}",
      cancel_url: siteUrl + "/?paiement=annule",
      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: ["FR"] }
    });
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout error:", error.message);
    return res.status(500).json({ error: "Impossible de créer le paiement pour le moment." });
  }
};
