/* =========================================================
   ResumeForge v4 - Final Rebuilt Script
   Bootstrap + Attractive Resume Builder Logic
   ========================================================= */

const STORAGE_KEY = "resumeforge_v4_data";
const DEFAULT_TEMPLATE = "modern";
const MAX_SUMMARY = 350;
const MAX_PROJECT_DESC = 220;
const MAX_EXPERIENCE_DESC = 220;

const state = {
  template: DEFAULT_TEMPLATE,
  theme: "light",
  activeTab: "personal",
  photo: "",
  visibility: {
    skills: true,
    projects: true,
    experience: true,
    certifications: true,
    achievements: true,
    languages: true,
  },
  data: {
    personal: {
      fullName: "",
      role: "",
      email: "",
      phone: "",
      address: "",
      linkedin: "",
      github: "",
      portfolio: "",
      summary: "",
    },
    skills: {
      technical: "",
      soft: "",
    },
    education: [],
    projects: [],
    experience: [],
    certifications: [],
    achievements: [],
    languages: [],
  },
};

let toastInstance = null;
let ids = {};

/* =========================================================
   Bootstrap app
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  cacheDOM();
  initializeApp();
});

function cacheDOM() {
  ids = {
    // top actions
    fillSampleBtn: document.getElementById("fillSampleBtn"),
    saveResumeBtn: document.getElementById("saveResumeBtn"),
    clearResumeBtn: document.getElementById("clearResumeBtn"),
    downloadPdfBtn: document.getElementById("downloadPdfBtn"),
    printResumeBtn: document.getElementById("printResumeBtn"),
    exportJsonBtn: document.getElementById("exportJsonBtn"),
    importJsonInput: document.getElementById("importJsonInput"),

    // personal
    fullName: document.getElementById("fullName"),
    role: document.getElementById("role"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    address: document.getElementById("address"),
    linkedin: document.getElementById("linkedin"),
    github: document.getElementById("github"),
    portfolio: document.getElementById("portfolio"),
    summary: document.getElementById("summary"),
    summaryCounter: document.getElementById("summaryCounter"),
    photoInput: document.getElementById("photoInput"),

    // skills
    technicalSkills: document.getElementById("technicalSkills"),
    softSkills: document.getElementById("softSkills"),

    // containers
    educationContainer: document.getElementById("educationContainer"),
    projectsContainer: document.getElementById("projectsContainer"),
    experienceContainer: document.getElementById("experienceContainer"),
    certificationsContainer: document.getElementById("certificationsContainer"),
    achievementsContainer: document.getElementById("achievementsContainer"),
    languagesContainer: document.getElementById("languagesContainer"),

    // preview
    resumePreview: document.getElementById("resumePreview"),

    // progress
    completionBar: document.getElementById("completionBar"),
    completionText: document.getElementById("completionText"),

    // ATS
    atsRing: document.getElementById("atsRing"),
    atsScoreText: document.getElementById("atsScoreText"),
    atsGrade: document.getElementById("atsGrade"),
    atsHint: document.getElementById("atsHint"),
    atsSuggestions: document.getElementById("atsSuggestions"),

    // theme
    themeSwitch: document.getElementById("themeSwitch"),
    themeLabel: document.getElementById("themeLabel"),

    // toast
    toastEl: document.getElementById("liveToast"),
  };
}

function initializeApp() {
  loadFromLocalStorage();
  ensureMinimumBlocks();
  applyTheme();
  renderDynamicSections();
  populateForm();
  bindEvents();
  setActiveTab(state.activeTab || "personal");
  syncVisibilityUI();
  syncTemplateUI();
  syncThemeUI();
  updateSummaryCounter();
  updatePreview();
  updateCompletionProgress();
  updateATSScore();
}

/* =========================================================
   Event binding
   ========================================================= */
function bindEvents() {
  // top actions
  ids.fillSampleBtn?.addEventListener("click", fillSampleData);
  ids.saveResumeBtn?.addEventListener("click", () => {
    collectFormData();
    saveToLocalStorage(true);
  });
  ids.clearResumeBtn?.addEventListener("click", clearForm);
  ids.downloadPdfBtn?.addEventListener("click", downloadPDF);
  ids.printResumeBtn?.addEventListener("click", printResume);
  ids.exportJsonBtn?.addEventListener("click", exportJSON);

  // import json
  ids.importJsonInput?.addEventListener("change", importJSON);

  // tabs
  document.querySelectorAll(".section-tab").forEach((btn) => {
    btn.addEventListener("click", () => setActiveTab(btn.dataset.tab));
  });

  // template switch
  document.querySelectorAll(".template-card").forEach((card) => {
    card.addEventListener("click", () => switchTemplate(card.dataset.template));
  });

  // visibility toggles
  document.querySelectorAll(".section-visibility-toggle").forEach((toggle) => {
    toggle.addEventListener("change", () => {
      state.visibility[toggle.dataset.section] = toggle.checked;
      saveToLocalStorage();
      updatePreview();
    });
  });

  // theme
  ids.themeSwitch?.addEventListener("change", () => {
    state.theme = ids.themeSwitch.checked ? "dark" : "light";
    applyTheme();
    syncThemeUI();
    saveToLocalStorage();
  });

  // photo
  ids.photoInput?.addEventListener("change", handlePhotoUpload);

  // live input changes
  document.addEventListener("input", handleInputChange);
  document.addEventListener("change", handleChangeEvents);

  // dynamic button clicks (add/remove)
  document.addEventListener("click", handleClickEvents);
}

/* =========================================================
   Helpers
   ========================================================= */
