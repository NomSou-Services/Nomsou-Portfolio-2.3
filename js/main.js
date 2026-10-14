/* =============================================================================
   main.js — everything the site does in the browser.
   -----------------------------------------------------------------------------
   Sections:
     1. Footer year
     2. Mobile navigation
     3. Sticky header shadow
     4. Scroll reveal animations
     5. Contact form (validation + Supabase submit)
     6. Hero video + before/after sliders
     7. Case study view counter
   Each part checks that the elements it needs exist first, so the same file
   can be loaded on every page.
   ========================================================================== */

(function () {
  "use strict";

  var config = window.NOMSOU_CONFIG || {};
  var data = window.NomSouData;

  /* 1. FOOTER YEAR ---------------------------------------------------------- */

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* 2. MOBILE NAVIGATION ---------------------------------------------------- */

  var navToggle = document.getElementById("navToggle");
  var nav = document.getElementById("primaryNav");

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close the menu after tapping a link.
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a") && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });

    // Close the menu on Escape.
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.focus();
      }
    });
  }

  /* 3. STICKY HEADER -------------------------------------------------------- */

  var header = document.getElementById("siteHeader");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* 4. SCROLL REVEAL -------------------------------------------------------- */

  /* Elements marked .reveal start faded out and slide up as they come into
     view. One sweep function handles it, run on scroll and on resize.

     Why a sweep instead of IntersectionObserver: the observer only reports
     elements that CROSS the viewport edge. Jump straight down the page — an
     anchor link, a restored scroll position after a refresh, a fast flick on a
     phone — and everything skipped over never fires, so that content stays
     invisible forever. Checking positions directly cannot miss anything. */

  var revealTargets = document.querySelectorAll(".reveal");

  if (revealTargets.length) {
    var prefersReducedMotion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var showAll = function () {
      Array.prototype.forEach.call(document.querySelectorAll(".reveal"), function (el) {
        el.classList.add("is-visible");
      });
    };

    if (prefersReducedMotion) {
      showAll(); // no animation for visitors who asked for less motion
    } else {
      var ticking = false;

      var sweep = function () {
        ticking = false;
        var pending = document.querySelectorAll(".reveal:not(.is-visible)");

        Array.prototype.forEach.call(pending, function (el) {
          // Reveal once the element's top edge reaches 88% of the way down
          // the window — or once it is already above the fold.
          if (el.getBoundingClientRect().top < window.innerHeight * 0.88) {
            el.classList.add("is-visible");
          }
        });

        // Everything is showing: stop listening.
        if (pending.length === 0) {
          window.removeEventListener("scroll", onScrollReveal);
          window.removeEventListener("resize", onScrollReveal);
        }
      };

      var onScrollReveal = function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(sweep);
      };

      sweep(); // first pass for whatever is on screen at load
      window.addEventListener("scroll", onScrollReveal, { passive: true });
      window.addEventListener("resize", onScrollReveal);
      window.addEventListener("load", sweep); // images can shift the layout
    }
  }

  /* 5. CONTACT FORM --------------------------------------------------------- */

  var form = document.getElementById("contactForm");

  if (form && data) {
    var statusEl = document.getElementById("formStatus");
    var submitBtn = document.getElementById("formSubmit");
    var submitLabel = submitBtn ? submitBtn.innerHTML : "";

    var showStatus = function (message, kind) {
      if (!statusEl) return;
      statusEl.textContent = message;
      statusEl.className = "form__status is-visible " + (kind === "error" ? "is-error" : "is-success");
    };

    var clearStatus = function () {
      if (statusEl) statusEl.className = "form__status";
    };

    var setFieldError = function (fieldName, message) {
      var el = form.querySelector('[data-error-for="' + fieldName + '"]');
      var input = form.elements[fieldName];
      if (el) el.textContent = message || "";
      if (input) {
        if (message) input.setAttribute("aria-invalid", "true");
        else input.removeAttribute("aria-invalid");
      }
    };

    /** Returns an object of { fieldName: errorMessage } — empty means valid. */
    var validate = function (values) {
      var errors = {};
      if (!values.name) errors.name = "Please add your name.";
      if (!values.email) errors.email = "Please add an email address.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) errors.email = "That email does not look right.";
      if (!values.message) errors.message = "Tell me a little about the project.";
      else if (values.message.length < 20) errors.message = "A couple more sentences would help.";
      return errors;
    };

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearStatus();

      var values = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        company: form.elements.company.value.trim(),
        service: form.elements.service.value,
        message: form.elements.message.value.trim()
      };

      // Spam trap: if the hidden field is filled in, it was a bot.
      // Pretend it worked so the bot does not learn anything.
      if (form.elements.website && form.elements.website.value) {
        showStatus("Thanks — your message is on its way.", "success");
        form.reset();
        return;
      }

      var errors = validate(values);
      ["name", "email", "company", "message"].forEach(function (field) {
        setFieldError(field, errors[field]);
      });

      var firstError = Object.keys(errors)[0];
      if (firstError) {
        var firstInput = form.elements[firstError];
        if (firstInput) firstInput.focus();
        showStatus("Please fix the highlighted fields.", "error");
        return;
      }

      if (config.ENABLE_CONTACT_FORM === false) {
        showStatus("Form submitting is switched off in js/config.js.", "error");
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      data.submitInquiry(values)
        .then(function () {
          form.reset();
          showStatus("Thanks — your message landed. I reply within two business days.", "success");
        })
        .catch(function (error) {
          // The reason is for us, not for the visitor — a raw "Supabase is not
          // configured" string in the UI just reads as broken software.
          if (window.console && console.error) {
            console.error("Inquiry submission failed:", error);
          }
          showStatus(
            "Something went wrong sending that. Email nomsouservices@gmail.com and I will pick it up.",
            "error"
          );
        })
        .then(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = submitLabel;
          }
        });
    });

    // Clear a field's error as soon as the visitor starts fixing it.
    form.addEventListener("input", function (event) {
      if (event.target.name) setFieldError(event.target.name, "");
    });
  }

  /* 6. HERO VIDEO + BEFORE/AFTER -------------------------------------------- */

  var heroVideo = document.querySelector(".hero__video");
  if (heroVideo) {
    var reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    var wideQuery = window.matchMedia("(min-width: 761px)");

    var syncHeroVideo = function () {
      var allow = wideQuery.matches && !reduceQuery.matches;
      if (!allow) {
        heroVideo.pause();
        heroVideo.removeAttribute("autoplay");
        return;
      }
      if (!heroVideo.querySelector("source")) {
        var source = document.createElement("source");
        source.src = "assets/media/hero-loop.mp4";
        source.type = "video/mp4";
        heroVideo.appendChild(source);
        heroVideo.preload = "metadata";
        heroVideo.load();
      }
      heroVideo.setAttribute("autoplay", "");
      var playPromise = heroVideo.play();
      if (playPromise && playPromise.catch) playPromise.catch(function () {});
    };

    syncHeroVideo();
    if (wideQuery.addEventListener) wideQuery.addEventListener("change", syncHeroVideo);
    if (reduceQuery.addEventListener) reduceQuery.addEventListener("change", syncHeroVideo);
  }

  var baFrames = document.querySelectorAll(".ba__frame");
  Array.prototype.forEach.call(baFrames, function (frame) {
    var range = frame.querySelector(".ba__range");
    if (!range) return;

    var setSplit = function (value) {
      var pct = Math.max(0, Math.min(100, Number(value)));
      frame.style.setProperty("--ba-split", pct + "%");
    };

    setSplit(range.value);
    range.addEventListener("input", function () {
      setSplit(range.value);
    });
  });

  /* 7. CASE STUDY VIEW COUNTER ---------------------------------------------- */

  var counterEl = document.querySelector("[data-project-slug]");

  if (counterEl && data && config.ENABLE_VIEW_COUNTER !== false) {
    var slug = counterEl.getAttribute("data-project-slug");
    var valueEl = counterEl.querySelector("[data-view-value]");

    data.recordProjectView(slug)
      .then(function (total) {
        if (valueEl && isFinite(total)) {
          valueEl.textContent = total.toLocaleString();
          counterEl.hidden = false;
        }
      })
      .catch(function () {
        // No counter is better than a broken counter — leave it hidden.
        counterEl.hidden = true;
      });
  }
})();
