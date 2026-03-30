<template>
  <q-page class="flex flex-center bg-grey-1">
    <q-card class="login-card q-pa-lg">
      <q-card-section class="text-center q-pb-md">
        <div class="app-logo q-mb-md">
          <q-icon name="directions_run" size="48px" color="primary" />
        </div>
        <div class="text-h5 q-mb-xs">{{ t("login.appName") }}</div>
        <div class="text-body1 text-grey-7">{{ t("login.title") }}</div>
      </q-card-section>

      <q-card-section v-if="view === 'email'" class="q-pt-none">
        <q-input
          v-model="email"
          :label="t('login.email')"
          type="email"
          outlined
          dense
          :error="!!errors.email"
          :error-message="errors.email"
          @keyup.enter="handleEmailNext"
        >
          <template #prepend>
            <q-icon name="email" color="grey" />
          </template>
        </q-input>
      </q-card-section>

      <q-card-section v-else-if="view === 'password'" class="q-pt-none">
        <div class="text-body2 q-mb-md">
          {{ email }}
        </div>
        <q-input
          v-model="password"
          :label="t('login.password')"
          :type="showPassword ? 'text' : 'password'"
          outlined
          dense
          :error="!!errors.password"
          :error-message="errors.password"
          @keyup.enter="handleSignIn"
        >
          <template #prepend>
            <q-icon name="lock" color="grey" />
          </template>
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>
        <div class="q-mt-md">
          <q-btn
            flat
            no-caps
            color="primary"
            :label="t('login.forgotPassword')"
            @click="view = 'forgot'"
          />
        </div>
      </q-card-section>

      <q-card-section v-else-if="view === 'signup'" class="q-pt-none">
        <div class="text-body2 q-mb-md">
          {{ email }}
        </div>
        <q-input
          v-model="password"
          :label="t('login.password')"
          :type="showPassword ? 'text' : 'password'"
          outlined
          dense
          :error="!!errors.password"
          :error-message="errors.password"
          class="q-mb-sm"
          @keyup.enter="handleSignUp"
        >
          <template #prepend>
            <q-icon name="lock" color="grey" />
          </template>
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>
        <q-input
          v-model="confirmPassword"
          :label="t('login.confirmPassword')"
          :type="showPassword ? 'text' : 'password'"
          outlined
          dense
          :error="!!errors.confirmPassword"
          :error-message="errors.confirmPassword"
          @keyup.enter="handleSignUp"
        >
          <template #prepend>
            <q-icon name="lock_outline" color="grey" />
          </template>
        </q-input>
      </q-card-section>

      <q-card-section v-else-if="view === 'forgot'" class="q-pt-none">
        <div class="text-body2 q-mb-md text-grey-7">
          {{ t("login.resetPassword") }}
        </div>
        <q-input
          v-model="email"
          :label="t('login.email')"
          type="email"
          outlined
          dense
          :error="!!errors.email"
          :error-message="errors.email"
          @keyup.enter="handleResetPassword"
        >
          <template #prepend>
            <q-icon name="email" color="grey" />
          </template>
        </q-input>
      </q-card-section>

      <q-card-section v-if="view === 'email'">
        <q-btn
          color="primary"
          :label="t('login.next')"
          class="full-width"
          unelevated
          :loading="loading"
          @click="handleEmailNext"
        />
      </q-card-section>

      <q-card-section v-else-if="view === 'password'">
        <q-btn
          color="primary"
          :label="t('login.signin')"
          class="full-width"
          unelevated
          :loading="loading"
          @click="handleSignIn"
        />
        <q-btn
          flat
          no-caps
          color="primary"
          :label="t('login.createAccount')"
          class="full-width q-mt-sm"
          @click="
            view = 'signup';
            password = '';
            confirmPassword = '';
          "
        />
      </q-card-section>

      <q-card-section v-else-if="view === 'signup'">
        <q-btn
          color="primary"
          :label="t('login.createAccount')"
          class="full-width"
          unelevated
          :loading="loading"
          @click="handleSignUp"
        />
        <q-btn
          flat
          no-caps
          color="primary"
          :label="t('login.back')"
          class="full-width q-mt-sm"
          @click="view = 'password'"
        />
      </q-card-section>

      <q-card-section v-else-if="view === 'forgot'">
        <q-btn
          color="primary"
          :label="t('login.sendResetLink')"
          class="full-width"
          unelevated
          :loading="loading"
          @click="handleResetPassword"
        />
        <q-btn
          flat
          no-caps
          color="primary"
          :label="t('login.back')"
          class="full-width q-mt-sm"
          @click="view = 'password'"
        />
      </q-card-section>

      <q-card-section v-if="view === 'email'" class="text-center">
        <div class="text-grey-7 q-my-md">{{ t("login.or") }}</div>

        <q-btn
          class="google-btn full-width"
          unelevated
          :loading="loadingGoogle"
          @click="handleGoogleLogin"
        >
          <template #default>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              class="q-mr-sm"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {{ t("login.google") }}
          </template>
        </q-btn>
      </q-card-section>

      <q-card-section
        v-if="view === 'password' || view === 'signup'"
        class="text-center q-pt-none"
      >
        <q-btn
          class="google-btn full-width"
          unelevated
          :loading="loadingGoogle"
          @click="handleGoogleLogin"
        >
          <template #default>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              class="q-mr-sm"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {{ t("login.google") }}
          </template>
        </q-btn>
      </q-card-section>

      <q-card-section v-if="successMessage" class="q-pb-none">
        <q-banner class="bg-green-1 text-green q-py-sm" rounded>
          {{ successMessage }}
        </q-banner>
      </q-card-section>

      <q-card-section v-if="error" class="q-pb-none">
        <q-banner class="bg-red-1 text-red q-py-sm" rounded>
          {{ error }}
        </q-banner>
      </q-card-section>

      <q-card-section v-if="view === 'email'" class="text-center q-pt-sm">
        <div class="text-body2">
          {{ t("login.dontHaveAccount") }}
          <q-btn
            flat
            no-caps
            color="primary"
            :label="t('login.signup')"
            @click="handleCreateAccount"
          />
        </div>
      </q-card-section>

      <q-card-section
        v-else-if="
          view === 'password' || view === 'signup' || view === 'forgot'
        "
        class="text-center q-pt-sm"
      >
        <div class="text-body2">
          {{ t("login.haveAccount") }}
          <q-btn
            flat
            no-caps
            color="primary"
            :label="t('login.signin')"
            @click="
              view = 'email';
              resetForm();
            "
          />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "src/composables/useAuth.js";
