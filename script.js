
"use strict";

// 1. Mobile navigation
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

function closeMenu() {
  navLinks.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
}

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");

  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu"
  );
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

document.addEventListener("click", (event) => {
  if (
    navLinks.classList.contains("open") &&
    !navLinks.contains(event.target) &&
    !menuToggle.contains(event.target)
  ) {
    closeMenu();
  }
});

// 2. Automatically display the current year
document.getElementById("year").textContent = new Date().getFullYear();

// 3. Highlight the navigation link for the visible section
const sections = document.querySelectorAll("main section[id]");
const sectionLinks = document.querySelectorAll('.nav-links a[href^="#"]');

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        sectionLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${entry.target.id}`;

          if (isActive) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      });
    },
    {
      rootMargin: "-25% 0px -60% 0px",
      threshold: 0
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

// 4. Contact form validation and Formspree message delivery
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");
const submitButton = contactForm.querySelector('button[type="submit"]');
const submitLabel = document.getElementById("submit-label");

// IMPORTANT: Replace this value with your own Formspree endpoint.
// Example format: https://formspree.io/f/abcdefgh
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xbgdnzrd";

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  formStatus.textContent = "";
  formStatus.className = "form-status";

  if (!contactForm.checkValidity()) {
    contactForm.reportValidity();
    return;
  }

  if (FORMSPREE_ENDPOINT.includes("YOUR_FORM_ID")) {
    formStatus.textContent =
      "Contact form setup is incomplete. Configure your Formspree endpoint in script.js first.";
    formStatus.classList.add("error");
    return;
  }

  const formData = new FormData(contactForm);
  const senderName = String(formData.get("name") || "").trim();
  const senderEmail = String(formData.get("email") || "").trim();
  const senderSubject = String(formData.get("subject") || "").trim();
  const senderMessage = String(formData.get("message") || "").trim();

  if (senderName.length < 2) {
    formStatus.textContent = "Please enter a name with at least 2 characters.";
    formStatus.classList.add("error");
    return;
  }

  if (!senderEmail || !senderSubject || senderMessage.length < 10) {
    formStatus.textContent =
      "Please check your email, subject, and message (at least 10 characters).";
    formStatus.classList.add("error");
    return;
  }

  submitButton.disabled = true;
  submitLabel.textContent = "Sending...";

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json"
      }
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const serverMessage = Array.isArray(result.errors)
        ? result.errors.map((item) => item.message).join(" ")
        : "";

      throw new Error(
        serverMessage || "The message could not be sent. Please try again."
      );
    }

    formStatus.textContent =
      "Message sent successfully! Thank you for contacting me.";
    formStatus.classList.add("success");
    contactForm.reset();
  } catch (error) {
    formStatus.textContent =
      error.message ||
      "Something went wrong. Please check your connection and try again.";
    formStatus.classList.add("error");
  } finally {
    submitButton.disabled = false;
    submitLabel.textContent = "Send Message ↗";
  }
});
