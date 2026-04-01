import { computed, ref } from "vue";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "src/boot/firebase.js";
import { defaultTranslations } from "src/composables/defaultTranslations.js";

const STORAGE_KEY = "appLanguage";
const currentLanguage = ref("it");
const translations = ref({ ...defaultTranslations });

let initialized = false;
let unsubscribeTranslations = null;

const interpolate = (template, params = {}) => {
  return String(template).replace(
    /\{(\w+)\}/g,
    (_, key) => params[key] ?? `{${key}}`
  );
};

const normalizeTranslations = (source = {}) => {
  const merged = { ...defaultTranslations };

  Object.entries(source).forEach(([key, value]) => {
    merged[key] = {
      it: value?.it ?? merged[key]?.it ?? key,
      en: value?.en ?? merged[key]?.en ?? key,
    };
  });

  return merged;
};

const loadLanguage = () => {
  const savedLanguage = localStorage.getItem(STORAGE_KEY);
  if (savedLanguage === "it" || savedLanguage === "en") {
    currentLanguage.value = savedLanguage;
  }
};

const initTranslations = async () => {
  if (initialized === true) return;
  initialized = true;
  loadLanguage();

  try {
    const docRef = doc(db, "config", "translations");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      translations.value = normalizeTranslations(docSnap.data());
    }

    unsubscribeTranslations = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          translations.value = normalizeTranslations(snapshot.data());
        } else {
          translations.value = { ...defaultTranslations };
        }
      },
      (error) => {
        console.error("Translations snapshot error:", error);
      }
    );
  } catch (error) {
    console.error("Error initializing translations:", error);
  }
};

export function useI18n() {
  initTranslations();

  const language = computed(() => currentLanguage.value);

  const t = (key, params = {}) => {
    const entry = translations.value[key] || defaultTranslations[key];
    const rawValue = entry?.[currentLanguage.value] ?? entry?.it ?? key;
    return interpolate(rawValue, params);
  };

  const setLanguage = (lang) => {
    if (lang !== "it" && lang !== "en") return;
    currentLanguage.value = lang;
    localStorage.setItem(STORAGE_KEY, lang);
  };

  const saveTranslations = async (nextTranslations) => {
    const docRef = doc(db, "config", "translations");
    await setDoc(docRef, normalizeTranslations(nextTranslations));
  };

  return {
    language,
    locale: language,
    languages: [
      { label: "IT", value: "it" },
      { label: "EN", value: "en" },
    ],
    translations,
    t,
    setLanguage,
    saveTranslations,
    defaultTranslations,
    unsubscribeTranslations,
  };
}
