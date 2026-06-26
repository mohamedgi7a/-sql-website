const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
const header = document.querySelector(".site-header");

if (toggle && nav) {
  const closeNav = () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("click", (event) => {
    if (!nav.classList.contains("open")) return;
    if (header && header.contains(event.target)) return;
    closeNav();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });
}

document.querySelectorAll(".filters button").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter || "all";
    const filters = button.closest(".filters");
    const section = button.closest(".section") || document;
    const projectCards = section.querySelectorAll(".project-card[data-category]");

    if (filters) {
      filters.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
    }
    button.classList.add("active");

    projectCards.forEach((card) => {
      const isVisible = filter === "all" || card.dataset.category === filter;
      card.hidden = !isVisible;
      card.classList.toggle("is-filtered-out", !isVisible);
    });
  });
});

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const supabaseConfig = {
  url: "https://ibnjrcoqiactimyhhksf.supabase.co",
  key: "sb_publishable_LpQzLxdeisfx1KG9PkM50g_Cdy2--xX"
};

const pageLanguage = document.documentElement.lang || (document.documentElement.dir === "rtl" ? "ar" : "en");
const isArabic = document.documentElement.dir === "rtl";

const formMessages = {
  sending: isArabic ? "جاري الإرسال..." : "Sending...",
  success: isArabic ? "تم إرسال الطلب بنجاح. سيتواصل معك فريقنا قريبا." : "Your request has been sent successfully. Our team will contact you soon.",
  error: isArabic ? "تعذر الإرسال حاليا. حاول مرة أخرى أو تواصل معنا مباشرة." : "We could not send the form right now. Please try again or contact us directly."
};

const readFormValue = (formData, name) => String(formData.get(name) || "").trim();

const setFormStatus = (form, message, type = "info") => {
  let status = form.querySelector(".form-status");

  if (!status) {
    status = document.createElement("p");
    status.className = "form-status";
    status.setAttribute("role", "status");
    form.append(status);
  }

  status.textContent = message;
  status.dataset.type = type;
};

