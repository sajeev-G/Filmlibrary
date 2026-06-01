import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const LEGACY_STORAGE_KEY = "health-media-repository-v1";
const PAGE_SIZE = 48;
const PUBLIC_READ_ONLY = new URLSearchParams(window.location.search).get("public") === "1";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.");
}

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const mainCategories = [
  "ANC",
  "PNC",
  "SNCU",
  "NCD",
  "TB",
  "Cardiac",
  "MCCS Vertical",
  "Programme support videos",
  "NON med videos"
];

const extraMedicalSubjects = [
  "Cancer",
  "CLD",
  "Maternal Health",
  "Child Health",
  "Newborn Care",
  "Immunization",
  "Nutrition",
  "Diabetes",
  "Hypertension",
  "Mental Health",
  "Adolescent Health",
  "Family Planning",
  "Communicable Diseases",
  "Vector-borne Diseases",
  "Respiratory Health",
  "Kidney Disease",
  "Liver Disease",
  "Oral Health",
  "Eye Health",
  "ENT",
  "Emergency Care",
  "Palliative Care",
  "Geriatric Care",
  "Occupational Health",
  "Health Promotion",
  "Sanitation and Hygiene",
  "Public Health",
  "Training"
];

const indianLanguages = [
  "English",
  "Hindi",
  "Assamese",
  "Bengali",
  "Bodo",
  "Dogri",
  "Gujarati",
  "Kannada",
  "Kashmiri",
  "Konkani",
  "Maithili",
  "Malayalam",
  "Manipuri",
  "Marathi",
  "Nepali",
  "Odia",
  "Punjabi",
  "Sanskrit",
  "Santali",
  "Sindhi",
  "Tamil",
  "Telugu",
  "Urdu",
  "Bhojpuri",
  "Tulu",
  "Rajasthani",
  "Haryanvi",
  "Garhwali",
  "Kumaoni",
  "Khasi",
  "Garo",
  "Mizo",
  "Ladakhi",
  "Bhili",
  "Gondi",
  "Kodava",
  "Nagamese"
];

const programmeSupportTypes = ["MCCS", "MCCS Vertical", "NON med videos"];

const spreadsheetHeaders = [
  "Title",
  "Primary URL",
  "Primary Language",
  "Main Category",
  "Description",
  "Duration (minutes)",
  "Year of Creation",
  "Tags",
  "Script Link",
  "Internal Notes",
  "Featured",
  "Lang Link 1 - Language",
  "Lang Link 1 - URL",
  "Lang Link 2 - Language",
  "Lang Link 2 - URL",
  "Lang Link 3 - Language",
  "Lang Link 3 - URL",
  "Lang Link 4 - Language",
  "Lang Link 4 - URL",
  "Lang Link 5 - Language",
  "Lang Link 5 - URL"
];

let items = [];
let filteredItems = [];
let currentPage = 1;
let activeQuickFilter = "all";
let showMoreSubjects = false;
let currentUser = null;
let currentRole = "viewer";
let lastFocus = null;

const els = {
  authStatus: document.querySelector("#authStatus"),
  roleBadge: document.querySelector("#roleBadge"),
  emailInput: document.querySelector("#emailInput"),
  emailLoginButton: document.querySelector("#emailLoginButton"),
  googleLoginButton: document.querySelector("#googleLoginButton"),
  logoutButton: document.querySelector("#logoutButton"),
  totalItems: document.querySelector("#totalItems"),
  totalLanguages: document.querySelector("#totalLanguages"),
  totalSubjects: document.querySelector("#totalSubjects"),
  totalYears: document.querySelector("#totalYears"),
  subjectNavCount: document.querySelector("#subjectNavCount"),
  subjectNavList: document.querySelector("#subjectNavList"),
  subjectToggleButton: document.querySelector("#subjectToggleButton"),
  searchInput: document.querySelector("#searchInput"),
  yearFilter: document.querySelector("#yearFilter"),
  subjectFilter: document.querySelector("#subjectFilter"),
  languageFilter: document.querySelector("#languageFilter"),
  categoryFilter: document.querySelector("#categoryFilter"),
  programmeSupportFilter: document.querySelector("#programmeSupportFilter"),
  prioritySubjectFilter: document.querySelector("#prioritySubjectFilter"),
  sortFilter: document.querySelector("#sortFilter"),
  mediaGrid: document.querySelector("#mediaGrid"),
  emptyState: document.querySelector("#emptyState"),
  resultSummary: document.querySelector("#resultSummary"),
  pageSummary: document.querySelector("#pageSummary"),
  prevPageButton: document.querySelector("#prevPageButton"),
  nextPageButton: document.querySelector("#nextPageButton"),
  formOverlay: document.querySelector("#formOverlay"),
  form: document.querySelector("#mediaForm"),
  formTitle: document.querySelector("#formTitle"),
  itemId: document.querySelector("#itemId"),
  titleInput: document.querySelector("#titleInput"),
  yearInput: document.querySelector("#yearInput"),
  durationInput: document.querySelector("#durationInput"),
  subjectInput: document.querySelector("#subjectInput"),
  categoryInput: document.querySelector("#categoryInput"),
  languageInput: document.querySelector("#languageInput"),
  sourceInput: document.querySelector("#sourceInput"),
  urlInput: document.querySelector("#urlInput"),
  thumbnailInput: document.querySelector("#thumbnailInput"),
  variantRows: document.querySelector("#variantRows"),
  addVariantButton: document.querySelector("#addVariantButton"),
  tagsInput: document.querySelector("#tagsInput"),
  pinnedInput: document.querySelector("#pinnedInput"),
  starredInput: document.querySelector("#starredInput"),
  programmeSupportInput: document.querySelector("#programmeSupportInput"),
  notesInput: document.querySelector("#notesInput"),
  cancelEditButton: document.querySelector("#cancelEditButton"),
  closeFormButton: document.querySelector("#closeFormButton"),
  newItemButton: document.querySelector("#newItemButton"),
  clearFiltersButton: document.querySelector("#clearFiltersButton"),
  exportCsvButton: document.querySelector("#exportCsvButton"),
  exportExcelButton: document.querySelector("#exportExcelButton"),
  exportJsonButton: document.querySelector("#exportJsonButton"),
  importJsonButton: document.querySelector("#importJsonButton"),
  templateButton: document.querySelector("#templateButton"),
  manageUsersButton: document.querySelector("#manageUsersButton"),
  clearLibraryButton: document.querySelector("#clearLibraryButton"),
  importButton: document.querySelector("#importButton"),
  importFileInput: document.querySelector("#importFileInput"),
  jsonFileInput: document.querySelector("#jsonFileInput"),
  clearConfirmOverlay: document.querySelector("#clearConfirmOverlay"),
  clearConfirmCheckbox: document.querySelector("#clearConfirmCheckbox"),
  cancelClearButton: document.querySelector("#cancelClearButton"),
  confirmClearButton: document.querySelector("#confirmClearButton"),
  userManageOverlay: document.querySelector("#userManageOverlay"),
  closeUserManageButton: document.querySelector("#closeUserManageButton"),
  userList: document.querySelector("#userList"),
  loadingOverlay: document.querySelector("#loadingOverlay"),
  toast: document.querySelector("#toast")
};

