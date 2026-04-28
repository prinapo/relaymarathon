<template>
  <q-page>
    <div class="q-pa-md">
      <div class="text-h6 q-mb-md">
        {{ t("race.selectRace") || t("index.races") }}
      </div>

      <q-list bordered separator>
        <q-item
          v-for="race in raceOptions"
          :key="race.value"
          clickable
          :active="selectedRaceId === race.value"
          active-class="bg-grey-3"
          @click="selectRace(race.value)"
        >
          <q-item-section avatar>
            <q-icon name="directions_run" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ race.label }}</q-item-label>
            <q-item-label caption v-if="race.startTime">
              {{ t("race.startTime") }}: {{ race.startTime }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon
              v-if="selectedRaceId === race.value"
              name="check"
              color="positive"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useFirestore } from "src/composables/useFirestore.js";
import { useTeamContext } from "src/composables/useTeamContext.js";
import { useI18n } from "src/composables/useI18n.js";

const router = useRouter();
const { getRaces } = useFirestore();
const { selectedPublicRaceId, setSelectedPublicRace } = useTeamContext();
const { t } = useI18n();

const races = ref([]);

const selectedRaceId = computed(() => selectedPublicRaceId.value);

const raceOptions = computed(() =>
  races.value.map((race) => ({
    label: race.name?.trim() || t("admin.unnamedRace"),
    value: race.id,
    startTime: race.startTime,
  })),
);

const loadRaces = async () => {
  try {
    races.value = await getRaces();
  } catch (error) {
    console.error("Error loading races:", error);
  }
};

const selectRace = (raceId) => {
  setSelectedPublicRace(raceId);
  router.push("/");
};

onMounted(() => {
  loadRaces();
});
</script>
