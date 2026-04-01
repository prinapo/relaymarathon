<template>
  <q-layout view="lhh LpR lff">
    <q-header reveal :class="$q.dark.isActive ? 'bg-secondary' : 'bg-black'">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          no-caps
          @click="drawerLeft = !drawerLeft"
        />
        <q-toolbar-title>{{ pageTitle }}</q-toolbar-title>
        <q-space />
        <div v-if="user" class="text-subtitle2 q-mr-md">
          {{ user.displayName || user.email }}
        </div>
        <q-btn
          v-if="!user"
          flat
          :label="t('nav.login')"
          class="text-white"
          @click="$router.push('/login')"
        />
        <q-btn
          v-else
          flat
          :label="t('nav.logout')"
          class="text-white"
          @click="logout"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawerLeft"
      :width="200"
      :breakpoint="700"
      bordered
      class="bg-grey-1"
    >
      <q-scroll-area class="fit">
        <q-list padding class="rounded-borders">
          <q-item
            clickable
            :to="'/'"
            exact
            active-class="bg-blue-1 text-blue-9"
            @click="drawerLeft = false"
          >
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ t("nav.home") }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            v-if="user"
            clickable
            :to="'/team'"
            active-class="bg-blue-1 text-blue-9"
            @click="drawerLeft = false"
          >
            <q-item-section avatar>
              <q-icon name="group" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ t("nav.team") }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            :to="'/appointments'"
            active-class="bg-blue-1 text-blue-9"
            @click="drawerLeft = false"
          >
            <q-item-section avatar>
              <q-icon name="event" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ t("nav.appointments") }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            :to="'/faq'"
            active-class="bg-blue-1 text-blue-9"
            @click="drawerLeft = false"
          >
            <q-item-section avatar>
              <q-icon name="help" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ t("nav.faq") }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            :to="'/help'"
            active-class="bg-blue-1 text-blue-9"
            @click="drawerLeft = false"
          >
            <q-item-section avatar>
              <q-icon name="info" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ t("nav.help") }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            :to="'/route'"
            active-class="bg-blue-1 text-blue-9"
            @click="drawerLeft = false"
          >
            <q-item-section avatar>
              <q-icon name="map" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ t("nav.route") }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator v-if="isAdmin" class="q-my-md" />

          <q-item
            v-if="isAdmin"
            clickable
            :to="'/admin'"
            active-class="bg-amber-1 text-amber-9"
            @click="drawerLeft = false"
          >
            <q-item-section avatar>
              <q-icon name="admin_panel_settings" color="amber" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ t("nav.admin") }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator class="q-my-md" />

          <q-btn-dropdown
            flat
            no-caps
            :label="currentLanguageLabel"
            dropdown-icon="expand_more"
          >
            <q-list>
              <q-item
                v-for="lang in languages"
                :key="lang.value"
                v-close-popup
                clickable
                :active="language === lang.value"
                @click="setLanguage(lang.value)"
              >
                <q-item-section>{{ lang.label }}</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
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
    const drawerLeft = ref(false);

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
      drawerLeft,
      pageTitle,
      currentLanguageLabel,
    };
  },
};
</script>
