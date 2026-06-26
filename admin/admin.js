const supabaseConfig = {
  url: "https://ibnjrcoqiactimyhhksf.supabase.co",
  key: "sb_publishable_LpQzLxdeisfx1KG9PkM50g_Cdy2--xX"
};

const loginScreen = document.querySelector("[data-login-screen]");
const loginForm = document.querySelector("[data-login-form]");
const loginStatus = document.querySelector("[data-login-status]");
const adminShell = document.querySelectorAll("[data-admin-shell]");
const logoutButton = document.querySelector("[data-logout]");
const refreshButton = document.querySelector("[data-refresh]");
const serviceList = document.querySelector("[data-service-list]");
const contactList = document.querySelector("[data-contact-list]");
const serviceCounter = document.querySelector("[data-count-service]");
const contactCounter = document.querySelector("[data-count-contact]");
const emptyService = document.querySelector("[data-empty-service]");
const emptyContact = document.querySelector("[data-empty-contact]");
const blogForm = document.querySelector("[data-blog-form]");
const blogStatus = document.querySelector("[data-blog-status]");
const blogList = document.querySelector("[data-blog-list]");

const storageKey = "sql_admin_session";

const setStatus = (message, type = "info") => {
  if (!loginStatus) return;
  loginStatus.textContent = message;
  loginStatus.dataset.type = type;
};

