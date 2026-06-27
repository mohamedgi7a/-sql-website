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

const scrollProgress = document.createElement("div");
scrollProgress.className = "scroll-progress";
scrollProgress.setAttribute("aria-hidden", "true");
document.body.prepend(scrollProgress);

const backToTop = document.createElement("button");
backToTop.className = "back-to-top";
backToTop.type = "button";
backToTop.setAttribute("aria-label", document.documentElement.dir === "rtl" ? "العودة إلى الأعلى" : "Back to top");
backToTop.textContent = "↑";
document.body.append(backToTop);

const updateScrollControls = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  scrollProgress.style.width = `${Math.min(Math.max(progress, 0), 100)}%`;
  backToTop.classList.toggle("is-visible", window.scrollY > 520);
};

window.addEventListener("scroll", updateScrollControls, { passive: true });
window.addEventListener("resize", updateScrollControls);
updateScrollControls();

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
});

const addParticles = (section, count = 34) => {
  if (!section || reducedMotion || section.querySelector(".particles-layer")) return;

  const layer = document.createElement("div");
  layer.className = "particles-layer";
  layer.id = section.classList.contains("falfa-dark-band") ? "wpr-particle-9d39f09" : "";
  layer.setAttribute("aria-hidden", "true");

  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    const size = 3 + (index % 5);
    particle.style.left = `${(index * 29) % 100}%`;
    particle.style.top = `${(index * 47) % 100}%`;
    particle.style.setProperty("--particle-size", `${size}px`);
    particle.style.setProperty("--particle-speed", `${7 + (index % 8)}s`);
    particle.style.setProperty("--particle-delay", `${(index % 9) * -0.8}s`);
    particle.style.setProperty("--particle-drift", `${index % 2 === 0 ? "" : "-"}${22 + (index % 7) * 8}px`);
    layer.append(particle);
  }

  section.prepend(layer);
};

document.querySelectorAll(".falfa-dark-band, .falfa-cta").forEach((section, index) => {
  addParticles(section, index === 0 ? 42 : 24);
});

const parallaxSections = document.querySelectorAll(".falfa-dark-band, .falfa-cta");
const updateParallaxSections = () => {
  if (reducedMotion) return;

  parallaxSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const viewport = window.innerHeight || document.documentElement.clientHeight;
    const progress = (viewport - rect.top) / (viewport + rect.height);
    const shift = Math.round((Math.min(Math.max(progress, 0), 1) - 0.5) * 72);
    section.style.setProperty("--parallax-shift", `${shift}px`);
  });
};

window.addEventListener("scroll", updateParallaxSections, { passive: true });
window.addEventListener("resize", updateParallaxSections);
updateParallaxSections();

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

const blogGrid = document.querySelector("[data-blog-posts]");
const featuredPost = document.querySelector("[data-featured-post]");
const blogLoading = document.querySelector("[data-blog-loading]");
const blogArticle = document.querySelector("[data-blog-article]");
const articleLoading = document.querySelector("[data-article-loading]");

const plainText = (value) => String(value || "").trim();
const safeText = (value) => {
  const span = document.createElement("span");
  span.textContent = plainText(value);
  return span.innerHTML;
};
const blogPostHref = (post) => `blog-post.html?slug=${encodeURIComponent(post.slug || "")}`;

const renderBlogPostCard = (post) => `
  <article class="post-card">
    <span>${plainText(post.category)}</span>
    <h3>${plainText(post.title)}</h3>
    <p>${plainText(post.excerpt)}</p>
    <div class="tag-list compact-tags">${(post.keywords || []).slice(0, 4).map((tag) => `<span>${plainText(tag)}</span>`).join("")}</div>
    <a href="${blogPostHref(post)}">${isArabic ? "قراءة المقال" : "Read article"}</a>
  </article>
`;

