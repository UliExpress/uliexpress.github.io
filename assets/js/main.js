function myFunction() {
  var x = document.getElementById("myLinks");
  if (!x) return;

  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
}

// Hero slider + stinger transition
(function () {
  var hero = document.querySelector("[data-hero]");
  if (!hero) return;

  var slides = hero.querySelectorAll(".hero-slide");
  var stinger = hero.querySelector(".hero-stinger");
  if (!slides.length || !stinger) return;

  var index = 0;
  var intervalMs = 5200;      // total time each slide stays
  var stingerDelayMs = 500;   // wait before swapping slide (lets divider be visible)

  function show(i) {
    slides.forEach(function (s) { s.classList.remove("is-active"); });
    slides[i].classList.add("is-active");
  }

  function next() {
    // stinger runs, then we swap the slide while it crosses
    stinger.classList.add("is-animating");

    window.setTimeout(function () {
      index = (index + 1) % slides.length;
      show(index);
    }, stingerDelayMs);

    // remove animation class so it can replay next time
    window.setTimeout(function () {
      stinger.classList.remove("is-animating");
    }, 700);
  }

  // init
  show(index);
  window.setInterval(next, intervalMs);
})();

// ===== Estimate Calculator (Price only) =====
// Easily editable constants live here:
const ESTIMATE_CONFIG = {
  baseFee: 25,          // $
  perMileRate: 2.25,    // $ per mile
  perLbRate: 0.08,      // $ per pound

  // Simple size pricing (edit freely)
  oversizeThresholdIn: 36, // if width OR height >= this -> oversize fee applies
  oversizeFee: 20,         // $

  minCharge: 50,        // $
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

  function calculateCost(weightLbs, widthIn, heightIn, distanceMi) {
    const base = ESTIMATE_CONFIG.baseFee;
    const distanceCharge = distanceMi * ESTIMATE_CONFIG.perMileRate;
    const weightCharge = weightLbs * ESTIMATE_CONFIG.perLbRate;

    const isOversize =
      widthIn >= ESTIMATE_CONFIG.oversizeThresholdIn ||
      heightIn >= ESTIMATE_CONFIG.oversizeThresholdIn;

    const sizeCharge = isOversize ? ESTIMATE_CONFIG.oversizeFee : 0;

    let total = base + distanceCharge + weightCharge + sizeCharge;
    total = Math.max(total, ESTIMATE_CONFIG.minCharge);

    return total;
  }

  function clear() {
    costEl.textContent = "—";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fd = new FormData(form);

    const weightLbs = Number(fd.get("weightLbs"));
    const widthIn = Number(fd.get("widthIn"));
    const heightIn = Number(fd.get("heightIn"));
    const distanceMi = Number(fd.get("distanceMi"));

    const ok =
      isFinite(weightLbs) && weightLbs >= 0 &&
      isFinite(widthIn) && widthIn >= 0 &&
      isFinite(heightIn) && heightIn >= 0 &&
      isFinite(distanceMi) && distanceMi >= 0;

    if (!ok) {
      clear();
      return;
    }

    const total = calculateCost(weightLbs, widthIn, heightIn, distanceMi);
    costEl.textContent = formatMoney(total);
  });

  resetBtn.addEventListener("click", () => {
    form.reset();
    clear();
  });

  clear();
})();
