'use strict';
// Yachtmaster Theory Prep for Windows: port of the SwiftUI iOS app.
// Hard paywall: content is gated until the user owns a Microsoft Store add-on
// (monthly / yearly subscription or lifetime durable), checked via the Digital Goods API.

// MARK: - Config

const APP_VERSION = '1.0.0';
const BILLING = 'https://store.microsoft.com/billing';
// Partner Center add-on Product IDs (InAppOfferToken). Must match Partner Center exactly.
const PRODUCTS = { monthly: 'ymtp_monthly', yearly: 'ymtp_yearly', lifetime: 'ymtp_lifetime' };
const PRODUCT_ORDER = [PRODUCTS.monthly, PRODUCTS.yearly, PRODUCTS.lifetime];
const LINKS = {
  base: 'https://joykhansayan1.github.io/yachtmaster-theory-prep-windows',
  get privacy() { return this.base + '/privacy.html'; },
  get terms() { return this.base + '/terms.html'; },
  get support() { return this.base + '/support.html'; },
  store: 'https://apps.microsoft.com/detail/9ND2K8KVQ64R',
  manageSubscriptions: 'https://account.microsoft.com/services',
  colregs: 'https://www.imo.org/en/About/Conventions/Pages/COLREG.aspx',
  supportEmail: 'dmjks120@gmail.com'
};
const EXAM = { count: 40, minutes: 60, pass: 28 };
EXAM.passPercent = Math.floor(EXAM.pass / EXAM.count * 100);
const TRACKS = {
  'Coastal Skipper': {
    full: 'Coastal Skipper shorebased theory', icon: 'sailboat',
    blurb: 'Coastal navigation, tides, IRPCS, meteorology and passage planning for Coastal Skipper theory.'
  },
  'Yachtmaster Offshore': {
    full: 'Yachtmaster Offshore shorebased theory', icon: 'waves',
    blurb: 'Advanced chartwork, tidal streams, offshore meteorology, passage planning and COLREGS for YM Offshore theory.'
  }
};
// Screenshot/demo mode: only on a local dev host so the paywall can't be bypassed from the public site.
const IS_LOCAL = ['localhost', '127.0.0.1'].includes(location.hostname);
const PARAMS = new URLSearchParams(location.search);
const DEMO = IS_LOCAL && PARAMS.has('demo');

// MARK: - Icons (inline SVG, stroke style)

const ICON_PATHS = {
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  flame: '<path d="M12 22c4 0 7-3 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8 0 4 3 7 7 7z"/>',
  gauge: '<path d="M4 18a9 9 0 1 1 16 0"/><path d="M12 14l4-5"/>',
  seal: '<path d="M12 2l2.4 2.2 3.2-.4.9 3.1 2.9 1.5-1 3.1 1 3.1-2.9 1.5-.9 3.1-3.2-.4L12 22l-2.4-2.2-3.2.4-.9-3.1-2.9-1.5 1-3.1-1-3.1 2.9-1.5.9-3.1 3.2.4z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  cards: '<rect x="3" y="7" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/>',
  fx: '<path d="M9 4c-2 0-3 1-3 3v13M3 11h7M14 10l6 8M20 10l-6 8"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  bookmarkFill: '<path d="M6 3h12v18l-6-4-6 4z" fill="currentColor"/>',
  chevron: '<path d="M9 5l7 7-7 7"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  flagFill: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5z" fill="currentColor"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
  checkFill: '<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M7.5 12l3 3 6-6.5" stroke="#fff"/>',
  xFill: '<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#fff"/>',
  circle: '<circle cx="12" cy="12" r="9"/>',
  square: '<rect x="4" y="4" width="16" height="16" rx="3"/>',
  squareCheck: '<rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" stroke="none"/><path d="M7.5 12l3 3 6-6.5" stroke="#fff"/>',
  sailboat: '<path d="M12 3v14M12 3l7 12h-7M12 6l-6 9h6M3 19h18l-2 2H5z"/>',
  waves: '<path d="M2 8c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 14c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 20c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.9-3M4 4v4h4M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4"/>',
  map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  list: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h10M7 17h6"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>',
  light: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
  cloud: '<path d="M7 18a5 5 0 1 1 1-9.9A6 6 0 0 1 19 10a4 4 0 0 1 0 8z"/>',
  bars: '<path d="M4 20V14M9 20V8M14 20v-9M19 20V4"/>',
  one: '<circle cx="12" cy="12" r="9"/><path d="M11 8l2-1v10"/>',
  two: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4 2L9.5 16h5"/>',
  three: '<circle cx="12" cy="12" r="9"/><path d="M9.5 8h5l-3 3.5a2.5 2.5 0 1 1-2 4"/>',
  wifiOff: '<path d="M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 12.5a10 10 0 0 1 4-2.3M19 12.5a10 10 0 0 0-2.6-1.8M2 8.8a15 15 0 0 1 4.6-2.9M22 8.8A15 15 0 0 0 11 5"/><circle cx="12" cy="20" r=".5"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  hand: '<path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10V6a2 2 0 0 0-4 0v8a8 8 0 0 0 16 0v-3a2 2 0 0 0-4 0"/>',
  doc: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 13h6M9 17h6"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.5"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3"/>',
  closedBook: '<path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"/><path d="M5 18a2 2 0 0 1 2-2h12"/>',
  play: '<path d="M7 4l13 8-13 8z" fill="currentColor"/>',
  bulb: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
  num: '<path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/>',
  speed: '<path d="M4 18a9 9 0 1 1 16 0"/><path d="M12 14l5-4"/>',
  north: '<path d="M12 3l5 18-5-4-5 4z"/>',
  clockArrows: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>'
};
function icon(name, cls = '', style = '') {
  return `<svg class="${cls}" style="${style}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ''}</svg>`;
}

// MARK: - Helpers

const $app = document.getElementById('app');
const $modal = document.getElementById('modal-root');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const DAY = 86400000;
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const toDateInput = (d) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
const fromDateInput = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d).getTime(); };
const masteryColor = (v) => v < 0.5 ? 'var(--red)' : v < 0.75 ? 'var(--amber)' : 'var(--green)';
const lsGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } };

// MARK: - Question bank

const Bank = {
  all: [], byId: new Map(),
  async load() {
    const res = await fetch('questions.json');
    const data = await res.json();
    this.all = data.questions.map((q) => ({ ...q, track: q.track || 'both', difficulty: q.difficulty || 'medium' }));
    this.byId = new Map(this.all.map((q) => [q.id, q]));
  },
  inTrack: (q, t) => q.track === 'both' || q.track === t,
  forTrack(t) { return this.all.filter((q) => this.inTrack(q, t)); },
  topics(t) { return [...new Set(this.forTrack(t).map((q) => q.topic))].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())); },
  countTopic(topic, t) { return this.all.filter((q) => q.topic === topic && this.inTrack(q, t)).length; },
  mockPaper(t) {
    const pool = shuffle(this.forTrack(t));
    const byTopic = new Map();
    for (const q of pool) { if (!byTopic.has(q.topic)) byTopic.set(q.topic, []); byTopic.get(q.topic).push(q); }
    const picked = [];
    let keys = shuffle([...byTopic.keys()]);
    let idx = 0;
    while (picked.length < EXAM.count && byTopic.size) {
      if (!keys.length) keys = shuffle([...byTopic.keys()]);
      const k = keys[idx % keys.length]; idx++;
      const arr = byTopic.get(k);
      if (arr && arr.length) {
        picked.push(arr.shift());
        if (!arr.length) { byTopic.delete(k); keys = keys.filter((x) => x !== k); idx = 0; }
      }
    }
    if (picked.length < EXAM.count) {
      const ids = new Set(picked.map((q) => q.id));
      picked.push(...pool.filter((q) => !ids.has(q.id)).slice(0, EXAM.count - picked.length));
    }
    return shuffle(picked.slice(0, EXAM.count));
  },
  quick(t, n = 10) { return shuffle(this.forTrack(t)).slice(0, n); },
  practice(topic, t, n = 15) { return shuffle(this.all.filter((q) => q.topic === topic && this.inTrack(q, t))).slice(0, n); },
  lookup(ids) { return ids.map((id) => this.byId.get(id)).filter(Boolean); }
};

// MARK: - User progress (persisted)