const canEdit = () => ["admin", "editor"].includes(currentRole);
const canDelete = () => currentRole === "admin";
const canImportExport = () => ["admin", "editor"].includes(currentRole);

function showLoading(message = "Loading...") {
  els.loadingOverlay.textContent = message;
  els.loadingOverlay.hidden = false;
}

function hideLoading() {
  els.loadingOverlay.hidden = true;
}

function showToast(message, type = "info") {
  els.toast.textContent = message;
  els.toast.dataset.type = type;
  els.toast.hidden = false;
  window.setTimeout(() => {
    els.toast.hidden = true;
  }, 4200);
}

function handleError(error, fallback) {
  console.error(error);
  const message = error?.message || fallback || "Something went wrong.";
  showToast(message.includes("permission") ? "Permission denied for this action." : message, "error");
}

async function init() {
  bindEvents();
  showLoading("Loading repository...");
  if (!supabase) {
    updateAuthUI();
    render();
    hideLoading();
    showToast("Supabase environment variables are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.", "error");
    return;
  }
  if (!PUBLIC_READ_ONLY) {
    const { data } = await supabase.auth.getSession();
    currentUser = data.session?.user || null;
    await loadRole();
  }
  updateAuthUI();
  await getMedia();
  await offerLegacyMigration();
  subscribeToMediaChanges();
  hideLoading();
}

async function loadRole() {
  if (!supabase) {
    currentRole = "viewer";
    return;
  }
  if (!currentUser) {
    currentRole = "viewer";
    return;
  }
  const { data, error } = await supabase.from("profiles").select("role").eq("id", currentUser.id).maybeSingle();
  if (error) {
    currentRole = "viewer";
    return;
  }
  currentRole = data?.role || "viewer";
}

function updateAuthUI() {
  if (!supabase) {
    els.authStatus.textContent = "Supabase environment not configured";
    els.roleBadge.textContent = "offline";
    els.googleLoginButton.hidden = true;
    els.emailLoginButton.hidden = true;
    els.emailInput.hidden = true;
    els.logoutButton.hidden = true;
    els.newItemButton.hidden = true;
    els.importButton.hidden = true;
    els.importJsonButton.hidden = true;
    els.manageUsersButton.hidden = true;
    els.clearLibraryButton.hidden = true;
    return;
  }
  if (PUBLIC_READ_ONLY) {
    els.authStatus.textContent = "Public read-only mode";
    els.roleBadge.textContent = "public";
    els.googleLoginButton.hidden = true;
    els.emailLoginButton.hidden = true;
    els.emailInput.hidden = true;
    els.logoutButton.hidden = true;
  } else {
    els.authStatus.textContent = currentUser ? currentUser.email || "Signed in" : "Not signed in";
    els.roleBadge.textContent = currentRole;
    els.googleLoginButton.hidden = Boolean(currentUser);
    els.emailLoginButton.hidden = Boolean(currentUser);
    els.emailInput.hidden = Boolean(currentUser);
    els.logoutButton.hidden = !currentUser;
  }
  els.newItemButton.hidden = !canEdit();
  els.importButton.hidden = !canImportExport();
  els.importJsonButton.hidden = !canImportExport();
  els.manageUsersButton.hidden = !canDelete();
  els.clearLibraryButton.hidden = !canDelete();
}

function toMedia(row) {
  return {
    id: row.id,
    title: row.title || "",
    year: row.year || "",
    duration: row.duration || "",
    subject: row.subject || "",
    category: row.category || "",
    language: row.language || "",
    source: row.source || "Other",
    url: row.url || "",
    thumbnailUrl: row.thumbnail_url || "",
    variants: row.variants || [],
    tags: row.tags || [],
    pinned: Boolean(row.pinned),
    starred: Boolean(row.starred),
    programmeSupport: row.programme_support || "",
    notes: row.notes || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
    createdBy: row.created_by || "",
    updatedBy: row.updated_by || ""
  };
}

function toRow(item) {
  return {
    title: item.title,
    year: item.year ? Number(item.year) : null,
    duration: item.duration || null,
    subject: item.subject || null,
    category: item.category || null,
    language: item.language || null,
    source: item.source || "Other",
    url: item.url || null,
    thumbnail_url: item.thumbnailUrl || getAutoThumbnail(item.url) || null,
    variants: item.variants || [],
    tags: item.tags || [],
    pinned: Boolean(item.pinned),
    starred: Boolean(item.starred),
    programme_support: item.programmeSupport || null,
    notes: item.notes || null,
    updated_by: currentUser?.id || null
  };
}

