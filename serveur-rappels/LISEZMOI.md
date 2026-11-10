# Serveur de rappels MFC Quiz

Envoie la notification du matin à chaque abonné, à l'heure qu'il a choisie dans l'app.
Hébergé sur Cloudflare Workers (offre gratuite : largement suffisante pour des milliers d'abonnés).

Mise en service (une seule fois) :
1. Créer un compte gratuit sur cloudflare.com.
2. `npx wrangler login`, puis `npx wrangler kv namespace create SUBS` → recopier l'id dans `wrangler.toml`.
3. Secrets : `npx wrangler secret put VAPID_PUBLIC`, `VAPID_PRIVATE_JWK`, `VAPID_SUBJECT` (ex. `mailto:contact@mathisfelicite.fr`).
4. `npx wrangler deploy` → recopier l'adresse obtenue dans `PUSH_API` (index.html).

La clé publique VAPID est déjà dans index.html. La clé privée ne doit jamais être publiée dans ce dépôt.
