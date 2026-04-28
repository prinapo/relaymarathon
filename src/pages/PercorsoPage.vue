<template>
  <q-page>
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="text-h6">{{ t("route.title") }}</div>
      </q-card-section>

      <q-card-section v-if="loading" class="text-center q-pa-md">
        <q-spinner-dots color="primary" size="40px" />
      </q-card-section>

      <q-card-section v-else-if="!selectedPublicRaceId" class="q-pt-none">
        <div class="text-body2 text-grey-7">
          {{ t("route.noRaceSelected") }}
        </div>
      </q-card-section>

      <q-card-section v-else-if="!currentRoute" class="q-pt-none">
        <div class="text-body2 text-grey-7">
          {{ t("route.notConfigured") }}
        </div>
      </q-card-section>

      <q-card-section v-else class="q-pt-none">
        <div class="route-embed" v-html="currentRoute.embedCode"></div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "src/composables/useI18n.js";
import { useTeamContext } from "src/composables/useTeamContext.js";
import { useFirestore } from "src/composables/useFirestore.js";

export default {
  setup() {
    const { t } = useI18n();
    const { selectedPublicRaceId } = useTeamContext();
    const { getRoutesListener } = useFirestore();

    const routes = ref([]);
    const loading = ref(true);
    let routesUnsubscribe = null;

    const currentRoute = computed(() => {
      const raceId = selectedPublicRaceId.value;
      if (!raceId) return null;
      return routes.value.find((r) => r.raceId === raceId && r.isDefault);
    });

    onMounted(() => {
      loading.value = true;
      routesUnsubscribe = getRoutesListener(
        (data) => {
          routes.value = data;
          loading.value = false;
        },
        (error) => {
          console.error("Error loading routes:", error);
          loading.value = false;
        },
      );
    });

    onUnmounted(() => {
      if (routesUnsubscribe) routesUnsubscribe();
    });

    return {
      t,
      selectedPublicRaceId,
      currentRoute,
      loading,
    };
  },
};
</script>

<style scoped>
.route-embed {
  width: 100%;
  min-height: 580px;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.route-embed :deep(iframe) {
  display: block;
  width: 100%;
  height: 580px;
  border: none;
}
</style>