const PROGRESS_KEY = 'ymtp.progress.v1';
const defaultProgress = () => ({
  onboarded: false, track: null, testDate: null, dailyGoal: 20,
  diagnosticCompleted: false, diagnosticScorePercent: 0, studyGoal: '', experienceLevel: '',
  total: 0, correct: 0, streak: 0, lastStudyDay: null,
  bookmarks: [], incorrect: [], topicCorrect: {}, topicTotal: {},
  srs: {}, mocks: [], seededDemo: false
});
const P = {
  data: defaultProgress(),
  load() {
    const raw = lsGet(PROGRESS_KEY);
    if (raw) { try { this.data = { ...defaultProgress(), ...JSON.parse(raw) }; } catch { /* corrupt: start fresh */ } }
  },
  save() { if (!DEMO) lsSet(PROGRESS_KEY, JSON.stringify(this.data)); },
  get track() { return this.data.track || 'Coastal Skipper'; },
  record(q, selected) {
    const d = this.data, ok = selected === q.correctAnswer;
    d.total++; if (ok) d.correct++;
    d.topicTotal[q.topic] = (d.topicTotal[q.topic] || 0) + 1;
    if (ok) d.topicCorrect[q.topic] = (d.topicCorrect[q.topic] || 0) + 1;
    if (ok) d.incorrect = d.incorrect.filter((id) => id !== q.id);
    else if (!d.incorrect.includes(q.id)) d.incorrect.push(q.id);
    this.registerStudyDay(); this.save();
  },
  recordMock(result) {
    this.data.mocks.push(result);
    if (this.data.mocks.length > 50) this.data.mocks.splice(0, this.data.mocks.length - 50);
    this.registerStudyDay(); this.save();
  },
  isBookmarked(id) { return this.data.bookmarks.includes(id); },
  toggleBookmark(id) {
    const b = this.data.bookmarks;
    const i = b.indexOf(id);
    if (i >= 0) b.splice(i, 1); else b.push(id);
    this.save();
  },
  registerStudyDay() {
    const today = startOfDay(Date.now()).getTime();
    const last = this.data.lastStudyDay;
    if (last == null) { this.data.streak = 1; this.data.lastStudyDay = today; return; }
    const lastDay = startOfDay(last).getTime();
    if (lastDay === today) return;
    const diff = Math.round((today - lastDay) / DAY);
    this.data.streak = diff === 1 ? this.data.streak + 1 : 1;
    this.data.lastStudyDay = today;
  },
  srsCard(id) { return this.data.srs[id] || { reps: 0, ease: 2.5, interval: 0, due: Date.now() }; },
  reviewSRS(id, grade) {
    const c = { ...this.srsCard(id) }, now = Date.now();
    if (grade === 0) {
      c.reps = 0; c.interval = 0; c.due = now + 600000; c.ease = Math.max(1.3, c.ease - 0.2);
    } else {
      c.ease = Math.max(1.3, c.ease + (0.1 - (3 - grade) * (0.08 + (3 - grade) * 0.02)));
      c.reps += 1;
      c.interval = c.reps === 1 ? 1 : c.reps === 2 ? 4 : Math.round(c.interval * c.ease);
      if (grade === 1) c.interval = Math.max(1, c.interval * 0.6);
      if (grade === 3) c.interval = c.interval * 1.3;
      c.due = now + c.interval * DAY;
    }
    this.data.srs[id] = c;
    this.registerStudyDay(); this.save();
  },
  dueFlashcards(limit = 20) {
    const now = Date.now(), pool = Bank.forTrack(this.track), srs = this.data.srs;
    const due = pool.filter((q) => (srs[q.id]?.due ?? now) <= now)
      .sort((a, b) => (srs[a.id]?.due ?? now) - (srs[b.id]?.due ?? now));
    if (due.length >= limit) return due.slice(0, limit);
    const extra = shuffle(pool.filter((q) => !srs[q.id]));
    return [...due, ...extra].slice(0, limit);
  },
  get accuracy() { return this.data.total ? Math.floor(this.data.correct / this.data.total * 100) : 0; },
  mastery(topic) { const t = this.data.topicTotal[topic] || 0; return t ? (this.data.topicCorrect[topic] || 0) / t : 0; },
  get readiness() {
    const recent = this.data.mocks.slice(-3);
    const mockAvg = recent.length ? recent.reduce((s, m) => s + m.percent, 0) / recent.length : 0;
    const acc = this.accuracy;
    const covered = Object.values(this.data.topicTotal).filter((v) => v >= 3).length;
    const totalTopics = Math.max(1, Bank.topics(this.track).length);
    const coverage = Math.min(1, covered / totalTopics) * 100;
    const base = recent.length ? mockAvg * 0.5 + acc * 0.3 + coverage * 0.2 : acc * 0.7 + coverage * 0.3;
    return clamp(Math.round(base), 0, 100);
  },
  get daysUntilTest() {
    if (this.data.testDate == null) return null;
    return Math.round((startOfDay(this.data.testDate) - startOfDay(Date.now())) / DAY);
  },
  weakTopics(limit = 5) {
    return Bank.topics(this.track)
      .map((t) => [t, this.mastery(t), this.data.topicTotal[t] || 0])
      .sort((a, b) => {
        if (a[2] === 0 && b[2] === 0) return a[0] < b[0] ? -1 : 1;
        if (a[2] === 0) return 1;
        if (b[2] === 0) return -1;
        return a[1] - b[1];
      })
      .slice(0, limit).map((x) => x[0]);
  },
  weakAreaDrill(n = 15) {
    const weak = new Set(this.weakTopics(4));
    let pool = Bank.forTrack(this.track).filter((q) => weak.has(q.topic));
    if (pool.length < n) pool = pool.concat(Bank.forTrack(this.track));
    const seen = new Set();
    return shuffle(pool).filter((q) => !seen.has(q.id) && seen.add(q.id)).slice(0, n);
  },
  reset() {
    const { track, testDate, onboarded } = this.data;
    this.data = { ...defaultProgress(), track, testDate, onboarded };
    this.save();
  },
  seedDemo() {
    const d = this.data, t = this.track;
    for (const topic of Bank.topics(t)) {
      const total = 8 + Math.floor(Math.random() * 17);
      const correct = Math.floor(total * (0.62 + Math.random() * 0.32));
      d.topicTotal[topic] = total; d.topicCorrect[topic] = correct; d.total += total; d.correct += correct;
    }
    [78, 82, 88, 90, 94].forEach((p, i, arr) => {
      const score = Math.floor(EXAM.count * p / 100);
      d.mocks.push({ date: Date.now() - (arr.length - i) * 2 * DAY, total: EXAM.count, score, percent: Math.floor(score / EXAM.count * 100), durationSeconds: 1500 + Math.floor(Math.random() * 900), track: t, perTopicCorrect: {}, perTopicTotal: {}, incorrect: [] });
    });
    const qs = Bank.forTrack(t);
    d.bookmarks = shuffle(qs).slice(0, 6).map((q) => q.id);
    d.incorrect = shuffle(qs).slice(0, 9).map((q) => q.id);
    d.streak = 7; d.lastStudyDay = startOfDay(Date.now()).getTime();
    d.diagnosticCompleted = true; d.diagnosticScorePercent = 72; d.seededDemo = true;
    d.testDate = Date.now() + 28 * DAY;
  }
};

// MARK: - Microsoft Store purchases (Digital Goods API + Payment Request API)

const ENT_KEY = 'ymtp.entitlement.v1';
const Store = {
  service: null, available: false, loaded: false, details: [], owned: new Set(), error: null,
  async init() {
    if (DEMO) { this.owned = new Set(['demo']); this.loaded = true; return; }
    if (typeof window.getDigitalGoodsService === 'function') {
      try { this.service = await window.getDigitalGoodsService(BILLING); this.available = true; }
      catch { this.available = false; }
    }
    if (this.available) { await this.fetchProducts(); await this.refresh(); }
    this.loaded = true;
  },
  async fetchProducts() {
    try {
      const list = await this.service.getDetails(PRODUCT_ORDER);
      this.details = PRODUCT_ORDER.map((id) => list.find((d) => d.itemId === id)).filter(Boolean);
      this.error = null;
    } catch {
      this.error = "Couldn't load purchase options. Check your connection and try again.";
    }
  },
  async refresh() {
    try {
      const purchases = await this.service.listPurchases();
      this.owned = new Set(purchases.map((p) => p.itemId).filter((id) => PRODUCT_ORDER.includes(id)));
      lsSet(ENT_KEY, JSON.stringify({ ids: [...this.owned], at: Date.now() }));
    } catch {
      // Store unreachable: honour the last known entitlement for up to 7 days.
      try {
        const cached = JSON.parse(lsGet(ENT_KEY) || 'null');
        if (cached && Date.now() - cached.at < 7 * DAY) this.owned = new Set(cached.ids);
      } catch { /* ignore */ }
    }
  },
  async purchase(itemId) {
    this.error = null;
    try {
      const request = new PaymentRequest(
        [{ supportedMethods: BILLING, data: { sku: itemId } }],
        { total: { label: 'Total', amount: { currency: 'USD', value: '0' } } }
      );
      const response = await request.show();
      try { await response.complete('success'); } catch { /* not required by Store billing */ }
    } catch (e) {
      if (e && e.name === 'AbortError') return false;
      this.error = 'Purchase failed: ' + (e && e.message ? e.message : 'please try again.');
      return false;
    }
    await this.refresh();
    return this.isSubscribed;
  },
  async restore() {
    this.error = null;
    if (!this.available) { this.error = 'Install the app from the Microsoft Store to restore purchases.'; return; }
    await this.refresh();
    if (!this.isSubscribed) this.error = 'No previous purchases were found for this Microsoft account.';
  },
  get isSubscribed() { return this.owned.size > 0; },
  get hasLifetime() { return this.owned.has(PRODUCTS.lifetime); },
  detail(id) { return this.details.find((d) => d.itemId === id); },
  price(d) {
    if (!d || !d.price) return '';
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: d.price.currency }).format(Number(d.price.value)); }
    catch { return `${d.price.value} ${d.price.currency}`; }
  },
  perMonth(d) {
    if (!d || !d.price) return '';
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: d.price.currency }).format(Number(d.price.value) / 12); }
    catch { return ''; }
  },
  planName(id) { return id === PRODUCTS.monthly ? 'Monthly' : id === PRODUCTS.yearly ? 'Yearly' : 'Lifetime'; },
  cadence(id) { return id === PRODUCTS.monthly ? 'per month' : id === PRODUCTS.yearly ? 'per year' : 'one-time'; },
  disclosure(id) {
    const d = this.detail(id), p = this.price(d), name = this.planName(id);
    if (id === PRODUCTS.lifetime) return `${name}: ${p} one-time purchase. No subscription, billed once.`;
    return `${name}: ${p} ${this.cadence(id)}, auto-renewing. Cancel anytime in your Microsoft account.`;
  }
};

// MARK: - Router & rendering

let route = 'home';
let routeArg = null;
let navStack = [];
const TABS = [
  ['home', 'Home', 'home'], ['practice', 'Practice', 'book'], ['progress', 'Progress', 'chart'],
  ['info', 'Exam Info', 'info'], ['settings', 'Settings', 'gear']
];
const TAB_OF = { topics: 'practice', review: 'practice', flashcards: 'home', calc: 'home', reference: 'info' };

function go(r, arg = null, push = true) {
  if (push && (route !== r || routeArg !== arg) && route !== 'quiz') navStack.push([route, routeArg]);
  route = r; routeArg = arg;
  render();
  window.scrollTo(0, 0);
}
function goTab(r) { navStack = []; go(r, null, false); }
function goBack() {
  const prev = navStack.pop();
  if (prev) { route = prev[0]; routeArg = prev[1]; } else { route = 'home'; routeArg = null; }
  render();
}

function render() {
  stopTimer();
  if (!P.data.onboarded) { $app.innerHTML = Onboarding.view(); return; }
  if (!Store.loaded) { $app.innerHTML = splash(); return; }
  if (!Store.isSubscribed) { $app.innerHTML = Paywall.view(); return; }
  if (route === 'quiz' && Quiz.cur) { $app.innerHTML = Quiz.view(); if (Quiz.cur.mode === 'mock' && !Quiz.cur.finished) startTimer(); return; }
  if (route === 'quiz') route = 'home';
  const activeTab = TAB_OF[route] || route;
  const views = { home: homeView, practice: practiceView, topics: topicsView, review: reviewView, flashcards: Flash.view, progress: progressView, info: infoView, reference: referenceView, settings: settingsView, calc: calcView };
  const body = (views[route] || homeView)();
  $app.innerHTML = `
    <div class="shell">
      <nav class="sidebar" aria-label="Main">
        <div class="brand"><img src="icons/logo.png" alt=""><b>Yachtmaster<br>Theory Prep</b></div>
        ${TABS.map(([r, l, i]) => `<button class="nav-item ${activeTab === r ? 'active' : ''}" data-act="tab" data-arg="${r}">${icon(i)}<span>${l}</span></button>`).join('')}
      </nav>
      <main class="main">${body}</main>
      <nav class="tabbar" aria-label="Main">
        ${TABS.map(([r, l, i]) => `<button class="${activeTab === r ? 'active' : ''}" data-act="tab" data-arg="${r}">${icon(i)}<span>${l}</span></button>`).join('')}
      </nav>
    </div>`;
  if (route === 'calc') updateCalcOut();
}

