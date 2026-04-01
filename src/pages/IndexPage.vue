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

        <div
          v-if="user && teamsForSelectedRace.length > 0"
          class="q-px-sm q-pb-sm"
        >
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
              class="text-weight-bold minWidth100"
              @update:model-value="updateStartDelay"
            />
            <span
              v-else
              class="text-weight-bold text-h6 minWidth100"
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
                class="label-cell"
              >
                <template v-if="props.row.editable && canEditRow(props.row)">
                  <div
                    class="cursor-pointer"
                    @click.stop="openCompactSegmentEdit(props.row)"
                  >
                    <div class="row items-center">
                      <div class="icon-cell row justify-center">
                        <q-icon
                          v-if="props.row.segmentType"
                          :name="
                            props.row.segmentType === 'group'
                              ? 'groups'
                              : 'person'
                          "
                          :color="getSegmentColor(props.row.segmentId)"
                          size="16px"
                        />
                      </div>
                      <span class="text-weight-bold">{{
                        props.row.label.segment
                      }}</span>
                    </div>
                    <div
                      v-if="props.row.label.runner"
                      class="text-weight-regular label-indent"
                    >
                      {{ props.row.label.runner }}
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="row items-center">
                    <div class="icon-cell row justify-center">
                      <q-icon
                        v-if="props.row.segmentType"
                        :name="
                          props.row.segmentType === 'group'
                            ? 'groups'
                            : 'person'
                        "
                        :color="getSegmentColor(props.row.segmentId)"
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
                    class="text-weight-regular label-indent"
                  >
                    {{ props.row.label.runner }}
                  </div>
                </template>
              </q-td>

              <q-td
                v-for="col in props.cols.filter((col) => col.name !== 'label')"
                :key="col.name"
                :props="props"
                :class="[
                  col.name === 'arrivalTime'
                    ? 'text-right text-weight-bold text-caption'
                    : col.name === 'duration'
                    ? 'text-right text-caption'
                    : 'text-center text-caption',
                  'text-nowrap',
                ]"
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

        <q-dialog v-model="showCompactSegmentDialog" persistent>
          <q-card class="details-card flat bordered">
            <q-card-section class="q-gutter-sm">
              <div class="text-subtitle2">
                {{ currentCompactRow?.segmentName || "" }}
              </div>
              <q-input
                v-if="isCaptain"
                v-model="editDraft.teamName"
                :label="t('team.teamName')"
                dense
                class="q-mb-sm"
              />
              <q-input
                v-if="currentCompactRow?.segmentType === 'solo'"
                v-model="editDraft.name"
                :label="t('index.name')"
                dense
                autofocus
              />
              <div class="row items-end q-gutter-sm pace-row">
                <div class="col pace-part">
                  <q-select
                    v-model="editDraft.minutes"
                    :options="minuteOptions"
                    :label="t('index.min')"
                    dense
                    emit-value
                    map-options
                  />
                </div>
                <div class="col pace-part">
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

              <div
                v-if="isCaptain && currentCompactRow?.segmentType === 'group'"
                class="q-mt-sm"
              >
                <div class="text-caption text-grey-7 q-mb-xs">
                  {{ t("team.teamPace") }}
                </div>
                <div class="row items-end q-gutter-sm pace-row">
                  <div class="col pace-part">
                    <q-select
                      v-model="editDraft.groupMinutes"
                      :options="minuteOptions"
                      :label="t('index.min')"
                      dense
                      emit-value
                      map-options
                    />
                  </div>
                  <div class="col pace-part">
                    <q-select
                      v-model="editDraft.groupSeconds"
                      :options="secondOptions"
                      :label="t('index.sec')"
                      dense
                      emit-value
                      map-options
                    />
                  </div>
                </div>
              </div>

              <div
                v-if="selectedTeam && currentCompactRow?.segmentType === 'solo'"
                class="q-mt-md"
              >
                <div class="row q-col-gutter-sm q-mb-md items-center">
                  <q-btn
                    v-if="isCaptain && !isAssignedToMe"
                    :label="t('team.assignToMe')"
                    color="positive"
                    size="sm"
                    @click="assignCaptainToSegment(currentCompactRow)"
                  />
                  <q-btn
                    v-if="isCaptain && isAssignedToMe"
                    :label="t('team.unassignMe')"
                    color="negative"
                    size="sm"
                    @click="
                      removeCaptainFromSpecificSegment(
                        currentCompactRow.segmentId
                      )
                    "
                  />
                  <q-btn
                    v-if="isCaptain && !isAssignedToMe"
                    :label="t('team.invite')"
                    icon="send"
                    color="primary"
                    size="sm"
                    @click="inviteRunner(currentCompactRow)"
                  />
                </div>
                <q-input
                  v-if="
                    selectedTeam?.invitationCodes?.[
                      currentCompactRow?.segmentId
                    ]
                  "
                  :model-value="
                    selectedTeam.invitationCodes[currentCompactRow.segmentId]
                  "
                  :label="
                    t('team.inviteCodeLeg', {
                      n: currentCompactRow?.segmentName || 1,
                    })
                  "
                  readonly
                  dense
                  outlined
                />
              </div>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn
                flat
                :label="t('index.cancel')"
                color="primary"
                @click="closeCompactSegmentEdit"
              />
              <q-btn
                flat
                :label="t('index.save')"
                color="primary"
                @click="saveCompactSegmentEdit"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <q-dialog v-model="confirmRegenerateDialog" persistent>
          <q-card class="dialog-card">
            <q-card-section class="text-h6">
              {{ t("team.confirmRegenerateTitle") }}
            </q-card-section>
            <q-card-section>
              {{ t("team.confirmRegenerateBody", { name: runnerToRemove }) }}
            </q-card-section>
            <q-card-actions align="right">
              <q-btn
                flat
                :label="t('index.cancel')"
                color="primary"
                @click="confirmRegenerateDialog = false"
              />
              <q-btn
                flat
                :label="t('team.generateCode')"
                color="negative"
                @click="confirmAndGenerateCode"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
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
    const editDraft = ref({
      name: "",
      minutes: 5,
      seconds: 0,
      teamName: "",
      groupMinutes: 5,
      groupSeconds: 0,
    });
    const showCompactSegmentDialog = ref(false);
    const currentCompactRow = ref(null);
    const confirmRegenerateDialog = ref(false);
    const runnerToRemove = ref("");
    const pendingSegmentForCode = ref(null);
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

    const isCaptain = computed(
      () => selectedTeam.value?.captainId === user.value?.uid
    );

    const captainAssignedSegment = computed(() => {
      if (!selectedTeam.value || !user.value?.uid) return null;
      const runner = (selectedTeam.value.runners || []).find(
        (r) => r.id === user.value.uid
      );
      if (!runner?.segmentId) return null;
      return (activeRace.value?.segments || []).find(
        (segment) => segment.id === runner.segmentId && segment.type === "solo"
      );
    });

    const isCaptainAssignedToAnySegment = computed(
      () => !!captainAssignedSegment.value
    );

    const isSegmentAssigned = computed(() => {
      if (!selectedTeam.value || !currentCompactRow.value) return false;
      const runner = (selectedTeam.value.runners || []).find(
        (r) => r.segmentId === currentCompactRow.value.segmentId
      );
      return !!runner;
    });

    const isAssignedToMe = computed(() => {
      if (!selectedTeam.value || !currentCompactRow.value || !user.value?.uid)
        return false;
      const runner = (selectedTeam.value.runners || []).find(
        (r) =>
          r.segmentId === currentCompactRow.value.segmentId &&
          r.id === user.value.uid
      );
      return !!runner;
    });

    const getSegmentRunner = (segmentId) => {
      if (!selectedTeam.value) return null;
      return (selectedTeam.value.runners || []).find(
        (r) => r.segmentId === segmentId && r.id !== user.value?.uid
      );
    };

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
      const teamGroupPace =
        selectedTeam.value?.groupPaces?.[row.segmentId] || 5;
      editDraft.value = {
        name: config.name || "",
        minutes: getPaceMinutes(config.pace || 5),
        seconds: getPaceSeconds(config.pace || 5),
        teamName: selectedTeam.value?.name || "",
        groupMinutes: getPaceMinutes(teamGroupPace),
        groupSeconds: getPaceSeconds(teamGroupPace),
      };
    };

    const openCompactSegmentEdit = (row) => {
      if (!row?.editable) return;
      currentCompactRow.value = row;
      startCompactSegmentEdit(row);
      showCompactSegmentDialog.value = true;
    };

    const closeCompactSegmentEdit = () => {
      showCompactSegmentDialog.value = false;
      currentCompactRow.value = null;
    };

    const saveCompactSegmentEdit = async (row = currentCompactRow.value) => {
      closeCompactSegmentEdit();
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

      if (isCaptain.value && selectedTeam.value) {
        const updates = {};
        if (
          editDraft.value.teamName &&
          editDraft.value.teamName !== selectedTeam.value.name
        ) {
          updates.name = editDraft.value.teamName;
        }
        if (row.segmentType === "group") {
          const groupPace = paceFromParts(
            editDraft.value.groupMinutes,
            editDraft.value.groupSeconds
          );
          const currentGroupPaces = selectedTeam.value.groupPaces || {};
          if (currentGroupPaces[row.segmentId] !== groupPace) {
            updates.groupPaces = {
              ...currentGroupPaces,
              [row.segmentId]: groupPace,
            };
          }
        }
        if (Object.keys(updates).length > 0) {
          await updateTeam(selectedTeam.value.id, updates);
        }
      }

      if (!selectedTeam.value || canEditSetup.value) {
        queueTeamAutosave(0);
      } else {
        saveOwnRunnerSegment(row.segmentId, updatedConfig);
      }
      closeCompactSegmentEdit();
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

    const notify = (message, type = "positive") => {
      $q.notify({ type, message, position: "top" });
    };

    const doGenerateCode = async (segment) => {
      if (!selectedTeam.value || !segment?.id) return;
      const code = Math.random().toString(36).substring(2, 15);
      const runners = (selectedTeam.value.runners || []).filter(
        (runner) => runner.segmentId !== segment.id
      );
      await updateTeam(selectedTeam.value.id, {
        invitationCodes: {
          ...(selectedTeam.value.invitationCodes || {}),
          [segment.id]: code,
        },
        runners,
      });
    };

    const inviteRunner = async (segment) => {
      if (!selectedTeam.value || !isCaptain.value || !segment?.id) return;
      const existingCode = selectedTeam.value?.invitationCodes?.[segment.id];
      if (existingCode) {
        const existingRunner = getSegmentRunner(segment.id);
        const runnerName = existingRunner?.name || t("team.runner");
        $q.dialog({
          title: t("team.inviteReplaceTitle"),
          message: t("team.inviteReplaceBody", { name: runnerName }),
          persistent: true,
          ok: {
            label: t("team.invite"),
            color: "primary",
          },
          cancel: {
            label: t("index.cancel"),
            color: "negative",
          },
        }).onOk(async () => {
          const code = Math.random().toString(36).substring(2, 15);
          const runners = (selectedTeam.value.runners || []).filter(
            (runner) => runner.segmentId !== segment.id
          );
          await updateTeam(selectedTeam.value.id, {
            invitationCodes: {
              ...(selectedTeam.value.invitationCodes || {}),
              [segment.id]: code,
            },
            runners,
          });
          await shareCodeWithCode(segment, code);
        });
        return;
      }
      await doGenerateCode(segment);
      const code = selectedTeam.value?.invitationCodes?.[segment.id];
      if (code) {
        await shareCodeWithCode(segment, code);
      }
    };

    const shareCodeWithCode = async (segment, code) => {
      if (!code) return;
      const message = t("team.shareMessage", {
        team: selectedTeam.value?.name || t("team.unnamedTeam"),
        code,
      });

      if (navigator.share) {
        try {
          await navigator.share({
            title: "Milano Relay Marathon",
            text: message,
          });
        } catch (err) {
          if (err.name !== "AbortError") {
            console.error("Share failed:", err);
          }
        }
      } else {
        await navigator.clipboard.writeText(message);
        notify(t("team.codeCopied"), "positive");
      }
    };

    const generateCode = async (segment) => {
      if (!selectedTeam.value || !isCaptain.value || !segment?.id) return;
      const existingCode = selectedTeam.value?.invitationCodes?.[segment.id];
      if (existingCode) {
        const existingRunner = getSegmentRunner(segment.id);
        pendingSegmentForCode.value = segment;
        runnerToRemove.value = existingRunner?.name || "runner";
        confirmRegenerateDialog.value = true;
        return;
      }
      await doGenerateCode(segment);
    };

    const confirmAndGenerateCode = async () => {
      if (!pendingSegmentForCode.value) return;
      await doGenerateCode(pendingSegmentForCode.value);
      pendingSegmentForCode.value = null;
      confirmRegenerateDialog.value = false;
    };

    const assignCaptainToSegment = async (segment) => {
      if (!selectedTeam.value || !isCaptain.value || !segment?.id) return;

      const existingRunner = getSegmentRunner(segment.id);
      const invitationCodes = {
        ...(selectedTeam.value.invitationCodes || {}),
      };
      if (existingRunner) {
        delete invitationCodes[segment.id];
      }

      const runners = (selectedTeam.value.runners || []).filter(
        (runner) => runner.segmentId !== segment.id
      );
      runners.push({
        id: user.value.uid,
        segmentId: segment.id,
        name: user.value.displayName || user.value.email || "",
        pace: 5,
      });

      await updateTeam(selectedTeam.value.id, { runners, invitationCodes });
    };

    const removeCaptainFromSpecificSegment = async (segmentId) => {
      if (!selectedTeam.value || !segmentId) return;
      const runners = (selectedTeam.value.runners || []).filter(
        (runner) =>
          runner.id !== user.value.uid || runner.segmentId !== segmentId
      );
      await updateTeam(selectedTeam.value.id, { runners });
    };

    const shareCode = async (segment) => {
      if (!selectedTeam.value || !segment?.id) return;
      const code = selectedTeam.value?.invitationCodes?.[segment.id];
      if (!code) return;
      const message = t("team.shareMessage", {
        team: selectedTeam.value?.name || t("team.unnamedTeam"),
        code,
      });

      if (navigator.share) {
        try {
          await navigator.share({
            title: "Milano Relay Marathon",
            text: message,
          });
        } catch (err) {
          if (err.name !== "AbortError") {
            console.error("Share failed:", err);
          }
        }
      } else {
        await navigator.clipboard.writeText(message);
        notify(t("team.codeCopied"), "positive");
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

    const getSegmentColor = (segmentId) => {
      if (!selectedTeam.value || !segmentId) return "grey-7";
      const runner = (selectedTeam.value.runners || []).find(
        (r) => r.segmentId === segmentId
      );
      return runner ? "positive" : "grey-7";
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
      getSegmentColor,
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
      showCompactSegmentDialog,
      currentCompactRow,
      openCompactSegmentEdit,
      closeCompactSegmentEdit,
      startCompactSegmentEdit,
      saveCompactSegmentEdit,
      isCaptain,
      captainAssignedSegment,
      isCaptainAssignedToAnySegment,
      isSegmentAssigned,
      isAssignedToMe,
      confirmRegenerateDialog,
      pendingSegmentForCode,
      runnerToRemove,
      assignCaptainToSegment,
      removeCaptainFromSpecificSegment,
      inviteRunner,
      generateCode,
      confirmAndGenerateCode,
      shareCode,
      savingTeamSetup,
    };
  },
};
</script>

<style scoped>
.minWidth100 {
  min-width: 100px;
}
.label-cell {
  min-width: 100px;
  white-space: normal;
}
.icon-cell {
  width: 20px;
}
.label-indent {
  padding-left: 20px;
}
.details-card {
  min-width: 260px;
  width: min(92vw, 360px);
  max-width: 100vw;
}
.details-card .pace-row {
  flex-wrap: nowrap;
}
.details-card .pace-part {
  min-width: 120px;
  max-width: 160px;
}
.details-card .col {
  min-width: 0;
}
@media (max-width: 680px) {
  .details-card {
    width: calc(100vw - 16px);
    min-width: unset;
  }
}
</style>