function escapeHTML(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeUrl(url = "") {
  const val = (url || "").trim();
  if (!val) return "";
  if (/^https?:\/\//i.test(val)) return val;
  return `https://${val}`;
}

function splitCommaValues(str = "") {
  return (str || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim());
}

function isValidPhone(phone = "") {
  const digits = (phone || "").replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

function showToast(message = "Saved successfully") {
  const toastMessage = document.getElementById("toastMessage");
  if (toastMessage) toastMessage.textContent = message;

  if (window.bootstrap && ids.toastEl) {
    if (!toastInstance) {
      toastInstance = new bootstrap.Toast(ids.toastEl, { delay: 2500 });
    }
    toastInstance.show();
  } else {
    alert(message);
  }
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/* =========================================================
   Theme
   ========================================================= */
function applyTheme() {
  document.documentElement.setAttribute(
    "data-theme",
    state.theme === "dark" ? "dark" : "light"
  );
}

function syncThemeUI() {
  if (ids.themeSwitch) ids.themeSwitch.checked = state.theme === "dark";
  if (ids.themeLabel) {
    ids.themeLabel.textContent = state.theme === "dark" ? "Dark Mode" : "Light Mode";
  }
}

/* =========================================================
   Tabs
   ========================================================= */
function setActiveTab(tabName) {
  state.activeTab = tabName;

  document.querySelectorAll(".section-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabName);
  });

  document.querySelectorAll(".editor-pane").forEach((pane) => {
    pane.classList.toggle("active", pane.dataset.pane === tabName);
  });

  saveToLocalStorage();
}

/* =========================================================
   Data object creators
   ========================================================= */
function createEducation(data = {}) {
  return {
    degree: data.degree || "",
    college: data.college || "",
    duration: data.duration || "",
    score: data.score || "",
  };
}

function createProject(data = {}) {
  return {
    title: data.title || "",
    stack: data.stack || "",
    description: data.description || "",
    link: data.link || "",
  };
}

function createExperience(data = {}) {
  return {
    company: data.company || "",
    role: data.role || "",
    duration: data.duration || "",
    description: data.description || "",
  };
}

function createCertification(data = {}) {
  return {
    name: data.name || "",
    platform: data.platform || "",
    year: data.year || "",
  };
}

function createAchievement(data = {}) {
  return {
    text: data.text || "",
  };
}

function createLanguage(data = {}) {
  return {
    text: data.text || "",
  };
}

function ensureMinimumBlocks() {
  if (!state.data.education.length) state.data.education = [createEducation()];
  if (!state.data.projects.length) state.data.projects = [createProject()];
  if (!state.data.experience.length) state.data.experience = [createExperience()];
  if (!state.data.certifications.length) state.data.certifications = [createCertification()];
  if (!state.data.achievements.length) state.data.achievements = [createAchievement()];
  if (!state.data.languages.length) state.data.languages = [createLanguage()];
}

/* =========================================================
   Input handlers
   ========================================================= */
function handleInputChange(e) {
  const target = e.target;
  if (!target) return;

  if (target.id === "summary") updateSummaryCounter();

  if (target.classList.contains("project-description")) {
    const wrap = target.closest(".dynamic-card");
    const counter = wrap?.querySelector(".project-char-counter");
    if (counter) counter.textContent = `${target.value.length}/${MAX_PROJECT_DESC}`;
  }

  if (target.classList.contains("experience-description")) {
    const wrap = target.closest(".dynamic-card");
    const counter = wrap?.querySelector(".experience-char-counter");
    if (counter) counter.textContent = `${target.value.length}/${MAX_EXPERIENCE_DESC}`;
  }

  collectFormData();
  validateField(target);
  updatePreview();
  updateCompletionProgress();
  updateATSScore();
  saveToLocalStorage();
}

function handleChangeEvents(e) {
  const target = e.target;
  if (!target) return;

  collectFormData();
  updatePreview();
  updateCompletionProgress();
  updateATSScore();
  saveToLocalStorage();
}

function handleClickEvents(e) {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;
  const index = Number(btn.dataset.index);

  switch (action) {
    case "add-education":
      addEducationField();
      break;
    case "remove-education":
      removeDynamicItem("education", index);
      break;

    case "add-project":
      addProjectField();
      break;
    case "remove-project":
      removeDynamicItem("projects", index);
      break;

    case "add-experience":
      addExperienceField();
      break;
    case "remove-experience":
      removeDynamicItem("experience", index);
      break;

    case "add-certification":
      addCertificationField();
      break;
    case "remove-certification":
      removeDynamicItem("certifications", index);
      break;

    case "add-achievement":
      addAchievementField();
      break;
    case "remove-achievement":
      removeDynamicItem("achievements", index);
      break;

    case "add-language":
      addLanguageField();
      break;
    case "remove-language":
      removeDynamicItem("languages", index);
      break;
  }
}

/* =========================================================
   Dynamic section add/remove
   ========================================================= */
function addEducationField(data = {}) {
  state.data.education.push(createEducation(data));
  renderEducationFields();
  saveToLocalStorage();
}

function addProjectField(data = {}) {
  state.data.projects.push(createProject(data));
  renderProjectFields();
  saveToLocalStorage();
}

function addExperienceField(data = {}) {
  state.data.experience.push(createExperience(data));
  renderExperienceFields();
  saveToLocalStorage();
}

function addCertificationField(data = {}) {
  state.data.certifications.push(createCertification(data));
  renderCertificationFields();
  saveToLocalStorage();
}

function addAchievementField(data = {}) {
  state.data.achievements.push(createAchievement(data));
  renderAchievementFields();
  saveToLocalStorage();
}

function addLanguageField(data = {}) {
  state.data.languages.push(createLanguage(data));
  renderLanguageFields();
  saveToLocalStorage();
}

function removeDynamicItem(type, index) {
  if (!Array.isArray(state.data[type])) return;

  if (state.data[type].length <= 1) {
    switch (type) {
      case "education":
        state.data[type] = [createEducation()];
        break;
      case "projects":
        state.data[type] = [createProject()];
        break;
      case "experience":
        state.data[type] = [createExperience()];
        break;
      case "certifications":
        state.data[type] = [createCertification()];
        break;
      case "achievements":
        state.data[type] = [createAchievement()];
        break;
      case "languages":
        state.data[type] = [createLanguage()];
        break;
    }
  } else {
    state.data[type].splice(index, 1);
  }

  renderDynamicSections();
  updatePreview();
  updateCompletionProgress();
  updateATSScore();
  saveToLocalStorage();
}

/* =========================================================
   Render dynamic forms
   ========================================================= */
function renderDynamicSections() {
  renderEducationFields();
  renderProjectFields();
  renderExperienceFields();
  renderCertificationFields();
  renderAchievementFields();
  renderLanguageFields();
}

function renderEducationFields() {
  if (!ids.educationContainer) return;

  ids.educationContainer.innerHTML = state.data.education
    .map(
      (item, index) => `
      <div class="dynamic-card">
        <div class="dynamic-card-head">
          <div class="dynamic-card-title">Education ${index + 1}</div>
          <button type="button" class="icon-btn" data-action="remove-education" data-index="${index}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
        <div class="dynamic-card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Degree</label>
              <input type="text" class="form-control education-degree" data-index="${index}" value="${escapeHTML(item.degree)}" placeholder="Master of Computer Applications (MCA)">
            </div>
            <div class="col-md-6">
              <label class="form-label">College / University</label>
              <input type="text" class="form-control education-college" data-index="${index}" value="${escapeHTML(item.college)}" placeholder="College name">
            </div>
            <div class="col-md-6">
              <label class="form-label">Year / Duration</label>
              <input type="text" class="form-control education-duration" data-index="${index}" value="${escapeHTML(item.duration)}" placeholder="2024 - 2026">
            </div>
            <div class="col-md-6">
              <label class="form-label">CGPA / Percentage</label>
              <input type="text" class="form-control education-score" data-index="${index}" value="${escapeHTML(item.score)}" placeholder="8.5 CGPA / 78%">
            </div>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

function renderProjectFields() {
  if (!ids.projectsContainer) return;

  ids.projectsContainer.innerHTML = state.data.projects
    .map(
      (item, index) => `
      <div class="dynamic-card">
        <div class="dynamic-card-head">
          <div class="dynamic-card-title">Project ${index + 1}</div>
          <button type="button" class="icon-btn" data-action="remove-project" data-index="${index}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
        <div class="dynamic-card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Project Title</label>
              <input type="text" class="form-control project-title" data-index="${index}" value="${escapeHTML(item.title)}" placeholder="ResumeForge – Smart Resume Builder">
            </div>
            <div class="col-md-6">
              <label class="form-label">Tech Stack</label>
              <input type="text" class="form-control project-stack" data-index="${index}" value="${escapeHTML(item.stack)}" placeholder="HTML, CSS, JavaScript, Bootstrap">
            </div>
            <div class="col-12">
              <label class="form-label">Description</label>
              <textarea class="form-control project-description" data-index="${index}" maxlength="${MAX_PROJECT_DESC}" rows="4" placeholder="Describe the project, features, and impact...">${escapeHTML(item.description)}</textarea>
              <div class="field-meta">
                <span class="field-hint">Mention responsiveness, real features, and tools used.</span>
                <span class="char-counter project-char-counter">${(item.description || "").length}/${MAX_PROJECT_DESC}</span>
              </div>
            </div>
            <div class="col-12">
              <label class="form-label">GitHub / Demo Link</label>
              <input type="text" class="form-control project-link" data-index="${index}" value="${escapeHTML(item.link)}" placeholder="https://github.com/username/project">
            </div>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

function renderExperienceFields() {
  if (!ids.experienceContainer) return;

  ids.experienceContainer.innerHTML = state.data.experience
    .map(
      (item, index) => `
      <div class="dynamic-card">
        <div class="dynamic-card-head">
          <div class="dynamic-card-title">Experience ${index + 1}</div>
          <button type="button" class="icon-btn" data-action="remove-experience" data-index="${index}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
        <div class="dynamic-card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Company Name</label>
              <input type="text" class="form-control experience-company" data-index="${index}" value="${escapeHTML(item.company)}" placeholder="ABC Tech Solutions">
            </div>
            <div class="col-md-6">
              <label class="form-label">Role</label>
              <input type="text" class="form-control experience-role" data-index="${index}" value="${escapeHTML(item.role)}" placeholder="Frontend Developer Intern">
            </div>
            <div class="col-12">
              <label class="form-label">Duration</label>
              <input type="text" class="form-control experience-duration" data-index="${index}" value="${escapeHTML(item.duration)}" placeholder="Jan 2026 - Mar 2026">
            </div>
            <div class="col-12">
              <label class="form-label">Description</label>
              <textarea class="form-control experience-description" data-index="${index}" maxlength="${MAX_EXPERIENCE_DESC}" rows="4" placeholder="Worked on UI components, forms, responsiveness, bug fixes...">${escapeHTML(item.description)}</textarea>
              <div class="field-meta">
                <span class="field-hint">Use words like built, improved, optimized, collaborated.</span>
                <span class="char-counter experience-char-counter">${(item.description || "").length}/${MAX_EXPERIENCE_DESC}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

function renderCertificationFields() {
  if (!ids.certificationsContainer) return;

  ids.certificationsContainer.innerHTML = state.data.certifications
    .map(
      (item, index) => `
      <div class="dynamic-card">
        <div class="dynamic-card-head">
          <div class="dynamic-card-title">Certification ${index + 1}</div>
          <button type="button" class="icon-btn" data-action="remove-certification" data-index="${index}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
        <div class="dynamic-card-body">
          <div class="row g-3">
            <div class="col-md-5">
              <label class="form-label">Certification Name</label>
              <input type="text" class="form-control certification-name" data-index="${index}" value="${escapeHTML(item.name)}" placeholder="Responsive Web Design">
            </div>
            <div class="col-md-5">
              <label class="form-label">Platform / Institute</label>
              <input type="text" class="form-control certification-platform" data-index="${index}" value="${escapeHTML(item.platform)}" placeholder="freeCodeCamp / Coursera / NPTEL">
            </div>
            <div class="col-md-2">
              <label class="form-label">Year</label>
              <input type="text" class="form-control certification-year" data-index="${index}" value="${escapeHTML(item.year)}" placeholder="2026">
            </div>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

function renderAchievementFields() {
  if (!ids.achievementsContainer) return;

  ids.achievementsContainer.innerHTML = state.data.achievements
    .map(
      (item, index) => `
      <div class="dynamic-card">
        <div class="dynamic-card-head">
          <div class="dynamic-card-title">Achievement ${index + 1}</div>
          <button type="button" class="icon-btn" data-action="remove-achievement" data-index="${index}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
        <div class="dynamic-card-body">
          <label class="form-label">Achievement / Extra Activity</label>
          <textarea class="form-control achievement-text" data-index="${index}" rows="3" placeholder="Won 2nd prize in web development competition / Solved 150+ coding problems">${escapeHTML(item.text)}</textarea>
        </div>
      </div>
    `
    )
    .join("");
}

function renderLanguageFields() {
  if (!ids.languagesContainer) return;

  ids.languagesContainer.innerHTML = state.data.languages
    .map(
      (item, index) => `
      <div class="dynamic-card">
        <div class="dynamic-card-head">
          <div class="dynamic-card-title">Language ${index + 1}</div>
          <button type="button" class="icon-btn" data-action="remove-language" data-index="${index}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
        <div class="dynamic-card-body">
          <label class="form-label">Language</label>
          <input type="text" class="form-control language-text" data-index="${index}" value="${escapeHTML(item.text)}" placeholder="English / Hindi / Marathi">
        </div>
      </div>
    `
    )
    .join("");
}

/* =========================================================
   Populate / collect form
   ========================================================= */
function populateForm() {
  const p = state.data.personal;

  if (ids.fullName) ids.fullName.value = p.fullName || "";
  if (ids.role) ids.role.value = p.role || "";
  if (ids.email) ids.email.value = p.email || "";
  if (ids.phone) ids.phone.value = p.phone || "";
  if (ids.address) ids.address.value = p.address || "";
  if (ids.linkedin) ids.linkedin.value = p.linkedin || "";
  if (ids.github) ids.github.value = p.github || "";
  if (ids.portfolio) ids.portfolio.value = p.portfolio || "";
  if (ids.summary) ids.summary.value = p.summary || "";

  if (ids.technicalSkills) ids.technicalSkills.value = state.data.skills.technical || "";
  if (ids.softSkills) ids.softSkills.value = state.data.skills.soft || "";

  renderDynamicSections();
  updateSummaryCounter();
}

function collectFormData() {
  // personal
  state.data.personal.fullName = ids.fullName?.value.trim() || "";
  state.data.personal.role = ids.role?.value.trim() || "";
  state.data.personal.email = ids.email?.value.trim() || "";
  state.data.personal.phone = ids.phone?.value.trim() || "";
  state.data.personal.address = ids.address?.value.trim() || "";
  state.data.personal.linkedin = ids.linkedin?.value.trim() || "";
  state.data.personal.github = ids.github?.value.trim() || "";
  state.data.personal.portfolio = ids.portfolio?.value.trim() || "";
  state.data.personal.summary = ids.summary?.value.trim() || "";

  // skills
  state.data.skills.technical = ids.technicalSkills?.value.trim() || "";
  state.data.skills.soft = ids.softSkills?.value.trim() || "";

  // education
  state.data.education = [...document.querySelectorAll(".education-degree")].map((el, i) => ({
    degree: el.value.trim(),
    college: document.querySelector(`.education-college[data-index="${i}"]`)?.value.trim() || "",
    duration: document.querySelector(`.education-duration[data-index="${i}"]`)?.value.trim() || "",
    score: document.querySelector(`.education-score[data-index="${i}"]`)?.value.trim() || "",
  }));

  // projects
  state.data.projects = [...document.querySelectorAll(".project-title")].map((el, i) => ({
    title: el.value.trim(),
    stack: document.querySelector(`.project-stack[data-index="${i}"]`)?.value.trim() || "",
    description: document.querySelector(`.project-description[data-index="${i}"]`)?.value.trim() || "",
    link: document.querySelector(`.project-link[data-index="${i}"]`)?.value.trim() || "",
  }));

  // experience
  state.data.experience = [...document.querySelectorAll(".experience-company")].map((el, i) => ({
    company: el.value.trim(),
    role: document.querySelector(`.experience-role[data-index="${i}"]`)?.value.trim() || "",
    duration: document.querySelector(`.experience-duration[data-index="${i}"]`)?.value.trim() || "",
    description: document.querySelector(`.experience-description[data-index="${i}"]`)?.value.trim() || "",
  }));

  // certifications
  state.data.certifications = [...document.querySelectorAll(".certification-name")].map((el, i) => ({
    name: el.value.trim(),
    platform: document.querySelector(`.certification-platform[data-index="${i}"]`)?.value.trim() || "",
    year: document.querySelector(`.certification-year[data-index="${i}"]`)?.value.trim() || "",
  }));

  // achievements
  state.data.achievements = [...document.querySelectorAll(".achievement-text")].map((el) => ({
    text: el.value.trim(),
  }));

  // languages
  state.data.languages = [...document.querySelectorAll(".language-text")].map((el) => ({
    text: el.value.trim(),
  }));
}

/* =========================================================
   Validation
   ========================================================= */
function validateField(field) {
  if (!field) return true;

  field.classList.remove("is-invalid");

  if (field.id === "fullName" && !field.value.trim()) {
    field.classList.add("is-invalid");
    return false;
  }

  if (field.id === "email" && field.value.trim() && !isValidEmail(field.value.trim())) {
    field.classList.add("is-invalid");
    return false;
  }

  if (field.id === "phone" && field.value.trim() && !isValidPhone(field.value.trim())) {
    field.classList.add("is-invalid");
    return false;
  }

  return true;
}

function validateForm() {
  let valid = true;

  if (!ids.fullName?.value.trim()) {
    ids.fullName?.classList.add("is-invalid");
    valid = false;
  } else {
    ids.fullName?.classList.remove("is-invalid");
  }

  if (ids.email?.value.trim() && !isValidEmail(ids.email.value.trim())) {
    ids.email.classList.add("is-invalid");
    valid = false;
  } else {
    ids.email?.classList.remove("is-invalid");
  }

  if (ids.phone?.value.trim() && !isValidPhone(ids.phone.value.trim())) {
    ids.phone.classList.add("is-invalid");
    valid = false;
  } else {
    ids.phone?.classList.remove("is-invalid");
  }

  return valid;
}

/* =========================================================
   Summary counter
   ========================================================= */
function updateSummaryCounter() {
  if (!ids.summary || !ids.summaryCounter) return;
  ids.summaryCounter.textContent = `${ids.summary.value.length}/${MAX_SUMMARY}`;
}

/* =========================================================
   Local Storage
   ========================================================= */
function saveToLocalStorage(showSavedToast = false) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (showSavedToast) showToast("Resume saved successfully");
  } catch (err) {
    console.error("LocalStorage save error:", err);
  }
}

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    if (!parsed) return;

    state.template = parsed.template || DEFAULT_TEMPLATE;
    state.theme = parsed.theme || "light";
    state.activeTab = parsed.activeTab || "personal";
    state.photo = parsed.photo || "";
    state.visibility = { ...state.visibility, ...(parsed.visibility || {}) };

    if (parsed.data) {
      state.data.personal = { ...state.data.personal, ...(parsed.data.personal || {}) };
      state.data.skills = { ...state.data.skills, ...(parsed.data.skills || {}) };
      state.data.education = Array.isArray(parsed.data.education) ? parsed.data.education : [];
      state.data.projects = Array.isArray(parsed.data.projects) ? parsed.data.projects : [];
      state.data.experience = Array.isArray(parsed.data.experience) ? parsed.data.experience : [];
      state.data.certifications = Array.isArray(parsed.data.certifications) ? parsed.data.certifications : [];
      state.data.achievements = Array.isArray(parsed.data.achievements) ? parsed.data.achievements : [];
      state.data.languages = Array.isArray(parsed.data.languages) ? parsed.data.languages : [];
    }
  } catch (err) {
    console.error("LocalStorage load error:", err);
  }
}

function clearForm() {
  const ok = confirm("Are you sure you want to clear the entire resume?");
  if (!ok) return;

  localStorage.removeItem(STORAGE_KEY);

  state.template = DEFAULT_TEMPLATE;
  state.theme = "light";
  state.activeTab = "personal";
  state.photo = "";
  state.visibility = {
    skills: true,
    projects: true,
    experience: true,
    certifications: true,
    achievements: true,
    languages: true,
  };
  state.data = {
    personal: {
      fullName: "",
      role: "",
      email: "",
      phone: "",
      address: "",
      linkedin: "",
      github: "",
      portfolio: "",
      summary: "",
    },
    skills: {
      technical: "",
      soft: "",
    },
    education: [createEducation()],
    projects: [createProject()],
    experience: [createExperience()],
    certifications: [createCertification()],
    achievements: [createAchievement()],
    languages: [createLanguage()],
  };

  populateForm();
  renderDynamicSections();
  applyTheme();
  syncThemeUI();
  syncVisibilityUI();
  switchTemplate(DEFAULT_TEMPLATE, false);
  setActiveTab("personal");
  updatePreview();
  updateCompletionProgress();
  updateATSScore();

  if (ids.photoInput) ids.photoInput.value = "";
  showToast("Resume cleared");
}

/* =========================================================
   Sample Data
   ========================================================= */
function fillSampleData() {
  state.template = "modern";
  state.theme = "light";
  state.photo = "";

  state.visibility = {
    skills: true,
    projects: true,
    experience: true,
    certifications: true,
    achievements: true,
    languages: true,
  };

  state.data.personal = {
    fullName: "Aman Patil",
    role: "MCA Student • Aspiring Frontend / Web Developer",
    email: "amanpatil.dev@gmail.com",
    phone: "+91 9876543210",
    address: "Pune, Maharashtra, India",
    linkedin: "linkedin.com/in/amanpatil-dev",
    github: "github.com/amanpatil-dev",
    portfolio: "amanpatil-portfolio.netlify.app",
    summary:
      "MCA student and aspiring web developer with hands-on experience building responsive web applications using HTML, CSS, JavaScript, Bootstrap, Tailwind CSS, and MySQL. Passionate about creating clean interfaces, ATS-friendly tools, and practical projects with real-world usability.",
  };

  state.data.skills = {
    technical:
      "HTML5, CSS3, JavaScript, Bootstrap 5, Tailwind CSS, Responsive Design, DOM Manipulation, LocalStorage, JSON, MySQL, Git, GitHub, ASP.NET, C#, SQL Server",
    soft:
      "Problem Solving, Communication, Teamwork, Time Management, Quick Learning, Attention to Detail",
  };

  state.data.education = [
    {
      degree: "Master of Computer Applications (MCA)",
      college: "Savitribai Phule Pune University",
      duration: "2024 - 2026",
      score: "8.6 CGPA",
    },
    {
      degree: "Bachelor of Computer Applications (BCA)",
      college: "XYZ College of Computer Science",
      duration: "2021 - 2024",
      score: "79%",
    },
  ];

  state.data.projects = [
    {
      title: "ResumeForge – Smart Resume Builder",
      stack: "HTML, CSS, JavaScript, Bootstrap, LocalStorage, html2pdf.js",
      description:
        "Built a premium resume builder with live preview, ATS score, multiple templates, section visibility controls, JSON import/export, dark mode, and polished PDF export.",
      link: "github.com/amanpatil-dev/resumeforge",
    },
    {
      title: "Laptop Shop Management System",
      stack: "ASP.NET, C#, SQL Server, Crystal Reports",
      description:
        "Developed a laptop shop management system with product listing, customer orders, cart, billing, wishlist, and Crystal Report based receipt generation.",
      link: "github.com/amanpatil-dev/laptop-shop-system",
    },
    {
      title: "Expense Tracker Dashboard",
      stack: "HTML, Bootstrap, JavaScript, Chart.js, LocalStorage",
      description:
        "Created a responsive expense tracker dashboard with monthly analytics, charts, income-expense categorization, and persistent browser storage.",
      link: "github.com/amanpatil-dev/expense-tracker",
    },
  ];

  state.data.experience = [
    {
      company: "ABC Web Solutions",
      role: "Frontend Developer Intern",
      duration: "Jan 2026 - Mar 2026",
      description:
        "Worked on responsive UI pages, reusable Bootstrap components, form validation, bug fixing, and improved user experience across mobile and desktop layouts.",
    },
  ];

  state.data.certifications = [
    {
      name: "Responsive Web Design",
      platform: "freeCodeCamp",
      year: "2025",
    },
    {
      name: "JavaScript Essentials",
      platform: "Coursera",
      year: "2025",
    },
    {
      name: "Cloud Computing",
      platform: "NPTEL",
      year: "2026",
    },
  ];

  state.data.achievements = [
    { text: "Built 5+ academic and portfolio web projects including resume builder, dashboard tools, and management systems." },
    { text: "Solved 150+ aptitude and programming questions while preparing for technical and government exams." },
    { text: "Actively maintain GitHub portfolio with clean project documentation and screenshots." },
  ];

  state.data.languages = [
    { text: "English" },
    { text: "Hindi" },
    { text: "Marathi" },
  ];

  populateForm();
  renderDynamicSections();
  applyTheme();
  syncThemeUI();
  syncVisibilityUI();
  switchTemplate("modern", false);
  updatePreview();
  updateCompletionProgress();
  updateATSScore();
  saveToLocalStorage();
  showToast("Sample data loaded successfully");
}

/* =========================================================
   Photo Upload
   ========================================================= */
function handlePhotoUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    state.photo = e.target.result;
    updatePreview();
    saveToLocalStorage();
  };
  reader.readAsDataURL(file);
}

/* =========================================================
   Template / Visibility sync
   ========================================================= */
function switchTemplate(templateName, shouldSave = true) {
  state.template = templateName || DEFAULT_TEMPLATE;
  syncTemplateUI();
  updatePreview();
  if (shouldSave) saveToLocalStorage();
}

function syncTemplateUI() {
  document.querySelectorAll(".template-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.template === state.template);
  });
}