const pageHead = (title, back = false) => `<div class="page-head">${back ? `<button class="back" data-act="back" aria-label="Back">${icon('back')}</button>` : ''}<h1>${esc(title)}</h1></div>`;
const stat = (v, l, ic, color) => `<div class="card stat">${icon(ic, '', `color:${color}`)}<div class="v">${esc(v)}</div><div class="l">${esc(l)}</div></div>`;
const actionCard = (ic, color, title, sub, act, arg = '') => `<button class="action" data-act="${act}" data-arg="${esc(arg)}">${icon(ic, 'ic', `color:${color}`)}<div class="grow"><h3>${esc(title)}</h3><div class="small muted">${esc(sub)}</div></div>${icon('chevron', 'chev')}</button>`;
const listRow = (ic, color, title, detail, act, arg = '') => `<button class="list-row" data-act="${act}" data-arg="${esc(arg)}">${icon(ic, 'ic', `color:${color}`)}<span class="grow">${esc(title)}</span><span class="small muted">${esc(detail)}</span>${icon('chevron', 'chev')}</button>`;
const linkRow = (ic, title, href) => `<a class="list-row" href="${href}" target="_blank" rel="noopener">${icon(ic, 'ic', 'color:var(--accent)')}<span class="grow">${esc(title)}</span>${icon('chevron', 'chev')}</a>`;
const bar = (v, color) => `<div class="bar"><i style="width:${Math.round(clamp(v, 0, 1) * 100)}%;background:${color}"></i></div>`;
function ring(value, label, caption, color, size = 160) {
  const r = 52, c = 2 * Math.PI * r, v = clamp(value, 0.001, 1);
  return `<div class="ring" style="width:${size}px;height:${size}px" role="img" aria-label="${esc(caption)} ${esc(label)}">
    <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--track)" stroke-width="12"/>
    <circle cx="60" cy="60" r="${r}" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${c * v} ${c}"/></svg>
    <div class="lbl"><b>${esc(label)}</b><span>${esc(caption)}</span></div></div>`;
}
const splash = () => `<div class="splash"><img class="logo" src="icons/logo.png" alt=""><h2>Yachtmaster Theory Prep</h2><div class="muted">Coastal &amp; Offshore</div><div class="spinner"></div></div>`;

function modal(title, message, buttons) {
  $modal.innerHTML = `<div class="modal-back" role="dialog" aria-modal="true"><div class="modal"><h3>${esc(title)}</h3><p class="muted small">${esc(message)}</p>
    <div class="row">${buttons.map((b, i) => `<button class="btn ${b.cls || 'secondary'}" data-modal="${i}">${esc(b.label)}</button>`).join('')}</div></div></div>`;
  $modal.querySelectorAll('[data-modal]').forEach((el) => el.addEventListener('click', () => {
    const b = buttons[Number(el.dataset.modal)];
    $modal.innerHTML = '';
    if (b.run) b.run();
  }));
  const first = $modal.querySelector('[data-modal]');
  if (first) first.focus();
}

// MARK: - Onboarding

const Onboarding = {
  step: 0, goal: null, pains: new Set(), track: null, exp: null,
  testDate: Date.now() + 45 * DAY, dailyGoal: 20,
  diag: [], diagIndex: 0, diagCorrect: 0, diagSelected: null,
  total: 9,
  goals: [
    ['Pass Coastal Skipper theory', 'sailboat', 'I want the Coastal Skipper shorebased paper solid.'],
    ['Yachtmaster Offshore theory', 'waves', "I'm preparing for Yachtmaster Offshore shorebased."],
    ['Refresh before practical', 'refresh', 'I need a sharp theory refresh before afloat exams.'],
    ['Build chartwork confidence', 'map', 'I want tidal, plotting and IRPCS confidence.']
  ],
  painList: [
    ['Tidal calculations feel messy', 'clockArrows'], ['COLREGS lights & shapes blur together', 'light'],
    ['Chartwork under time pressure', 'map'], ['Meteorology systems confuse me', 'cloud'],
    ['Not enough timed practice', 'timer'], ['Hard to track weak topics', 'bars']
  ],
  exps: [
    ['Day Skipper level', 'one', 'I know basics; Yachtmaster depth is new.'],
    ['Some coastal miles', 'two', "I've skippered coastal passages and need theory polish."],
    ['Experienced offshore', 'three', 'I need exam-style practice more than lectures.']
  ],
  canAdvance() {
    return { 1: !!this.goal, 2: this.pains.size > 0, 3: !!this.track, 4: !!this.exp }[this.step] ?? true;
  },
  title: (t, s) => `<div class="stack-sm"><h1>${esc(t)}</h1><div class="muted">${esc(s)}</div></div>`,
  select(title, sub, ic, on, act, arg) {
    return `<button class="select ${on ? 'on' : ''}" data-act="${act}" data-arg="${esc(arg)}" aria-pressed="${on}">${icon(ic, 'ic')}<div class="grow"><h3>${esc(title)}</h3>${sub ? `<div class="tiny muted">${esc(sub)}</div>` : ''}</div>${icon(on ? 'checkFill' : 'circle', 'tick')}</button>`;
  },
  multi(title, ic, on, arg) {
    return `<button class="select ${on ? 'on' : ''}" data-act="ob-pain" data-arg="${esc(arg)}" aria-pressed="${on}">${icon(ic, 'ic')}<div class="grow">${esc(title)}</div>${icon(on ? 'squareCheck' : 'square', 'tick')}</button>`;
  },
  view() {
    const s = this.step;
    let body;
    if (s === 0) {
      body = `<div class="stack center" style="padding-top:24px">
        <img class="logo" src="icons/logo.png" alt="">
        <h1 style="font-size:32px">Walk into Yachtmaster theory ready</h1>
        <div class="muted">Coastal Skipper &amp; Yachtmaster Offshore shorebased prep: unofficial study aid.</div>
        <div class="stack" style="text-align:left;margin-top:8px">
          ${[['list', '550+ original theory questions'], ['timer', 'Timed paper-style mocks · chartwork & COLREGS'], ['fx', 'Tidal & chartwork calculators with examples'], ['trend', 'Readiness score & weak-topic drills']]
            .map(([i, t]) => `<div class="feature">${icon(i, '', 'color:var(--accent);width:22px;height:22px')}<span>${esc(t)}</span></div>`).join('')}
        </div></div>`;
    } else if (s === 1) {
      body = this.title('What are you aiming for?', "We'll tailor your plan around your goal.") + this.goals.map(([t, i, sub]) => this.select(t, sub, i, this.goal === t, 'ob-goal', t)).join('');
    } else if (s === 2) {
      body = this.title('What slows you down?', 'Pick any that apply, no judgment.') + this.painList.map(([t, i]) => this.multi(t, i, this.pains.has(t), t)).join('');
    } else if (s === 3) {
      body = this.title('Which syllabus focus?', 'Same shorebased theory base. Choose your primary label; change anytime in Settings.') + Object.entries(TRACKS).map(([t, v]) => this.select(t, v.blurb, v.icon, this.track === t, 'ob-track', t)).join('');
    } else if (s === 4) {
      body = this.title('How experienced are you?', 'Honest answer helps set your starting pace.') + this.exps.map(([t, i, sub]) => this.select(t, sub, i, this.exp === t, 'ob-exp', t)).join('');
    } else if (s === 5) {
      body = this.title('Your plan, built for you', "Here's how this app matches what you told us.") + [
        ['Timed pressure', 'Paper-style mocks with countdown and pass mark feedback'],
        ['Weak topics', 'Topic mastery bars and automatic weak-area drills'],
        ['Tides & chartwork', 'Calculators plus calculation questions with rationales'],
        ['COLREGS & met', 'IRPCS and meteorology banks from public rules & practice']
      ].map(([p, f]) => `<div class="card flat stack-sm"><span class="tiny muted">${esc(p)}</span><div class="feature" style="color:var(--green);font-weight:600">${icon('checkFill', '', 'color:var(--green)')}<span>${esc(f)}</span></div></div>`).join('') +
        `<div class="tiny muted">Daily goal: ${this.dailyGoal} questions.</div>`;
    } else if (s === 6) {
      body = this.title('When is your course or exam?', "We'll show a countdown on your home screen.") +
        `<div class="list"><label class="field"><span>Target date</span><input type="date" data-input="ob-date" min="${toDateInput(Date.now())}" value="${toDateInput(this.testDate)}"></label></div>`;
    } else if (s === 7) {
      body = this.title('Daily practice goal', 'Small daily sessions beat cramming.') +
        `<div class="small muted">Questions per day</div><div class="goal-pick">${[10, 20, 30, 50].map((g) => `<button class="${this.dailyGoal === g ? 'on' : ''}" data-act="ob-daily" data-arg="${g}">${g}</button>`).join('')}</div>`;
    } else {
      body = this.diagView();
    }
    const showSteps = s > 0 && s < this.total;
    let footer = '';
    if (s === 0) footer = `<button class="btn" data-act="ob-next">Get Started</button>`;
    else if (s < this.total - 1) footer = `<button class="btn secondary auto" style="min-width:110px" data-act="ob-back">Back</button><button class="btn" data-act="ob-next" ${this.canAdvance() ? '' : 'disabled'}>Continue</button>`;
    return `<div class="content narrow stack" style="min-height:100vh;padding-bottom:24px">
      ${showSteps ? `<div class="steps">${Array.from({ length: this.total }, (_, i) => `<i class="${i <= s ? 'on' : ''}"></i>`).join('')}</div>` : ''}
      <div class="stack" style="flex:1">${body}</div>
      ${footer ? `<div class="row">${footer}</div>` : ''}
    </div>`;
  },
  diagView() {
    if (!this.diag.length) {
      return this.title('Quick diagnostic', "Answer 5 questions so we can gauge your starting level. Skip if you'd rather dive in.") +
        `<button class="btn" data-act="ob-diag-start">Start diagnostic</button><button class="btn secondary" data-act="ob-finish">Skip for now</button>`;
    }
    const q = this.diag[this.diagIndex];
    const answered = this.diagSelected != null;
    return `<div class="tiny muted" style="font-weight:700">Question ${this.diagIndex + 1} of ${this.diag.length}</div>
      <div class="stem">${esc(q.stem)}</div>
      ${q.options.map((o, i) => optionHTML(o, i, answered ? (i === q.correctAnswer ? 'correct' : i === this.diagSelected ? 'wrong' : 'idle') : 'idle', 'ob-diag-pick', answered)).join('')}
      ${answered ? `<button class="btn" data-act="ob-diag-next">${this.diagIndex === this.diag.length - 1 ? 'See my level' : 'Next'}</button>` : ''}`;
  },
  finish() {
    const d = P.data;
    d.track = this.track || 'Coastal Skipper';
    d.testDate = this.testDate; d.dailyGoal = this.dailyGoal;
    d.studyGoal = this.goal || ''; d.experienceLevel = this.exp || '';
    d.diagnosticCompleted = this.diag.length > 0;
    d.diagnosticScorePercent = this.diag.length ? Math.floor(this.diagCorrect / this.diag.length * 100) : 0;
    d.onboarded = true;
    P.save();
    render();
  }
};

