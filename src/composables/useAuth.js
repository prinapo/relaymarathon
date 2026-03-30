import { computed, ref } from "vue";
import { Capacitor } from "@capacitor/core";
import { SocialLogin } from "@capgo/capacitor-social-login";
import { auth } from "src/boot/firebase.js";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
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
let socialLoginInitializationPromise = null;

const authReadyPromise = new Promise((resolve) => {
  authReadyResolver = resolve;
});

const getGoogleClientConfig = () => {
  const webClientId =
    import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID || DEFAULT_GOOGLE_WEB_CLIENT_ID;
  const iOSClientId = import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID;
  const iOSServerClientId =
    import.meta.env.VITE_GOOGLE_IOS_SERVER_CLIENT_ID || webClientId;

  return {
    webClientId,
    iOSClientId,
    iOSServerClientId,
  };
};

const createGoogleLoginOptions = () => {
  const platform = Capacitor.getPlatform();

  if (platform === "android") {
    return {
      filterByAuthorizedAccounts: false,
      preferIdTokenOnly: true,
    };
  }

  if (platform === "ios") {
    return {
      forcePrompt: true,
    };
  }

  return {
    prompt: "select_account",
  };
};

const ensureSocialLoginInitialized = async () => {
  if (socialLoginInitializationPromise) {
    return socialLoginInitializationPromise;
  }

  socialLoginInitializationPromise = (async () => {
    const { webClientId, iOSClientId, iOSServerClientId } =
      getGoogleClientConfig();

    if (!webClientId) {
      throw new Error(
        "Google login is not configured: missing web client ID."
      );
    }

    const googleConfig = {
      webClientId,
      mode: "online",
    };

    if (iOSClientId) {
      googleConfig.iOSClientId = iOSClientId;
      googleConfig.iOSServerClientId = iOSServerClientId;
    }

    await SocialLogin.initialize({
      google: googleConfig,
    });
  })().catch((error) => {
    socialLoginInitializationPromise = null;
    throw error;
  });

  return socialLoginInitializationPromise;
};

const getGoogleFirebaseCredential = (loginResult) => {
  const idToken = loginResult?.result?.idToken;

  if (!idToken) {
    throw new Error(
      "Google login completed but did not return an ID token usable by Firebase."
    );
  }

  return GoogleAuthProvider.credential(idToken);
};

const initAuth = () => {
  if (initialized) return;
  initialized = true;

  // Preload the social login provider early so the web popup/native bridge
  // is ready by the time the user taps the Google button.
  ensureSocialLoginInitialized().catch((error) => {
    console.warn("Social login initialization failed:", error);
  });

  unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    user.value = firebaseUser;

    if (firebaseUser) {
      const tokenResult = await firebaseUser.getIdTokenResult(true);
      userClaims.value = tokenResult.claims;
    } else {
      userClaims.value = null;
    }

    authInitialized.value = true;
    isLoading.value = false;
    if (authReadyResolver) {
      authReadyResolver(firebaseUser);
      authReadyResolver = null;
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
      await ensureSocialLoginInitialized();

      const googleLoginResult = await SocialLogin.login({
        provider: "google",
        options: createGoogleLoginOptions(),
      });

      const credential = getGoogleFirebaseCredential(googleLoginResult);
      await signInWithCredential(auth, credential);
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
      await Promise.allSettled([
        signOut(auth),
        ensureSocialLoginInitialized()
          .then(() => SocialLogin.logout({ provider: "google" }))
          .catch(() => undefined),
      ]);
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