function syncVisibilityUI() {
  document.querySelectorAll(".section-visibility-toggle").forEach((toggle) => {
    toggle.checked = !!state.visibility[toggle.dataset.section];
  });
}

/* =========================================================
   Completion progress
   ========================================================= */
function updateCompletionProgress() {
  collectFormData();

  const checks = [
    !!state.data.personal.fullName,
    !!state.data.personal.role,
    isValidEmail(state.data.personal.email),
    isValidPhone(state.data.personal.phone),
    !!state.data.personal.summary,
    hasFilledItems(state.data.education, ["degree", "college"]),
    !!state.data.skills.technical,
    hasFilledItems(state.data.projects, ["title", "description"]),
    hasFilledItems(state.data.experience, ["company", "role", "description"]),
    hasFilledItems(state.data.certifications, ["name"]),
    hasTextItems(state.data.achievements),
    hasTextItems(state.data.languages),
    !!state.data.personal.github || !!state.data.personal.linkedin || !!state.data.personal.portfolio,
  ];

  const filled = checks.filter(Boolean).length;
  const percent = Math.round((filled / checks.length) * 100);

  if (ids.completionBar) ids.completionBar.style.width = `${percent}%`;
  if (ids.completionText) ids.completionText.textContent = `${percent}%`;
}

