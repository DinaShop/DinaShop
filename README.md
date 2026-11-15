# DinaShop

Site vitrine de la boutique DinaShop. Le paiement Stripe est préparé côté serveur dans `api/create-checkout-session.js`.

## Déploiement du serveur sur Vercel

1. Importer le dépôt GitHub `DinaShop/DinaShop` dans Vercel.
2. Dans **Settings → Environment Variables**, ajouter :
   - `STRIPE_SECRET_KEY` : clé secrète Stripe (à conserver uniquement dans Vercel).
   - `STRIPE_PRICE_IDS` : identifiants des prix Stripe autorisés, séparés par des virgules.
   - `SITE_URL` : adresse HTTPS du site déployé, sans barre oblique finale.
3. Redéployer après l'ajout ou la modification des variables.

## Sécurité et état actuel

- La clé secrète Stripe n'est jamais placée dans le navigateur ni dans le dépôt.
- Le serveur n'accepte que les identifiants de prix déclarés dans `STRIPE_PRICE_IDS` et limite les quantités.
- L'endpoint attend un POST JSON de la forme `{"items":[{"priceId":"price_...","quantity":1}]}`.
- Le site n'a pas encore de catalogue réel ni de panier connecté. Aucun paiement ne peut donc être proposé aux clientes avant la configuration des produits, prix, livraison et du parcours de commande.
- Ne jamais publier une clé secrète dans GitHub ou la transmettre dans une conversation.
