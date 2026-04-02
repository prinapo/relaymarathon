<template>
  <q-layout view="lhh LpR lff">
    <q-page-container :style="pageContainerStyle">
      <router-view />
    </q-page-container>

    <q-footer
      class="bg-white text-grey-8"
      bordered
      style="border-top: 1px solid #e0e0e0; padding-top: 8px"
    >
      <q-tabs
        v-model="currentTab"
        class="text-grey-7"
        active-color="primary"
        indicator-color="primary"
        narrow-indicator
        dense
      >
        <q-route-tab to="/" icon="home" :label="t('nav.home')" no-caps />
        <q-route-tab
          v-if="user"
          to="/team"
          icon="group"
          :label="t('nav.team')"
          no-caps
        />
        <q-route-tab
          to="/appointments"
          icon="event"
          :label="t('nav.appointments')"
          no-caps
        />
        <q-route-tab to="/faq" icon="help" :label="t('nav.faq')" no-caps />
        <q-route-tab
          :to="user ? '' : '/login'"
          :icon="user ? 'logout' : 'login'"
          :label="user ? t('nav.logout') : t('nav.login')"
          no-caps
          @click="user ? handleLogout() : null"
        />
      </q-tabs>
      <div
        class="text-center text-caption text-grey-5 q-pb-xs"
        style="font-size: 10px"
      >
        v{{ appVersion }}
      </div>
    </q-footer>
  </q-layout>
</template>

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
    const currentTab = ref("/");

    const appVersion = computed(() => {
      const v = import.meta.env.VITE_RELEASE || "1.0.0";
      return v;
    });

    const currentLanguageLabel = computed(() => {
      const lang = languages.find((l) => l.value === language.value);
      return lang?.label || "IT";
    });

    const pageTitle = computed(() => {
      const pageTitles = {
        "/": t("page.home"),
        "/home": t("page.home"),
        "/team": t("page.team"),
        "/admin": t("page.admin"),
        "/login": t("page.login"),
        "/appointments": t("page.appointments"),
        "/faq": t("page.faq"),
        "/help": t("page.help"),
        "/route": t("page.route"),
        "/splash": t("page.splash"),
      };

      return pageTitles[route.path] || t("app.title");
    });

    const pageContainerStyle = computed(() => {
      const statusBarHeight = getComputedStyle(document.documentElement)
        .getPropertyValue("--status-bar-height")
        .trim();
      const height =
        statusBarHeight && statusBarHeight !== "0px"
          ? parseInt(statusBarHeight)
          : 20;
      return { paddingTop: height + "px" };
    });

    const handleLogout = async () => {
      await logout();
      router.push("/login");
    };

    return {
      user,
      logout: handleLogout,
      isAdmin,
      t,
      language,
      setLanguage,
      languages,
      pageTitle,
      currentLanguageLabel,
      currentTab,
      appVersion,
      handleLogout,
      pageContainerStyle,
    };
  },
};
</script>