function hasFilledItems(arr = [], keys = []) {
  return arr.some((item) => keys.every((k) => (item[k] || "").trim()));
}

function hasTextItems(arr = []) {
  return arr.some((item) => (item.text || "").trim());
}

/* =========================================================
   ATS Score
   ========================================================= */
function updateATSScore() {
  collectFormData();

  let score = 0;
  const suggestions = [];

  if (state.data.personal.fullName) score += 8;
  else suggestions.push("Add your full name clearly.");

  if (state.data.personal.role) score += 6;
  else suggestions.push("Add a role like Frontend Developer / MCA Student.");

  if (isValidEmail(state.data.personal.email)) score += 6;
  else suggestions.push("Use a valid professional email.");

  if (isValidPhone(state.data.personal.phone)) score += 5;
  else suggestions.push("Add a valid phone number.");

  if (state.data.personal.summary && state.data.personal.summary.length >= 80) score += 10;
  else suggestions.push("Write a stronger 2–3 line professional summary.");

  let links = 0;
  if (state.data.personal.github) links++;
  if (state.data.personal.linkedin) links++;
  if (state.data.personal.portfolio) links++;
  score += Math.min(links * 3, 9);
  if (links < 2) suggestions.push("Add GitHub / LinkedIn / Portfolio links.");

  if (hasFilledItems(state.data.education, ["degree", "college"])) score += 10;
  else suggestions.push("Add at least one education entry.");

  const techSkills = splitCommaValues(state.data.skills.technical);
  if (techSkills.length >= 5) score += 12;
  else suggestions.push("Add 5+ technical skills.");

  if (splitCommaValues(state.data.skills.soft).length >= 3) score += 4;

  const validProjects = state.data.projects.filter(
    (p) => p.title && p.description && p.stack
  );
  if (validProjects.length >= 2) score += 14;
  else suggestions.push("Add 2–3 strong projects with stack and features.");

  if (state.data.projects.some((p) => p.link)) score += 4;
  else suggestions.push("Include GitHub/demo links for projects.");

  if (hasFilledItems(state.data.experience, ["company", "role", "description"])) score += 8;
  else suggestions.push("Add internship or project experience.");

  if (hasFilledItems(state.data.certifications, ["name"])) score += 4;
  else suggestions.push("Add at least one certification.");

  if (hasTextItems(state.data.achievements)) score += 4;
  else suggestions.push("Add achievements or extra activities.");

  if (hasTextItems(state.data.languages)) score += 2;

  const keywordPool = [
    "html",
    "css",
    "javascript",
    "bootstrap",
    "tailwind",
    "responsive",
    "frontend",
    "web",
    "mysql",
    "git",
    "github",
  ];
  const combined = JSON.stringify(state.data).toLowerCase();
  const matches = keywordPool.filter((k) => combined.includes(k)).length;
  score += Math.min(matches, 8);

  score = Math.min(score, 100);

  if (ids.atsRing) {
    ids.atsRing.style.setProperty("--score", `${(score / 100) * 360}deg`);
  }
  if (ids.atsScoreText) ids.atsScoreText.textContent = score;
  if (ids.atsGrade) ids.atsGrade.textContent = getATSGrade(score);
  if (ids.atsHint) ids.atsHint.textContent = getATSHint(score);

  if (ids.atsSuggestions) {
    ids.atsSuggestions.innerHTML = suggestions.length
      ? suggestions.map((s) => `<li>${escapeHTML(s)}</li>`).join("")
      : `<li>Excellent ATS-ready resume structure. Tailor keywords per job description for even better results.</li>`;
  }
}

