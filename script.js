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
