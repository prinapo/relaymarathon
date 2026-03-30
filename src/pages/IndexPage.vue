<template>
  <q-page>
    <q-card class="q-pa-sm">
      <q-card-section v-if="!user">
        <div class="text-h6 q-mb-md">{{ t("index.title") }}</div>
        <div class="text-body2 q-mb-md text-grey-7">
          {{ t("index.localHint") }}
        </div>
      </q-card-section>

      <q-card-section v-else-if="!selectedTeam">
        <div class="text-h6 q-mb-md">
          {{
            activeRace?.name ||
            t("index.noTeamTitle", { name: user.displayName || user.email })
          }}
        </div>
        <div class="text-body1 q-mb-md">
          {{ t("index.noTeamBody") }}
        </div>
        <q-btn
          :label="t('team.createTeam')"
          color="primary"
          class="q-mr-sm"
          @click="
            $router.push({
              path: '/team',
              query: { tab: 'create', race: activeRace?.id || '' },
            })
          "
        />
        <q-btn
          :label="t('team.joinTeam')"
          color="secondary"
          @click="$router.push({ path: '/team', query: { tab: 'join' } })"
        />
      </q-card-section>

      <q-card-section v-else>
        <div class="text-h6 q-mb-md">
          {{ t("index.teamRaceTimes", { team: selectedTeam.name }) }}
        </div>
      </q-card-section>

      <q-card-section class="q-px-sm q-pb-sm q-pt-none">
        <div v-if="raceOptions.length" class="q-px-sm q-pb-sm">
          <q-select
            :model-value="selectedPublicRaceId"
            :options="raceOptions"
            emit-value
            map-options
            behavior="menu"
            outlined
            dense
            :label="t('index.selectRace')"
            @update:model-value="handleSelectRace"
          />
        </div>

        <div v-if="teamsForSelectedRace.length > 1" class="q-px-sm q-pb-sm">
          <q-select
            :model-value="selectedTeamId"
            :options="teamOptions"
            emit-value
            map-options
            behavior="menu"
            outlined
            dense
            :label="t('index.selectTeam')"
            @update:model-value="handleSelectTeam"
          />
        </div>

        <div v-if="activeRace" class="q-px-sm q-pb-sm">
          <div class="row items-center q-mb-sm">
            <q-icon name="flag" size="20px" class="q-mr-sm text-primary" />
            <div class="text-weight-medium q-mr-sm">
              {{ t("index.raceStartTime") }}:
            </div>
            <span class="text-weight-bold text-h6">{{
              activeRace.startTime
            }}</span>
          </div>
          <div class="row items-center q-mb-md">
            <q-icon name="schedule" size="20px" class="q-mr-sm text-primary" />
            <div class="text-weight-medium q-mr-sm">
              {{ t("index.startDelay") }}:
            </div>
            <q-input
              v-if="canEditSetup"
              :model-value="setupValues.startDelay"
              type="number"
              min="0"
              max="60"
              outlined
              dense
              style="min-width: 100px"
              class="text-weight-bold"
              @update:model-value="updateStartDelay"
            />
            <span
              v-else
              class="text-weight-bold text-h6"
              style="min-width: 100px"
              @mousedown="notifyStartDelayReadOnly"
            >
              {{ setupValues.startDelay }}
            </span>
          </div>
        </div>

        <div v-else class="q-px-sm q-pb-md text-body2 text-grey-7">
          {{ t("index.noRaceSelected") }}
        </div>

        <q-table
          v-if="activeRace"
          :rows="resultRows"
          :columns="resultColumns"
          row-key="id"
          :loading="loading"
          :pagination="{ rowsPerPage: 0 }"
          dense
          hide-pagination
          flat
          table-style="width: 100%;"
        >
          <template #header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="bg-primary text-white"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template #body="props">
            <q-tr :props="props">
              <q-td
                key="label"
                :props="props"
                :class="getRowClass(props.row)"
                style="min-width: 100px; white-space: normal"
              >
                <template v-if="props.row.editable && canEditRow(props.row)">
                  <div class="cursor-pointer">
                    <div class="row items-center">
                      <div style="width: 20px" class="row justify-center">
                        <q-icon
                          v-if="props.row.segmentType"
                          :name="
                            props.row.segmentType === 'group'
                              ? 'groups'
                              : 'person'
                          "
                          size="16px"
                        />
                      </div>
                      <span class="text-weight-bold">{{
                        props.row.label.segment
                      }}</span>
                    </div>
                    <div
                      v-if="props.row.label.runner"
                      class="text-weight-regular"
                      style="padding-left: 20px"
                    >
                      {{ props.row.label.runner }}
                    </div>
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                      @before-show="startCompactSegmentEdit(props.row)"
                    >
                      <q-card flat bordered style="min-width: 260px">
                        <q-card-section class="q-gutter-sm">
                          <div class="text-subtitle2">
                            {{ props.row.segmentName }}
                          </div>
                          <q-input
                            v-if="props.row.segmentType === 'solo'"
                            v-model="editDraft.name"
                            :label="t('index.name')"
                            dense
                            autofocus
                          />
                          <div class="row q-col-gutter-sm">
                            <div class="col">
                              <q-select
                                v-model="editDraft.minutes"
                                :options="minuteOptions"
                                :label="t('index.min')"
                                dense
                                emit-value
                                map-options
                              />
                            </div>
                            <div class="col">
                              <q-select
                                v-model="editDraft.seconds"
                                :options="secondOptions"
                                :label="t('index.sec')"
                                dense
                                emit-value
                                map-options
                              />
                            </div>
                          </div>
                        </q-card-section>

                        <q-card-actions align="right">
                          <q-btn
                            v-close-popup
                            flat
                            :label="t('index.cancel')"
                            color="primary"
                          />
                          <q-btn
                            v-close-popup
                            flat
                            :label="t('index.save')"
                            color="primary"
                            @click="saveCompactSegmentEdit(props.row)"
                          />
                        </q-card-actions>
                      </q-card>
                    </q-popup-proxy>
                  </div>
                </template>
                <template v-else>
                  <div class="row items-center">
                    <div style="width: 20px" class="row justify-center">
                      <q-icon
                        v-if="props.row.segmentType"
                        :name="
                          props.row.segmentType === 'group'
                            ? 'groups'
                            : 'person'
                        "
                        size="16px"
                      />
                      <q-icon
                        v-else-if="props.row.id === 'planned-start'"
                        name="event"
                        size="16px"
                      />
                      <q-icon
                        v-else-if="props.row.id === 'real-start'"
                        name="play_arrow"
                        size="16px"
                      />
                    </div>
                    <span class="text-weight-bold">{{
                      props.row.label.segment
                    }}</span>
                  </div>
                  <div
                    v-if="props.row.label.runner"
                    class="text-weight-regular"
                    style="padding-left: 20px"
                  >
                    {{ props.row.label.runner }}
                  </div>
                </template>
              </q-td>

              <q-td
                v-for="col in props.cols.filter((col) => col.name !== 'label')"
                :key="col.name"
                :props="props"
                :class="
                  col.name === 'arrivalTime'
                    ? 'text-right text-weight-bold text-caption'
                    : col.name === 'duration'
                    ? 'text-right text-caption'
                    : 'text-center text-caption'
                "
                style="white-space: nowrap"
              >
                {{ col.value }}
              </q-td>
            </q-tr>
          </template>
        </q-table>

        <div v-if="activeRace" class="q-px-sm q-pt-xs text-caption text-grey-7">
          <q-icon name="person" size="16px" class="q-mr-xs" />
          {{ t("index.legendSolo") }}
          <span class="q-mx-sm">|</span>
          <q-icon name="groups" size="16px" class="q-mr-xs" />
          {{ t("index.legendGroup") }}
        </div>
      </q-card-section>

      <q-card-section v-if="!user">
        <q-btn
          :label="t('index.loginToSave')"
          color="primary"
          @click="$router.push('/login')"
        />
      </q-card-section>

      <q-card-section v-if="user"> </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useQuasar } from "quasar";