function getATSGrade(score) {
  if (score >= 85) return "Excellent ATS Readiness";
  if (score >= 70) return "Strong Resume Score";
  if (score >= 55) return "Good Base, Needs Improvement";
  return "Needs More Resume Details";
}

function getATSHint(score) {
  if (score >= 85) return "Strong resume structure with good keyword coverage.";
  if (score >= 70) return "Good profile. Add more quantified project and experience points.";
  if (score >= 55) return "You have a decent start. Complete more sections for better ATS compatibility.";
  return "Start with personal details, summary, skills, education, and projects.";
}

/* =========================================================
   Preview rendering
   ========================================================= */
function updatePreview() {
  collectFormData();

  const hasAnyContent =
    state.data.personal.fullName ||
    state.data.personal.role ||
    state.data.personal.summary ||
    hasFilledItems(state.data.education, ["degree"]) ||
    hasFilledItems(state.data.projects, ["title"]) ||
    hasFilledItems(state.data.experience, ["company"]) ||
    state.data.skills.technical ||
    state.data.skills.soft;

  if (!hasAnyContent) {
    ids.resumePreview.innerHTML = renderEmptyPreview();
    return;
  }

  let html = "";
  switch (state.template) {
    case "minimal":
      html = renderMinimalTemplate();
      break;
    case "corporate":
      html = renderCorporateTemplate();
      break;
    default:
      html = renderModernTemplate();
      break;
  }

  ids.resumePreview.innerHTML = html;
}

