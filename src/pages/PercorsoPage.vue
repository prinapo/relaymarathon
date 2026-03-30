<template>
  <q-page>
    <q-card class="q-pa-sm">
      <q-card-section>
        <div class="text-h6">{{ t("route.title") }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="komoot-embed">
          <iframe
            src="https://www.komoot.com/it-it/collection/4196565/embed"
            width="100%"
            height="580"
            frameborder="0"
            scrolling="no"
            style="border-radius: 8px"
          ></iframe>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { useI18n } from "src/composables/useI18n.js";

export default {
  setup() {
    const { t } = useI18n();

    return {
      t,
    };
  },
};
</script>

<style scoped>
.komoot-embed {
  width: 100%;
  min-height: 580px;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.komoot-embed iframe {
  display: block;
}
</style>