// MARK: - Paywall

const Paywall = {
  selected: PRODUCTS.yearly, busy: false,
  view() {
    const features = [
      ['list', '550+ original Yachtmaster theory questions'], ['timer', 'Timed mocks: 40 Q / 60 min / pass 28'],
      ['fx', 'Tidal height & chartwork calculators'], ['chart', 'Readiness score & weak-topic drills'],
      ['cards', 'Flashcards with spaced repetition'], ['wifiOff', 'Works fully offline']
    ];
    let plans, cta;
    if (!Store.available) {
      plans = `<div class="card flat small muted center">Purchases are handled by the Microsoft Store. Install Yachtmaster Theory Prep from the Microsoft Store on Windows to unlock monthly, yearly or lifetime access.</div>`;
      cta = `<a class="btn navy" href="${LINKS.store}" target="_blank" rel="noopener">Get it from Microsoft Store</a>`;
    } else if (!Store.details.length) {
      plans = Store.error ? `<div class="error">${esc(Store.error)}</div><button class="btn secondary" data-act="pw-reload">Try again</button>` : `<div class="center"><div class="spinner" style="margin:12px auto"></div><div class="small muted">Loading options…</div></div>`;
      cta = '';
    } else {
      if (!Store.detail(this.selected)) this.selected = Store.details[0].itemId;
      plans = Store.details.map((d) => {
        const id = d.itemId, on = id === this.selected;
        const sub = id === PRODUCTS.lifetime ? 'One-time purchase · lifetime access' : `Billed ${Store.cadence(id)} · auto-renewing`;
        return `<button class="plan ${on ? 'on' : ''}" data-act="pw-pick" data-arg="${esc(id)}" aria-pressed="${on}">
          ${id === PRODUCTS.yearly ? '<span class="badge">BEST VALUE</span>' : ''}
          <div class="row"><div class="grow"><h3>${Store.planName(id)}</h3><div class="tiny muted">${sub}</div></div>
          <div style="text-align:right"><div class="price">${esc(Store.price(d))}</div>${id === PRODUCTS.yearly ? `<div class="tiny muted">≈ ${esc(Store.perMonth(d))}/mo</div>` : ''}</div></div></button>`;
      }).join('');
      const d = Store.detail(this.selected);
      const label = this.selected === PRODUCTS.lifetime ? `Buy Lifetime · ${Store.price(d)}` : `Subscribe · ${Store.price(d)}`;
      cta = `<button class="btn navy" data-act="pw-buy" ${this.busy ? 'disabled' : ''}>${this.busy ? '<span class="spinner" style="width:18px;height:18px;border-width:2px"></span>' : esc(label)}</button>
        <div class="tiny muted center">${esc(Store.disclosure(this.selected))}</div>
        ${Store.error ? `<div class="error">${esc(Store.error)}</div>` : ''}`;
    }
    return `<div class="content narrow stack" style="padding-top:32px">
      <img class="logo" src="icons/logo.png" alt="" style="width:72px;height:72px;border-radius:16px">
      <h1 class="center">Unlock Yachtmaster Theory Prep</h1>
      <div class="muted center">Full access requires a subscription or one-time purchase. Unlock 550+ Coastal Skipper &amp; Yachtmaster Offshore theory questions, timed mocks, calculators and progress tracking.</div>
      <div class="card stack-sm">${features.map(([i, t]) => `<div class="feature">${icon(i)}<span>${esc(t)}</span></div>`).join('')}</div>
      ${plans}${cta}
      ${Store.available ? `<button class="btn link" style="align-self:center" data-act="pw-restore">Restore Purchases</button>` : ''}
      <div class="tiny muted center">Yachtmaster Theory Prep Premium. Payment is charged to your Microsoft account at confirmation. Subscriptions renew automatically until cancelled; manage or cancel anytime at account.microsoft.com/services.</div>
      <div class="center small"><a href="${LINKS.terms}" target="_blank" rel="noopener">Terms of Use</a> · <a href="${LINKS.privacy}" target="_blank" rel="noopener">Privacy Policy</a></div>
    </div>`;
  }
};

// MARK: - Home

function homeView() {
  const days = P.daysUntilTest;
  return `<div class="content stack">${pageHead('Home')}
    <div class="grid-3">
      ${stat(days == null ? '—' : days >= 0 ? `${days}d` : 'Past', 'Until exam', 'calendar', 'var(--blue)')}
      ${stat(String(P.data.streak), 'Day streak', 'flame', 'var(--amber)')}
      ${stat(`${P.readiness}%`, 'Readiness', 'gauge', 'var(--green)')}
    </div>
    <button class="hero-card" data-act="start-mock">
      <h3>${icon('seal')} Timed Mock Paper</h3>
      <p>${EXAM.count} questions · ${EXAM.minutes} minutes · pass ${EXAM.pass}/${EXAM.count}</p>
      <p class="small">Mixed chartwork, tides, meteorology, IRPCS, passage planning &amp; safety.</p>
    </button>
    ${actionCard('bolt', 'var(--amber)', 'Quick Practice', '10 mixed questions with instant feedback', 'start-quick', '10')}
    ${actionCard('target', 'var(--red)', 'Weak-Area Drill', 'Focus on your lowest-scoring topics', 'start-weak')}
    ${actionCard('cards', 'var(--green)', 'Flashcards', 'Spaced-repetition revision', 'nav', 'flashcards')}
    ${actionCard('fx', 'var(--accent)', 'Tidal & Chartwork Tools', 'Calculators with worked examples', 'nav', 'calc')}
  </div>`;
}

// MARK: - Practice hub, topics, review

function practiceView() {
  return `<div class="content">${pageHead('Practice')}
    <div class="list-head">Practice</div>
    <div class="list">
      ${listRow('bolt', 'var(--amber)', 'Quick Practice', '15 mixed questions', 'start-quick', '15')}
      ${listRow('grid', 'var(--blue)', 'Practice by Topic', `${Bank.topics(P.track).length} topics`, 'nav', 'topics')}
      ${listRow('cards', 'var(--green)', 'Flashcards', 'Spaced repetition', 'nav', 'flashcards')}
      ${listRow('fx', 'var(--accent)', 'Tidal & Chartwork Tools', 'Calculators with examples', 'nav', 'calc')}
    </div>
    <div class="list-head">Review</div>
    <div class="list">
      ${listRow('undo', 'var(--red)', 'Review Incorrect', `${P.data.incorrect.length} to review`, 'nav-review', 'incorrect')}
      ${listRow('bookmarkFill', 'var(--amber)', 'Bookmarked', `${P.data.bookmarks.length} saved`, 'nav-review', 'bookmarked')}
    </div></div>`;
}

function topicsView() {
  const t = P.track;
  return `<div class="content">${pageHead('By Topic', true)}<div class="list">
    ${Bank.topics(t).map((topic) => {
      const m = P.mastery(topic), attempted = (P.data.topicTotal[topic] || 0) > 0;
      return `<button class="list-row" data-act="start-topic" data-arg="${esc(topic)}" style="flex-direction:column;align-items:stretch;gap:6px">
        <div class="row"><span class="grow">${esc(topic)}</span><span class="small muted">${Bank.countTopic(topic, t)} Q</span></div>
        ${attempted ? bar(m, masteryColor(m)) : ''}</button>`;
    }).join('')}</div></div>`;
}

function reviewView() {
  const incorrect = routeArg === 'incorrect';
  const qs = Bank.lookup(incorrect ? P.data.incorrect : P.data.bookmarks);
  const title = incorrect ? 'Review Incorrect' : 'Bookmarked';
  if (!qs.length) {
    return `<div class="content">${pageHead(title, true)}<div class="empty">${icon(incorrect ? 'check' : 'bookmark')}
      <h2>${incorrect ? 'No incorrect answers' : 'No bookmarks yet'}</h2>
      <p class="muted">${incorrect ? 'Questions you get wrong will appear here for revision.' : 'Click the bookmark icon during practice to save questions.'}</p></div></div>`;
  }
  return `<div class="content">${pageHead(title, true)}<div class="list">
    <button class="list-row" data-act="start-review" data-arg="${routeArg}" style="color:var(--blue);font-weight:600">${icon('play', 'ic')}Practise all ${qs.length}</button>
    ${qs.map((q) => `<div class="list-row" style="flex-direction:column;align-items:flex-start;gap:2px"><span class="tiny" style="color:var(--blue);font-weight:700">${esc(q.topic)}</span><span class="small">${esc(q.stem)}</span></div>`).join('')}
  </div></div>`;
}

// MARK: - Quiz engine

let timerHandle = null;
function stopTimer() { if (timerHandle) { clearInterval(timerHandle); timerHandle = null; } }
function startTimer() {
  stopTimer();
  timerHandle = setInterval(() => {
    const q = Quiz.cur;
    if (!q || q.finished) { stopTimer(); return; }
    q.timeRemaining = Math.max(0, Math.round((q.deadline - Date.now()) / 1000));
    const el = document.getElementById('timer');
    if (el) { el.querySelector('span').textContent = Quiz.timeString(); el.classList.toggle('low', q.timeRemaining < 60); }
    if (q.timeRemaining <= 0) { q.timedOut = true; Quiz.submit(); render(); }
  }, 1000);
}

function optionHTML(text, i, state, act, disabled = false) {
  const letter = 'ABCD'[Math.min(i, 3)];
  const mark = state === 'correct' ? icon('checkFill') : state === 'wrong' ? icon('xFill') : '';
  return `<button class="option ${state}" data-act="${act}" data-arg="${i}" ${disabled ? 'disabled' : ''} aria-label="Option ${letter}: ${esc(text)}" aria-pressed="${state === 'selected'}">
    <span class="ltr">${letter}</span><span class="txt">${esc(text)}</span>${mark}</button>`;
}