function renderEmptyPreview() {
  return `
    <div class="resume-page">
      <div class="resume-empty-state">
        <div>
          <div class="empty-state-icon">
            <i class="fa-solid fa-file-lines"></i>
          </div>
          <h3>Your resume preview will appear here</h3>
          <p>Fill your details, projects, skills, and education to generate a polished ATS-friendly resume preview instantly.</p>
        </div>
      </div>
    </div>
  `;
}

function getVisibleData() {
  const p = state.data.personal;
  const skillsTech = state.visibility.skills ? splitCommaValues(state.data.skills.technical) : [];
  const skillsSoft = state.visibility.skills ? splitCommaValues(state.data.skills.soft) : [];

  const education = state.data.education.filter((e) =>
    [e.degree, e.college, e.duration, e.score].some((v) => (v || "").trim())
  );

  const projects = state.visibility.projects
    ? state.data.projects.filter((x) =>
        [x.title, x.stack, x.description, x.link].some((v) => (v || "").trim())
      )
    : [];

  const experience = state.visibility.experience
    ? state.data.experience.filter((x) =>
        [x.company, x.role, x.duration, x.description].some((v) => (v || "").trim())
      )
    : [];

  const certifications = state.visibility.certifications
    ? state.data.certifications.filter((x) =>
        [x.name, x.platform, x.year].some((v) => (v || "").trim())
      )
    : [];

  const achievements = state.visibility.achievements
    ? state.data.achievements.filter((x) => (x.text || "").trim())
    : [];

  const languages = state.visibility.languages
    ? state.data.languages.filter((x) => (x.text || "").trim())
    : [];

  return {
    p,
    skillsTech,
    skillsSoft,
    education,
    projects,
    experience,
    certifications,
    achievements,
    languages,
  };
}

function renderSectionTitle(title) {
  return `<div class="rf-section-title">${escapeHTML(title)}</div>`;
}

/* =========================================================
   Template 1: Modern
   ========================================================= */
function renderModernTemplate() {
  const {
    p,
    skillsTech,
    skillsSoft,
    education,
    projects,
    experience,
    certifications,
    achievements,
    languages,
  } = getVisibleData();

  return `
    <div class="resume-page">
      <div class="rf-resume resume-modern">
        <aside class="rm-sidebar">
          ${state.photo ? `<img src="${state.photo}" class="rf-photo" alt="Profile Photo">` : ""}
          <div class="rm-name">${escapeHTML(p.fullName || "Your Name")}</div>
          <div class="rm-role">${escapeHTML(p.role || "Professional Role")}</div>

          ${renderSidebarContactBlock()}

          ${
            skillsTech.length
              ? `<section class="rf-resume-section">
                  ${renderSectionTitle("Technical Skills")}
                  <div class="rf-chip-wrap">${skillsTech.map((s) => `<span class="rf-chip">${escapeHTML(s)}</span>`).join("")}</div>
                </section>`
              : ""
          }

          ${
            skillsSoft.length
              ? `<section class="rf-resume-section">
                  ${renderSectionTitle("Soft Skills")}
                  <div class="rf-chip-wrap">${skillsSoft.map((s) => `<span class="rf-chip">${escapeHTML(s)}</span>`).join("")}</div>
                </section>`
              : ""
          }

          ${
            certifications.length
              ? `<section class="rf-resume-section">
                  ${renderSectionTitle("Certifications")}
                  ${certifications.map(renderCertificationItem).join("")}
                </section>`
              : ""
          }

          ${
            languages.length
              ? `<section class="rf-resume-section">
                  ${renderSectionTitle("Languages")}
                  <div class="rf-chip-wrap">${languages.map((l) => `<span class="rf-chip">${escapeHTML(l.text)}</span>`).join("")}</div>
                </section>`
              : ""
          }
        </aside>

        <main class="rm-main">
          ${
            p.summary
              ? `<section class="rf-resume-section">
                  ${renderSectionTitle("Professional Summary")}
                  <div class="rf-summary">${escapeHTML(p.summary)}</div>
                </section>`
              : ""
          }

          ${
            education.length
              ? `<section class="rf-resume-section">
                  ${renderSectionTitle("Education")}
                  ${education.map(renderEducationItem).join("")}
                </section>`
              : ""
          }

          ${
            projects.length
              ? `<section class="rf-resume-section">
                  ${renderSectionTitle("Projects")}
                  ${projects.map(renderProjectItem).join("")}
                </section>`
              : ""
          }

          ${
            experience.length
              ? `<section class="rf-resume-section">
                  ${renderSectionTitle("Experience")}
                  ${experience.map(renderExperienceItem).join("")}
                </section>`
              : ""
          }

          ${
            achievements.length
              ? `<section class="rf-resume-section">
                  ${renderSectionTitle("Achievements")}
                  <ul class="rf-bullet-list">${achievements.map((a) => `<li>${escapeHTML(a.text)}</li>`).join("")}</ul>
                </section>`
              : ""
          }
        </main>
      </div>
    </div>
  `;
}

function renderSidebarContactBlock() {
  const { p } = getVisibleData();
  const items = [];

  if (p.email) items.push(`<div class="rm-contact-item"><i class="fa-solid fa-envelope"></i><a class="rf-rs-link text-white" href="mailto:${escapeHTML(p.email)}">${escapeHTML(p.email)}</a></div>`);
  if (p.phone) items.push(`<div class="rm-contact-item"><i class="fa-solid fa-phone"></i><a class="rf-rs-link text-white" href="tel:${escapeHTML(p.phone)}">${escapeHTML(p.phone)}</a></div>`);
  if (p.address) items.push(`<div class="rm-contact-item"><i class="fa-solid fa-location-dot"></i><span>${escapeHTML(p.address)}</span></div>`);
  if (p.linkedin) items.push(`<div class="rm-contact-item"><i class="fa-brands fa-linkedin"></i><a class="rf-rs-link text-white" target="_blank" href="${escapeHTML(normalizeUrl(p.linkedin))}">${escapeHTML(p.linkedin)}</a></div>`);
  if (p.github) items.push(`<div class="rm-contact-item"><i class="fa-brands fa-github"></i><a class="rf-rs-link text-white" target="_blank" href="${escapeHTML(normalizeUrl(p.github))}">${escapeHTML(p.github)}</a></div>`);
  if (p.portfolio) items.push(`<div class="rm-contact-item"><i class="fa-solid fa-globe"></i><a class="rf-rs-link text-white" target="_blank" href="${escapeHTML(normalizeUrl(p.portfolio))}">${escapeHTML(p.portfolio)}</a></div>`);

  if (!items.length) return "";
  return `<section class="rf-resume-section">${renderSectionTitle("Contact")}<div class="rm-contact-list">${items.join("")}</div></section>`;
}

