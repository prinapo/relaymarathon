import { computed, ref } from "vue";
import { Platform } from "quasar";
import { SocialLogin } from "@capgo/capacitor-social-login";
import { auth } from "src/boot/firebase.js";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPopup,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

const DEFAULT_GOOGLE_WEB_CLIENT_ID =
  "600515034231-b5vnh2ghitevnd6c4sl273mtbuqlab01.apps.googleusercontent.com";

const user = ref(null);
const isLoading = ref(true);
const userClaims = ref(null);
const isAdmin = computed(() => userClaims.value?.admin === true);
const authInitialized = ref(false);

let initialized = false;
let unsubscribe = null;
let authReadyResolver = null;
let socialLoginInitialized = false;

const authReadyPromise = new Promise((resolve) => {
  authReadyResolver = resolve;
});

const ensureSocialLoginInitialized = async () => {
  if (socialLoginInitialized) return;
  socialLoginInitialized = true;

  const webClientId =
    import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID || DEFAULT_GOOGLE_WEB_CLIENT_ID;

  await SocialLogin.initialize({
    google: {
      webClientId: webClientId,
      mode: "online",
    },
  });
};

const initAuth = () => {
  if (initialized) return;
  initialized = true;

  unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    try {
      user.value = firebaseUser;

      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult(true);
        userClaims.value = tokenResult.claims;
        console.log('[DEBUG Auth] Token claims:', JSON.stringify(tokenResult.claims));
      } else {
        userClaims.value = null;
      }
    } catch (error) {
      console.error("Error resolving auth token:", error);
      user.value = firebaseUser || null;
      userClaims.value = null;
    } finally {
      authInitialized.value = true;
      isLoading.value = false;
      if (authReadyResolver) {
        authReadyResolver(user.value);
        authReadyResolver = null;
      }
    }
  });
};

export const waitForAuthReady = async () => {
  initAuth();
  if (authInitialized.value) {
    return user.value;
  }
  await authReadyPromise;
  return user.value;
};

export function useAuth() {
  initAuth();

  const login = async () => {
    try {
      if (Platform.is.capacitor) {
        await ensureSocialLoginInitialized();
        const result = await SocialLogin.login({
          provider: "google",
          options: {
            scopes: ["profile", "email"],
          },
        });
        const idToken = result.result.idToken;
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
      } else {
        const provider = new GoogleAuthProvider();
        provider.addScope("profile");
        provider.addScope("email");
        await signInWithPopup(auth, provider);
      }
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Email login error:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email, password) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Email signup error:", error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (Platform.is.capacitor) {
        await ensureSocialLoginInitialized();
        await Promise.allSettled([
          signOut(auth),
          SocialLogin.logout({ provider: "google" }).catch(() => undefined),
        ]);
      } else {
        await signOut(auth);
      }
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const getIdTokenClaims = async () => {
    if (!user.value) return null;
    const tokenResult = await user.value.getIdTokenResult();
    return tokenResult.claims;
  };

  return {
    user,
    isLoading,
    authInitialized,
    login,
    loginWithEmail,
    signUpWithEmail,
    resetPassword,
    logout,
    isAdmin,
    getIdTokenClaims,
    cleanupAuthListener: () => unsubscribe?.(),
  };
}