async function getMedia() {
  if (!supabase) {
    items = [];
    render();
    return;
  }
  try {
    showLoading("Loading media...");
    const { data, error } = await supabase.from("media").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    items = (data || []).map(toMedia);
    currentPage = 1;
    render();
  } catch (error) {
    handleError(error, "Could not load media. Check Supabase configuration and network access.");
  } finally {
    hideLoading();
  }
}

async function searchMedia() {
  await getMedia();
}

function getRecentMedia(limit = 12) {
  return [...items].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, limit);
}

function getRecentlyUpdatedMedia(limit = 12) {
  return [...items].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)).slice(0, limit);
}

function subscribeToMediaChanges() {
  if (!supabase) return;
  supabase
    .channel("media-repository-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "media" }, () => {
      showToast("Repository changed. Syncing...");
      getMedia();
    })
    .subscribe();
}

async function createMedia(item) {
  if (!canEdit()) throw new Error("Permission denied.");
  const { data, error } = await supabase
    .from("media")
    .insert({ ...toRow(item), created_by: currentUser?.id || null })
    .select()
    .single();
  if (error) throw error;
  items = [toMedia(data), ...items];
}

async function updateMedia(id, item) {
  if (!canEdit()) throw new Error("Permission denied.");
  const { data, error } = await supabase.from("media").update(toRow(item)).eq("id", id).select().single();
  if (error) throw error;
  items = items.map((entry) => (entry.id === id ? toMedia(data) : entry));
}

async function deleteMedia(id) {
  if (!canDelete()) throw new Error("Permission denied.");
  const { error } = await supabase.from("media").delete().eq("id", id);
  if (error) throw error;
  items = items.filter((entry) => entry.id !== id);
}

async function getProfiles() {
  if (!canDelete()) throw new Error("Permission denied.");
  const { data, error } = await supabase.from("profiles").select("id,email,role,created_at,updated_at").order("email", { ascending: true });
  if (error) throw error;
  return data || [];
}

async function updateProfileRole(id, role) {
  if (!canDelete()) throw new Error("Permission denied.");
  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) throw error;
}

async function bulkImportMedia(imported) {
  if (!canImportExport()) throw new Error("Permission denied.");
  const byTitle = new Map(items.map((item) => [item.title.trim().toLowerCase(), item]));
  let added = 0;
  let updated = 0;
  for (const incoming of imported) {
    const existing = byTitle.get(incoming.title.trim().toLowerCase());
    if (existing) {
      await updateMedia(existing.id, mergeItem(existing, incoming));
      updated += 1;
    } else {
      await createMedia(incoming);
      added += 1;
    }
  }
  return { added, updated };
}

function uniqueValues(key) {
  return [...new Set(items.map((item) => item[key]).filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b), undefined, { numeric: true })
  );
}

function allLanguageValues() {
  return [
    ...new Set(items.flatMap((item) => [item.language, ...(item.variants || []).map((variant) => variant.language)]).filter(Boolean))
  ].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
}

function allSubjectValues() {
  return orderSubjects([...new Set([...mainCategories, ...extraMedicalSubjects, ...uniqueValues("subject")])]);
}

function sidebarSubjectValues() {
  const extras = uniqueValues("subject").filter((subject) => !mainCategories.includes(subject));
  return showMoreSubjects ? orderSubjects([...new Set([...mainCategories, ...extraMedicalSubjects, ...extras])]) : mainCategories;
}

function orderSubjects(subjects) {
  const extras = subjects.filter((subject) => !mainCategories.includes(subject)).sort();
  return [...mainCategories, ...extras];
}

function syncFilterOptions() {
  const subjects = allSubjectValues();
  fillSelect(els.yearFilter, uniqueValues("year").sort((a, b) => Number(b) - Number(a)), "All years");
  fillSelect(els.subjectFilter, subjects, "All main categories");
  fillSelect(els.languageFilter, [...new Set([...indianLanguages, ...allLanguageValues()])].sort(), "All languages");
  fillSelect(els.categoryFilter, uniqueValues("category"), "All categories");
  fillSelect(els.programmeSupportFilter, [...programmeSupportTypes, "none"], "All media", { none: "Not marked" });
  fillSelect(els.prioritySubjectFilter, subjects, "Choose subject");
  fillDatalist("subjectOptions", subjects);
  fillDatalist("languageOptions", [...new Set([...indianLanguages, ...allLanguageValues()])].sort());
}

function fillSelect(select, values, label, labels = {}) {
  const current = select.value;
  select.innerHTML = `<option value="">${label}</option>`;
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = labels[value] || value;
    select.append(option);
  });
  select.value = values.map(String).includes(current) ? current : "";
}

function fillDatalist(id, values) {
  const datalist = document.querySelector(`#${id}`);
  datalist.innerHTML = "";
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    datalist.append(option);
  });
}

function getFilteredItems() {
  const query = els.searchInput.value.trim().toLowerCase();
  const year = els.yearFilter.value;
  const subject = els.subjectFilter.value;
  const language = els.languageFilter.value;
  const category = els.categoryFilter.value;
  const programmeSupport = els.programmeSupportFilter.value;
  return items
    .filter((item) => {
      const haystack = [
        item.title,
        item.year,
        item.subject,
        item.category,
        item.language,
        ...(item.variants || []).map((variant) => variant.language),
        item.source,
        item.duration,
        item.pinned ? "pinned pin priority" : "",
        item.starred ? "starred star important" : "",
        item.programmeSupport ? `programme support ${item.programmeSupport}` : "",
        item.notes,
        ...(item.tags || [])
      ]
        .join(" ")
        .toLowerCase();
      const sourceMatch =
        activeQuickFilter === "all" ||
        (activeQuickFilter === "youtube" && item.source === "YouTube") ||
        (activeQuickFilter === "drive" && item.source === "Google Drive");
      return (
        sourceMatch &&
        (!query || haystack.includes(query)) &&
        (!year || String(item.year) === year) &&
        (!subject || item.subject === subject) &&
        (!language || item.language === language || (item.variants || []).some((variant) => variant.language === language)) &&
        (!category || item.category === category) &&
        (!programmeSupport || (programmeSupport === "none" ? !item.programmeSupport : item.programmeSupport === programmeSupport))
      );
    })
    .sort(sortItems);
}

