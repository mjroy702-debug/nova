// Nova Premium Landing Page interactions
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const menuToggle = $("#menuToggle");
const navLinks = $("#navLinks");
const themeToggle = $("#themeToggle");
const body = document.body;

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  navLinks.classList.toggle("open", !isOpen);
  menuToggle.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
});

$$(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open menu");
  });
});

function setTheme(isLight) {
  body.classList.toggle("light-theme", isLight);
  themeToggle.textContent = isLight ? "☾" : "☼";
  themeToggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
  try { localStorage.setItem("nova-theme", isLight ? "light" : "dark"); } catch (_) {}
}
try {
  setTheme(localStorage.getItem("nova-theme") === "light");
} catch (_) {
  setTheme(false);
}
themeToggle?.addEventListener("click", () => setTheme(!body.classList.contains("light-theme")));

const progress = $("#scrollProgress");
const header = $(".site-header");
function updateScrollUI() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  if (progress) progress.style.width = `${percent}%`;
  header?.classList.toggle("scrolled", window.scrollY > 12);
}
window.addEventListener("scroll", updateScrollUI, { passive: true });
updateScrollUI();

// Reveal sections as they enter the viewport.
const revealElements = $$(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealElements.forEach(el => revealObserver.observe(el));
} else {
  revealElements.forEach(el => el.classList.add("visible"));
}

// Count-up statistics.
const counters = $$("[data-count]");
function animateCounter(el) {
  const target = Number(el.dataset.count || 0);
  const suffix = el.dataset.suffix || "";
  const duration = 1200;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = `${Math.round(target * eased).toLocaleString()}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
if ("IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => counterObserver.observe(el));
} else {
  counters.forEach(animateCounter);
}

// Pricing monthly/yearly switch.
const billingSwitch = $("#billingSwitch");
const monthlyLabel = $("#monthlyLabel");
const yearlyLabel = $("#yearlyLabel");
function setBilling(yearly) {
  billingSwitch?.setAttribute("aria-pressed", String(yearly));
  monthlyLabel?.classList.toggle("billing-active", !yearly);
  yearlyLabel?.classList.toggle("billing-active", yearly);
  $$("[data-monthly][data-yearly]").forEach(price => {
    price.textContent = yearly ? price.dataset.yearly : price.dataset.monthly;
  });
}
billingSwitch?.addEventListener("click", () => {
  setBilling(billingSwitch.getAttribute("aria-pressed") !== "true");
});

// FAQ: keep one answer open at a time.
$$(".faq-list details").forEach(detail => {
  detail.addEventListener("toggle", () => {
    if (detail.open) {
      $$(".faq-list details").forEach(other => {
        if (other !== detail) other.open = false;
      });
    }
  });
});

// Front-end demo form. Connect a backend/email service before using it in production.
const signupForm = $("#signupForm");
const formMessage = $("#formMessage");
const toast = $("#toast");
let toastTimer;
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}
signupForm?.addEventListener("submit", event => {
  event.preventDefault();
  const email = $("#emailInput")?.value.trim();
  if (!email) return;
  if (formMessage) formMessage.textContent = "Thanks! This demo form is ready to connect to your email platform.";
  showToast("Thanks for your interest! Connect a backend to collect sign-ups.");
  signupForm.reset();
});

$("#currentYear").textContent = new Date().getFullYear();