const loadBlogPosts = async () => {
  if (!blogGrid || !featuredPost) return;

  try {
    const response = await fetch(`${supabaseConfig.url}/rest/v1/blog_posts?select=*&status=eq.published&language=eq.${pageLanguage}&order=published_at.desc`, {
      headers: {
        apikey: supabaseConfig.key,
        Authorization: `Bearer ${supabaseConfig.key}`
      }
    });

    if (!response.ok) throw new Error("Could not load blog posts");

    const posts = await response.json();
    const [firstPost, ...otherPosts] = posts;

    if (blogLoading) blogLoading.hidden = true;

    if (!firstPost) {
      blogGrid.innerHTML = `<div class="empty-state"><h3>${isArabic ? "لا توجد مقالات منشورة بعد" : "No published articles yet"}</h3></div>`;
      return;
    }

    featuredPost.hidden = false;
    featuredPost.innerHTML = `
      <img src="${firstPost.image_url || "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80"}" alt="${plainText(firstPost.title)}">
      <div>
        <p class="eyebrow">${isArabic ? "مقال مميز" : "Featured"}</p>
        <h2>${plainText(firstPost.title)}</h2>
        <p>${plainText(firstPost.excerpt)}</p>
        <div class="tag-list compact-tags">${(firstPost.keywords || []).slice(0, 6).map((tag) => `<span>${plainText(tag)}</span>`).join("")}</div>
        <a class="text-link" href="${blogPostHref(firstPost)}">${isArabic ? "قراءة المقال" : "Read article"}</a>
      </div>
    `;

    blogGrid.innerHTML = otherPosts.map(renderBlogPostCard).join("");
  } catch (error) {
    console.error(error);
    if (blogLoading) {
      blogLoading.textContent = isArabic ? "تعذر تحميل المقالات حاليا." : "Could not load articles right now.";
    }
  }
};

loadBlogPosts();

const loadBlogArticle = async () => {
  if (!blogArticle) return;

  const slug = new URLSearchParams(window.location.search).get("slug");

  if (!slug) {
    if (articleLoading) articleLoading.textContent = isArabic ? "لم يتم تحديد المقال." : "No article selected.";
    return;
  }

  try {
    const response = await fetch(`${supabaseConfig.url}/rest/v1/blog_posts?select=*&status=eq.published&slug=eq.${encodeURIComponent(slug)}&limit=1`, {
      headers: {
        apikey: supabaseConfig.key,
        Authorization: `Bearer ${supabaseConfig.key}`
      }
    });

    if (!response.ok) throw new Error("Could not load article");

    const [post] = await response.json();

    if (!post) {
      if (articleLoading) articleLoading.textContent = isArabic ? "المقال غير موجود أو غير منشور." : "Article not found or not published.";
      return;
    }

    document.title = `${post.title} | ${isArabic ? "صقور الإتقان" : "Saqour Al-Itqan"}`;
    if (articleLoading) articleLoading.hidden = true;

    blogArticle.innerHTML = `
      <img class="article-cover" src="${post.image_url || "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=80"}" alt="${safeText(post.title)}">
      <p class="eyebrow">${safeText(post.category)}</p>
      <h1>${safeText(post.title)}</h1>
      <p class="article-excerpt">${safeText(post.excerpt)}</p>
      <div class="tag-list compact-tags">${(post.keywords || []).map((tag) => `<span>${safeText(tag)}</span>`).join("")}</div>
      <div class="article-body">${plainText(post.content).split("\n").filter(Boolean).map((paragraph) => `<p>${safeText(paragraph)}</p>`).join("")}</div>
      <div class="article-actions">
        <a class="btn btn-primary" href="service-request.html">${isArabic ? "طلب هذه الخدمة" : "Request this service"}</a>
        <a class="text-link" href="blog.html">${isArabic ? "العودة إلى المدونة" : "Back to blog"}</a>
      </div>
    `;
  } catch (error) {
    console.error(error);
    if (articleLoading) articleLoading.textContent = isArabic ? "تعذر تحميل المقال حاليا." : "Could not load this article right now.";
  }
};

loadBlogArticle();

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
  const cloneCards = () => {
    cards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.append(clone);
    });
  };

  cloneCards();

  while (track.scrollWidth < carousel.clientWidth * 3) {
    cloneCards();
  }

  track.dataset.marqueeReady = "true";

  const pauseMarquee = () => {
    track.style.animationPlayState = "paused";
  };

  const resumeMarquee = () => {
    track.style.animationPlayState = "running";
  };

  carousel.addEventListener("mouseenter", pauseMarquee);
  carousel.addEventListener("mouseleave", resumeMarquee);
  carousel.addEventListener("focusin", pauseMarquee);
  carousel.addEventListener("focusout", resumeMarquee);
});

// Clients marquee — wait for images to load so scrollWidth is accurate
window.addEventListener("load", function () {
  const track = document.querySelector(".clients-track");
  if (!track || reducedMotion) return;

  const origImgs = [...track.children];
  const clone = () => {
    origImgs.forEach((img) => {
      const c = img.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      track.append(c);
    });
  };

  clone();
  while (track.scrollWidth < window.innerWidth * 3) clone();

  track.dataset.marqueeReady = "true";
});

