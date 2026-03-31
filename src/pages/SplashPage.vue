<template>
  <q-page class="splash-page flex flex-center">
    <div class="splash-content text-center">
      <q-img
        :src="logoUrl"
        :ratio="1"
        class="splash-logo full-width q-mb-lg"
      />
      <div class="text-h5 text-weight-bold q-mb-md">
        {{ t("page.splash") }}
      </div>
      <q-spinner-dots color="primary" size="40px" class="q-mt-lg" />
    </div>
  </q-page>
</template>

<script>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "src/composables/useI18n.js";
import logoUrl from "src/assets/Logo.svg";

export default {
  setup() {
    const router = useRouter();
    const { t } = useI18n();

    onMounted(() => {
      setTimeout(() => {
        router.replace("/home");
      }, 3000);
    });

    return {
      logoUrl,
      t,
    };
  },
};
</script>

<style scoped>
.splash-page {
  background: linear-gradient(135deg, #1f9343 0%, #173a79 100%);
  min-height: 100vh;
}

.splash-content {
  padding: 20px;
}

.splash-logo {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.text-h5 {
  color: white;
}
</style>
