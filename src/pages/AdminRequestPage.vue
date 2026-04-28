<template>
  <q-page class="q-pa-md">
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="text-h6">{{ t("adminRequest.title") }}</div>
      </q-card-section>

      <q-card-section v-if="!user">
        <div class="text-body2 text-grey-7">
          {{ t("adminRequest.loginRequired") }}
        </div>
      </q-card-section>

      <q-card-section v-else-if="isAdminOfAnyRace" class="q-pt-none">
        <div class="text-body2 text-positive">
          {{ t("adminRequest.alreadyAdmin") }}
        </div>
      </q-card-section>

      <q-card-section v-else class="q-pt-none">
        <div class="text-body2 q-mb-md">
          {{ t("adminRequest.description") }}
        </div>

        <q-form @submit.prevent="submitRequest">
          <q-input
            v-model="form.name"
            :label="t('adminRequest.name')"
            outlined
            class="q-mb-md"
            :rules="[(val) => !!val || t('common.required')]"
          />

          <q-input
            v-model="form.surname"
            :label="t('adminRequest.surname')"
            outlined
            class="q-mb-md"
            :rules="[(val) => !!val || t('common.required')]"
          />

          <q-select
            v-model="form.raceId"
            :options="raceOptions"
            :label="t('adminRequest.race')"
            outlined
            emit-value
            map-options
            class="q-mb-md"
            :rules="[(val) => !!val || t('common.required')]"
          />

          <q-input
            v-model="form.message"
            :label="t('adminRequest.message')"
            type="textarea"
            outlined
            class="q-mb-md"
          />

          <q-btn
            type="submit"
            :label="t('adminRequest.submit')"
            color="primary"
            :loading="submitting"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "src/composables/useI18n.js";
import { useAuth } from "src/composables/useAuth.js";
import { useFirestore } from "src/composables/useFirestore.js";

export default {
  setup() {
    const { t } = useI18n();
    const { user } = useAuth();
    const { getRaces, submitAdminRequest } = useFirestore();

    const races = ref([]);
    const submitting = ref(false);

    const form = ref({
      name: "",
      surname: "",
      raceId: "",
      message: "",
    });

    const raceOptions = computed(() =>
      races.value.map((race) => ({
        label: race.name,
        value: race.id,
      })),
    );

    const isAdminOfAnyRace = computed(() => {
      return races.value.some(
        (race) => (race.adminUids || []).includes(user.value?.uid),
      );
    });

    onMounted(async () => {
      races.value = await getRaces();
    });

    const submitRequest = async () => {
      if (!user.value) return;
      submitting.value = true;
      try {
        await submitAdminRequest({
          name: form.value.name,
          surname: form.value.surname,
          raceId: form.value.raceId,
          message: form.value.message,
          userId: user.value.uid,
          userEmail: user.value.email,
        });
        form.value = {
          name: "",
          surname: "",
          raceId: "",
          message: "",
        };
      } catch (error) {
        console.error("Error submitting request:", error);
      } finally {
        submitting.value = false;
      }
    };

    return {
      t,
      user,
      form,
      raceOptions,
      isAdminOfAnyRace,
      submitting,
      submitRequest,
    };
  },
};
</script>