const revealItems = document.querySelectorAll(".section, .section-head, .section-heading, .trust-strip > div, .service-grid .service-card, .project-card, .post-card, .values-grid article, .process-list article, .featured-post, .blog-sidebar > div, .media-panel, .contact-info, .contact-form, .falfa-feature-strip article, .falfa-values-grid article, .falfa-service-card, .falfa-sectors-grid article, .falfa-news-grid article, .opening-logo-card, .opening-service, .falfa-company-intro, .vision-text, .vision-photo, .footer-group");

if ("IntersectionObserver" in window) {
  const revealSequence = [
    "reveal-fadeInRight", "reveal-fadeInRight", "reveal-zoomInLeft", "reveal-fadeInUp",
    "reveal-bounceIn", "reveal-slideInDown", "reveal-slideInUp", "reveal-fadeInRight",
    "reveal-zoomInLeft", "reveal-fadeInUp", "reveal-slideInDown", "reveal-fadeInRight",
    "reveal-zoomInLeft", "reveal-bounceIn", "reveal-fadeInUp", "reveal-slideInUp",
    "reveal-fadeInRight", "reveal-zoomInLeft", "reveal-fadeIn", "reveal-slideInLeft",
    "reveal-slideInRight"
  ];

  revealItems.forEach((item, index) => {
    item.classList.add("reveal", revealSequence[index % revealSequence.length]);

    if (item.matches(".service-card, .project-card, .post-card, .values-grid article, .process-list article, .trust-strip > div, .falfa-feature-strip article, .falfa-values-grid article, .falfa-service-card, .falfa-sectors-grid article, .falfa-news-grid article, .opening-service, .vision-text, .vision-photo, .footer-group")) {
      const baseDelay = item.classList.contains("reveal-bounceIn") ? 700 : Math.min(index % 6, 5) * 90;
      item.style.setProperty("--reveal-delay", `${baseDelay}ms`);
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

const phoneNumbers = document.querySelectorAll(".footer-contact strong");
const animateTypewriterNumber = (element) => {
  const fullText = element.dataset.fullText || element.textContent.trim();
  if (!fullText || !/[0-9+]/.test(fullText) || element.dataset.typed === "true") return;

  element.dataset.typed = "true";
  element.dataset.fullText = fullText;
  element.classList.add("typewriter-number");

  if (reducedMotion) {
    element.textContent = fullText;
    element.classList.add("is-complete");
    return;
  }

  element.textContent = "";
  let index = 0;

  const typeNext = () => {
    element.textContent = fullText.slice(0, index + 1);
    index += 1;

    if (index < fullText.length) {
      window.setTimeout(typeNext, 42);
    } else {
      element.classList.add("is-complete");
    }
  };

  typeNext();
};

const typedPhoneItems = [...phoneNumbers].filter((item) => /[0-9+]/.test(item.textContent));

if (typedPhoneItems.length) {
  if ("IntersectionObserver" in window) {
    const phoneObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateTypewriterNumber(entry.target);
          phoneObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    typedPhoneItems.forEach((item) => phoneObserver.observe(item));
  } else {
    typedPhoneItems.forEach(animateTypewriterNumber);
  }
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

const falfaHeroBackgrounds = [...document.querySelectorAll(".falfa-hero-bg")];
const falfaHeroDots = [...document.querySelectorAll(".falfa-hero-dots button")];

if (falfaHeroBackgrounds.length) {
  let activeFalfaHero = 0;

  const setFalfaHero = (nextIndex) => {
    activeFalfaHero = nextIndex % falfaHeroBackgrounds.length;
    falfaHeroBackgrounds.forEach((slide, index) => {
      slide.classList.toggle("active", index === activeFalfaHero);
    });
    falfaHeroDots.forEach((dot, index) => {
      dot.classList.toggle("active", index === activeFalfaHero);
    });
  };

  falfaHeroDots.forEach((dot, index) => {
    dot.addEventListener("click", () => setFalfaHero(index));
  });

  if (!reducedMotion && falfaHeroBackgrounds.length > 1) {
    window.setInterval(() => {
      setFalfaHero(activeFalfaHero + 1);
    }, 2500);
  }
}

const visionRows = document.querySelectorAll(".vision-row");

if (visionRows.length) {
  if (reducedMotion) {
    visionRows.forEach(row => row.classList.add("row-visible"));
  } else {
    let observerReady = false;

    const rowObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        rowObserver.unobserve(entry.target);
        const delay = observerReady ? 0 : 280;
        setTimeout(() => {
          requestAnimationFrame(() => entry.target.classList.add("row-visible"));
        }, delay);
      });
    }, { threshold: 0.15 });

    requestAnimationFrame(() => {
      visionRows.forEach(row => rowObserver.observe(row));
      setTimeout(() => { observerReady = true; }, 600);
    });
  }
}
