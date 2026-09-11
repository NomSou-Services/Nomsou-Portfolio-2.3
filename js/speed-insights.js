/* =============================================================================
   speed-insights.js — Vercel Speed Insights initialization
   -----------------------------------------------------------------------------
   Loads and initializes @vercel/speed-insights for performance tracking.
   This script injects the Speed Insights tracking code when the page loads.
   
   Note: Speed Insights only tracks data in production mode on Vercel.
   ========================================================================== */

(function () {
  "use strict";

  // Import the injectSpeedInsights function from the package
  // For static sites, we use the inject function to add tracking
  if (typeof window !== "undefined") {
    // Initialize Speed Insights
    // The script will be loaded from /_vercel/speed-insights/script.js
    // when deployed on Vercel
    window.si = window.si || function() {
      (window.siq = window.siq || []).push(arguments);
    };
    
    // Create and inject the script tag
    var script = document.createElement("script");
    script.src = "/_vercel/speed-insights/script.js";
    script.defer = true;
    script.dataset.sdkn = "@vercel/speed-insights";
    script.dataset.sdkv = "1.3.1";
    
    script.onerror = function() {
      console.log(
        "[Vercel Speed Insights] Failed to load script. " +
        "This is expected in development. Speed Insights will work when deployed to Vercel."
      );
    };
    
    document.head.appendChild(script);
  }
})();