const postToSupabase = async (table, payload) => {
  const response = await fetch(`${supabaseConfig.url}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: supabaseConfig.key,
      Authorization: `Bearer ${supabaseConfig.key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Supabase insert failed: ${response.status}`);
  }
};

document.querySelectorAll("form.contact-form").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector("[type='submit']");
    const formData = new FormData(form);
    const isServiceRequest = formData.has("details") || formData.has("company");
    const table = isServiceRequest ? "service_requests" : "contact_messages";

    const payload = isServiceRequest
      ? {
          company: readFormValue(formData, "company") || null,
          contact_name: readFormValue(formData, "contact_name"),
          phone: readFormValue(formData, "phone"),
          email: readFormValue(formData, "email") || null,
          city: readFormValue(formData, "city") || null,
          facility_type: readFormValue(formData, "facility_type") || null,
          service: readFormValue(formData, "service") || null,
          urgency: readFormValue(formData, "urgency") || null,
          preferred_date: readFormValue(formData, "preferred_date") || null,
          details: readFormValue(formData, "details") || null,
          page_language: pageLanguage,
          source_page: window.location.pathname
        }
      : {
          name: readFormValue(formData, "name"),
          email: readFormValue(formData, "email") || null,
          phone: readFormValue(formData, "phone") || null,
          service: readFormValue(formData, "service") || null,
          message: readFormValue(formData, "message"),
          page_language: pageLanguage,
          source_page: window.location.pathname
        };

    try {
      if (submitButton) submitButton.disabled = true;
      setFormStatus(form, formMessages.sending, "info");
      await postToSupabase(table, payload);
      form.reset();
      setFormStatus(form, formMessages.success, "success");
    } catch (error) {
      console.error(error);
      setFormStatus(form, formMessages.error, "error");
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
});

const homeHero = document.querySelector(".home-hero .hero-content");
const heroTitle = homeHero?.querySelector("h1");
const heroText = homeHero?.querySelector("p:not(.eyebrow)");

if (homeHero && heroTitle && heroText) {
  const rtlSlides = [
    {
      title: "قوى عاملة موثوقة وخدمات مساندة لتشغيل منشأتك بكفاءة",
      text: "نقدم حلول إدارة مرافق تركز على توفير وتشغيل الكوادر، النظافة، الضيافة، الأمن، والصيانة لدعم أعمال المنشآت داخل المملكة منذ عام 2008."
    },
    {
      title: "تشغيل يومي منظم يرفع كفاءة مرافقك",
      text: "فرق جاهزة، إشراف واضح، وخدمات مساندة تساعد منشأتك على الاستمرار بثبات وجودة في كل وردية وكل موقع."
    },
    {
      title: "كوادر وخدمات مرنة حسب احتياج مشروعك",
      text: "نوفر العمالة والخدمات التشغيلية للقطاعات التجارية والصناعية والسكنية وفق احتياج كل منشأة وطبيعة عملها."
    },
    {
      title: "شريك تشغيلي يعتمد عليه داخل المملكة",
      text: "من النظافة والضيافة إلى الأمن والصيانة، نساند منشأتك بحلول عملية تمنحك راحة أكبر وتركيزا أعلى على أعمالك."
    }
  ];

  const ltrSlides = [
    {
      title: "Reliable manpower and support services for efficient operations",
      text: "We provide facility management solutions focused on workforce deployment, cleaning, hospitality, security, and maintenance across Saudi Arabia since 2008."
    },
    {
      title: "Structured daily operations for better facility performance",
      text: "Ready teams, clear supervision, and support services that keep every site and shift running with consistency."
    },
    {
      title: "Flexible teams and services matched to your project",
      text: "We support commercial, industrial, and residential facilities with operational teams tailored to each requirement."
    },
    {
      title: "A dependable operations partner across the Kingdom",
      text: "From cleaning and hospitality to security and maintenance, we help your facility run with confidence and control."
    }
  ];

  const heroSlides = document.documentElement.dir === "rtl" ? rtlSlides : ltrSlides;
  let activeHeroSlide = 0;

  heroTitle.classList.add("hero-rotating-text");
  heroText.classList.add("hero-rotating-text");

  if (!reducedMotion && heroSlides.length > 1) {
    window.setInterval(() => {
      activeHeroSlide = (activeHeroSlide + 1) % heroSlides.length;
      homeHero.classList.add("is-changing");

      window.setTimeout(() => {
        heroTitle.textContent = heroSlides[activeHeroSlide].title;
        heroText.textContent = heroSlides[activeHeroSlide].text;
        homeHero.classList.remove("is-changing");
      }, 260);
    }, 2500);
  }
}

document.querySelectorAll("[data-service-carousel]").forEach((carousel) => {
  const track = carousel.querySelector(".service-track");
  if (!track || reducedMotion || track.dataset.marqueeReady === "true") return;

  const cards = [...track.children];
  cards.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.append(clone);
  });

  track.dataset.marqueeReady = "true";
});

const revealItems = document.querySelectorAll(".section, .trust-strip > div, .service-grid .service-card, .project-card, .post-card, .values-grid article, .process-list article, .featured-post, .blog-sidebar > div, .media-panel, .contact-info, .contact-form");

if ("IntersectionObserver" in window) {
  revealItems.forEach((item, index) => {
    item.classList.add("reveal", index % 2 === 0 ? "reveal-from-right" : "reveal-from-left");

    if (item.matches(".service-card, .project-card, .post-card, .values-grid article, .process-list article, .trust-strip > div")) {
      item.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 90}ms`);
    }
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  revealItems.forEach((item) => revealObserver.observe(item));
}

const metricItems = document.querySelectorAll(".metric[data-count]");

const formatMetric = (value, suffix) => {
  const normalizedValue = String(Math.round(value));
  return document.documentElement.dir === "rtl" ? `${suffix}${normalizedValue}` : `${normalizedValue}${suffix}`;
};

const animateMetric = (metric) => {
  if (metric.dataset.animated === "true") return;
  metric.dataset.animated = "true";

  const target = Number(metric.dataset.count || 0);
  const suffix = metric.dataset.suffix || "";

  if (reducedMotion) {
    metric.textContent = formatMetric(target, suffix);
    return;
  }

  const duration = Math.min(1700, Math.max(900, target * 1.4));
  const startTime = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    metric.textContent = formatMetric(target * easedProgress, suffix);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      metric.textContent = formatMetric(target, suffix);
    }
  };

  requestAnimationFrame(tick);
};

if (metricItems.length) {
  if ("IntersectionObserver" in window) {
    const metricObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateMetric(entry.target);
          metricObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.42 });

    metricItems.forEach((metric) => metricObserver.observe(metric));
  } else {
    metricItems.forEach(animateMetric);
  }
}
