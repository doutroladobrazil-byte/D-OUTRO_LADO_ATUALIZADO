import { app } from "./app.js";
import { env } from "./config/env.js";

app.listen(Number(env.PORT), () => {
  console.log(`D'OUTRO LADO API running on port ${env.PORT}`);
});