function sortItems(a, b) {
  const priority = Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || Number(Boolean(b.starred)) - Number(Boolean(a.starred));
  if (els.sortFilter.value === "oldest") return Number(a.year || 0) - Number(b.year || 0);
  if (els.sortFilter.value === "title") return a.title.localeCompare(b.title);
  if (els.sortFilter.value === "subject") return a.subject.localeCompare(b.subject);
  if (els.sortFilter.value === "priority") return priority || a.subject.localeCompare(b.subject);
  if (els.sortFilter.value === "recentlyAdded") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  if (els.sortFilter.value === "recentlyUpdated") return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
  return priority || Number(b.year || 0) - Number(a.year || 0);
}

function render() {
  syncFilterOptions();
  filteredItems = getFilteredItems();
  renderStats();
  renderCards();
  updateAuthUI();
}

function renderStats() {
  els.totalItems.textContent = items.length;
  els.totalLanguages.textContent = allLanguageValues().length;
  els.totalSubjects.textContent = uniqueValues("subject").length;
  els.totalYears.textContent = uniqueValues("year").length;
  const subjects = sidebarSubjectValues();
  els.subjectNavCount.textContent = subjects.length;
  els.subjectNavList.innerHTML = "";
  els.subjectToggleButton.textContent = showMoreSubjects ? "Show main subjects" : "Show more subjects";
  subjects.forEach((subject) => {
    const button = document.createElement("button");
    button.className = "subject-pill";
    button.type = "button";
    button.innerHTML = `<span>${escapeHtml(subject)}</span><span>${items.filter((item) => item.subject === subject).length}</span>`;
    button.addEventListener("click", () => {
      els.subjectFilter.value = subject;
      currentPage = 1;
      render();
    });
    els.subjectNavList.append(button);
  });
}

function renderCards() {
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  currentPage = Math.min(currentPage, totalPages);
  const pageItems = filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  els.mediaGrid.innerHTML = "";
  els.emptyState.hidden = filteredItems.length > 0;
  els.resultSummary.textContent = `${filteredItems.length} of ${items.length} records shown`;
  els.pageSummary.textContent = `Page ${currentPage} of ${totalPages}`;
  els.prevPageButton.disabled = currentPage <= 1;
  els.nextPageButton.disabled = currentPage >= totalPages;
  pageItems.forEach((item) => els.mediaGrid.append(renderCard(item)));
}

