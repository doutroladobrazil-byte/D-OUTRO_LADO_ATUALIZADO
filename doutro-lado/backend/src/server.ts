import { app } from "./app.js";

// Use INTERNAL_API_PORT so the backend never conflicts with the public PORT
// that Render assigns to the Next.js frontend.
const port = Number(process.env.INTERNAL_API_PORT || process.env.PORT || 4000);

app.listen(port, "0.0.0.0", () => {
  console.log(`D'OUTRO LADO API running on port ${port}`);
});
