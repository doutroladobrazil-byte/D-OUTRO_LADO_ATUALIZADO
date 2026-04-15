# Runbook: Media Upload Failed

## Symptom

- Admin tries to upload a product image or video and gets an error
- "Supabase Storage is not configured" error in media manager
- Upload progress bar stalls, then shows an error
- Image uploaded but not registered (appears in storage but not in product gallery)

---

## Possible Causes

| Cause | How to identify |
|---|---|
| `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` missing | `GET /api/health/ready` shows `checks.storage.ok = false` |
| Storage bucket does not exist or is named differently | Upload URL request returns 503 |
| Supabase storage bucket is private | Upload succeeds but public URL returns 403 |
| Signed URL expired before browser completed upload | Upload to Supabase returns 400 |
| File type not accepted | Frontend validation error before upload starts |
| File too large | Supabase returns 413 or the signed URL PUT fails |
| Network issue between browser and Supabase | Browser network tab shows failed PUT request |

---

## How to Verify

1. **Health check**:
   ```bash
   curl https://your-api.com/api/health/ready
   ```
   If `checks.storage.ok = false` → env vars missing. Fix them first.

2. **Backend logs** — look for:
   ```
   upload_url_unavailable
   media_register_failed
   ```

3. **Browser DevTools → Network tab** during upload:
   - Request to `POST /api/admin/media/upload-url` → should return 200 with `signedUrl`
   - PUT to Supabase signed URL → should return 200
   - POST to `/api/admin/media/register` → should return 201

4. **Supabase Dashboard → Storage** — check if the bucket `product-media` exists and is public.

5. **Test upload URL generation manually**:
   ```bash
   curl -X POST https://your-api.com/api/admin/media/upload-url \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"brand":"moda","productId":"<uuid>","mediaType":"image","filename":"test.jpg"}'
   ```

---

## How to Mitigate

### Missing env vars
1. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Render env vars
2. Restart the service
3. Re-run `curl /api/health/ready` — `checks.storage.ok` should be `true`

### Bucket missing
1. Supabase Dashboard → Storage → Create bucket named `product-media`
2. Set bucket to **public** (or configure RLS to allow public reads)
3. Re-test upload

### Bucket is private (images not loading after upload)
1. Supabase Dashboard → Storage → `product-media` → Policies
2. Add a policy: `SELECT` for `anon` role (public read)
3. Or in Supabase UI: toggle bucket to "Public"

### File type rejected
- Accepted: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `video/mp4`, `video/webm`, `video/quicktime`
- Convert the file to an accepted format before uploading

### File too large
- Supabase free tier: 50 MB per file limit
- For videos, compress before uploading or use a lower resolution

---

## When to Escalate

- Supabase Storage is experiencing an outage (check status.supabase.com)
- All uploads fail even with correct config — may be a Supabase service degradation
- Upload succeeds but public URL is broken after correct bucket setup
