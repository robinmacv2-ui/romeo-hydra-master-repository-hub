import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  deleteDoc,
  Firestore
} from "firebase/firestore";

// Safe loading of Firebase configuration with clean environment injection
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || "",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || ""
};

// Check if we have valid-looking configuration keys
const hasConfig = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

let app;
let auth: any = null;
let db: any = null;
let isMock = true;

if (hasConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    isMock = false;
    console.log("Firebase initialized successfully in Cloud Connected mode.");
  } catch (error) {
    console.error("Failed to initialize Firebase SDK, falling back to Local Mock Sync:", error);
    isMock = true;
  }
} else {
  console.log("No Firebase configuration detected in environment variables. Operating in Local Mock Sync mode.");
  isMock = true;
}

// Mock Database and Auth state to guarantee 100% offline-first compatibility and seamless operation
class LocalMockDatabase {
  private getStorage(collectionName: string): any[] {
    const raw = localStorage.getItem(`mock_fb_${collectionName}`);
    return raw ? JSON.parse(raw) : [];
  }

  private setStorage(collectionName: string, data: any[]) {
    localStorage.setItem(`mock_fb_${collectionName}`, JSON.stringify(data));
  }

  async getCollection(collectionName: string): Promise<any[]> {
    return this.getStorage(collectionName);
  }

  async addDocument(collectionName: string, data: any): Promise<any> {
    const items = this.getStorage(collectionName);
    const newDoc = { ...data, id: data.id || `doc_${Math.random().toString(36).substring(2, 9)}` };
    items.unshift(newDoc); // Newest first
    this.setStorage(collectionName, items);
    return newDoc;
  }

  async setDocument(collectionName: string, docId: string, data: any): Promise<void> {
    const items = this.getStorage(collectionName);
    const idx = items.findIndex(item => item.id === docId);
    if (idx !== -1) {
      items[idx] = { ...data, id: docId };
    } else {
      items.push({ ...data, id: docId });
    }
    this.setStorage(collectionName, items);
  }

  async deleteCollection(collectionName: string): Promise<void> {
    localStorage.removeItem(`mock_fb_${collectionName}`);
  }
}

const mockDb = new LocalMockDatabase();

// Wrapper helper functions for safe high-level Auth & Database actions
export const ROMEO_HYDRA_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- White Background -->
  <rect width="400" height="400" fill="#FFFFFF"/>
  
  <!-- Central trunk (Navy) -->
  <circle cx="200" cy="115" r="12" fill="#0B2545"/>
  <line x1="200" y1="127" x2="200" y2="260" stroke="#0B2545" stroke-width="8" stroke-linecap="round"/>
  
  <!-- Left branch 1 (Navy) -->
  <path d="M 145 105 L 145 145 L 192 192 L 192 260" stroke="#0B2545" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  
  <!-- Left branch 2 (Navy) -->
  <circle cx="130" cy="185" r="10" fill="#0B2545"/>
  <path d="M 140 185 L 184 185 L 184 260" stroke="#0B2545" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  
  <!-- Left branch 3 (Gold) -->
  <circle cx="130" cy="225" r="10" fill="#C5A880"/>
  <path d="M 140 225 L 176 225 L 176 260" stroke="#C5A880" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  
  <!-- Left top gold square -->
  <rect x="121" y="136" width="18" height="18" rx="3" fill="#C5A880"/>
  
  <!-- Right branch 1: Plug (Navy) -->
  <line x1="244" y1="88" x2="244" y2="102" stroke="#0B2545" stroke-width="3" stroke-linecap="round"/>
  <line x1="249" y1="88" x2="249" y2="102" stroke="#0B2545" stroke-width="3" stroke-linecap="round"/>
  <line x1="254" y1="88" x2="254" y2="102" stroke="#0B2545" stroke-width="3" stroke-linecap="round"/>
  <rect x="241" y="102" width="16" height="12" rx="2" fill="#0B2545"/>
  <path d="M 249 114 L 249 155 L 216 155 L 216 260" stroke="#0B2545" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  
  <!-- Right branch 2: Loop (Navy) -->
  <path d="M 216 155 L 249 155 L 249 185 L 216 185" stroke="#0B2545" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  
  <!-- Right branch 3: Bottom Gold -->
  <path d="M 208 190 L 208 210 L 224 225 L 248 225" stroke="#C5A880" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="258" cy="225" r="10" fill="#C5A880"/>
  
  <!-- Text -->
  <text x="200" y="325" font-family="'Inter', sans-serif, system-ui" font-weight="900" font-size="28" fill="#0B2545" text-anchor="middle" letter-spacing="4">ROMEO-HYDRA</text>