const getSession = () => {
  try {
    const raw = sessionStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setSession = (session) => {
  sessionStorage.setItem(storageKey, JSON.stringify(session));
};

const clearSession = () => {
  sessionStorage.removeItem(storageKey);
};

const authHeaders = (token) => ({
  apikey: supabaseConfig.key,
  Authorization: `Bearer ${token || supabaseConfig.key}`,
  "Content-Type": "application/json"
});

const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
};

const escapeText = (value) => {
  const span = document.createElement("span");
  span.textContent = value || "-";
  return span.innerHTML;
};

const showAdmin = async () => {
  loginScreen.hidden = true;
  adminShell.forEach((item) => {
    item.hidden = false;
  });
  await loadDashboard();
};

const showLogin = () => {
  loginScreen.hidden = false;
  adminShell.forEach((item) => {
    item.hidden = true;
  });
};

const signIn = async (email, password) => {
  const response = await fetch(`${supabaseConfig.url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    throw new Error("Invalid login");
  }

  return response.json();
};

const fetchTable = async (table, token) => {
  const response = await fetch(`${supabaseConfig.url}/rest/v1/${table}?select=*&order=created_at.desc&limit=50`, {
    headers: authHeaders(token)
  });

  if (!response.ok) {
    throw new Error(`Could not load ${table}`);
  }

  return response.json();
};

const renderServiceRequests = (rows) => {
  serviceList.querySelectorAll(".table-row:not(.table-header)").forEach((row) => row.remove());
  serviceCounter.textContent = rows.length;
  emptyService.hidden = rows.length !== 0;

  rows.forEach((item) => {
    serviceList.insertAdjacentHTML("beforeend", `
      <div class="table-row">
        <span>${escapeText(item.company)}</span>
        <span>${escapeText(item.contact_name)}</span>
        <span>${escapeText(item.phone)}</span>
        <span>${escapeText(item.service)}</span>
        <span>${escapeText(item.city)}</span>
        <span>${formatDate(item.created_at)}</span>
      </div>
    `);
  });
};

const renderContactMessages = (rows) => {
  contactList.querySelectorAll(".table-row:not(.table-header)").forEach((row) => row.remove());
  contactCounter.textContent = rows.length;
  emptyContact.hidden = rows.length !== 0;

  rows.forEach((item) => {
    contactList.insertAdjacentHTML("beforeend", `
      <div class="table-row">
        <span>${escapeText(item.name)}</span>
        <span>${escapeText(item.phone)}</span>
        <span>${escapeText(item.email)}</span>
        <span>${escapeText(item.service)}</span>
        <span>${escapeText(item.message)}</span>
        <span>${formatDate(item.created_at)}</span>
      </div>
    `);
  });
};

const renderBlogPosts = (rows) => {
  if (!blogList) return;

  blogList.querySelectorAll(".table-row:not(.table-header)").forEach((row) => row.remove());

  rows.forEach((item) => {
    blogList.insertAdjacentHTML("beforeend", `
      <div class="table-row">
        <span>${escapeText(item.title)}</span>
        <span>${escapeText(item.category)}</span>
        <span>${escapeText(item.language)}</span>
        <span>${escapeText(item.status)}</span>
        <span>${formatDate(item.created_at)}</span>
      </div>
    `);
  });
};

const loadDashboard = async () => {
  const session = getSession();

  if (!session?.access_token) {
    showLogin();
    return;
  }

  refreshButton.disabled = true;
  refreshButton.textContent = "جاري التحديث...";

  try {
    const [services, contacts, posts] = await Promise.all([
      fetchTable("service_requests", session.access_token),
      fetchTable("contact_messages", session.access_token),
      fetchTable("blog_posts", session.access_token)
    ]);

    renderServiceRequests(services);
    renderContactMessages(contacts);
    renderBlogPosts(posts);
  } catch (error) {
    console.error(error);
    clearSession();
    showLogin();
    setStatus("انتهت الجلسة أو لا توجد صلاحية قراءة. سجل الدخول مرة أخرى.", "error");
  } finally {
    refreshButton.disabled = false;
    refreshButton.textContent = "تحديث البيانات";
  }
};

document.querySelectorAll(".admin-sidebar nav a").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".admin-sidebar nav a").forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  });
});

blogForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const session = getSession();
  if (!session?.access_token) return;

  const formData = new FormData(blogForm);
  const keywords = String(formData.get("keywords") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const status = String(formData.get("status") || "published");
  const payload = {
    title: String(formData.get("title") || "").trim(),
    slug: String(formData.get("slug") || "").trim(),
    language: String(formData.get("language") || "ar"),
    category: String(formData.get("category") || "").trim(),
    keywords,
    image_url: String(formData.get("image_url") || "").trim() || null,
    excerpt: String(formData.get("excerpt") || "").trim(),
    content: String(formData.get("content") || "").trim(),
    status,
    published_at: status === "published" ? new Date().toISOString() : null
  };

  const submit = blogForm.querySelector("[type='submit']");

  try {
    submit.disabled = true;
    blogStatus.textContent = "جاري حفظ المقال...";
    blogStatus.dataset.type = "info";

    const response = await fetch(`${supabaseConfig.url}/rest/v1/blog_posts`, {
      method: "POST",
      headers: {
        ...authHeaders(session.access_token),
        Prefer: "return=minimal"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Could not save blog post");

    blogForm.reset();
    blogStatus.textContent = "تم حفظ المقال بنجاح.";
    blogStatus.dataset.type = "success";
    await loadDashboard();
  } catch (error) {
    console.error(error);
    blogStatus.textContent = "تعذر حفظ المقال. تأكد من عدم تكرار الرابط المختصر slug.";
    blogStatus.dataset.type = "error";
  } finally {
    submit.disabled = false;
  }
});

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const submit = loginForm.querySelector("[type='submit']");

  try {
    submit.disabled = true;
    setStatus("جاري تسجيل الدخول...");
    const session = await signIn(email, password);
    setSession(session);
    setStatus("");
    await showAdmin();
  } catch (error) {
    console.error(error);
    setStatus("بيانات الدخول غير صحيحة أو المستخدم غير موجود.", "error");
  } finally {
    submit.disabled = false;
  }
});

logoutButton?.addEventListener("click", () => {
  clearSession();
  showLogin();
});

refreshButton?.addEventListener("click", loadDashboard);

if (getSession()?.access_token) {
  showAdmin();
} else {
  showLogin();
}
