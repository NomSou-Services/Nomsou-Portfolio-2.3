/* =============================================================================
   supabase-client.js — talks to Supabase over its REST API using plain fetch.
   -----------------------------------------------------------------------------
   There is no library to install and no build step. Supabase exposes every
   table at  <project-url>/rest/v1/<table>  and every database function at
   <project-url>/rest/v1/rpc/<function>.  That is all this file uses.

   Two things happen here:
     submitInquiry()      → inserts a row into the "inquiries" table
     recordProjectView()  → calls the "increment_project_view" function and
                            returns the new total for that project

   Both fail quietly-but-honestly: they throw an Error with a readable message
   that main.js turns into on-screen text.
   ========================================================================== */

(function (window) {
  "use strict";

  var config = window.NOMSOU_CONFIG || {};

  /** True once real credentials have been pasted into config.js. */
  function isConfigured() {
    return (
      typeof config.SUPABASE_URL === "string" &&
      config.SUPABASE_URL.indexOf("YOUR-PROJECT-REF") === -1 &&
      typeof config.SUPABASE_ANON_KEY === "string" &&
      config.SUPABASE_ANON_KEY.indexOf("YOUR-PUBLIC-ANON-KEY") === -1
    );
  }

  /** Headers every Supabase REST request needs. */
  function headers(extra) {
    var base = {
      "apikey": config.SUPABASE_ANON_KEY,
      "Authorization": "Bearer " + config.SUPABASE_ANON_KEY,
      "Content-Type": "application/json"
    };
    for (var key in extra) {
      if (Object.prototype.hasOwnProperty.call(extra, key)) base[key] = extra[key];
    }
    return base;
  }

  /** Turn a failed response into an Error with the clearest message available. */
  function toError(response, body) {
    var message = "Request failed (" + response.status + ").";
    if (body && body.message) message = body.message;
    else if (body && body.hint) message = body.hint;
    var error = new Error(message);
    error.status = response.status;
    return error;
  }

  /**
   * Insert one contact inquiry.
   * @param {{name:string,email:string,company:string,service:string,message:string}} inquiry
   * @returns {Promise<void>}
   */
  function submitInquiry(inquiry) {
    if (!isConfigured()) {
      return Promise.reject(new Error("Supabase is not configured yet — add your keys to js/config.js."));
    }

    return fetch(config.SUPABASE_URL + "/rest/v1/inquiries", {
      method: "POST",
      headers: headers({ "Prefer": "return=minimal" }),
      body: JSON.stringify({
        name: inquiry.name,
        email: inquiry.email,
        company: inquiry.company || null,
        service: inquiry.service || null,
        message: inquiry.message,
        source_page: window.location.pathname
      })
    }).then(function (response) {
      if (response.ok) return;
      return response.json().catch(function () { return null; })
        .then(function (body) { throw toError(response, body); });
    });
  }

  /**
   * Count one view of a case study and get the running total back.
   * The counting happens inside the database function so the browser can
   * never set the number to whatever it likes.
   * @param {string} slug  e.g. "cornerstone-realty"
   * @returns {Promise<number>}
   */
  function recordProjectView(slug) {
    if (!isConfigured()) {
      return Promise.reject(new Error("Supabase is not configured yet."));
    }

    return fetch(config.SUPABASE_URL + "/rest/v1/rpc/increment_project_view", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ project_slug: slug })
    }).then(function (response) {
      return response.json().catch(function () { return null; })
        .then(function (body) {
          if (!response.ok) throw toError(response, body);
          // The function returns a single number.
          return typeof body === "number" ? body : Number(body);
        });
    });
  }

  window.NomSouData = {
    isConfigured: isConfigured,
    submitInquiry: submitInquiry,
    recordProjectView: recordProjectView
  };
})(window);
