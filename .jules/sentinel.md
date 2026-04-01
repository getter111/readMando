## 2026-04-01 - [Fix IDOR vulnerability in vocabulary update endpoints]
**Vulnerability:** Insecure Direct Object Reference (IDOR) on `/study_deck/toggle` and `/study_deck/update` endpoints allowed any user to modify or delete other users' vocabulary records by supplying arbitrary `user_vocab_id`s.
**Learning:** Endpoints that modify specific objects must always verify that the object being modified belongs to the currently authenticated user, not just that the user is authenticated.
**Prevention:** Always extract the object from the database using the provided ID, check its ownership field (e.g., `user_id`) against the authenticated user's ID from the session/token, and return a 403 Forbidden/Unauthorized if they do not match before making any updates.
