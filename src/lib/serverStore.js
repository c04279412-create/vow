import fs from 'fs';
import path from 'path';
import {
  initialSettings,
  initialCategories,
  initialProducts,
  initialOrders,
  initialBanners,
  initialCoupons,
  initialReviews,
  initialAdminUsers,
  initialCollections,
  initialAuditLogs,
} from './dataStore';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store_state.json');

const defaultState = {
  settings: { ...initialSettings },
  categories: [...initialCategories],
  products: [...initialProducts],
  orders: [...initialOrders],
  banners: [...initialBanners],
  coupons: [...initialCoupons],
  reviews: [...initialReviews],
  users: [...initialAdminUsers],
  customers: [],
  collections: [...initialCollections],
  auditLogs: [...initialAuditLogs],
};

function ensureDataDirectory() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('Could not create data directory:', err.message);
  }
}

let cachedState = null;
let lastMtime = 0;

function saveStateToDisk(state) {
  ensureDataDirectory();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    try {
      lastMtime = fs.statSync(DB_FILE).mtimeMs;
    } catch (e) {}
    cachedState = state;
    global.__vowcrafts_storeState = state;
  } catch (err) {
    console.error('Could not write store_state.json:', err.message);
  }
}

function loadStateFromDisk() {
  ensureDataDirectory();
  try {
    if (fs.existsSync(DB_FILE)) {
      const stat = fs.statSync(DB_FILE);
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') {
        const state = {
          settings: parsed.settings || defaultState.settings,
          categories: Array.isArray(parsed.categories) ? parsed.categories : defaultState.categories,
          products: Array.isArray(parsed.products) ? parsed.products : defaultState.products,
          orders: Array.isArray(parsed.orders) ? parsed.orders : defaultState.orders,
          banners: Array.isArray(parsed.banners) ? parsed.banners : defaultState.banners,
          coupons: Array.isArray(parsed.coupons) ? parsed.coupons : defaultState.coupons,
          reviews: Array.isArray(parsed.reviews) ? parsed.reviews : defaultState.reviews,
          users: Array.isArray(parsed.users) ? parsed.users : defaultState.users,
          customers: Array.isArray(parsed.customers) ? parsed.customers : [],
          collections: Array.isArray(parsed.collections) ? parsed.collections : defaultState.collections,
          auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : defaultState.auditLogs,
        };
        lastMtime = stat.mtimeMs;
        cachedState = state;
        global.__vowcrafts_storeState = state;
        return state;
      }
    }
  } catch (err) {
    console.warn('Could not read store_state.json, creating new file:', err.message);
  }

  // File doesn't exist yet, save default initial state to disk
  saveStateToDisk(defaultState);
  return defaultState;
}

export const getStoreState = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const stat = fs.statSync(DB_FILE);
      if (cachedState && stat.mtimeMs === lastMtime) {
        return cachedState;
      }
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') {
        const state = {
          settings: parsed.settings || defaultState.settings,
          categories: Array.isArray(parsed.categories) ? parsed.categories : defaultState.categories,
          products: Array.isArray(parsed.products) ? parsed.products : defaultState.products,
          orders: Array.isArray(parsed.orders) ? parsed.orders : defaultState.orders,
          banners: Array.isArray(parsed.banners) ? parsed.banners : defaultState.banners,
          coupons: Array.isArray(parsed.coupons) ? parsed.coupons : defaultState.coupons,
          reviews: Array.isArray(parsed.reviews) ? parsed.reviews : defaultState.reviews,
          users: Array.isArray(parsed.users) ? parsed.users : defaultState.users,
          customers: Array.isArray(parsed.customers) ? parsed.customers : [],
          collections: Array.isArray(parsed.collections) ? parsed.collections : defaultState.collections,
          auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : defaultState.auditLogs,
        };
        lastMtime = stat.mtimeMs;
        cachedState = state;
        global.__vowcrafts_storeState = state;
        return state;
      }
    }
  } catch (err) {
    console.error('Error reading store_state.json in getStoreState:', err.message);
  }

  if (cachedState) return cachedState;
  if (!global.__vowcrafts_storeState) {
    global.__vowcrafts_storeState = loadStateFromDisk();
  }
  return global.__vowcrafts_storeState;
};

export const updateStoreState = (updater) => {
  const currentState = getStoreState();
  const nextState =
    typeof updater === 'function' ? updater(currentState) : { ...currentState, ...updater };
  cachedState = nextState;
  global.__vowcrafts_storeState = nextState;
  saveStateToDisk(nextState);
  return nextState;
};
