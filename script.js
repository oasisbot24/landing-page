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

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
const UTM_STORAGE_KEY = "oasis_utm_params";
const CTA_SELECTOR = 'a[href="/start"], a[href^="/start?"], a[href^="https://cloud.oasisbot24.com"]';

const getCurrentUtmParams = () => {
  const currentParams = new URLSearchParams(window.location.search);
  const utmParams = {};

  UTM_KEYS.forEach((key) => {
    const value = currentParams.get(key);
    if (value) utmParams[key] = value;
  });

  return utmParams;
};

const getStoredUtmParams = () => {
  try {
    return JSON.parse(sessionStorage.getItem(UTM_STORAGE_KEY) || "{}");
  } catch (error) {
    return {};
  }
};

const persistUtmParams = () => {
  const currentUtmParams = getCurrentUtmParams();
  if (!Object.keys(currentUtmParams).length) return getStoredUtmParams();

  sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(currentUtmParams));
  return currentUtmParams;
};

const appendParamsToUrl = (url, params) => {
  if (!Object.keys(params).length) return url;

  const nextUrl = new URL(url, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (!nextUrl.searchParams.has(key)) nextUrl.searchParams.set(key, value);
  });

  return nextUrl.origin === window.location.origin
    ? `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
    : nextUrl.toString();
};

const getCtaLocation = (link) => {
  const section = link.closest("section");
  if (section?.id) return section.id;
  if (link.closest("header")) return "header";
  if (link.closest("footer")) return "footer";
  return "unknown";
};

const setupUtmAndCtaTracking = () => {
  const utmParams = persistUtmParams();
  const ctaLinks = document.querySelectorAll(CTA_SELECTOR);

  ctaLinks.forEach((link) => {
    link.href = appendParamsToUrl(link.getAttribute("href"), utmParams);

    link.addEventListener("click", (event) => {
      if (typeof window.gtag !== "function") return;

      const destinationUrl = link.href;
      let callbackFired = false;
      const navigate = () => {
        if (callbackFired) return;
        callbackFired = true;
        window.location.href = destinationUrl;
      };

      event.preventDefault();
      window.gtag("event", "cta_click", {
        event_category: "engagement",
        event_label: link.textContent.trim(),
        cta_text: link.textContent.trim(),
        cta_location: getCtaLocation(link),
        cta_href: destinationUrl,
        destination_url: destinationUrl,
        page_path: window.location.pathname,
        landing_page: window.location.href,
        ...utmParams,
        transport_type: "beacon",
        event_callback: navigate,
      });
      window.setTimeout(navigate, 600);
    });
  });
};

revealTargets.forEach((target) => target.classList.add("reveal"));

updateRouteCanonical();
setupMarketFilters();
setupUtmAndCtaTracking();

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
