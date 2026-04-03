<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer
      class="bg-white text-grey-8"
      style="padding-top: 8px; border: none; box-shadow: none"
    >
      <q-tabs
        v-model="currentTab"
        class="text-grey-7 nav-tabs"
        active-color="primary"
        indicator-color="primary"
        narrow-indicator
        dense
        inline
        style="max-width: 100vw"
      >
        <q-route-tab to="/" icon="home" label="Home" no-caps />
        <q-route-tab to="/faq" icon="help" label="Info" no-caps />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "AuthLayout",
  setup() {
    const route = useRoute();
    const currentTab = ref(route.path);
    return { currentTab };
  },
});
</script>

<style scoped>
.nav-tabs {
  width: 100%;
}
.nav-tabs :deep(.q-tab) {
  min-width: 0;
  padding: 0 4px;
}
.nav-tabs :deep(.q-tab__icon) {
  font-size: 28px;
}
</style>
