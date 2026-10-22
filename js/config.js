/* =============================================================================
   config.js — the only file you need to edit to connect the site to Supabase.
   -----------------------------------------------------------------------------
   1. Open your Supabase project → Settings → API.
   2. Copy the "Project URL" into SUPABASE_URL below.
   3. Copy the "anon / public" key into SUPABASE_ANON_KEY below.

   The anon key is meant to be public — it is safe in a browser AS LONG AS
   row level security is switched on. supabase/schema.sql does that for you.
   Never paste the "service_role" key here.
   ========================================================================== */

window.NOMSOU_CONFIG = {
  SUPABASE_URL: "https://YOUR-PROJECT-REF.supabase.co",
  SUPABASE_ANON_KEY: "YOUR-PUBLIC-ANON-KEY",

  // Off until a real Supabase project replaces the placeholders above.
  ENABLE_CONTACT_FORM: false,
  ENABLE_VIEW_COUNTER: false
};
