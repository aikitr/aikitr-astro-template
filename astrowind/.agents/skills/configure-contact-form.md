# Form integration in this fork

The contact and subscribe forms already submit to `/api/contact` and `/api/subscribe`. The Worker reads `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, and optional `TURNSTILE_SECRET_KEY`; browser code receives none of these values. Set up the migration and secrets using `README.md`. Keep consent and input validation when changing the form. This template only stores submissions; connect a separate service if email delivery is needed.
