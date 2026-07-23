const revealTargets = document.querySelectorAll(
  ".hero-copy, .hero-panel, .section-head, .service-bot-showcase, .partners, .difference-graph-copy, .trust-graph, .logic-video, .logic-grid article, .plan-grid article, .plans-cta"
);

const routeSections = {
  "/service": "service",
  "/difference": "difference",
  "/logic": "logic",
  "/plans": "plans",
};

const normalizePath = (path) => {
  if (path.length <= 1) return path;
  return path.endsWith("/") ? path.slice(0, -1) : path;
};

const updateRouteCanonical = () => {
  const path = normalizePath(window.location.pathname);
  if (!routeSections[path]) return;

  const canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) return;

  canonical.href = `${window.location.origin}${path}`;
};

const scrollToRouteSection = () => {
  const sectionId = routeSections[normalizePath(window.location.pathname)];
  if (!sectionId) return;

  const target = document.getElementById(sectionId);
  if (!target) return;

  requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: "auto", block: "start" });
  });
};

const setupMarketFilters = () => {
  const filterButtons = document.querySelectorAll("[data-market-filter]");
  const marketRows = document.querySelectorAll(".market-row[data-market]");

  if (!filterButtons.length || !marketRows.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedFilter = button.dataset.marketFilter;

      filterButtons.forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });

      marketRows.forEach((row) => {
        const shouldShow =
          selectedFilter === "all" ||
          row.dataset.market === selectedFilter ||
          (selectedFilter === "recommended" && row.querySelector(".recommend-chip"));
        row.hidden = !shouldShow;
      });
    });
  });
};

revealTargets.forEach((target) => target.classList.add("reveal"));

updateRouteCanonical();
setupMarketFilters();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.16 }
);

revealTargets.forEach((target) => revealObserver.observe(target));

scrollToRouteSection();