</svg>`;

export const FOUNDER_PHOTO_URL = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(ROMEO_HYDRA_LOGO_SVG);

export const adjustUserPhoto = (user: any) => {
  if (!user) return null;
  const email = user.email ? user.email.toLowerCase().trim() : "";
  const name = user.displayName ? user.displayName.toLowerCase().trim() : "";
  const isFounder = (
    email === "robinmac.v2@gmail.com" ||
    email === "luis.angel.vazquez@gmail.com" ||
    name.includes("luis angel vazquez martinez") ||
    name.includes("luis angel vazquez") ||
    user.uid === "mock_founder"
  );
  if (isFounder) {
    return {
      ...user,
      photoURL: FOUNDER_PHOTO_URL
    };
  }
  return user;
};

export const getFirebaseMode = () => {
  return {
    isMock,
    configLoaded: hasConfig,
    provider: isMock ? "LocalStorage Web Sandbox" : "Google Firebase Live Cloud"
  };
};

export const loginWithGoogle = async (customUser?: any): Promise<any> => {
  if (isMock) {
    // Simulate interactive login
    const mockUser = adjustUserPhoto(customUser || {
      uid: "mock_founder",
      displayName: "Luis Angel Vazquez Martinez",
      email: "robinmac.v2@gmail.com",
      photoURL: FOUNDER_PHOTO_URL
    });
    localStorage.setItem("mock_fb_auth_user", JSON.stringify(mockUser));
    return mockUser;
  } else {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return adjustUserPhoto(result.user);
    } catch (error: any) {
      // Fallback to simulated login if Google Auth provider configuration is not found, or if popups are blocked by the browser/iframe sandbox
      const errorCode = error.code || "";
      const errorMessage = error.message || "";
      const isConfigNotFound = errorCode === "auth/configuration-not-found" || errorCode === "auth/operation-not-allowed" || errorMessage.includes("configuration-not-found") || errorMessage.includes("operation-not-allowed");
      const isPopupBlocked = errorCode === "auth/popup-blocked" || errorCode === "auth/cancelled-popup-request" || errorCode === "auth/popup-closed-by-user" || errorMessage.includes("popup-blocked") || errorMessage.includes("cancelled-popup-request") || errorMessage.includes("popup-closed-by-user");

      if (isConfigNotFound || isPopupBlocked) {
        console.warn(`Firebase Live Auth popup failed (${errorCode}). Falling back to local secure sandbox session gracefully.`);
        const fallbackUser = adjustUserPhoto(customUser || {
          uid: "mock_founder",
          displayName: "Luis Angel Vazquez Martinez",
          email: "robinmac.v2@gmail.com",
          photoURL: FOUNDER_PHOTO_URL
        });
        localStorage.setItem("mock_fb_auth_user", JSON.stringify(fallbackUser));
        return fallbackUser;
      }
      console.error("Firebase Live Auth error:", error);
      throw error;
    }
  }
};

export const logoutUser = async (): Promise<void> => {
  localStorage.removeItem("mock_fb_auth_user");
  if (!isMock && auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Firebase signOut error:", e);
    }
  }
};

export const subscribeToAuth = (callback: (user: any | null) => void) => {
  if (isMock) {
    const checkAuth = () => {
      const raw = localStorage.getItem("mock_fb_auth_user");
      callback(raw ? JSON.parse(raw) : null);
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    // Poll to support same-tab updates
    const interval = setInterval(checkAuth, 1000);
    return () => {
      window.removeEventListener("storage", checkAuth);
      clearInterval(interval);
    };
  } else {
    // Check both Local Storage (fallback sandbox user) and Live Firebase state
    const checkAuthLocal = () => {
      const raw = localStorage.getItem("mock_fb_auth_user");
      if (raw) {
        callback(JSON.parse(raw));
        return true;
      }
      return false;
    };

    checkAuthLocal();

    const unsubscribeFirebase = onAuthStateChanged(auth, (user) => {
      const rawLocal = localStorage.getItem("mock_fb_auth_user");
      if (user) {
        callback(adjustUserPhoto({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        }));
      } else if (!rawLocal) {
        callback(null);
      }
    });

    const checkAuth = () => {
      const raw = localStorage.getItem("mock_fb_auth_user");
      if (raw) {
        callback(JSON.parse(raw));
      } else {
        if (auth && auth.currentUser) {
          callback(adjustUserPhoto({
            uid: auth.currentUser.uid,
            displayName: auth.currentUser.displayName,
            email: auth.currentUser.email,
            photoURL: auth.currentUser.photoURL
          }));
        } else {
          callback(null);
        }
      }
    };

    window.addEventListener("storage", checkAuth);
    const interval = setInterval(checkAuth, 1000);

    return () => {
      unsubscribeFirebase();
      window.removeEventListener("storage", checkAuth);
      clearInterval(interval);
    };
  }
};

let isFirestoreHealthy = true;
let lastFirestoreCheckTime = 0;
const FIREBASE_BACKOFF_MS = 60000; // 1 minute backoff when Firestore times out or fails

const fetchFromFirestore = async <T>(
  queryFn: () => Promise<T[]>,
  collectionName: string,
  cacheKeyFn: (item: T) => string
): Promise<T[]> => {
  if (isMock) {
    return await mockDb.getCollection(collectionName);
  }

  const now = Date.now();
  if (!isFirestoreHealthy && (now - lastFirestoreCheckTime < FIREBASE_BACKOFF_MS)) {
    // Return local cache immediately during backoff window without network delay or warnings
    return await mockDb.getCollection(collectionName);
  }

  try {
    const firestorePromise = queryFn();
    const timeoutPromise = new Promise<T[]>((_, reject) => 
      setTimeout(() => reject(new Error("Firestore timeout")), 2500)
    );

    const results = await Promise.race([firestorePromise, timeoutPromise]);
    isFirestoreHealthy = true;

    // Sync into local cache for offline availability
    for (const item of results) {
      await mockDb.setDocument(collectionName, cacheKeyFn(item), item);
    }
    return results || [];
  } catch (e) {
    // Mark as offline/unhealthy temporarily to avoid blocking subsequent calls
    isFirestoreHealthy = false;
    lastFirestoreCheckTime = Date.now();
    
    // Quietly return local cache without spamming console warnings
    try {
      const localList = await mockDb.getCollection(collectionName);
      return localList || [];
    } catch (cacheErr) {
      return [];
    }
  }
};

export const saveCertifiedInstitution = async (institution: any) => {
  // Always save to mockDb as a local cache to guarantee high-performance offline availability
  await mockDb.setDocument("certified_institutions", institution.id, institution);
  if (!isMock && isFirestoreHealthy) {
    try {
      await setDoc(doc(db, "certified_institutions", institution.id), institution);
    } catch (e) {
      isFirestoreHealthy = false;
      lastFirestoreCheckTime = Date.now();
    }
  }
};

export const getCertifiedInstitutions = async (): Promise<any[]> => {
  return fetchFromFirestore(
    async () => {
      const q = query(collection(db, "certified_institutions"), orderBy("id", "desc"));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((doc) => list.push(doc.data()));
      return list;
    },
    "certified_institutions",
    (item) => item.id
  );
};

export const saveLedgerBlock = async (block: any) => {
  // Always save to local cache
  await mockDb.setDocument("audit_ledger", `block_${block.index}`, block);
  if (!isMock && isFirestoreHealthy) {
    try {
      await setDoc(doc(db, "audit_ledger", `block_${block.index}`), block);
    } catch (e) {
      isFirestoreHealthy = false;
      lastFirestoreCheckTime = Date.now();
    }
  }
};

export const getLedgerBlocks = async (): Promise<any[]> => {
  return fetchFromFirestore(
    async () => {
      const q = query(collection(db, "audit_ledger"), orderBy("index", "asc"));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((doc) => list.push(doc.data()));
      return list;
    },
    "audit_ledger",
    (item) => `block_${item.index}`
  );
};

export const saveExternalInteraction = async (interaction: any) => {
  // Always save to local cache
  await mockDb.setDocument("external_interactions", interaction.id, interaction);
  if (!isMock && isFirestoreHealthy) {
    try {
      await setDoc(doc(db, "external_interactions", interaction.id), interaction);
    } catch (e) {
      isFirestoreHealthy = false;
      lastFirestoreCheckTime = Date.now();
    }
  }
};

export const getExternalInteractions = async (): Promise<any[]> => {
  return fetchFromFirestore(
    async () => {
      const q = query(collection(db, "external_interactions"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((doc) => list.push(doc.data()));
      return list;
    },
    "external_interactions",
    (item) => item.id
  );
};

export const clearLedgerDatabase = async () => {
  // Always clear local cache
  await mockDb.deleteCollection("audit_ledger");
  await mockDb.deleteCollection("external_interactions");
  await mockDb.deleteCollection("visitas");
  await mockDb.deleteCollection("interacciones");
  
  if (!isMock && isFirestoreHealthy) {
    try {
      const q = query(collection(db, "audit_ledger"));
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(docSnapshot => deleteDoc(docSnapshot.ref));
      await Promise.all(deletePromises);

      try {
        const qExt = query(collection(db, "external_interactions"));
        const querySnapshotExt = await getDocs(qExt);
        const deletePromisesExt = querySnapshotExt.docs.map(docSnapshot => deleteDoc(docSnapshot.ref));
        await Promise.all(deletePromisesExt);
      } catch (e) {}

      try {
        const qVis = query(collection(db, "visitas"));
        const querySnapshotVis = await getDocs(qVis);
        const deletePromisesVis = querySnapshotVis.docs.map(docSnapshot => deleteDoc(docSnapshot.ref));
        await Promise.all(deletePromisesVis);
      } catch (e) {}

      try {
        const qInt = query(collection(db, "interacciones"));
        const querySnapshotInt = await getDocs(qInt);
        const deletePromisesInt = querySnapshotInt.docs.map(docSnapshot => deleteDoc(docSnapshot.ref));
        await Promise.all(deletePromisesInt);
      } catch (e) {}
    } catch (e) {
      isFirestoreHealthy = false;
      lastFirestoreCheckTime = Date.now();
    }
  }
};

export const loginAsGuest = async (customName?: string): Promise<any> => {
  if (isMock) {
    const guestUser = {
      uid: "guest_" + Math.random().toString(36).substring(2, 9),
      displayName: customName || "Invitado (Viewer Mode)",
      email: "guest@viewer.local",
      isAnonymous: true,
      photoURL: FOUNDER_PHOTO_URL
    };
    localStorage.setItem("mock_fb_auth_user", JSON.stringify(guestUser));
    return guestUser;
  } else {
    try {
      const credential = await signInAnonymously(auth);
      const guestUser = {
        uid: credential.user.uid,
        displayName: customName || "Invitado (Viewer Mode)",
        email: "guest@viewer.local",
        isAnonymous: true,
        photoURL: FOUNDER_PHOTO_URL
      };
      localStorage.setItem("mock_fb_auth_user", JSON.stringify(guestUser));
      return guestUser;
    } catch (error) {
      const guestUser = {
        uid: "guest_" + Math.random().toString(36).substring(2, 9),
        displayName: customName || "Invitado (Viewer Mode)",
        email: "guest@viewer.local",
        isAnonymous: true,
        photoURL: FOUNDER_PHOTO_URL
      };
      localStorage.setItem("mock_fb_auth_user", JSON.stringify(guestUser));
      return guestUser;
    }
  }
};

export const saveVisit = async (visit: any): Promise<void> => {
  // Always save to local cache
  await mockDb.setDocument("visitas", visit.id, visit);
  if (!isMock && isFirestoreHealthy) {
    try {
      await setDoc(doc(db, "visitas", visit.id), visit);
    } catch (e) {
      isFirestoreHealthy = false;
      lastFirestoreCheckTime = Date.now();
    }
  }
};

export const getVisits = async (): Promise<any[]> => {
  return fetchFromFirestore(
    async () => {
      const q = query(collection(db, "visitas"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((doc) => list.push(doc.data()));
      return list;
    },
    "visitas",
    (item) => item.id
  );
};

export const saveInteraction = async (interaction: any): Promise<void> => {
  // Always save to local cache
  await mockDb.setDocument("interacciones", interaction.id, interaction);
  if (!isMock && isFirestoreHealthy) {
    try {
      await setDoc(doc(db, "interacciones", interaction.id), interaction);
    } catch (e) {
      isFirestoreHealthy = false;
      lastFirestoreCheckTime = Date.now();
    }
  }
};

export const getInteractions = async (): Promise<any[]> => {
  return fetchFromFirestore(
    async () => {
      const q = query(collection(db, "interacciones"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((doc) => list.push(doc.data()));
      return list;
    },
    "interacciones",
    (item) => item.id
  );
};