import { useAuth } from "src/composables/useAuth.js";
import { useFirestore } from "src/composables/useFirestore.js";
import { useTimeCalculator } from "src/composables/useTimeCalculator.js";
import { useI18n } from "src/composables/useI18n.js";
import { useTeamContext } from "src/composables/useTeamContext.js";

const createDefaultSegmentConfig = (segment) => ({
  name: segment.type === "group" ? "" : "",
  pace: 5,
});

export default {
  setup() {
    const $q = useQuasar();
    const { user } = useAuth();
    const {
      getTeams,
      getRaces,
      getTeamsListener,
      getRacesListener,
      updateTeam,
    } = useFirestore();
    const {
      calculateTimes,
      formatClockDisplay,
      formatDurationMinutesSeconds,
      formatPaceDisplay,
    } = useTimeCalculator();
    const { t } = useI18n();
    const {
      selectedTeamId,
      selectedPublicRaceId,
      syncSelectedTeam,
      setSelectedTeam,
      syncSelectedPublicRace,
      setSelectedPublicRace,
    } = useTeamContext();

    const loading = ref(true);
    const teams = ref([]);
    const races = ref([]);
    const setupValues = ref({ startDelay: 0, segmentConfigs: {} });
    const editDraft = ref({ name: "", minutes: 5, seconds: 0 });
    const savingTeamSetup = ref(false);
    const suppressSetupAutosave = ref(false);
    let autosaveTimer = null;
    let unsubscribeTeams = null;
    let unsubscribeRaces = null;

    const resultRows = ref([]);
    const fitResultsTable = true;
    const resultColumns = computed(() => [
      {
        name: "label",
        label: t("results.leg"),
        field: "label",
        align: "left",
        classes: `${fitResultsTable ? "text-caption" : ""} text-weight-medium`,
        headerClasses: "bg-primary text-white",
        style: "min-width: 100px; white-space: normal;",
        headerStyle: "min-width: 100px; white-space: normal;",
      },
      {
        name: "arrivalTime",
        label: t("results.arrivalTime"),
        field: "arrivalTime",
        align: "right",
        classes: `${fitResultsTable ? "text-caption" : ""} text-weight-bold`,
        style: "white-space: nowrap; min-width: 70px;",
        headerClasses: "bg-primary text-white",
      },
      {
        name: "duration",
        label: t("results.duration"),
        field: "duration",
        align: "right",
        classes: fitResultsTable ? "text-caption" : "",
        style: "white-space: nowrap; min-width: 60px;",
        headerClasses: "bg-primary text-white",
      },
      {
        name: "pace",
        label: t("results.paceMultiline"),
        field: "pace",
        align: "center",
        classes: fitResultsTable ? "text-caption" : "",
        style: "white-space: nowrap; min-width: 50px;",
        headerClasses: "bg-primary text-white",
      },
    ]);

    const minuteOptions = computed(() =>
      Array.from({ length: 8 }, (_, index) => ({
        label: `${index + 2}`,
        value: index + 2,
      }))
    );

    const secondOptions = computed(() =>
      Array.from({ length: 12 }, (_, index) => ({
        label: `${index * 5}`.padStart(2, "0"),
        value: index * 5,
      }))
    );

    const userTeams = computed(() =>
      teams.value.filter(
        (team) =>
          team.captainId === user.value?.uid ||
          (team.runners || []).some((runner) => runner.id === user.value?.uid)
      )
    );

    const defaultRace = computed(
      () => races.value.find((race) => race.isDefault) || races.value[0] || null
    );
    const fallbackUserRace = computed(() => {
      const selectedUserTeam = userTeams.value.find(
        (team) => team.id === selectedTeamId.value
      );
      if (selectedUserTeam?.raceId) {
        return (
          races.value.find((race) => race.id === selectedUserTeam.raceId) ||
          null
        );
      }

      const firstUserTeam = userTeams.value[0];
      if (firstUserTeam?.raceId) {
        return (
          races.value.find((race) => race.id === firstUserTeam.raceId) || null
        );
      }

      return null;
    });
    const selectedViewRace = computed(
      () =>
        races.value.find((race) => race.id === selectedPublicRaceId.value) ||
        fallbackUserRace.value ||
        defaultRace.value ||
        null
    );
    const teamsForSelectedRace = computed(() =>
      userTeams.value.filter(
        (team) =>
          !selectedViewRace.value || team.raceId === selectedViewRace.value.id
      )
    );
    const selectedTeam = computed(
      () =>
        teamsForSelectedRace.value.find(
          (team) => team.id === selectedTeamId.value
        ) ||
        teamsForSelectedRace.value[0] ||
        null
    );
    const activeRace = computed(() => {
      if (selectedViewRace.value) {
        return selectedViewRace.value;
      }

      if (selectedTeam.value?.raceId) {
        return (
          races.value.find((race) => race.id === selectedTeam.value.raceId) ||
          defaultRace.value
        );
      }

      if (selectedPublicRaceId.value) {
        return (
          races.value.find((race) => race.id === selectedPublicRaceId.value) ||
          defaultRace.value
        );
      }

      return defaultRace.value;
    });

    const canEditSetup = computed(
      () =>
        !selectedTeam.value || selectedTeam.value.captainId === user.value?.uid
    );
    const runnerSegmentIds = computed(
      () =>
        new Set(
          (selectedTeam.value?.runners || [])
            .filter((runner) => runner.id === user.value?.uid)
            .map((runner) => runner.segmentId)
        )
    );

    const raceOptions = computed(() =>
      races.value.map((race) => ({
        label: race.name?.trim() || t("admin.unnamedRace"),
        value: race.id,
      }))
    );

    const teamOptions = computed(() =>
      teamsForSelectedRace.value.map((team) => {
        const race = races.value.find((item) => item.id === team.raceId);
        return {
          label: `${team.name} - ${
            race?.name?.trim() || t("admin.unnamedRace")
          }`,
          value: team.id,
        };
      })
    );

    const getLocalSetupStorageKey = (raceId) =>
      `runnerSetup:${raceId || "default"}`;

    const parsePace = (pace) => Number(pace) || 0;

    const getPaceMinutes = (pace) => Math.floor(parsePace(pace));
    const getPaceSeconds = (pace) =>
      Math.round((parsePace(pace) - Math.floor(parsePace(pace))) * 60);
    const paceFromParts = (minutes, seconds) =>
      (Number(minutes) || 0) + (Number(seconds) || 0) / 60;

    const buildBaseSetup = (race) => {
      const segmentConfigs = {};
      (race?.segments || []).forEach((segment) => {
        segmentConfigs[segment.id] = createDefaultSegmentConfig(segment);
      });
      return {
        startDelay: Number(race?.defaultStartDelay) || 0,
        segmentConfigs,
      };
    };

    const mergeSetup = (baseSetup, incomingSetup = {}) => {
      const mergedConfigs = { ...baseSetup.segmentConfigs };
      Object.entries(mergedConfigs).forEach(([segmentId, defaultConfig]) => {
        const incomingConfig = incomingSetup.segmentConfigs?.[segmentId] || {};
        mergedConfigs[segmentId] = {
          ...defaultConfig,
          name: incomingConfig.name || defaultConfig.name || "",
          pace: Number(incomingConfig.pace) || Number(defaultConfig.pace) || 5,
        };
      });

      return {
        startDelay:
          Number(incomingSetup.startDelay ?? baseSetup.startDelay) || 0,
        segmentConfigs: mergedConfigs,
      };
    };

    const loadLocalSetup = (race) => {
      const baseSetup = buildBaseSetup(race);
      const saved = localStorage.getItem(getLocalSetupStorageKey(race?.id));

      if (!saved) {
        setupValues.value = baseSetup;
        return;
      }

      try {
        const parsed = JSON.parse(saved);
        setupValues.value = mergeSetup(baseSetup, parsed);
      } catch (error) {
        console.error("Error loading local runner setup:", error);
        setupValues.value = baseSetup;
      }
    };

    const saveLocalSetup = () => {
      if (!activeRace.value) return;
      localStorage.setItem(
        getLocalSetupStorageKey(activeRace.value.id),
        JSON.stringify(setupValues.value)
      );
    };

    const syncSetupFromTeam = (team, race) => {
      const baseSetup = buildBaseSetup(race);
      const runnersBySegment = Object.fromEntries(
        (team?.runners || []).map((runner) => [runner.segmentId, runner])
      );
      const groupPaces = team?.groupPaces || {};

      const teamSetup = {
        startDelay: team?.hasCustomStartDelay
          ? Number(team?.startDelay ?? 0)
          : Number(race?.defaultStartDelay ?? 0),
        segmentConfigs: {},
      };

      (race?.segments || []).forEach((segment) => {
        if (segment.type === "group") {
          teamSetup.segmentConfigs[segment.id] = {
            name: "",
            pace: Number(groupPaces[segment.id]) || 5,
          };
          return;
        }

        const runner = runnersBySegment[segment.id] || {};
        teamSetup.segmentConfigs[segment.id] = {
          name: runner.name || "",
          pace: Number(runner.pace) || 5,
        };
      });

      suppressSetupAutosave.value = true;
      setupValues.value = mergeSetup(baseSetup, teamSetup);
      suppressSetupAutosave.value = false;
    };

    const queueTeamAutosave = (delay = 250) => {
      if (
        !selectedTeam.value ||
        !canEditSetup.value ||
        suppressSetupAutosave.value
      )
        return;
      if (autosaveTimer) clearTimeout(autosaveTimer);
      autosaveTimer = setTimeout(() => {
        saveTeamSetup();
      }, delay);
    };

    const updateStartDelay = (value) => {
      if (!canEditSetup.value) return;
      setupValues.value = {
        ...setupValues.value,
        startDelay: Number(value) || 0,
      };
      queueTeamAutosave(0);
    };

    const startCompactSegmentEdit = (row) => {
      if (!row?.editable) return;
      const config = setupValues.value.segmentConfigs?.[row.segmentId] || {};
      editDraft.value = {
        name: config.name || "",
        minutes: getPaceMinutes(config.pace || 5),
        seconds: getPaceSeconds(config.pace || 5),
      };
    };

    const saveCompactSegmentEdit = (row) => {
      if (!row?.editable || !canEditRow(row)) return;
      const updatedConfig = {
        ...(setupValues.value.segmentConfigs?.[row.segmentId] || {}),
        pace: paceFromParts(editDraft.value.minutes, editDraft.value.seconds),
      };

      if (row.segmentType === "solo") {
        updatedConfig.name = editDraft.value.name || "";
      }

      setupValues.value = {
        ...setupValues.value,
        segmentConfigs: {
          ...setupValues.value.segmentConfigs,
          [row.segmentId]: updatedConfig,
        },
      };

      if (!selectedTeam.value || canEditSetup.value) {
        queueTeamAutosave(0);
      } else {
        saveOwnRunnerSegment(row.segmentId, updatedConfig);
      }
    };

    const saveOwnRunnerSegment = async (segmentId, config) => {
      if (!selectedTeam.value || !segmentId || savingTeamSetup.value) return;

      savingTeamSetup.value = true;
      try {
        const runners = (selectedTeam.value.runners || []).map((runner) =>
          runner.id === user.value?.uid && runner.segmentId === segmentId
            ? {
                ...runner,
                name: config.name || runner.name || "",
                pace: Number(config.pace) || 5,
              }
            : runner
        );

        await updateTeam(selectedTeam.value.id, { runners });
      } catch (error) {
        console.error("Error saving runner segment setup:", error);
      } finally {
        savingTeamSetup.value = false;
      }
    };

    const saveTeamSetup = async () => {
      if (!selectedTeam.value || !activeRace.value || savingTeamSetup.value)
        return;

      savingTeamSetup.value = true;
      try {
        const existingRunnersBySegment = Object.fromEntries(
          (selectedTeam.value.runners || []).map((runner) => [
            runner.segmentId,
            runner,
          ])
        );

        const runners = (activeRace.value.segments || [])
          .filter((segment) => segment.type !== "group")
          .map((segment) => {
            const existingRunner = existingRunnersBySegment[segment.id] || {};
            const config = setupValues.value.segmentConfigs?.[segment.id] || {};
            return {
              id: existingRunner.id || null,
              segmentId: segment.id,
              name: config.name || existingRunner.name || "",
              pace: Number(config.pace) || 5,
            };
          });

        const groupPaces = {};
        (activeRace.value.segments || [])
          .filter((segment) => segment.type === "group")
          .forEach((segment) => {
            groupPaces[segment.id] =
              Number(setupValues.value.segmentConfigs?.[segment.id]?.pace) || 5;
          });

        await updateTeam(selectedTeam.value.id, {
          runners,
          groupPaces,
          startDelay: Number(setupValues.value.startDelay) || 0,
          hasCustomStartDelay: true,
        });
      } catch (error) {
        console.error("Error saving team setup:", error);
      } finally {
        savingTeamSetup.value = false;
      }
    };

    const buildRowLabel = (time) => {
      if (time.segmentType === "group") {
        return { segment: time.segmentName, runner: null };
      }

      if (time.runner) {
        return { segment: time.segmentName, runner: time.runner };
      }

      return { segment: time.segmentName, runner: null };
    };

    const buildResultRows = (times = []) => {
      const rows = [];
      const firstTime = times[0];

      if (activeRace.value?.startTime) {
        rows.push({
          id: "planned-start",
          label: { segment: t("results.plannedStart"), runner: null },
          arrivalTime: formatClockDisplay(
            activeRace.value.startTime
              ? Number(activeRace.value.startTime.split(":")[0] || 0) * 60 +
                  Number(activeRace.value.startTime.split(":")[1] || 0)
              : 0
          ),
          duration: "",
          pace: "",
          editable: false,
        });
      }

      if (firstTime) {
        rows.push({
          id: "real-start",
          label: { segment: t("results.realStart"), runner: null },
          arrivalTime: formatClockDisplay(firstTime.startTime),
          duration: setupValues.value.startDelay
            ? formatDurationMinutesSeconds(setupValues.value.startDelay)
            : "",
          pace: "",
          editable: false,
        });
      }

      times.forEach((time) => {
        rows.push({
          id: time.segmentId,
          label: buildRowLabel(time),
          segmentId: time.segmentId,
          segmentName: time.segmentName,
          segmentType: time.segmentType,
          arrivalTime: formatClockDisplay(time.arrivalTime),
          duration: formatDurationMinutesSeconds(time.duration),
          pace: time.pace ? formatPaceDisplay(time.pace) : "",
          editable: true,
        });
      });

      resultRows.value = rows;
    };

    const recalculate = () => {
      if (!activeRace.value) {
        resultRows.value = [];
        return;
      }

      const times = calculateTimes(
        activeRace.value,
        setupValues.value.segmentConfigs || {},
        setupValues.value.startDelay,
        activeRace.value.startTime || "08:00"
      );

      buildResultRows(times);
    };

    const applySetupForCurrentContext = () => {
      if (!activeRace.value) {
        setupValues.value = { startDelay: 0, segmentConfigs: {} };
        resultRows.value = [];
        return;
      }

      if (selectedTeam.value) {
        syncSetupFromTeam(selectedTeam.value, activeRace.value);
      } else {
        loadLocalSetup(activeRace.value);
      }

      recalculate();
    };

    const refreshData = async () => {
      loading.value = true;
      try {
        races.value = await getRaces();

        if (user.value) {
          teams.value = await getTeams();
          const preferredRaceId =
            fallbackUserRace.value?.id || defaultRace.value?.id || "";
          syncSelectedPublicRace(races.value, preferredRaceId);
          syncSelectedTeam(user.value?.uid, teamsForSelectedRace.value);
        } else {
          teams.value = [];
          syncSelectedPublicRace(races.value, defaultRace.value?.id || "");
        }

        applySetupForCurrentContext();
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        loading.value = false;
      }
    };

    const handleSelectTeam = (teamId) => {
      setSelectedTeam(user.value?.uid, teamId);
      const teamRaceId = userTeams.value.find(
        (team) => team.id === teamId
      )?.raceId;
      if (teamRaceId) {
        setSelectedPublicRace(teamRaceId);
      }
    };

    const handleSelectRace = (raceId) => {
      setSelectedPublicRace(raceId);
      const matchingTeams = userTeams.value.filter(
        (team) => team.raceId === raceId
      );
      setSelectedTeam(user.value?.uid, matchingTeams[0]?.id || "");
    };

    const canEditRow = (row) => {
      if (!row?.editable) return false;
      if (!selectedTeam.value) return true;
      if (canEditSetup.value) return true;
      if (row.segmentType !== "solo") return false;
      return runnerSegmentIds.value.has(row.segmentId);
    };

    const getRowClass = (row) => {
      if (isOwnRunnerRow(row)) {
        return "bg-light-green-2";
      }
      if (canEditRow(row)) {
        return "bg-light-blue-2";
      }
      return "bg-blue-1";
    };

    const isOwnRunnerRow = (row) =>
      !!selectedTeam.value &&
      row?.segmentType === "solo" &&
      runnerSegmentIds.value.has(row.segmentId);

    const notifyReadOnly = () => {
      if (canEditSetup.value) return;
      $q.notify({
        type: "info",
        position: "top",
        message: t("admin.readOnlyNotify"),
      });
    };

    const notifyStartDelayReadOnly = () => {
      $q.notify({
        type: "info",
        position: "top",
        message: t("index.startDelayReadOnly"),
      });
    };

    onMounted(() => {
      refreshData();

      unsubscribeRaces = getRacesListener(
        (newRaces) => {
          races.value = newRaces;
          const preferredRaceId =
            fallbackUserRace.value?.id || defaultRace.value?.id || "";
          syncSelectedPublicRace(races.value, preferredRaceId);
          syncSelectedTeam(user.value?.uid, teamsForSelectedRace.value);
          applySetupForCurrentContext();
        },
        (error) => {
          console.error("Error in races listener:", error);
          races.value = [];
          applySetupForCurrentContext();
        }
      );

      unsubscribeTeams = getTeamsListener(
        (newTeams) => {
          teams.value = newTeams;
          syncSelectedTeam(user.value?.uid, teamsForSelectedRace.value);
          applySetupForCurrentContext();
        },
        (error) => {
          console.error("Error in teams listener:", error);
        }
      );
    });

    watch(user, () => {
      refreshData();
    });

    watch(
      userTeams,
      (nextTeams) => {
        const nextTeamsForRace = nextTeams.filter(
          (team) =>
            !selectedViewRace.value || team.raceId === selectedViewRace.value.id
        );
        syncSelectedTeam(user.value?.uid, nextTeamsForRace);
      },
      { deep: true }
    );

    watch([selectedTeam, activeRace], () => {
      applySetupForCurrentContext();
    });

    watch(
      setupValues,
      () => {
        if (!selectedTeam.value) {
          saveLocalSetup();
        }
        recalculate();
      },
      { deep: true }
    );

    onUnmounted(() => {
      if (autosaveTimer) clearTimeout(autosaveTimer);
      if (unsubscribeTeams) unsubscribeTeams();
      if (unsubscribeRaces) unsubscribeRaces();
    });

    return {
      user,
      userTeams,
      selectedTeam,
      selectedTeamId,
      selectedPublicRaceId,
      activeRace,
      canEditSetup,
      canEditRow,
      getRowClass,
      isOwnRunnerRow,
      loading,
      setupValues,
      resultRows,
      resultColumns,
      raceOptions,
      teamOptions,
      teamsForSelectedRace,
      minuteOptions,
      secondOptions,
      editDraft,
      t,
      handleSelectTeam,
      handleSelectRace,
      notifyReadOnly,
      notifyStartDelayReadOnly,
      updateStartDelay,
      startCompactSegmentEdit,
      saveCompactSegmentEdit,
    };
  },
};
</script>