const Quiz = {
  cur: null,
  start(questions, mode, title) {
    if (!questions.length) return;
    this.cur = {
      questions, mode, title, index: 0,
      selections: questions.map(() => null), revealed: questions.map(() => false),
      flagged: new Set(), finished: false, timedOut: false, startedAt: Date.now(),
      deadline: Date.now() + EXAM.minutes * 60000, timeRemaining: EXAM.minutes * 60, result: null
    };
    go('quiz');
  },
  get q() { return this.cur.questions[this.cur.index]; },
  timeString() { const t = Math.max(0, this.cur.timeRemaining); return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; },
  score() { return this.cur.questions.reduce((s, q, i) => s + (this.cur.selections[i] === q.correctAnswer ? 1 : 0), 0); },
  select(i) {
    const c = this.cur;
    if (c.finished) return;
    if (c.mode !== 'mock' && c.revealed[c.index]) return;
    c.selections[c.index] = i;
    if (c.mode !== 'mock') { c.revealed[c.index] = true; P.record(this.q, i); }
  },
  next() { const c = this.cur; if (c.index < c.questions.length - 1) c.index++; else this.submit(); },
  prev() { if (this.cur.index > 0) this.cur.index--; },
  submit() {
    const c = this.cur;
    if (c.finished) return;
    stopTimer();
    c.finished = true;
    if (c.mode !== 'mock') return;
    const perCorrect = {}, perTotal = {}, wrong = [];
    c.questions.forEach((q, i) => {
      const sel = c.selections[i];
      perTotal[q.topic] = (perTotal[q.topic] || 0) + 1;
      if (sel === q.correctAnswer) perCorrect[q.topic] = (perCorrect[q.topic] || 0) + 1; else wrong.push(q.id);
      if (sel != null) P.record(q, sel);
      else {
        // count unanswered as attempted-incorrect for stats
        P.data.topicTotal[q.topic] = (P.data.topicTotal[q.topic] || 0) + 1;
        P.data.total++;
        if (!P.data.incorrect.includes(q.id)) P.data.incorrect.push(q.id);
      }
    });
    const score = this.score(), total = c.questions.length;
    c.result = {
      date: Date.now(), total, score, percent: total ? Math.floor(score / total * 100) : 0,
      durationSeconds: Math.round((Date.now() - c.startedAt) / 1000), track: P.track,
      perTopicCorrect: perCorrect, perTopicTotal: perTotal, incorrect: wrong
    };
    P.recordMock(c.result);
  },
  optionState(i) {
    const c = this.cur, sel = c.selections[c.index] === i;
    if (c.mode === 'mock') return sel ? 'selected' : 'idle';
    if (!c.revealed[c.index]) return 'idle';
    if (i === this.q.correctAnswer) return 'correct';
    return sel ? 'wrong' : 'idle';
  },
  view() {
    const c = this.cur;
    if (c.finished) return c.mode === 'mock' ? this.resultsView() : this.summaryView();
    const q = this.q, last = c.index === c.questions.length - 1, revealed = c.revealed[c.index];
    const right = c.mode === 'mock'
      ? `<span id="timer" class="timer ${c.timeRemaining < 60 ? 'low' : ''}" aria-label="Time remaining">${icon('timer')}<span>${this.timeString()}</span></span>`
      : `<button class="icon-btn" data-act="q-bookmark" style="color:var(--amber)" aria-label="${P.isBookmarked(q.id) ? 'Remove bookmark' : 'Bookmark question'}">${icon(P.isBookmarked(q.id) ? 'bookmarkFill' : 'bookmark')}</button>`;
    let rationale = '';
    if (revealed) {
      const ok = c.selections[c.index] === q.correctAnswer;
      rationale = `<div class="card stack-sm"><div class="feature" style="color:${ok ? 'var(--green)' : 'var(--red)'};font-weight:600">${icon(ok ? 'checkFill' : 'xFill', '', `color:${ok ? 'var(--green)' : 'var(--red)'}`)}<span>${ok ? 'Correct' : 'Not quite'}</span></div>
        ${ok ? '' : `<div class="small" style="font-weight:600">Correct answer: ${esc(q.options[q.correctAnswer])}</div>`}
        <div class="small muted">${esc(q.rationale)}</div></div>`;
    }
    let footer;
    if (c.mode === 'mock') {
      footer = `<button class="flag-btn" data-act="q-flag" aria-label="Flag for review">${icon(c.flagged.has(c.index) ? 'flagFill' : 'flag')}</button>
        ${c.index > 0 ? `<button class="btn secondary auto" style="min-width:100px" data-act="q-prev">Back</button>` : ''}
        <button class="btn" data-act="${last ? 'q-submit' : 'q-next'}">${last ? 'Submit' : 'Next'}</button>`;
    } else {
      footer = `<button class="btn" data-act="q-next" ${revealed ? '' : 'disabled'}>${last ? 'Finish' : 'Next'}</button>`;
    }
    const grid = c.mode === 'mock' ? `<details class="small"><summary class="muted">Question map (${c.selections.filter((s) => s != null).length}/${c.questions.length} answered)</summary>
      <div class="qgrid">${c.questions.map((_, i) => `<button class="${c.selections[i] != null ? 'ans' : ''} ${i === c.index ? 'cur' : ''} ${c.flagged.has(i) ? 'flg' : ''}" data-act="q-go" data-arg="${i}">${i + 1}</button>`).join('')}</div></details>` : '';
    return `<div style="min-height:100vh;display:flex;flex-direction:column">
      <div class="quiz-top"><div class="inner stack-sm">
        <div class="row"><button class="icon-btn" data-act="q-quit" aria-label="Close">${icon('close')}</button>
        <div class="grow center" style="font-weight:600">Question ${c.index + 1} of ${c.questions.length}</div>${right}</div>
        <div class="progress-thin"><i style="width:${(c.index + 1) / c.questions.length * 100}%"></i></div></div></div>
      <div class="content stack" style="flex:1;padding-bottom:24px;width:100%">
        <div><div class="topic-tag">${esc(q.topic)}</div><div class="stem">${esc(q.stem)}</div></div>
        ${q.options.map((o, i) => optionHTML(o, i, this.optionState(i), 'q-pick', c.mode !== 'mock' && revealed)).join('')}
        ${rationale}
        <div class="tiny muted">Keyboard: <span class="kbd">A</span>–<span class="kbd">D</span> or <span class="kbd">1</span>–<span class="kbd">4</span> to answer, <span class="kbd">Enter</span> for next.</div>
        ${grid}
      </div>
      <div class="quiz-bottom"><div class="inner">${footer}</div></div></div>`;
  },
  resultsView() {
    const r = this.cur.result, passed = r.score >= EXAM.pass;
    const topics = Object.keys(r.perTopicTotal).sort();
    const m = Math.floor(r.durationSeconds / 60), s = r.durationSeconds % 60;
    return `<div class="content stack">${pageHead('Mock Result')}
      <div class="stack center">${ring(r.score / Math.max(1, r.total), `${r.percent}%`, `${r.score}/${r.total}`, passed ? 'var(--green)' : 'var(--red)', 170)}
      <h1 style="color:${passed ? 'var(--green)' : 'var(--red)'}">${passed ? 'PASS' : 'NOT YET'}</h1>
      ${this.cur.timedOut ? '<div class="small muted">Time is up. Your paper was submitted automatically.</div>' : ''}
      <div class="muted">${passed ? `You met the ${EXAM.pass}/${EXAM.count} pass mark. Keep practising to stay sharp.` : `You need ${EXAM.pass}/${EXAM.count} (${EXAM.passPercent}%) to pass. Focus on your weak areas below.`}</div></div>
      <div class="grid-3">${stat(String(r.score), 'Correct', 'check', 'var(--green)')}${stat(String(r.total - r.score), 'Incorrect', 'close', 'var(--red)')}${stat(`${m}:${String(s).padStart(2, '0')}`, 'Time', 'timer', 'var(--accent)')}</div>
      <div class="card stack"><h3>Topic breakdown</h3>
        ${topics.map((t) => { const c = r.perTopicCorrect[t] || 0, tot = r.perTopicTotal[t]; return `<div class="stack-sm" style="gap:4px"><div class="row small"><span class="grow">${esc(t)}</span><span class="muted">${c}/${tot}</span></div>${bar(c / tot, masteryColor(c / tot))}</div>`; }).join('')}
      </div>
      ${r.incorrect.length ? `<button class="btn navy" data-act="res-review">${icon('undo', '', 'width:18px;height:18px')} Review ${r.incorrect.length} incorrect answers</button>
        <button class="btn amber" data-act="start-weak">${icon('target', '', 'width:18px;height:18px')} Drill my weak areas</button>` : ''}
      <button class="btn secondary" data-act="q-done">Done</button></div>`;
  },
  summaryView() {
    const c = this.cur, score = this.score();
    return `<div class="content narrow stack center" style="padding-top:48px">
      ${ring(score / Math.max(1, c.questions.length), `${score}/${c.questions.length}`, 'score', 'var(--blue)')}
      <h2>Session complete</h2><div class="muted">Great work. Every answer counts towards your readiness and streak.</div>
      <button class="btn" data-act="q-done">Done</button></div>`;
  }
};

// MARK: - Flashcards

const Flash = {
  cards: [], index: 0, show: false, done: false, loaded: false,
  load() { this.cards = P.dueFlashcards(20); this.index = 0; this.show = false; this.done = !this.cards.length; this.loaded = true; },
  view() {
    const f = Flash;
    if (!f.loaded) f.load();
    if (f.done || !f.cards.length) {
      return `<div class="content">${pageHead('Flashcards', true)}<div class="empty">${icon('checkFill')}<h2>All caught up</h2>
        <p class="muted">You've reviewed your due cards. Come back later or start a new set.</p>
        <button class="btn auto" data-act="fc-new">Start new set</button></div></div>`;
    }
    const q = f.cards[f.index];
    return `<div class="content stack">${pageHead('Flashcards', true)}
      ${bar((f.index + 1) / f.cards.length, 'var(--green)')}
      <div class="card flash stack"><div class="topic-tag" style="color:var(--green)">${esc(q.topic)}</div><div class="stem">${esc(q.stem)}</div>
      ${f.show ? `<hr style="border:0;border-top:1px solid var(--line);width:100%"><div class="feature" style="color:var(--green);font-weight:600">${icon('checkFill', '', 'color:var(--green)')}Answer</div>
        <div style="font-weight:600">${esc(q.options[q.correctAnswer])}</div><div class="small muted">${esc(q.rationale)}</div>` : ''}</div>
      ${f.show
        ? `<div class="grid-2" style="grid-template-columns:repeat(4,1fr)">${[['Again', 0, 'red'], ['Hard', 1, 'amber'], ['Good', 2, 'navy'], ['Easy', 3, 'green']].map(([l, g, c]) => `<button class="btn ${c}" data-act="fc-grade" data-arg="${g}">${l}</button>`).join('')}</div>`
        : `<button class="btn green" data-act="fc-show">Show Answer</button>`}
      <div class="tiny muted center">Keyboard: <span class="kbd">Space</span> to reveal, <span class="kbd">1</span>–<span class="kbd">4</span> to grade.</div>
    </div>`;
  },
  grade(g) {
    P.reviewSRS(this.cards[this.index].id, g);
    this.show = false;
    if (this.index < this.cards.length - 1) this.index++; else this.done = true;
  }
};