function renderCard(item) {
  const card = document.createElement("article");
  card.className = "media-card";
  const badgeClass = item.source === "Google Drive" ? "source-badge drive" : "source-badge";
  const tags = (item.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
  const languages = [...new Set([item.language, ...(item.variants || []).map((variant) => variant.language)].filter(Boolean))];
  const languageBadges = languages.map((language) => `<span class="language-badge">${escapeHtml(language)}</span>`).join("");
  const variantLinks = (item.variants || [])
    .map((variant) => `<a href="${escapeAttribute(variant.url)}" target="_blank" rel="noopener">${escapeHtml(variant.language)}</a>`)
    .join("");
  const thumbnail = item.thumbnailUrl || getAutoThumbnail(item.url);
  const priorityBadges = [
    item.pinned ? '<span class="priority-badge pin">Pinned</span>' : "",
    item.starred ? '<span class="priority-badge star">Starred</span>' : "",
    item.programmeSupport ? `<span class="priority-badge programme">${escapeHtml(item.programmeSupport)}</span>` : ""
  ].join("");
  const detailsId = `details-${item.id}`;
  card.innerHTML = `
    ${thumbnail ? `<img class="media-thumbnail" src="${escapeAttribute(thumbnail)}" alt="${escapeAttribute(item.title)} thumbnail" loading="lazy" />` : `<div class="media-thumbnail placeholder"><span>${escapeHtml(item.source)}</span></div>`}
    <h3 class="media-title">${escapeHtml(item.title)}</h3>
    ${languages.length > 1 ? `<div class="language-row">${languageBadges}</div>` : ""}
    <button class="details-toggle" type="button" data-details-toggle aria-expanded="false" aria-controls="${escapeAttribute(detailsId)}">
      <span>Details</span><span class="${badgeClass}">${escapeHtml(item.source)}</span>
    </button>
    <div id="${escapeAttribute(detailsId)}" class="media-details-panel">
      ${priorityBadges ? `<div class="priority-row">${priorityBadges}</div>` : ""}
      <dl class="meta-list">
        <div><strong>Year:</strong> ${escapeHtml(item.year || "")}</div>
        <div><strong>Main Category:</strong> ${escapeHtml(item.subject || "")}</div>
        <div><strong>Sub-category:</strong> ${escapeHtml(item.category || "")}</div>
        <div><strong>Language:</strong> ${escapeHtml(item.language || "")}</div>
        ${item.duration ? `<div><strong>Duration:</strong> ${escapeHtml(item.duration)}</div>` : ""}
        ${item.createdAt ? `<div><strong>Created:</strong> ${formatDate(item.createdAt)}</div>` : ""}
        ${item.updatedAt ? `<div><strong>Updated:</strong> ${formatDate(item.updatedAt)}</div>` : ""}
      </dl>
      ${tags ? `<div class="tag-list">${tags}</div>` : ""}
      ${variantLinks ? `<div class="variant-link-list"><strong>Language links:</strong>${item.url ? `<a href="${escapeAttribute(item.url)}" target="_blank" rel="noopener">${escapeHtml(item.language || "Primary")}</a>` : ""}${variantLinks}</div>` : ""}
      ${item.notes ? `<p class="result-summary">${escapeHtml(item.notes)}</p>` : ""}
      <div class="card-actions">
        ${item.url ? `<a href="${escapeAttribute(item.url)}" target="_blank" rel="noopener">Open link</a>` : ""}
        ${canEdit() ? `<button type="button" data-pin="${item.id}">${item.pinned ? "Unpin" : "Pin"}</button><button type="button" data-star="${item.id}">${item.starred ? "Unstar" : "Star"}</button><button type="button" data-edit="${item.id}">Edit</button>` : ""}
        ${canDelete() ? `<button class="delete" type="button" data-delete="${item.id}">Delete</button>` : ""}
      </div>
    </div>
  `;
  return card;
}

function formatDate(value) {
  return new Date(value).toLocaleString();
}

function renderUserList(profiles) {
  if (!profiles.length) {
    els.userList.innerHTML = '<p class="result-summary">No signed-in users found yet.</p>';
    return;
  }
  els.userList.innerHTML = profiles
    .map(
      (profile) => `
        <div class="user-row" data-user-id="${escapeAttribute(profile.id)}">
          <div>
            <strong>${escapeHtml(profile.email || "No email available")}</strong>
            <small>Role updated ${profile.updated_at ? formatDate(profile.updated_at) : "not yet"}</small>
          </div>
          <label>
            Role
            <select class="user-role-select">
              <option value="viewer" ${profile.role === "viewer" ? "selected" : ""}>Viewer</option>
              <option value="editor" ${profile.role === "editor" ? "selected" : ""}>Editor</option>
              <option value="admin" ${profile.role === "admin" ? "selected" : ""}>Admin</option>
            </select>
          </label>
          <button class="primary-button user-role-save" type="button">Save</button>
        </div>
      `
    )
    .join("");
}

async function openUserManagement() {
  if (!canDelete()) return showToast("Only admins can manage users.", "error");
  try {
    showLoading("Loading users...");
    const profiles = await getProfiles();
    renderUserList(profiles);
    els.userManageOverlay.hidden = false;
  } catch (error) {
    handleError(error, "Could not load users.");
  } finally {
    hideLoading();
  }
}

function addVariantRow(variant = {}) {
  const row = document.createElement("div");
  row.className = "variant-row";
  row.innerHTML = `
    <label>Language<input class="variant-language" type="text" list="languageOptions" placeholder="Language" value="${escapeAttribute(variant.language || "")}" /></label>
    <label>Link<input class="variant-url" type="url" placeholder="https://youtube.com/... or https://drive.google.com/..." value="${escapeAttribute(variant.url || "")}" /></label>
    <button class="ghost-button variant-remove" type="button">Remove</button>
  `;
  els.variantRows.append(row);
}

function getVariantRows() {
  return [...els.variantRows.querySelectorAll(".variant-row")]
    .map((row) => ({
      language: row.querySelector(".variant-language").value.trim(),
      url: row.querySelector(".variant-url").value.trim()
    }))
    .filter((variant) => variant.language && variant.url);
}

function resetForm() {
  els.form.reset();
  els.itemId.value = "";
  els.formTitle.textContent = "Add Media";
  els.cancelEditButton.hidden = true;
  els.variantRows.innerHTML = "";
  els.yearInput.value = new Date().getFullYear();
}

function openForm() {
  lastFocus = document.activeElement;
  els.formOverlay.hidden = false;
  els.titleInput.focus();
}

function closeForm() {
  els.formOverlay.hidden = true;
  lastFocus?.focus?.();
}

function editItem(id) {
  const item = items.find((entry) => entry.id === id);
  if (!item) return;
  els.itemId.value = item.id;
  els.titleInput.value = item.title;
  els.yearInput.value = item.year || "";
  els.durationInput.value = item.duration || "";
  els.subjectInput.value = item.subject || "";
  els.categoryInput.value = item.category || "";
  els.languageInput.value = item.language || "";
  els.sourceInput.value = item.source || "Other";
  els.urlInput.value = item.url || "";
  els.thumbnailInput.value = item.thumbnailUrl || getAutoThumbnail(item.url) || "";
  els.variantRows.innerHTML = "";
  (item.variants || []).forEach(addVariantRow);
  els.tagsInput.value = (item.tags || []).join(", ");
  els.pinnedInput.checked = Boolean(item.pinned);
  els.starredInput.checked = Boolean(item.starred);
  els.programmeSupportInput.value = item.programmeSupport || "";
  els.notesInput.value = item.notes || "";
  els.formTitle.textContent = "Edit Media";
  els.cancelEditButton.hidden = false;
  openForm();
}

function formToItem() {
  const url = els.urlInput.value.trim();
  const variants = getVariantRows();
  if (url && !isValidUrl(url)) throw new Error("Primary URL is not valid.");
  const invalidVariant = variants.find((variant) => !isValidUrl(variant.url));
  if (invalidVariant) throw new Error(`Variant URL for ${invalidVariant.language} is not valid.`);
  return {
    id: els.itemId.value,
    title: els.titleInput.value.trim(),
    year: els.yearInput.value ? Number(els.yearInput.value) : "",
    duration: els.durationInput.value.trim(),
    subject: els.subjectInput.value.trim(),
    category: els.categoryInput.value.trim(),
    language: els.languageInput.value.trim(),
    source: els.sourceInput.value,
    url,
    thumbnailUrl: els.thumbnailInput.value.trim() || getAutoThumbnail(url) || "",
    variants,
    tags: els.tagsInput.value.split(",").map((tag) => tag.trim()).filter(Boolean),
    pinned: els.pinnedInput.checked,
    starred: els.starredInput.checked,
    programmeSupport: els.programmeSupportInput.value,
    notes: els.notesInput.value.trim()
  };
}

function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function getExportRows() {
  return [
    spreadsheetHeaders,
    ...items.map((item) => {
      const variants = item.variants || [];
      return [
        item.title,
        item.url,
        item.language,
        item.subject,
        item.category,
        item.duration || "",
        item.year || "",
        (item.tags || []).join("; "),
        "",
        item.notes || "",
        item.starred ? "Yes" : "No",
        variants[0]?.language || "",
        variants[0]?.url || "",
        variants[1]?.language || "",
        variants[1]?.url || "",
        variants[2]?.language || "",
        variants[2]?.url || "",
        variants[3]?.language || "",
        variants[3]?.url || "",
        variants[4]?.language || "",
        variants[4]?.url || ""
      ];
    })
  ];
}

function exportCsv(filename = "noora-health-film-repository.csv") {
  downloadFile(filename, "text/csv", getExportRows().map((row) => row.map(csvCell).join(",")).join("\n"));
}

function exportExcel() {
  const htmlRows = getExportRows().map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("");
  downloadFile("noora-health-film-repository.xls", "application/vnd.ms-excel", `<!doctype html><html><meta charset="UTF-8"><body><table>${htmlRows}</table></body></html>`);
}

function exportJson() {
  downloadFile("noora-health-film-repository.json", "application/json", JSON.stringify(items, null, 2));
}

function exportTemplate() {
  const example = ["Example Health Film Title", "", "", "", "", "", "", "", "", "", "No", "", "", "", "", "", "", "", "", "", ""];
  downloadFile("noora-health-film-import-template.csv", "text/csv", [spreadsheetHeaders, example].map((row) => row.map(csvCell).join(",")).join("\n"));
}

function downloadFile(filename, mimeType, content) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function parseDelimitedText(text) {
  const delimiter = text.includes("\t") && !text.includes(",") ? "\t" : ",";
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') quoted = !quoted;
    else if (char === delimiter && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((entry) => entry.trim())) rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  row.push(cell);
  if (row.some((entry) => entry.trim())) rows.push(row);
  return rows;
}

function parseHtmlTable(text) {
  const doc = new DOMParser().parseFromString(text, "text/html");
  return [...doc.querySelectorAll("tr")].map((row) => [...row.querySelectorAll("th,td")].map((cell) => cell.textContent.trim()));
}

function rowsToItems(rows) {
  const headers = rows[0].map((header) => normalizeHeader(header));
  const groups = new Map();
  rows.slice(1).forEach((row) => {
    const record = {};
    headers.forEach((header, index) => (record[header] = row[index] || ""));
    const title = record.title?.trim();
    if (!title) return;
    const key = title.toLowerCase();
    const primaryUrl = record.primary_url || record.url || record.link || "";
    const primaryLanguage = record.primary_language || record.language || "";
    if (!groups.has(key)) {
      groups.set(key, {
        title,
        year: record.year_of_creation || record.year || "",
        subject: getMainCategory(record),
        category: record.description || record.category || "",
        language: primaryLanguage,
        source: getSourceFromUrl(primaryUrl),
        duration: record.duration_minutes || record.duration || "",
        url: primaryUrl,
        thumbnailUrl: getAutoThumbnail(primaryUrl),
        variants: parseVariantColumns(record),
        tags: splitTags(record.tags),
        pinned: false,
        starred: parseYesNo(record.featured || record.starred),
        programmeSupport: "",
        notes: buildImportNotes(record)
      });
    } else {
      const group = groups.get(key);
      if (primaryUrl) group.variants.push({ language: primaryLanguage || "Other", url: primaryUrl });
      group.variants.push(...parseVariantColumns(record));
      group.tags = [...new Set([...group.tags, ...splitTags(record.tags)])];
    }
  });
  return [...groups.values()].map((item) => ({ ...item, variants: dedupeVariants(item.variants, item.url) }));
}

function normalizeHeader(header) {
  return String(header).trim().toLowerCase().replaceAll(/[^a-z0-9]+/g, "_").replaceAll(/^_|_$/g, "");
}

function parseVariantColumns(record) {
  const variants = [];
  for (let index = 1; index <= 5; index += 1) {
    const language = record[`lang_link_${index}_language`];
    const url = record[`lang_link_${index}_url`];
    if (language && url) variants.push({ language: language.trim(), url: url.trim() });
  }
  return variants;
}

function splitTags(value) {
  return String(value || "").split(/[;,]/).map((tag) => tag.trim()).filter(Boolean);
}

function parseYesNo(value) {
  return ["yes", "true", "1", "y"].includes(String(value || "").trim().toLowerCase());
}

function buildImportNotes(record) {
  return [record.internal_notes ? `Internal notes: ${record.internal_notes}` : "", record.script_link ? `Script link: ${record.script_link}` : ""].filter(Boolean).join(" | ");
}

function getMainCategory(record) {
  const text = [record.subject, record.main_category, record.category, record.description, record.tags, record.title, record.programme_support].filter(Boolean).join(" ").toLowerCase();
  if (/\banc\b/.test(text)) return "ANC";
  if (/\bpnc\b/.test(text)) return "PNC";
  if (/\bsncu\b/.test(text)) return "SNCU";
  if (/\bncd\b/.test(text)) return "NCD";
  if (/\btb\b|tuberculosis/.test(text)) return "TB";
  if (/cardiac|cardio|heart/.test(text)) return "Cardiac";
  if (/mccs[^a-z0-9]+vertical|mccs vertical/.test(text)) return "MCCS Vertical";
  if (/programme support|program support/.test(text)) return "Programme support videos";
  if (/non[\s-]?med|non medical|non-medical/.test(text)) return "NON med videos";
  return record.main_category || record.description || record.subject || record.category || "";
}

function dedupeVariants(variants, primaryUrl = "") {
  const seen = new Set([primaryUrl].filter(Boolean));
  return variants.filter((variant) => {
    if (!variant.language || !variant.url || seen.has(variant.url)) return false;
    seen.add(variant.url);
    return true;
  });
}

function mergeItem(existing, incoming) {
  return {
    ...existing,
    year: existing.year || incoming.year,
    duration: existing.duration || incoming.duration,
    subject: existing.subject || incoming.subject,
    category: existing.category || incoming.category,
    language: existing.language || incoming.language,
    source: existing.source && existing.source !== "Other" ? existing.source : incoming.source,
    url: existing.url || incoming.url,
    thumbnailUrl: existing.thumbnailUrl || incoming.thumbnailUrl,
    variants: dedupeVariants([...(existing.variants || []), ...(incoming.variants || [])], existing.url || incoming.url),
    tags: [...new Set([...(existing.tags || []), ...(incoming.tags || [])])],
    pinned: existing.pinned || incoming.pinned,
    starred: existing.starred || incoming.starred,
    programmeSupport: existing.programmeSupport || incoming.programmeSupport,
    notes: [existing.notes, incoming.notes].filter(Boolean).filter((note, index, notes) => notes.indexOf(note) === index).join(" | ")
  };
}

function getSourceFromUrl(url) {
  const value = String(url || "").toLowerCase();
  if (value.includes("youtube.com") || value.includes("youtu.be")) return "YouTube";
  if (value.includes("drive.google.com")) return "Google Drive";
  return "Other";
}

function getAutoThumbnail(url) {
  const youtubeId = getYouTubeVideoId(url);
  if (youtubeId) return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  const driveId = getDriveFileId(url);
  if (driveId) return `https://drive.google.com/thumbnail?id=${driveId}&sz=w640`;
  return "";
}

function getYouTubeVideoId(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return parsed.pathname.split("/").filter(Boolean)[0] || "";
    if (host.endsWith("youtube.com")) {
      if (parsed.searchParams.get("v")) return parsed.searchParams.get("v");
      const parts = parsed.pathname.split("/").filter(Boolean);
      const marker = parts.findIndex((part) => ["embed", "shorts", "live"].includes(part));
      if (marker >= 0) return parts[marker + 1] || "";
    }
  } catch {
    return "";
  }
  return "";
}

