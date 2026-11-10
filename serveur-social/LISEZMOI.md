# Serveur des défis (Supabase)

Classements, amis, duels et Course au sommet.

- `schema.sql` : à coller une fois dans Supabase (SQL Editor > New query > Run). Relançable sans risque.
- Dans Supabase : Authentication > Sign In / Providers > activer **Allow anonymous sign-ins**.
- `social-block.js` : le code de l'app, inséré dans `index.html` par `python3 build.py`.

Semaine de jeu : du dimanche 20 h au dimanche 20 h (heure de Paris). L'XP totale n'est jamais remise à zéro ;
seul le compteur de la semaine repart à zéro. Ne jamais publier la clé « secret » / « service_role ».

## Modération
- Signalements : Supabase > Table Editor > `mfc_reports` (qui, quel pseudo, quelle raison).
- Suspendre un joueur : Table Editor > `mfc_profiles` > colonne `banned` = true. Il disparaît des classements et ne peut plus jouer aux Défis.
- `schema-2-moderation.sql` : mise à jour à coller une fois après `schema.sql` (blocage, signalement, suppression de compte).

## App iOS
- `.github/workflows/ios.yml` construit l'app sur un Mac de GitHub à chaque modification (contrôle).
- Envoi sur TestFlight : Actions > App iOS > Run workflow > cocher « testflight » (après avoir ajouté les secrets ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_P8, APPLE_TEAM_ID).