// MARK: - Progress dashboard

function trendChart(mocks) {
  const pts = mocks.slice(-10), W = 600, H = 180, L = 34, R = 10, T = 14, B = 22;
  const x = (i) => pts.length === 1 ? (L + W - R) / 2 : L + i * (W - L - R) / (pts.length - 1);
  const y = (v) => T + (1 - v / 100) * (H - T - B);
  const line = pts.map((m, i) => `${x(i)},${y(m.percent)}`).join(' ');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Mock test score trend">
    ${[0, 50, 100].map((v) => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`).join('')}
    <line x1="${L}" x2="${W - R}" y1="${y(EXAM.passPercent)}" y2="${y(EXAM.passPercent)}" stroke="var(--green)" stroke-dasharray="4 4" opacity=".8"/>
    <text x="${L + 4}" y="${y(EXAM.passPercent) - 5}" style="fill:var(--green)">Pass ${EXAM.passPercent}%</text>
    <polyline points="${line}" fill="none" stroke="var(--blue)" stroke-width="2.5" stroke-linejoin="round"/>
    ${pts.map((m, i) => `<circle cx="${x(i)}" cy="${y(m.percent)}" r="4" fill="var(--blue)"/><text x="${x(i)}" y="${H - 6}" text-anchor="middle">${i + 1}</text>`).join('')}
  </svg>`;
}

function progressView() {
  const r = P.readiness, days = P.daysUntilTest;
  const blurb = r < 50 ? "Keep practising daily: you're building your foundation." : r < 75 ? 'Good progress. Focus on weak topics to push over the line.' : "You're in great shape to pass. Keep sharp with mock tests.";
  const attempted = Bank.topics(P.track).filter((t) => (P.data.topicTotal[t] || 0) > 0);
  return `<div class="content stack">${pageHead('Progress')}
    <div class="card stack center">${ring(r / 100, `${r}%`, 'Readiness', masteryColor(r / 100))}<div class="small muted">${blurb}</div></div>
    <div class="grid-3">
      ${stat(days == null ? '—' : `${Math.max(0, days)}d`, 'Until test', 'calendar', 'var(--blue)')}
      ${stat(String(P.data.streak), 'Day streak', 'flame', 'var(--amber)')}
      ${stat(`${P.accuracy}%`, 'Accuracy', 'seal', 'var(--green)')}
    </div>
    ${P.data.mocks.length ? `<div class="card stack-sm"><h3>Mock test trend</h3>${trendChart(P.data.mocks)}</div>` : ''}
    <div class="card stack"><h3>Topic mastery</h3>
      ${attempted.length ? attempted.map((t) => { const m = P.mastery(t); return `<div class="stack-sm" style="gap:4px"><div class="row small"><span class="grow">${esc(t)}</span><span style="color:${masteryColor(m)};font-variant-numeric:tabular-nums">${Math.floor(m * 100)}%</span></div>${bar(m, masteryColor(m))}</div>`; }).join('')
        : '<div class="small muted">Answer some questions to see your topic mastery here.</div>'}
    </div></div>`;
}

// MARK: - Exam info & reference

function infoView() {
  const themes = ['Chartwork & coastal navigation', 'Tidal heights, streams & secondary ports', 'Meteorology & weather interpretation', 'IRPCS / COLREGS lights, shapes & conduct', 'Passage planning & pilotage', 'Electronic navigation (GPS, AIS, radar use)', 'Safety equipment & emergency procedures', 'Collision avoidance & traffic situations'];
  const tips = ['Sit a full timed mock at least twice a week before exam day.', 'Review every incorrect answer and bookmark hard IRPCS cases.', 'Practise tidal height and secondary-port calculations by hand.', 'Learn the structure of Rule 18 and light/shape recognition cold.', 'Use the in-app calculators, then do the same steps on paper under time.'];
  const info = (ic, t, d) => `<div class="list-row">${icon(ic, 'ic', 'color:var(--accent)')}<div class="grow"><div style="font-weight:600">${esc(t)}</div><div class="tiny muted">${esc(d)}</div></div></div>`;
  return `<div class="content">${pageHead('Exam Info')}
    <div class="list-head">Our practice mock format</div><div class="list">
      ${info('num', '40 questions', 'Multiple choice, randomised by topic')}${info('timer', '60 minutes', 'Countdown timer')}
      ${info('seal', 'Pass mark 28/40', "That's 70% correct")}${info('info', 'Practice format only', 'Real exams are set by your training centre or awarding body')}</div>
    <div class="list-head">Revise</div><div class="list">${listRow('closedBook', 'var(--accent)', 'Quick Reference', 'Signals, lights, buoyage, Beaufort, formulas', 'nav', 'reference')}</div>
    <div class="list-head">Syllabus themes (shorebased theory)</div><div class="list">${themes.map((t) => `<div class="list-row">${esc(t)}</div>`).join('')}</div>
    <div class="list-head">Tips to pass</div><div class="list">${tips.map((t) => `<div class="list-row">${icon('bulb', 'ic', 'color:var(--amber)')}<span>${esc(t)}</span></div>`).join('')}</div>
    <div class="list-head">About the content</div><div class="card flat stack-sm small muted">
      <div>All questions in this app are original study aids written from publicly available collision regulations (COLREGS / IRPCS), standard navigation practice, and publicly described Coastal Skipper / Yachtmaster Offshore shorebased theory themes. Content is not copied from any official RYA exam paper or third-party app.</div>
      <a href="${LINKS.colregs}" target="_blank" rel="noopener">IMO COLREGs overview (public)</a></div>
    <div class="list-head">Disclaimer</div><div class="card flat small muted">This app is an independent, unofficial study aid. It is not affiliated with, endorsed by, or connected to the Royal Yachting Association (RYA) or any other awarding body. "Yachtmaster", "Coastal Skipper", and related terms refer to widely known training frameworks and are used descriptively. Practising here does not guarantee a pass on any official assessment. Always follow current regulations, charts, and good seamanship afloat.</div>
  </div>`;
}

const REFERENCE = [
  ['Sound signals (Rule 34)', [['1 short', 'Altering course to starboard'], ['2 short', 'Altering course to port'], ['3 short', 'Engines going astern'], ['5+ short and rapid', 'Doubt or danger: I do not understand your intentions'], ['2 prolonged + 1 short', 'Intend to overtake on your starboard side (narrow channel)'], ['2 prolonged + 2 short', 'Intend to overtake on your port side (narrow channel)'], ['1 prolonged', 'Approaching a bend or leaving a berth']]],
  ['Fog signals (Rule 35), every 2 minutes', [['Power-driven, making way', 'One prolonged blast'], ['Power-driven, stopped', 'Two prolonged blasts'], ['Sailing, NUC, RAM, fishing, towing', 'One prolonged + two short'], ['At anchor (under 100 m)', 'Bell rapidly for 5 seconds, every minute']]],
  ['Order of priority (Rule 18)', [['1', 'Not under command'], ['2', 'Restricted in ability to manoeuvre'], ['3', 'Vessel engaged in fishing'], ['4', 'Sailing vessel'], ['5', 'Power-driven vessel keeps clear of all of the above'], ['Always', 'An overtaking vessel keeps clear (Rule 13)']]],
  ['Light arcs (Rule 21)', [['Masthead light', '225°, white'], ['Sidelights', '112.5° each: green starboard, red port'], ['Sternlight', '135°, white'], ['Towing light', '135°, yellow'], ['All-round light', '360°']]],
  ['Cardinal marks', [['North', 'Black over yellow, cones up, continuous quick flash'], ['East', 'Black, yellow band, black; cones base to base; 3 flashes'], ['South', 'Yellow over black, cones down; 6 flashes + long flash'], ['West', 'Yellow, black band, yellow; cones point to point; 9 flashes']]],
  ['Other IALA marks', [['Port-hand (Region A)', 'Red can; leave to port entering from seaward'], ['Starboard-hand (Region A)', 'Green cone; leave to starboard'], ['Safe water', 'Red and white vertical stripes, red sphere'], ['Isolated danger', 'Black with red bands, two black spheres'], ['Special mark', 'Yellow, X topmark'], ['Emergency wreck', 'Blue and yellow stripes']]],
  ['Compass corrections', [['True to compass', 'Add West variation, then subtract East deviation'], ['Compass to true', 'Add East deviation, then add East variation'], ['Rule of thumb', 'Easterly errors are added going from Compass to True']]],
  ['Rule of Twelfths', [['Hourly change', '1/12, 2/12, 3/12, 3/12, 2/12, 1/12 of the range'], ['Cumulative', '1/12, 3/12, 6/12, 9/12, 11/12, 12/12'], ['Limits', 'Unreliable at ports with a double HW or a long stand']]],
  ['Beaufort scale', [['Force 4', 'Moderate breeze, 11–16 kn'], ['Force 5', 'Fresh breeze, 17–21 kn'], ['Force 6', 'Strong breeze, 22–27 kn'], ['Force 7', 'Near gale, 28–33 kn'], ['Force 8', 'Gale, 34–40 kn'], ['Force 9', 'Severe gale, 41–47 kn'], ['Force 10', 'Storm, 48–55 kn']]],
  ['Shipping Forecast terms', [['Imminent / soon / later', 'Within 6 h / 6–12 h / over 12 h'], ['Visibility', 'Good over 5 NM · moderate 2–5 NM · poor 1000 m–2 NM · fog under 1000 m'], ['Pressure change', 'A fall of 6 hPa or more in 3 hours means a gale may follow']]],
  ['Distress, urgency, safety', [['Mayday', "Grave and imminent danger. Say it three times, then 'This is' and your vessel name three times"], ['Pan-Pan', 'Urgent message, no immediate danger to life'], ['Sécurité', 'Navigational or weather safety message'], ['Channels', 'VHF 16 for voice calling; 70 for digital selective calling only']]]
];
function referenceView() {
  return `<div class="content">${pageHead('Quick Reference', true)}
    ${REFERENCE.map(([title, rows]) => `<div class="list-head">${esc(title)}</div><div class="list">${rows.map(([a, b]) => `<div class="list-row ref-row"><div><b>${esc(a)}</b><span class="small muted">${esc(b)}</span></div></div>`).join('')}</div>`).join('')}
  </div>`;
}

// MARK: - Calculators

const Calc = {
  tide: { range: 4.8, lw: 0.6, hours: 3 },
  sec: { hw: '12:20', diff: -25, height: 5.4, hdiff: -0.3 },
  cts: { track: 90, speed: 6, set: 180, drift: 1.5 },
  dst: { mode: 0, distance: 12, speed: 5.5, time: 2 },
  tideResult() {
    const t = this.tide, h = clamp(t.hours, 0, 6), twelfth = (Number(t.range) || 0) / 12;
    const f = [0, 1, 3, 6, 9, 11, 12], i = Math.floor(h), frac = h - i;
    const a = f[Math.min(6, i)], b = f[Math.min(6, i + 1)];
    const rise = twelfth * (a + (b - a) * frac);
    return { rise, height: (Number(t.lw) || 0) + rise };
  },
  secResult() {
    const s = this.sec, m = /^(\d{1,2}):(\d{2})$/.exec(String(s.hw).trim());
    let time = '—';
    if (m && +m[1] <= 23 && +m[2] <= 59) {
      const tot = (((+m[1] * 60 + +m[2] + Number(s.diff)) % 1440) + 1440) % 1440;
      time = `${String(Math.floor(tot / 60)).padStart(2, '0')}:${String(tot % 60).padStart(2, '0')}`;
    }
    return { time, height: (Number(s.height) || 0) + (Number(s.hdiff) || 0) };
  },
  ctsResult() {
    const c = this.cts, rad = Math.PI / 180, dt = c.track * rad, ts = c.set * rad;
    const tx = c.drift * Math.sin(ts), ty = c.drift * Math.cos(ts);
    const cross = tx * Math.cos(dt) - ty * Math.sin(dt);
    const ratio = clamp(-cross / Math.max(0.1, c.speed), -1, 1);
    let cts = c.track + Math.asin(ratio) / rad;
    cts = ((cts % 360) + 360) % 360;
    const bx = c.speed * Math.sin(cts * rad) + tx, by = c.speed * Math.cos(cts * rad) + ty;
    return { cts, sog: Math.hypot(bx, by) };
  },
  dstResult() {
    const d = this.dst;
    if (d.mode === 0) { const t = d.distance / Math.max(0.01, d.speed), h = Math.floor(t), m = Math.round((t - h) * 60); return `${h} h ${String(m).padStart(2, '0')} m (${t.toFixed(2)} h)`; }
    if (d.mode === 1) return `${(d.speed * d.time).toFixed(1)} NM`;
    return `${(d.distance / Math.max(0.01, d.time)).toFixed(1)} kn`;
  }
};
const numField = (label, key, val, step = 0.1) => `<label class="field"><span>${esc(label)}</span><input type="number" step="${step}" data-input="${key}" value="${val}"></label>`;

function calcView() {
  const sub = routeArg;
  if (!sub) {
    return `<div class="content">${pageHead('Calculators', true)}<div class="list">
      ${listRow('waves', 'var(--accent)', 'Tidal Height (Rule of Twelfths)', '', 'nav-calc', 'tide')}
      ${listRow('clockArrows', 'var(--accent)', 'Secondary Port Time/Height', '', 'nav-calc', 'sec')}
      ${listRow('north', 'var(--accent)', 'Course to Steer (set & drift)', '', 'nav-calc', 'cts')}
      ${listRow('speed', 'var(--accent)', 'Distance · Speed · Time', '', 'nav-calc', 'dst')}</div>
      <p class="list-foot">These tools are study aids for standard navigation practice. Always cross-check with official tide tables, charts and instruments when afloat.</p></div>`;
  }
  const example = (t) => `<div class="list-head">Worked example</div><div class="card flat small muted">${esc(t)}</div>`;
  if (sub === 'tide') {
    const t = Calc.tide;
    return `<div class="content">${pageHead('Tidal Height', true)}<div class="list-head">Inputs</div><div class="list">
      ${numField('Tidal range (m)', 'tide.range', t.range)}${numField('LW height (m)', 'tide.lw', t.lw)}
      <div class="field" style="flex-direction:column;align-items:stretch"><span>Hours after low water: <b id="tide-h">${t.hours.toFixed(1)}</b></span><input type="range" min="0" max="6" step="0.5" data-input="tide.hours" value="${t.hours}"></div></div>
      <div class="list-head">Result</div><div class="list" id="calc-out"></div>
      ${example('Range 4.8 m, LW 0.6 m, 3 hours after LW: rise ≈ 6/12 of range = 2.40 m, so height ≈ 3.00 m. The Rule of Twelfths is a planning approximation; use official curves for critical clearances.')}</div>`;
  }
  if (sub === 'sec') {
    const s = Calc.sec;
    return `<div class="content">${pageHead('Secondary Port', true)}<div class="list-head">Standard port</div><div class="list">
      <label class="field"><span>HW/LW time (HH:MM)</span><input type="text" data-input="sec.hw" value="${esc(s.hw)}"></label>${numField('Standard height (m)', 'sec.height', s.height)}</div>
      <div class="list-head">Differences</div><div class="list">${numField('Time difference (min)', 'sec.diff', s.diff, 5)}${numField('Height difference (m)', 'sec.hdiff', s.hdiff)}</div>
      <div class="list-head">Secondary port</div><div class="list" id="calc-out"></div>
      ${example('Standard HW 12:20, difference −25 min gives secondary HW 11:55. Height 5.4 m with −0.3 m difference gives 5.1 m. Interpolate differences between springs/neaps when tables require it.')}</div>`;
  }
  if (sub === 'cts') {
    const c = Calc.cts;
    return `<div class="content">${pageHead('Course to Steer', true)}<div class="list-head">Inputs (true ° / kn)</div><div class="list">
      ${numField('Desired track (°)', 'cts.track', c.track, 5)}${numField('Boat speed (kn)', 'cts.speed', c.speed)}${numField('Tide set (°)', 'cts.set', c.set, 5)}${numField('Tide drift (kn)', 'cts.drift', c.drift)}</div>
      <div class="list-head">Result</div><div class="list" id="calc-out"></div>
      ${example('Desired track 090°, boat 6 kn, tide set 180° at 1.5 kn: allow for the southerly set by steering slightly north of east. Plot the vector triangle on your chart for exam accuracy; this tool is a quick check.')}</div>`;
  }
  const d = Calc.dst;
  return `<div class="content">${pageHead('Distance · Speed · Time', true)}
    <div class="seg" role="tablist">${['Time', 'Distance', 'Speed'].map((l, i) => `<button class="${d.mode === i ? 'on' : ''}" data-act="dst-mode" data-arg="${i}">${l}</button>`).join('')}</div>
    <div class="list" style="margin-top:14px">${d.mode !== 1 ? numField('Distance (NM)', 'dst.distance', d.distance) : ''}${d.mode !== 2 ? numField('Speed (kn)', 'dst.speed', d.speed) : ''}${d.mode !== 0 ? numField('Time (hours)', 'dst.time', d.time) : ''}</div>
    <div class="list-head">Result</div><div class="list" id="calc-out"></div>
    ${example('12 NM at 5.5 kn: time = 12/5.5 ≈ 2.18 h ≈ 2 h 11 m. Remember: Time = Distance ÷ Speed; Distance = Speed × Time.')}</div>`;
}
function updateCalcOut() {
  const out = document.getElementById('calc-out');
  if (!out) return;
  const row = (l, v) => `<div class="field"><span>${esc(l)}</span><b>${esc(v)}</b></div>`;
  if (routeArg === 'tide') { const r = Calc.tideResult(); out.innerHTML = row('Rise above LW', `${r.rise.toFixed(2)} m`) + row('Predicted height', `${r.height.toFixed(2)} m`); const h = document.getElementById('tide-h'); if (h) h.textContent = Calc.tide.hours.toFixed(1); }
  else if (routeArg === 'sec') { const r = Calc.secResult(); out.innerHTML = row('Time', r.time) + row('Height', `${r.height.toFixed(2)} m`); }
  else if (routeArg === 'cts') { const r = Calc.ctsResult(); out.innerHTML = row('Course to steer', `${Math.round(r.cts)}°`) + row('Approx. SOG', `${r.sog.toFixed(1)} kn`); }
  else if (routeArg === 'dst') { out.innerHTML = `<div class="field"><span class="result-big">${esc(Calc.dstResult())}</span></div>`; }
}

// MARK: - Settings

function settingsView() {
  const owned = Store.owned;
  const plan = Store.hasLifetime ? PRODUCTS.lifetime : owned.has(PRODUCTS.yearly) ? PRODUCTS.yearly : owned.has(PRODUCTS.monthly) ? PRODUCTS.monthly : null;
  const goals = []; for (let g = 5; g <= 50; g += 5) goals.push(g);
  return `<div class="content">${pageHead('Settings')}
    <div class="list-head">Subscription</div><div class="list">
      <div class="list-row">${icon('seal', 'ic', 'color:var(--green)')}<span class="grow" style="color:var(--green);font-weight:600">Membership</span><span class="muted">${Store.hasLifetime ? 'Lifetime' : Store.isSubscribed ? 'Active' : 'None'}</span></div>
      ${plan && Store.detail(plan) ? `<div class="list-row" style="flex-direction:column;align-items:flex-start;gap:2px"><b class="small">${Store.planName(plan)}</b><span class="tiny muted">${esc(Store.disclosure(plan))}</span></div>` : ''}
      <button class="list-row" data-act="settings-restore">${icon('refresh', 'ic', 'color:var(--accent)')}<span class="grow">Restore Purchases</span></button>
      ${Store.hasLifetime ? '' : linkRow('card', 'Manage Subscription', LINKS.manageSubscriptions)}
    </div><p class="list-foot">Manage or cancel anytime in your Microsoft account (account.microsoft.com/services).</p>
    <div class="list-head">Study</div><div class="list">
      <label class="field"><span>Syllabus focus</span><select data-input="set.track">${Object.keys(TRACKS).map((t) => `<option ${P.track === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
      <label class="field"><span>Course / exam date</span><input type="date" data-input="set.date" value="${toDateInput(P.data.testDate ?? Date.now() + 30 * DAY)}"></label>
      <label class="field"><span>Daily goal</span><select data-input="set.goal">${goals.map((g) => `<option value="${g}" ${P.data.dailyGoal === g ? 'selected' : ''}>${g} questions</option>`).join('')}</select></label>
    </div>
    <div class="list-head">Data</div><div class="list"><button class="list-row" data-act="settings-reset" style="color:var(--red)">${icon('trash', 'ic')}<span class="grow">Reset progress</span></button></div>
    <div class="list-head">Legal</div><div class="list">
      ${linkRow('hand', 'Privacy Policy', LINKS.privacy)}${linkRow('doc', 'Terms of Use', LINKS.terms)}${linkRow('help', 'Support', LINKS.support)}</div>
    <div class="list-head">About</div><div class="list">
      <div class="list-row"><span class="grow">Version</span><span class="muted">${APP_VERSION}</span></div>
      <div class="list-row small muted">Independent, unofficial study aid. Not affiliated with the RYA or any awarding body. Content authored from public COLREGS and standard navigation practice. © 2026 MD Shahariar Nazim Joy.</div></div>
  </div>`;
}

// MARK: - Events

const actions = {
  tab: (a) => goTab(a),
  back: () => goBack(),
  nav: (a) => { if (a === 'flashcards') Flash.loaded = false; go(a); },
  'nav-review': (a) => go('review', a),
  'nav-calc': (a) => go('calc', a),
  'start-mock': () => Quiz.start(Bank.mockPaper(P.track), 'mock', 'Mock Paper'),
  'start-quick': (a) => Quiz.start(Bank.quick(P.track, Number(a) || 10), 'practice', 'Quick Practice'),
  'start-weak': () => Quiz.start(P.weakAreaDrill(15), 'practice', 'Weak-Area Drill'),
  'start-topic': (a) => Quiz.start(Bank.practice(a, P.track, 15), 'practice', a),
  'start-review': (a) => Quiz.start(Bank.lookup(a === 'incorrect' ? P.data.incorrect : P.data.bookmarks), 'review', a === 'incorrect' ? 'Review Incorrect' : 'Bookmarked'),
  'q-pick': (a) => { Quiz.select(Number(a)); render(); },
  'q-next': () => { Quiz.next(); render(); window.scrollTo(0, 0); },
  'q-prev': () => { Quiz.prev(); render(); },
  'q-go': (a) => { Quiz.cur.index = Number(a); render(); },
  'q-flag': () => { const c = Quiz.cur; c.flagged.has(c.index) ? c.flagged.delete(c.index) : c.flagged.add(c.index); render(); },
  'q-submit': () => {
    const c = Quiz.cur, left = c.selections.filter((s) => s == null).length;
    if (!left) { Quiz.submit(); render(); return; }
    modal('Submit your paper?', `You have ${left} unanswered question${left === 1 ? '' : 's'}. Unanswered questions count as incorrect.`, [
      { label: 'Keep going' }, { label: 'Submit', cls: '', run: () => { Quiz.submit(); render(); } }
    ]);
  },
  'q-bookmark': () => { P.toggleBookmark(Quiz.q.id); render(); },
  'q-quit': () => modal('Leave this session?', Quiz.cur.mode === 'mock' ? 'Your mock test progress will be lost.' : 'Your answered questions are already saved.', [
    { label: 'Keep going' }, { label: 'Leave', cls: 'red', run: () => { stopTimer(); Quiz.cur = null; goBack(); } }
  ]),
  'q-done': () => { Quiz.cur = null; goBack(); },
  'res-review': () => { const r = Quiz.cur.result; Quiz.cur = null; Quiz.start(Bank.lookup(r.incorrect), 'review', 'Review Incorrect'); },
  'fc-show': () => { Flash.show = true; render(); },
  'fc-grade': (a) => { Flash.grade(Number(a)); render(); },
  'fc-new': () => { Flash.load(); render(); },
  'dst-mode': (a) => { Calc.dst.mode = Number(a); render(); updateCalcOut(); },
  'settings-restore': async () => {
    await Store.restore();
    modal('Restore Purchases', Store.isSubscribed ? 'Your purchases have been restored.' : (Store.error || 'No purchases found for this Microsoft account.'), [{ label: 'OK', cls: '' }]);
    render();
  },
  'settings-reset': () => modal('Reset progress?', 'This clears your answers, streak, mastery and mock history. Your subscription is not affected.', [
    { label: 'Cancel' }, { label: 'Reset', cls: 'red', run: () => { P.reset(); render(); } }
  ]),
  'pw-pick': (a) => { Paywall.selected = a; render(); },
  'pw-buy': async () => {
    Paywall.busy = true; render();
    await Store.purchase(Paywall.selected);
    Paywall.busy = false; render();
  },
  'pw-restore': async () => {
    await Store.restore();
    render();
    modal('Restore Purchases', Store.isSubscribed ? 'Your purchases have been restored.' : (Store.error || 'No purchases found for this Microsoft account.'), [{ label: 'OK', cls: '' }]);
  },
  'pw-reload': async () => { await Store.fetchProducts(); render(); },
  'ob-next': () => { if (Onboarding.canAdvance()) { Onboarding.step++; render(); window.scrollTo(0, 0); } },
  'ob-back': () => { Onboarding.step--; render(); },
  'ob-goal': (a) => { Onboarding.goal = a; render(); },
  'ob-pain': (a) => { const s = Onboarding.pains; s.has(a) ? s.delete(a) : s.add(a); render(); },
  'ob-track': (a) => { Onboarding.track = a; render(); },
  'ob-exp': (a) => { Onboarding.exp = a; render(); },
  'ob-daily': (a) => { Onboarding.dailyGoal = Number(a); render(); },
  'ob-diag-start': () => { Onboarding.diag = Bank.quick(Onboarding.track || 'Coastal Skipper', 5); Onboarding.diagIndex = 0; Onboarding.diagCorrect = 0; Onboarding.diagSelected = null; render(); },
  'ob-diag-pick': (a) => {
    const o = Onboarding;
    if (o.diagSelected != null) return;
    o.diagSelected = Number(a);
    if (o.diagSelected === o.diag[o.diagIndex].correctAnswer) o.diagCorrect++;
    render();
  },
  'ob-diag-next': () => {
    const o = Onboarding;
    o.diagSelected = null; o.diagIndex++;
    if (o.diagIndex >= o.diag.length) o.finish(); else render();
  },
  'ob-finish': () => Onboarding.finish()
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled || !$app.contains(el)) return;
  const fn = actions[el.dataset.act];
  if (fn) { e.preventDefault(); fn(el.dataset.arg); }
});

document.addEventListener('input', (e) => {
  const key = e.target.dataset && e.target.dataset.input;
  if (!key) return;
  const v = e.target.value;
  const [group, field] = key.split('.');
  if (group === 'ob' || key === 'ob-date') { if (v) Onboarding.testDate = fromDateInput(v); return; }
  if (group === 'set') {
    if (field === 'track') { P.data.track = v; P.save(); }
    if (field === 'date' && v) { P.data.testDate = fromDateInput(v); P.save(); }
    if (field === 'goal') { P.data.dailyGoal = Number(v); P.save(); }
    return;
  }
  if (Calc[group]) { Calc[group][field] = field === 'hw' ? v : Number(v); updateCalcOut(); }
});

document.addEventListener('keydown', (e) => {
  if ($modal.innerHTML) { if (e.key === 'Escape') $modal.innerHTML = ''; return; }
  if (e.target.matches && e.target.matches('input, select, textarea')) return;
  const k = e.key.toLowerCase();
  if (route === 'quiz' && Quiz.cur && !Quiz.cur.finished && P.data.onboarded && Store.isSubscribed) {
    const idx = { a: 0, b: 1, c: 2, d: 3, 1: 0, 2: 1, 3: 2, 4: 3 }[k];
    if (idx != null && idx < Quiz.q.options.length) { actions['q-pick'](idx); return; }
    if (k === 'enter') {
      const c = Quiz.cur, last = c.index === c.questions.length - 1;
      if (c.mode === 'mock') { last ? actions['q-submit']() : actions['q-next'](); }
      else if (c.revealed[c.index]) actions['q-next']();
      e.preventDefault();
      return;
    }
    if (k === 'arrowleft' && Quiz.cur.mode === 'mock') { actions['q-prev'](); return; }
    if (k === 'escape') { actions['q-quit'](); return; }
  }
  if (route === 'flashcards' && !Flash.done && Flash.cards.length) {
    if (k === ' ' && !Flash.show) { e.preventDefault(); actions['fc-show'](); return; }
    if (Flash.show && ['1', '2', '3', '4'].includes(k)) { actions['fc-grade'](Number(k) - 1); }
  }
});

// MARK: - Boot

(async function boot() {
  P.load();
  $app.innerHTML = splash();
  try { await Bank.load(); }
  catch { $app.innerHTML = '<div class="splash"><h2>Could not load questions</h2><p class="muted">Check your connection and reopen the app.</p></div>'; return; }
  if (DEMO) {
    if (!P.data.track) P.data.track = 'Coastal Skipper';
    P.data.onboarded = !PARAMS.has('onboarding');
    if (!PARAMS.has('fresh')) P.seedDemo();
  }
  render();
  await Store.init();
  if (DEMO && PARAMS.has('paywall')) {
    // Screenshot of the paywall with the real Store prices (USD).
    Store.owned = new Set(); Store.available = true;
    Store.details = [
      { itemId: PRODUCTS.monthly, price: { currency: 'USD', value: '6.99' } },
      { itemId: PRODUCTS.yearly, price: { currency: 'USD', value: '19.99' } },
      { itemId: PRODUCTS.lifetime, price: { currency: 'USD', value: '29.99' } }
    ];
  }
  if (DEMO && PARAMS.get('screen')) {
    const s = PARAMS.get('screen');
    if (s === 'quiz') { Quiz.start(Bank.quick(P.track, 10), 'practice', 'Quick Practice'); Quiz.select(Quiz.q.correctAnswer); }
    else if (s === 'mock') { Quiz.start(Bank.mockPaper(P.track), 'mock', 'Mock Paper'); Quiz.cur.index = 6; Quiz.cur.selections[6] = 1; }
    else if (s.startsWith('calc-')) go('calc', s.slice(5), false);
    else go(s, null, false);
  }
  render();
  updateCalcOut();
  if ('serviceWorker' in navigator && !IS_LOCAL) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
