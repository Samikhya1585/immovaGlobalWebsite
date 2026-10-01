(() => {
  "use strict";

  const header = document.getElementById("site-header");
  const menuToggle = document.getElementById("menu-toggle");
  const siteNav = document.getElementById("site-nav");
  const countrySearch = document.getElementById("country-search");
  const countryCards = [...document.querySelectorAll(".country-card")];
  const filterButtons = [...document.querySelectorAll(".filter-btn")];
  const noResults = document.getElementById("no-results");
  const countrySelect = document.getElementById("country-select");
  const serviceSelect = document.getElementById("service-select");

  // Sticky header shadow.
  const handleHeader = () => {
    header.classList.toggle("scrolled", window.scrollY > 15);
  };
  window.addEventListener("scroll", handleHeader, { passive: true });
  handleHeader();

  // Mobile navigation.
  menuToggle?.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  document.querySelectorAll(".site-nav a").forEach(link => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("open");
      menuToggle?.setAttribute("aria-expanded", "false");
    });
  });

  // Scroll reveal.
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

  // Country filter/search.
  function filterCountries() {
    const search = countrySearch.value.trim().toLowerCase();
    const active = document.querySelector(".filter-btn.active")?.dataset.filter || "all";
    let visibleCount = 0;

    countryCards.forEach(card => {
      const name = card.dataset.country;
      const matchesFilter = active === "all" || name === active;
      const matchesSearch = !search || name.toLowerCase().includes(search);
      const visible = matchesFilter && matchesSearch;

      card.style.display = visible ? "" : "none";
      if (visible) visibleCount++;
    });

    noResults.hidden = visibleCount !== 0;
  }

  countrySearch?.addEventListener("input", filterCountries);

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      filterButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      filterCountries();
    });
  });

  // Country/service CTA -> preselect form fields.
  document.querySelectorAll(".enquire-btn").forEach(button => {
    button.addEventListener("click", () => {
      countrySelect.value = button.dataset.country || "";
    });
  });

  document.querySelectorAll("[data-service]").forEach(link => {
    link.addEventListener("click", () => {
      if (serviceSelect) serviceSelect.value = link.dataset.service || "";
    });
  });

  // FAQ accordion.
  document.querySelectorAll(".faq-item button").forEach(button => {
    button.addEventListener("click", () => {
      const item = button.parentElement;
      const answer = item.querySelector(".faq-answer");
      const isOpen = item.classList.contains("open");

      document.querySelectorAll(".faq-item.open").forEach(openItem => {
        openItem.classList.remove("open");
        openItem.querySelector("button").setAttribute("aria-expanded", "false");
        openItem.querySelector(".faq-answer").style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add("open");
        button.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  // Animated statistics.
  const counters = document.querySelectorAll(".counter");
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const counter = entry.target;
      const target = Number(counter.dataset.target);
      const suffix = counter.dataset.suffix || "";
      const duration = 1000;
      const start = performance.now();

      function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.round(target * eased) + suffix;
        if (progress < 1) requestAnimationFrame(update);
      }

      requestAnimationFrame(update);
      observer.unobserve(counter);
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));

  // Formspree setup.
  // Replace YOUR_FORMSPREE_ID in index.html with the endpoint ID from Formspree.
  const form = document.getElementById("contact-form");
  const formMessage = document.getElementById("form-message");
  const replyTo = document.getElementById("reply-to");

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const endpoint = form.getAttribute("action");
    if (!endpoint || endpoint.includes("YOUR_FORMSPREE_ID")) {
      formMessage.className = "form-message error";
      formMessage.textContent = "Form setup is not complete yet. Add your Formspree endpoint ID in index.html.";
      return;
    }

    replyTo.value = form.elements.email.value;

    const submitButton = form.querySelector(".form-submit");
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = "Sending…";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      });

      if (!response.ok) throw new Error("Submission failed");

      form.reset();
      formMessage.className = "form-message success";
      formMessage.textContent = "Thank you! Your enquiry has been submitted. Immova Global will get in touch with you.";
    } catch (error) {
      formMessage.className = "form-message error";
      formMessage.textContent = "We couldn't submit the enquiry right now. Please try again or contact Immova Global directly.";
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = originalText;
    }
  });
})();


/* =========================================================
   SERVICES SECTION INTERACTIONS
   ========================================================= */