function getDriveFileId(url) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("drive.google.com")) return "";
    if (parsed.searchParams.get("id")) return parsed.searchParams.get("id");
    const parts = parsed.pathname.split("/").filter(Boolean);
    const marker = parts.indexOf("d");
    return marker >= 0 ? parts[marker + 1] || "" : "";
  } catch {
    return "";
  }
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

async function offerLegacyMigration() {
  const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw || !canImportExport()) return;
  if (!confirm("Local browser media was found. Import it into Supabase now?")) return;
  try {
    const legacy = JSON.parse(raw);
    await bulkImportMedia(legacy);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    showToast("Legacy local data imported.");
    await getMedia();
  } catch (error) {
    handleError(error, "Could not migrate local data.");
  }
}

function bindEvents() {
  if (supabase) {
    supabase.auth.onAuthStateChange(async (_event, session) => {
      currentUser = session?.user || null;
      await loadRole();
      updateAuthUI();
      await getMedia();
    });
  }
  els.googleLoginButton.addEventListener("click", async () => {
    if (!supabase) return showToast("Supabase is not configured yet.", "error");
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) handleError(error, "Google login failed.");
  });
  els.emailLoginButton.addEventListener("click", async () => {
    if (!supabase) return showToast("Supabase is not configured yet.", "error");
    const email = els.emailInput.value.trim();
    if (!email) return showToast("Enter an email address.", "error");
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } });
    if (error) handleError(error, "Email login failed.");
    else showToast("Check your email for the login link.");
  });
  els.logoutButton.addEventListener("click", () => supabase?.auth.signOut());
  document.querySelectorAll(".quick-filter").forEach((button) => {
    button.addEventListener("click", () => {
      activeQuickFilter = button.dataset.filterType;
      document.querySelectorAll(".quick-filter").forEach((entry) => entry.classList.remove("active"));
      button.classList.add("active");
      currentPage = 1;
      render();
    });
  });
  els.subjectToggleButton.addEventListener("click", () => {
    showMoreSubjects = !showMoreSubjects;
    render();
  });
  [els.searchInput, els.yearFilter, els.subjectFilter, els.languageFilter, els.categoryFilter, els.programmeSupportFilter, els.sortFilter].forEach((control) =>
    control.addEventListener("input", () => {
      currentPage = 1;
      render();
    })
  );
  els.prevPageButton.addEventListener("click", () => {
    currentPage -= 1;
    renderCards();
  });
  els.nextPageButton.addEventListener("click", () => {
    currentPage += 1;
    renderCards();
  });
  els.newItemButton.addEventListener("click", () => {
    resetForm();
    openForm();
  });
  document.querySelector("[data-empty-add]").addEventListener("click", () => {
    resetForm();
    openForm();
  });
  els.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const item = formToItem();
    if (items.some((entry) => entry.id !== item.id && (entry.url && entry.url === item.url || entry.title.toLowerCase() === item.title.toLowerCase()))) {
      if (!confirm("A similar media record exists. Save anyway?")) return;
    }
    try {
      showLoading("Saving media...");
      if (item.id) await updateMedia(item.id, item);
      else await createMedia(item);
      resetForm();
      closeForm();
      render();
      showToast("Media saved.");
    } catch (error) {
      handleError(error, "Could not save media.");
    } finally {
      hideLoading();
    }
  });
  els.mediaGrid.addEventListener("click", async (event) => {
    const toggle = event.target.closest("[data-details-toggle]");
    if (toggle) {
      const card = toggle.closest(".media-card");
      const panel = card?.querySelector(".media-details-panel");
      const isOpen = panel?.classList.contains("is-open");
      els.mediaGrid.querySelectorAll(".details-toggle").forEach((entry) => entry.setAttribute("aria-expanded", "false"));
      els.mediaGrid.querySelectorAll(".media-details-panel").forEach((entry) => entry.classList.remove("is-open"));
      if (panel && !isOpen) {
        toggle.setAttribute("aria-expanded", "true");
        panel.classList.add("is-open");
      }
      return;
    }
    const editId = event.target.dataset.edit;
    const deleteId = event.target.dataset.delete;
    const pinId = event.target.dataset.pin;
    const starId = event.target.dataset.star;
    try {
      if (editId) editItem(editId);
      if (deleteId) {
        if (!confirm("Delete this media record?")) return;
        await deleteMedia(deleteId);
        render();
      }
      if (pinId || starId) {
        const item = items.find((entry) => entry.id === (pinId || starId));
        await updateMedia(item.id, { ...item, [pinId ? "pinned" : "starred"]: !item[pinId ? "pinned" : "starred"] });
        render();
      }
    } catch (error) {
      handleError(error, "Action failed.");
    }
  });
  els.closeFormButton.addEventListener("click", () => {
    resetForm();
    closeForm();
  });
  els.cancelEditButton.addEventListener("click", () => {
    resetForm();
    closeForm();
  });
  els.formOverlay.addEventListener("click", (event) => {
    if (event.target === els.formOverlay) closeForm();
  });
  els.addVariantButton.addEventListener("click", () => addVariantRow());
  els.variantRows.addEventListener("click", (event) => {
    const button = event.target.closest(".variant-remove");
    if (button) button.closest(".variant-row").remove();
  });
  els.urlInput.addEventListener("input", () => {
    if (!els.thumbnailInput.value.trim()) els.thumbnailInput.value = getAutoThumbnail(els.urlInput.value.trim());
  });
  els.clearFiltersButton.addEventListener("click", () => {
    els.searchInput.value = "";
    els.yearFilter.value = "";
    els.subjectFilter.value = "";
    els.languageFilter.value = "";
    els.categoryFilter.value = "";
    els.programmeSupportFilter.value = "";
    els.sortFilter.value = "newest";
    activeQuickFilter = "all";
    currentPage = 1;
    document.querySelectorAll(".quick-filter").forEach((entry) => entry.classList.remove("active"));
    document.querySelector('[data-filter-type="all"]').classList.add("active");
    render();
  });
  els.exportCsvButton.addEventListener("click", () => exportCsv());
  els.exportExcelButton.addEventListener("click", exportExcel);
  els.exportJsonButton.addEventListener("click", exportJson);
  els.templateButton.addEventListener("click", exportTemplate);
  els.manageUsersButton.addEventListener("click", openUserManagement);
  els.importButton.addEventListener("click", () => els.importFileInput.click());
  els.importJsonButton.addEventListener("click", () => els.jsonFileInput.click());
  els.importFileInput.addEventListener("change", async (event) => {
    const [file] = event.target.files;
    if (file) await importSpreadsheet(file);
    event.target.value = "";
  });
  els.jsonFileInput.addEventListener("change", async (event) => {
    const [file] = event.target.files;
    if (file) await importJsonFile(file);
    event.target.value = "";
  });
  els.clearLibraryButton.addEventListener("click", () => {
    els.clearConfirmCheckbox.checked = false;
    els.confirmClearButton.disabled = true;
    els.clearConfirmOverlay.hidden = false;
  });
  els.clearConfirmCheckbox.addEventListener("input", () => {
    els.confirmClearButton.disabled = !els.clearConfirmCheckbox.checked;
  });
  els.cancelClearButton.addEventListener("click", () => {
    els.clearConfirmOverlay.hidden = true;
  });
  els.closeUserManageButton.addEventListener("click", () => {
    els.userManageOverlay.hidden = true;
  });
  els.userManageOverlay.addEventListener("click", (event) => {
    if (event.target === els.userManageOverlay) els.userManageOverlay.hidden = true;
  });
  els.userList.addEventListener("click", async (event) => {
    const button = event.target.closest(".user-role-save");
    if (!button) return;
    const row = button.closest(".user-row");
    const role = row.querySelector(".user-role-select").value;
    try {
      showLoading("Updating user role...");
      await updateProfileRole(row.dataset.userId, role);
      if (row.dataset.userId === currentUser?.id) {
        currentRole = role;
        updateAuthUI();
      }
      renderUserList(await getProfiles());
      showToast("User role updated.");
    } catch (error) {
      handleError(error, "Could not update user role.");
    } finally {
      hideLoading();
    }
  });
  els.confirmClearButton.addEventListener("click", async () => {
    try {
      exportCsv("noora-health-film-repository-backup-before-clear.csv");
      showLoading("Clearing library...");
      const { error } = await supabase.from("media").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) throw error;
      items = [];
      els.clearConfirmOverlay.hidden = true;
      render();
    } catch (error) {
      handleError(error, "Could not clear library.");
    } finally {
      hideLoading();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!els.userManageOverlay.hidden) els.userManageOverlay.hidden = true;
    if (!els.clearConfirmOverlay.hidden) els.clearConfirmOverlay.hidden = true;
    if (!els.formOverlay.hidden) closeForm();
  });
}

async function importSpreadsheet(file) {
  try {
    showLoading("Importing media...");
    const text = await file.text();
    const rows = file.name.toLowerCase().endsWith(".xls") ? parseHtmlTable(text) : parseDelimitedText(text);
    const imported = rowsToItems(rows);
    if (!imported.length) throw new Error("No valid records found.");
    const result = await bulkImportMedia(imported);
    await getMedia();
    showToast(`Imported ${result.added} new and updated ${result.updated}.`);
  } catch (error) {
    handleError(error, "Import failed.");
  } finally {
    hideLoading();
  }
}

async function importJsonFile(file) {
  try {
    showLoading("Importing JSON...");
    const imported = JSON.parse(await file.text());
    if (!Array.isArray(imported)) throw new Error("JSON must be an array.");
    const result = await bulkImportMedia(imported);
    await getMedia();
    showToast(`Imported ${result.added} new and updated ${result.updated}.`);
  } catch (error) {
    handleError(error, "JSON import failed.");
  } finally {
    hideLoading();
  }
}

init();