/* =========================================================
   Template 2: Minimal
   ========================================================= */
function renderMinimalTemplate() {
  const {
    p,
    skillsTech,
    skillsSoft,
    education,
    projects,
    experience,
    certifications,
    achievements,
    languages,
  } = getVisibleData();

  return `
    <div class="resume-page">
      <div class="rf-resume resume-minimal">
        <header class="rmin-header">
          <div>
            <div class="rmin-name">${escapeHTML(p.fullName || "Your Name")}</div>
            <div class="rmin-role">${escapeHTML(p.role || "Professional Role")}</div>
            <div class="rmin-links">${renderInlineContactMinimal()}</div>
          </div>
          ${state.photo ? `<img src="${state.photo}" class="rf-photo" alt="Profile Photo">` : ""}
        </header>

        ${
          p.summary
            ? `<section class="rf-resume-section">
                ${renderSectionTitle("Professional Summary")}
                <div class="rf-summary">${escapeHTML(p.summary)}</div>
              </section>`
            : ""
        }

        ${
          skillsTech.length || skillsSoft.length
            ? `<section class="rf-resume-section">
                ${renderSectionTitle("Skills")}
                ${
                  skillsTech.length
                    ? `<div class="mb-3"><div class="rf-item-subtitle mb-2">Technical</div><div class="rf-chip-wrap">${skillsTech.map((s) => `<span class="rf-chip resume-badge-soft">${escapeHTML(s)}</span>`).join("")}</div></div>`
                    : ""
                }
                ${
                  skillsSoft.length
                    ? `<div><div class="rf-item-subtitle mb-2">Soft Skills</div><div class="rf-chip-wrap">${skillsSoft.map((s) => `<span class="rf-chip resume-badge-dark">${escapeHTML(s)}</span>`).join("")}</div></div>`
                    : ""
                }
              </section>`
            : ""
        }

        ${
          education.length
            ? `<section class="rf-resume-section">
                ${renderSectionTitle("Education")}
                ${education.map(renderEducationItem).join("")}
              </section>`
            : ""
        }

        ${
          projects.length
            ? `<section class="rf-resume-section">
                ${renderSectionTitle("Projects")}
                ${projects.map(renderProjectItem).join("")}
              </section>`
            : ""
        }

        ${
          experience.length
            ? `<section class="rf-resume-section">
                ${renderSectionTitle("Experience")}
                ${experience.map(renderExperienceItem).join("")}
              </section>`
            : ""
        }

        ${
          certifications.length
            ? `<section class="rf-resume-section">
                ${renderSectionTitle("Certifications")}
                ${certifications.map(renderCertificationItem).join("")}
              </section>`
            : ""
        }

        ${
          achievements.length
            ? `<section class="rf-resume-section">
                ${renderSectionTitle("Achievements")}
                <ul class="rf-bullet-list">${achievements.map((a) => `<li>${escapeHTML(a.text)}</li>`).join("")}</ul>
              </section>`
            : ""
        }

        ${
          languages.length
            ? `<section class="rf-resume-section">
                ${renderSectionTitle("Languages")}
                <div class="rf-chip-wrap">${languages.map((l) => `<span class="rf-chip resume-badge-dark">${escapeHTML(l.text)}</span>`).join("")}</div>
              </section>`
            : ""
        }
      </div>
    </div>
  `;
}

function renderInlineContactMinimal() {
  const { p } = getVisibleData();
  const items = [];

  if (p.email) items.push(`<span><i class="fa-solid fa-envelope me-1"></i><a class="rf-rs-link" href="mailto:${escapeHTML(p.email)}">${escapeHTML(p.email)}</a></span>`);
  if (p.phone) items.push(`<span><i class="fa-solid fa-phone me-1"></i>${escapeHTML(p.phone)}</span>`);
  if (p.address) items.push(`<span><i class="fa-solid fa-location-dot me-1"></i>${escapeHTML(p.address)}</span>`);
  if (p.linkedin) items.push(`<span><i class="fa-brands fa-linkedin me-1"></i><a class="rf-rs-link" target="_blank" href="${escapeHTML(normalizeUrl(p.linkedin))}">LinkedIn</a></span>`);
  if (p.github) items.push(`<span><i class="fa-brands fa-github me-1"></i><a class="rf-rs-link" target="_blank" href="${escapeHTML(normalizeUrl(p.github))}">GitHub</a></span>`);
  if (p.portfolio) items.push(`<span><i class="fa-solid fa-globe me-1"></i><a class="rf-rs-link" target="_blank" href="${escapeHTML(normalizeUrl(p.portfolio))}">Portfolio</a></span>`);

  return items.join("");
}

/* =========================================================
   Template 3: Corporate
   ========================================================= */