(() => {
  const visaCard = document.querySelector(".service-main-card");
  const visaToggle = document.querySelector(".visa-toggle");
  const visaPanel = document.getElementById("visa-types-panel");

  const refusalModal = document.getElementById("refusal-modal");
  const refusalTrigger = document.querySelector(".refusal-trigger");
  const modalCloseButtons = document.querySelectorAll("[data-close-modal]");

  const queryForm = document.getElementById("service-query-form");
  const queryMessage = document.getElementById("service-query-message");

  const existingContactForm = document.getElementById("contact-form");

  /* ---------------------------------------------------------
     VISA TYPES - DESKTOP HOVER + MOBILE CLICK
     --------------------------------------------------------- */

  if (visaCard && visaToggle && visaPanel) {

    const isTouchDevice = () => {
      return window.matchMedia("(hover: none), (pointer: coarse)").matches;
    };

    const openVisaTypes = () => {
      visaCard.classList.add("visa-open");
      visaToggle.setAttribute("aria-expanded", "true");
    };

    const closeVisaTypes = () => {
      visaCard.classList.remove("visa-open");
      visaToggle.setAttribute("aria-expanded", "false");
    };

    visaToggle.addEventListener("click", (event) => {
      event.preventDefault();

      if (visaCard.classList.contains("visa-open")) {
        closeVisaTypes();
      } else {
        openVisaTypes();
      }
    });

    /*
     * Desktop:
     * Hovering over the Visa Services card opens the
     * visa types naturally.
     */
    visaCard.addEventListener("mouseenter", () => {
      if (!isTouchDevice()) {
        openVisaTypes();
      }
    });

    visaCard.addEventListener("mouseleave", () => {
      if (!isTouchDevice()) {
        closeVisaTypes();
      }
    });

    /*
     * Keyboard support.
     */
    visaToggle.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeVisaTypes();
        visaToggle.blur();
      }
    });
  }


  /* ---------------------------------------------------------
     VISA REFUSAL MODAL
     --------------------------------------------------------- */

  const openRefusalModal = () => {
    if (!refusalModal) return;

    refusalModal.classList.add("open");
    refusalModal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

    const firstInput = refusalModal.querySelector("input");

    if (firstInput) {
      setTimeout(() => firstInput.focus(), 150);
    }
  };

  const closeRefusalModal = () => {
    if (!refusalModal) return;

    refusalModal.classList.remove("open");
    refusalModal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";
  };

  if (refusalTrigger) {
    refusalTrigger.addEventListener("click", openRefusalModal);
  }

  modalCloseButtons.forEach((button) => {
    button.addEventListener("click", closeRefusalModal);
  });

  /*
   * Close modal with Escape.
   */
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && refusalModal?.classList.contains("open")) {
      closeRefusalModal();
    }
  });


  /* ---------------------------------------------------------
     MODAL QUERY FORM
     Reuses the SAME Formspree endpoint as the existing
     contact form.
     --------------------------------------------------------- */

  if (queryForm) {

    if (existingContactForm?.action) {
      queryForm.action = existingContactForm.action;
    }

    queryForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!queryForm.checkValidity()) {
        queryForm.reportValidity();
        return;
      }

      const submitButton = queryForm.querySelector(
        ".service-query-submit"
      );

      const originalButtonHTML = submitButton
        ? submitButton.innerHTML
        : "";

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = "Submitting...";
      }

      if (queryMessage) {
        queryMessage.className = "service-query-message";
        queryMessage.textContent = "";
      }

      try {
        const formData = new FormData(queryForm);

        const response = await fetch(queryForm.action, {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("Submission failed");
        }

        if (queryMessage) {
          queryMessage.className =
            "service-query-message success";

          queryMessage.textContent =
            "Your query has been submitted successfully. We will get back to you soon.";
        }

        queryForm.reset();

        setTimeout(() => {
          closeRefusalModal();

          if (queryMessage) {
            queryMessage.className = "service-query-message";
            queryMessage.textContent = "";
          }
        }, 1800);

      } catch (error) {

        if (queryMessage) {
          queryMessage.className =
            "service-query-message error";

          queryMessage.textContent =
            "Something went wrong. Please try again or contact us directly.";
        }

      } finally {

        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonHTML;
        }
      }
    });
  }


  /* ---------------------------------------------------------
     AUTO-CLOSE VISA PANEL WHEN CLICKING ANOTHER SECTION
     --------------------------------------------------------- */

  document.querySelectorAll(
    '#services ~ section a[href^="#"], #services ~ section button'
  ).forEach((element) => {

    element.addEventListener("click", () => {
      if (visaCard) {
        visaCard.classList.remove("visa-open");
      }

      if (visaToggle) {
        visaToggle.setAttribute("aria-expanded", "false");
      }
    });

  });

})();


