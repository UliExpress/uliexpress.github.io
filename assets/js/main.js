function myFunction() {
  var x = document.getElementById("myLinks");
  if (!x) return;
  x.style.display = (x.style.display === "block") ? "none" : "block";
}

// Hero slider + stinger transition
(function () {
  var hero = document.querySelector("[data-hero]");
  if (!hero) return;

  var slides = hero.querySelectorAll(".hero-slide");
  var stinger = hero.querySelector(".hero-stinger");
  if (!slides.length || !stinger) return;

  var index = 0;
  var intervalMs = 5200;
  var stingerDelayMs = 500;

  function show(i) {
    slides.forEach(function (s) { s.classList.remove("is-active"); });
    slides[i].classList.add("is-active");
  }

  function next() {
    stinger.classList.add("is-animating");
    window.setTimeout(function () {
      index = (index + 1) % slides.length;
      show(index);
    }, stingerDelayMs);

    window.setTimeout(function () {
      stinger.classList.remove("is-animating");
    }, 700);
  }

  show(index);
  window.setInterval(next, intervalMs);
})();

// ===== Estimate Calculator (with delivery speed + scheduled fields) =====
const ESTIMATE_CONFIG = {
  baseFee: 25,
  perMileRate: 2.25,
  perLbRate: 0.08,
  oversizeThresholdIn: 36,
  oversizeFee: 20,
  minCharge: 50,

  // Placeholder speed adders (swap to % later)
  speedAdders: {
    asap: 1,
    scheduled: 1,
    nextday: 1,
  },
};

function formatMoney(amount) {
  return amount.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

(function initEstimateCalculator() {
  const root = document.querySelector("[data-calc]");
  if (!root) return;

  const form = root.querySelector("[data-calc-form]");
  const costEl = root.querySelector("[data-calc-cost]");
  const resetBtn = root.querySelector("[data-calc-reset]");

  if (!form || !costEl) return;

  const speedEl = root.querySelector("[data-calc-speed]");
  const scheduledEls = root.querySelectorAll("[data-calc-scheduled]");

  function setScheduledVisible(visible) {
    scheduledEls.forEach((el) => {
      // Works regardless of whether you used hidden="" or CSS display:none
      el.hidden = !visible;
      el.style.display = visible ? "" : "none";
    });
  }

  function syncScheduledVisibility() {
    if (!speedEl) return;
    document.body.classList.toggle("is-scheduled", speedEl.value === "scheduled");
  }

  if (speedEl) {
    speedEl.addEventListener("change", syncScheduledVisibility);
    syncScheduledVisibility();
  }

  function calculateCost(weightLbs, widthIn, heightIn, distanceMi, speed) {
    const base = ESTIMATE_CONFIG.baseFee;
    const distanceCharge = distanceMi * ESTIMATE_CONFIG.perMileRate;
    const weightCharge = weightLbs * ESTIMATE_CONFIG.perLbRate;

    const isOversize =
      widthIn >= ESTIMATE_CONFIG.oversizeThresholdIn ||
      heightIn >= ESTIMATE_CONFIG.oversizeThresholdIn;

    const sizeCharge = isOversize ? ESTIMATE_CONFIG.oversizeFee : 0;

    let total = base + distanceCharge + weightCharge + sizeCharge;
    total += ESTIMATE_CONFIG.speedAdders[speed] ?? 0;
    total = Math.max(total, ESTIMATE_CONFIG.minCharge);

    return total;
  }

  function clear() {
    costEl.textContent = "—";
  }

  if (speedEl) {
    speedEl.addEventListener("change", syncScheduledVisibility);
    syncScheduledVisibility();
  } else {
    // If speed selector isn't present, never show scheduled fields
    setScheduledVisible(false);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const weightLbs = Number(fd.get("weightLbs"));
    const widthIn = Number(fd.get("widthIn"));
    const heightIn = Number(fd.get("heightIn"));
    const distanceMi = Number(fd.get("distanceMi"));
    const speed = String(fd.get("speed") || "asap");

    const ok =
      isFinite(weightLbs) && weightLbs >= 0 &&
      isFinite(widthIn) && widthIn >= 0 &&
      isFinite(heightIn) && heightIn >= 0 &&
      isFinite(distanceMi) && distanceMi >= 0;

    if (!ok) {
      clear();
      return;
    }

    const total = calculateCost(weightLbs, widthIn, heightIn, distanceMi, speed);
    costEl.textContent = formatMoney(total);
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      form.reset();
      if (speedEl) syncScheduledVisibility();
      clear();
    });
  }

  clear();
})();