function renderCorporateTemplate() {
  const {
    p,
    skillsTech,
    skillsSoft,
    education,
    projects,
    experience,
    certifications,
    achievements,
    languages,
  } = getVisibleData();

  return `
    <div class="resume-page">
      <div class="rf-resume resume-corporate">
        <div class="rc-topbar">
          <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap">
            <div>
              <div class="rc-name">${escapeHTML(p.fullName || "Your Name")}</div>
              <div class="rc-role">${escapeHTML(p.role || "Professional Role")}</div>
              <div class="rc-contact">${renderCorporateContactRow()}</div>
            </div>
            ${state.photo ? `<img src="${state.photo}" class="rf-photo" alt="Profile Photo">` : ""}
          </div>
        </div>

        <div class="rc-body">
          ${
            p.summary
              ? `<section class="rf-resume-section">
                  ${renderSectionTitle("Professional Summary")}
                  <div class="rf-summary">${escapeHTML(p.summary)}</div>
                </section>`
              : ""
          }

          <div class="rc-grid">
            <div>
              ${
                experience.length
                  ? `<section class="rf-resume-section">
                      ${renderSectionTitle("Experience")}
                      ${experience.map(renderExperienceItem).join("")}
                    </section>`
                  : ""
              }

              ${
                projects.length
                  ? `<section class="rf-resume-section">
                      ${renderSectionTitle("Projects")}
                      ${projects.map(renderProjectItem).join("")}
                    </section>`
                  : ""
              }

              ${
                education.length
                  ? `<section class="rf-resume-section">
                      ${renderSectionTitle("Education")}
                      ${education.map(renderEducationItem).join("")}
                    </section>`
                  : ""
              }

              ${
                achievements.length
                  ? `<section class="rf-resume-section">
                      ${renderSectionTitle("Achievements")}
                      <ul class="rf-bullet-list">${achievements.map((a) => `<li>${escapeHTML(a.text)}</li>`).join("")}</ul>
                    </section>`
                  : ""
              }
            </div>

            <aside class="d-flex flex-column gap-3">
              ${
                skillsTech.length || skillsSoft.length
                  ? `<div class="rc-sidebar-box">
                      ${renderSectionTitle("Skills")}
                      ${
                        skillsTech.length
                          ? `<div class="mb-3"><div class="rf-item-subtitle mb-2">Technical</div><div class="rf-chip-wrap">${skillsTech.map((s) => `<span class="rf-chip resume-badge-soft">${escapeHTML(s)}</span>`).join("")}</div></div>`
                          : ""
                      }
                      ${
                        skillsSoft.length
                          ? `<div><div class="rf-item-subtitle mb-2">Soft</div><div class="rf-chip-wrap">${skillsSoft.map((s) => `<span class="rf-chip resume-badge-dark">${escapeHTML(s)}</span>`).join("")}</div></div>`
                          : ""
                      }
                    </div>`
                  : ""
              }

              ${
                certifications.length
                  ? `<div class="rc-sidebar-box">
                      ${renderSectionTitle("Certifications")}
                      ${certifications.map(renderCertificationItem).join("")}
                    </div>`
                  : ""
              }

              ${
                languages.length
                  ? `<div class="rc-sidebar-box">
                      ${renderSectionTitle("Languages")}
                      <div class="rf-chip-wrap">${languages.map((l) => `<span class="rf-chip resume-badge-dark">${escapeHTML(l.text)}</span>`).join("")}</div>
                    </div>`
                  : ""
              }
            </aside>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCorporateContactRow() {
  const { p } = getVisibleData();
  const items = [];
  if (p.email) items.push(`<span><i class="fa-solid fa-envelope me-1"></i>${escapeHTML(p.email)}</span>`);
  if (p.phone) items.push(`<span><i class="fa-solid fa-phone me-1"></i>${escapeHTML(p.phone)}</span>`);
  if (p.address) items.push(`<span><i class="fa-solid fa-location-dot me-1"></i>${escapeHTML(p.address)}</span>`);
  if (p.linkedin) items.push(`<span><i class="fa-brands fa-linkedin me-1"></i><a class="rf-rs-link text-white" target="_blank" href="${escapeHTML(normalizeUrl(p.linkedin))}">LinkedIn</a></span>`);
  if (p.github) items.push(`<span><i class="fa-brands fa-github me-1"></i><a class="rf-rs-link text-white" target="_blank" href="${escapeHTML(normalizeUrl(p.github))}">GitHub</a></span>`);
  if (p.portfolio) items.push(`<span><i class="fa-solid fa-globe me-1"></i><a class="rf-rs-link text-white" target="_blank" href="${escapeHTML(normalizeUrl(p.portfolio))}">Portfolio</a></span>`);
  return items.join("");
}

/* =========================================================
   Shared renderers
   ========================================================= */
function renderEducationItem(item) {
  return `
    <div class="rf-item">
      <div class="d-flex justify-content-between gap-3 flex-wrap">
        <div>
          <div class="rf-item-title">${escapeHTML(item.degree || "")}</div>
          ${item.college ? `<div class="rf-item-subtitle">${escapeHTML(item.college)}</div>` : ""}
        </div>
        <div class="text-end">
          ${item.duration ? `<div class="rf-item-meta">${escapeHTML(item.duration)}</div>` : ""}
          ${item.score ? `<div class="rf-item-meta">${escapeHTML(item.score)}</div>` : ""}
        </div>
      </div>
    </div>
  `;
}

function renderProjectItem(item) {
  return `
    <div class="rf-item">
      <div class="d-flex justify-content-between gap-3 flex-wrap">
        <div>
          <div class="rf-item-title">${escapeHTML(item.title || "")}</div>
          ${item.stack ? `<div class="rf-item-subtitle">${escapeHTML(item.stack)}</div>` : ""}
        </div>
        ${
          item.link
            ? `<div class="rf-item-meta">
                <a class="rf-rs-link" href="${escapeHTML(normalizeUrl(item.link))}" target="_blank" rel="noopener noreferrer">View Project</a>
              </div>`
            : ""
        }
      </div>
      ${item.description ? `<div class="rf-small mt-2">${escapeHTML(item.description)}</div>` : ""}
    </div>
  `;
}

function renderExperienceItem(item) {
  return `
    <div class="rf-item">
      <div class="d-flex justify-content-between gap-3 flex-wrap">
        <div>
          <div class="rf-item-title">${escapeHTML(item.role || "")}</div>
          ${item.company ? `<div class="rf-item-subtitle">${escapeHTML(item.company)}</div>` : ""}
        </div>
        ${item.duration ? `<div class="rf-item-meta">${escapeHTML(item.duration)}</div>` : ""}
      </div>
      ${item.description ? `<div class="rf-small mt-2">${escapeHTML(item.description)}</div>` : ""}
    </div>
  `;
}

function renderCertificationItem(item) {
  return `
    <div class="rf-item">
      <div class="rf-item-title">${escapeHTML(item.name || "")}</div>
      <div class="rf-small">${escapeHTML(item.platform || "")}${item.year ? ` • ${escapeHTML(item.year)}` : ""}</div>
    </div>
  `;
}

/* =========================================================
   JSON export / import
   ========================================================= */
function exportJSON() {
  collectFormData();

  const payload = {
    app: "ResumeForge v4",
    exportedAt: new Date().toISOString(),
    template: state.template,
    theme: state.theme,
    photo: state.photo,
    visibility: state.visibility,
    data: state.data,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeName = (state.data.personal.fullName || "resume").replace(/\s+/g, "_");
  a.href = url;
  a.download = `${safeName}_ResumeForge_Data.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  showToast("JSON exported successfully");
}

function importJSON(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed.data) {
        alert("Invalid ResumeForge JSON file.");
        return;
      }

      state.template = parsed.template || DEFAULT_TEMPLATE;
      state.theme = parsed.theme || "light";
      state.photo = parsed.photo || "";
      state.visibility = { ...state.visibility, ...(parsed.visibility || {}) };

      state.data.personal = { ...state.data.personal, ...(parsed.data.personal || {}) };
      state.data.skills = { ...state.data.skills, ...(parsed.data.skills || {}) };
      state.data.education = Array.isArray(parsed.data.education)
        ? parsed.data.education
        : [createEducation()];
      state.data.projects = Array.isArray(parsed.data.projects)
        ? parsed.data.projects
        : [createProject()];
      state.data.experience = Array.isArray(parsed.data.experience)
        ? parsed.data.experience
        : [createExperience()];
      state.data.certifications = Array.isArray(parsed.data.certifications)
        ? parsed.data.certifications
        : [createCertification()];
      state.data.achievements = Array.isArray(parsed.data.achievements)
        ? parsed.data.achievements
        : [createAchievement()];
      state.data.languages = Array.isArray(parsed.data.languages)
        ? parsed.data.languages
        : [createLanguage()];

      ensureMinimumBlocks();
      applyTheme();
      populateForm();
      syncVisibilityUI();
      switchTemplate(state.template, false);
      updatePreview();
      updateCompletionProgress();
      updateATSScore();
      saveToLocalStorage();

      showToast("JSON imported successfully");
    } catch (err) {
      console.error(err);
      alert("Could not import JSON. Please select a valid ResumeForge export file.");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

/* =========================================================
   PDF + Print
   ========================================================= */
function downloadPDF() {
  if (!validateForm()) {
    alert("Please fix the highlighted fields before downloading the resume.");
    return;
  }

  const element = document.querySelector("#resumePreview .resume-page");
  if (!element) {
    alert("Please fill some resume details first.");
    return;
  }

  const fileNameBase =
    (state.data.personal.fullName || "Resume").trim().replace(/\s+/g, "_") || "Resume";

  const opt = {
    margin: [0, 0, 0, 0],
    filename: `${fileNameBase}_Resume.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollY: 0,
    },
    jsPDF: {
      unit: "pt",
      format: "a4",
      orientation: "portrait",
    },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  if (window.html2pdf) {
    html2pdf().set(opt).from(element).save();
  } else {
    alert("html2pdf library not found.");
  }
}

function printResume() {
  if (!validateForm()) {
    alert("Please fix the highlighted fields before printing the resume.");
    return;
  }
  window.print();
}