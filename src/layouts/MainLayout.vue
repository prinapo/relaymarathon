<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          dense
          flat
          round
          icon="menu"
          aria-label="Menu"
          @click="drawer = !drawer"
        />
        <q-toolbar-title>
          {{ t("app.title") }}
        </q-toolbar-title>

        <!-- Language Toggle -->
        <q-btn flat dense icon="translate" @click="toggleLanguage">
          <q-tooltip>{{ t("lang." + language) }}</q-tooltip>
        </q-btn>

        <!-- User Menu -->
        <template v-if="user">
          <q-btn flat dense @click="handleLogout">
            {{ t("nav.logout") }}
          </q-btn>
          <q-avatar class="q-ml-sm" size="28px">
            <img v-if="user.photoURL" :src="user.photoURL" />
            <q-icon v-else name="person" size="20px" />
          </q-avatar>
        </template>
        <q-btn v-else flat :label="t('nav.login')" @click="navigateTo('/login')" />
      </q-toolbar>
    </q-header>

    <!-- Drawer (Sidebar) -->
    <q-drawer
      v-model="drawer"
      show-if-above
      bordered
      class="column full-height bg-white"
    >
      <q-scroll-area class="col">
        <q-list padding>
          <!-- Home -->
          <q-item
            clickable
            v-ripple
            @click="navigateTo('/'); drawer = false"
            :active="route.path === '/'"
            active-class="text-primary"
          >
            <q-item-section avatar><q-icon name="home" /></q-item-section>
            <q-item-section>{{ t("nav.home") }}</q-item-section>
          </q-item>

          <!-- Team (logged in only) -->
          <q-item
            v-if="user"
            clickable
            v-ripple
            @click="navigateTo('/team'); drawer = false"
            :active="route.path === '/team'"
            active-class="text-primary"
          >
            <q-item-section avatar><q-icon name="groups" /></q-item-section>
            <q-item-section>{{ t("nav.team") }}</q-item-section>
          </q-item>

          <!-- Races -->
          <q-item
            clickable
            v-ripple
            @click="navigateTo('/race'); drawer = false"
            :active="route.path === '/race'"
            active-class="text-primary"
          >
            <q-item-section avatar><q-icon name="directions_run" /></q-item-section>
            <q-item-section>{{ t("nav.races") }}</q-item-section>
          </q-item>

          <!-- Appointments -->
          <q-item
            clickable
            v-ripple
            @click="navigateTo('/appointments'); drawer = false"
            :active="route.path === '/appointments'"
            active-class="text-primary"
          >
            <q-item-section avatar><q-icon name="event" /></q-item-section>
            <q-item-section>{{ t("nav.appointments") }}</q-item-section>
          </q-item>

          <!-- Route -->
          <q-item
            clickable
            v-ripple
            @click="navigateTo('/route'); drawer = false"
            :active="route.path === '/route'"
            active-class="text-primary"
          >
            <q-item-section avatar><q-icon name="map" /></q-item-section>
            <q-item-section>{{ t("nav.route") }}</q-item-section>
          </q-item>

          <!-- FAQ -->
          <q-item
            clickable
            v-ripple
            @click="navigateTo('/faq'); drawer = false"
            :active="route.path === '/faq'"
            active-class="text-primary"
          >
            <q-item-section avatar><q-icon name="help" /></q-item-section>
            <q-item-section>{{ t("nav.faq") }}</q-item-section>
          </q-item>

          <!-- Help -->
          <q-item
            clickable
            v-ripple
            @click="navigateTo('/help'); drawer = false"
            :active="route.path === '/help'"
            active-class="text-primary"
          >
            <q-item-section avatar><q-icon name="help_outline" /></q-item-section>
            <q-item-section>{{ t("nav.help") }}</q-item-section>
          </q-item>

          <q-separator class="q-my-md" />

          <!-- Admin (only for admin users) -->
          <q-item
            v-if="isAdmin"
            clickable
            v-ripple
            @click="navigateTo('/admin'); drawer = false"
            :active="route.path === '/admin'"
            active-class="text-primary"
          >
            <q-item-section avatar><q-icon name="admin_panel_settings" /></q-item-section>
            <q-item-section>{{ t("nav.admin") }}</q-item-section>
          </q-item>

          <!-- Request Admin Access (logged in non-admin only) -->
          <q-item
            v-if="user && !isAdmin"
            clickable
            v-ripple
            @click="navigateTo('/admin-request'); drawer = false"
            :active="route.path === '/admin-request'"
            active-class="text-primary"
          >
            <q-item-section avatar><q-icon name="assignment_ind" /></q-item-section>
            <q-item-section>{{ t("nav.adminRequest") }}</q-item-section>
          </q-item>

          <!-- Login (not logged in) -->
          <q-item
            v-if="!user"
            clickable
            v-ripple
            @click="navigateTo('/login'); drawer = false"
            :active="route.path === '/login'"
            active-class="text-primary"
          >
            <q-item-section avatar><q-icon name="login" /></q-item-section>
            <q-item-section>{{ t("nav.login") }}</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- Page Container -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Footer with version -->
    <q-footer class="bg-white text-grey-8" style="border: none; box-shadow: none">
      <div class="text-center text-caption text-grey-5 q-pa-xs" style="font-size: 10px">
        v{{ appVersion }}
      </div>
    </q-footer>
  </q-layout>
</template>

<style scoped>
.q-header {
  padding-top: env(safe-area-inset-top);
}
.q-page-container {
  padding-top: 50px !important;
}
.q-footer {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>

<script>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "src/composables/useAuth.js";
import { useI18n } from "src/composables/useI18n.js";

export default {
  setup() {
    const { user, logout, isAdmin } = useAuth();
    const { t, language, languages, setLanguage } = useI18n();
    const router = useRouter();
    const route = useRoute();

    const drawer = ref(false);

    const toggleLanguage = () => {
      const newLang = language.value === "it" ? "en" : "it";
      setLanguage(newLang);
    };

    const navigateTo = (path) => {
      router.push(path);
    };

    const handleLogout = async () => {
      drawer.value = false;
      await logout();
      router.push("/login");
    };

    const appVersion = computed(() => {
      return window.__APP_VERSION__ || "1.5.0";
    });

    const currentLanguageLabel = computed(() => {
      const lang = languages.find((l) => l.value === language.value);
      return lang?.label || "IT";
    });

    return {
      drawer,
      user,
      route,
      isAdmin,
      t,
      language,
      languages,
      navigateTo,
      handleLogout,
      toggleLanguage,
      appVersion,
      currentLanguageLabel,
    };
  },
};
</script>