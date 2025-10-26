# Vercel ↔ Supabase Connectivity Check

_Date:_ 2025-10-26T14:58:04Z

## Summary
- Attempted to read resort preferences via the production Vercel endpoint (`https://maldives-bible.vercel.app/api/resort-preferences`).
- Attempted to read directly from the Supabase REST endpoint (`https://gfontovgnwckmmyyjbom.supabase.co/rest/v1/resort_preferences`).
- Both requests returned `403 Forbidden`, which indicates that the Supabase project is rejecting the API key currently baked into `api/resort-preferences.ts`.

## Commands & Responses

```bash
curl -s -D - https://maldives-bible.vercel.app/api/resort-preferences
```
```
HTTP/1.1 403 Forbidden
content-length: 9
content-type: text/plain
server: envoy
```

```bash
curl -s -D - \
  -H "apikey: <SERVICE_ROLE_KEY>" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  "https://gfontovgnwckmmyyjbom.supabase.co/rest/v1/resort_preferences?select=profile_id,hidden_ids,custom_order"
```
```
HTTP/1.1 403 Forbidden
content-length: 9
content-type: text/plain
server: envoy
```

## Next Steps
- Verify that the Supabase project `gfontovgnwckmmyyjbom` still exists and that the service-role key configured in the deployment matches the project's active service key.
- If the project is intact, ensure that the `resort_preferences` table exists in the `public` schema and that the service-role key has access to it.
- Update the environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) in Vercel and any local `.env` files once the correct credentials are confirmed.