import { useI18n } from "src/composables/useI18n.js";

export default {
  setup() {
    const { login, loginWithEmail, signUpWithEmail, resetPassword } = useAuth();
    const { t } = useI18n();
    const router = useRouter();

    const view = ref("email");
    const email = ref("");
    const password = ref("");
    const confirmPassword = ref("");
    const showPassword = ref(false);
    const loading = ref(false);
    const loadingGoogle = ref(false);
    const error = ref("");
    const successMessage = ref("");
    const errors = ref({});

    const validateEmail = (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    };

    const handleEmailNext = () => {
      error.value = "";
      errors.value = {};

      if (!email.value) {
        errors.value.email = t("login.error.email");
        return;
      }
      if (!validateEmail(email.value)) {
        errors.value.email = t("login.error.email");
        return;
      }

      view.value = "password";
    };

    const handleSignIn = async () => {
      error.value = "";
      errors.value = {};

      if (!password.value) {
        errors.value.password = t("login.error.password");
        return;
      }

      loading.value = true;
      try {
        await loginWithEmail(email.value, password.value);
        router.push("/");
      } catch (err) {
        if (err.code === "auth/invalid-credential") {
          error.value = t("login.error.invalid");
        } else {
          error.value = err.message;
        }
      } finally {
        loading.value = false;
      }
    };

    const handleSignUp = async () => {
      error.value = "";
      errors.value = {};

      if (!password.value || password.value.length < 6) {
        errors.value.password = t("login.error.password");
        return;
      }

      if (password.value !== confirmPassword.value) {
        errors.value.confirmPassword = t("login.error.mismatch");
        return;
      }

      loading.value = true;
      try {
        await signUpWithEmail(email.value, password.value);
        router.push("/");
      } catch (err) {
        if (err.code === "auth/email-already-in-use") {
          error.value = t("login.error.exists");
        } else {
          error.value = err.message;
        }
      } finally {
        loading.value = false;
      }
    };

    const handleResetPassword = async () => {
      error.value = "";
      errors.value = {};
      successMessage.value = "";

      if (!email.value || !validateEmail(email.value)) {
        errors.value.email = t("login.error.email");
        return;
      }

      loading.value = true;
      try {
        await resetPassword(email.value);
        successMessage.value = t("login.resetSent");
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    const handleGoogleLogin = async () => {
      loadingGoogle.value = true;
      error.value = "";
      try {
        await login();
        router.push("/");
      } catch (err) {
        error.value = err.message;
      } finally {
        loadingGoogle.value = false;
      }
    };

    const handleCreateAccount = () => {
      error.value = "";
      errors.value = {};
      view.value = "signup";
      password.value = "";
      confirmPassword.value = "";
    };

    const resetForm = () => {
      password.value = "";
      confirmPassword.value = "";
      error.value = "";
      errors.value = {};
      successMessage.value = "";
    };

    return {
      view,
      email,
      password,
      confirmPassword,
      showPassword,
      loading,
      loadingGoogle,
      error,
      successMessage,
      errors,
      t,
      handleEmailNext,
      handleSignIn,
      handleSignUp,
      handleResetPassword,
      handleGoogleLogin,
      handleCreateAccount,
      resetForm,
    };
  },
};
</script>

<style scoped>
.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 8px;
}

.google-btn {
  background-color: #fff;
  color: #3c4043;
  border: 1px solid #dadce0;
  border-radius: 4px;
  padding: 10px 24px;
  font-weight: 500;
  text-transform: none;
  height: auto;
}

.google-btn:hover {
  background-color: #f8f9fa;
  border-color: #d2d3d4;
}

.app-logo {
  display: flex;
  justify-content: center;
}
</style>
