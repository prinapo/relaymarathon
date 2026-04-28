<template>
  <q-page>
    <div class="q-pa-md">
      <div v-if="!activeRace && user" class="q-pa-md">
        <div class="text-h6 q-mb-md">
          {{
            activeRace?.name ||
            t("index.noTeamTitle", { name: user.displayName || user.email })
          }}
        </div>
        <div class="text-body1 q-mb-md">{{ t("index.noTeamBody") }}</div>
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
      </div>

      <div v-else-if="!activeRace" class="q-pa-md text-body2 text-grey-7">
        {{ t("index.noRaceSelected") }}
      </div>

      <RaceTimeline
        v-if="activeRace"
        :rows="timelineRows"
        :assigned-segments="assignedSegments"
        :accepted-segments="acceptedSegments"
        :start-time="activeRace.startTime || '09:00'"
        :start-location="activeRace.startLocation || ''"
        :start-delay="setupValues.startDelay || 0"
        :end-time="endTime"
        :end-location="
          activeRace.segments[activeRace.segments.length - 1]?.name || ''
        "
        @edit-delay="openDelayDialog"
        @edit-pace="openPaceDialog"
        @edit-runner-name="openRunnerNameDialog"
      />

      <q-dialog v-model="showCompactSegmentDialog" persistent>
        <q-card class="details-card flat">
          <q-card-section class="row justify-end q-pa-xs">
            <q-btn icon="close" flat round @click="closeCompactSegmentEdit" />
          </q-card-section>
          <q-card-section class="q-gutter-sm q-pt-none">
            <PacePicker
              v-model="runnerPace"
              :minute-range="[2, 3, 4, 5, 6, 7]"
              :second-interval="5"
              @save="onRunnerPaceSaved"
            />
          </q-card-section>
        </q-card>
      </q-dialog>

      <q-dialog v-model="showPaceDialog">
        <q-card class="details-card flat">
          <q-card-section class="row justify-end q-pa-xs">
            <q-btn icon="close" flat round @click="showPaceDialog = false" />
          </q-card-section>
          <q-card-section class="text-center">
            <span class="text-h6 text-uppercase">{{ t("results.pace") }}</span>
          </q-card-section>
          <q-card-section class="q-gutter-sm q-pt-none">
            <PacePicker
              v-model="editingPace"
              :minute-range="[2, 3, 4, 5, 6, 7]"
              :second-interval="5"
              :runner-name="editingPaceRunnerName"
              @save="onPaceSaved"
            />
          </q-card-section>
        </q-card>
      </q-dialog>

      <q-dialog v-model="showDelayDialog">
        <q-card class="details-card flat">
          <q-card-section class="text-h6">{{
            t("index.startDelay")
          }}</q-card-section>
          <q-card-section>
            <q-input
              v-model="editingDelay"
              type="number"
              :label="t('index.delayMinutes')"
              outlined
              autofocus
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              flat
              :label="t('index.cancel')"
              color="grey"
              @click="showDelayDialog = false"
            />
            <q-btn
              flat
              :label="t('index.save')"
              color="primary"
              @click="saveDelay"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

<q-dialog v-model="showRunnerNameDialog">
        <q-card class="details-card flat">
          <q-card-section class="row justify-end q-pa-xs">
            <q-btn
              icon="close"
              flat
              round
              @click="showRunnerNameDialog = false"
            />
          </q-card-section>
          <q-card-section class="text-center">
            <span class="text-h6 text-uppercase">{{
              t("team.runnerName")
            }}</span>
          </q-card-section>
          <q-card-section>
            <q-input
              v-model="editingRunnerName"
              :label="t('team.runnerName')"
              outlined
              autofocus
            />
          </q-card-section>
          <q-card-section
            v-if="isCaptain && currentEditingSegment && timelineRows[editingRunnerNameIndex]?.segmentType === 'solo'"
            class="q-gutter-sm"
          >
            <div class="row q-gutter-sm">
              <q-btn
                v-if="!isMySegment(currentEditingSegment)"
                :label="t('team.assignToMe')"
                color="primary"
                outline
                @click="handleAssignToMe"
              />
              <q-btn
                v-if="isMySegment(currentEditingSegment)"
                :label="t('team.unassignMe')"
                color="negative"
                outline
                @click="handleUnassign"
              />
              <q-btn
                :label="t('team.invite')"
                color="secondary"
                outline
                @click="handleInvite"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              flat
              :label="t('index.cancel')"
              color="grey"
              @click="showRunnerNameDialog = false"
            />
            <q-btn
              flat
              :label="t('index.save')"
              color="primary"
              @click="saveRunnerName"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { useAuth } from "src/composables/useAuth.js";
import { useFirestore } from "src/composables/useFirestore.js";
import { useTimeCalculator } from "src/composables/useTimeCalculator.js";
import { useI18n } from "src/composables/useI18n.js";
import { useTeamContext } from "src/composables/useTeamContext.js";
import PacePicker from "src/components/PacePicker.vue";
import RaceTimeline from "src/components/RaceTimeline.vue";

const createDefaultSegmentConfig = (segment) => ({
  name: segment.type === "group" ? "" : "",
  pace: 5,
});

export default {
  components: { PacePicker, RaceTimeline },
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const { user, logout, isAdmin } = useAuth();
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
    const showDelayDialog = ref(false);
    const editingDelay = ref(0);
    const showPaceDialog = ref(false);
    const showRunnerNameDialog = ref(false);
    const editingRunnerName = ref("");
    const editingRunnerNameIndex = ref(null);
    const currentEditingSegment = ref(null);
    const editingPace = ref({ minutes: 5, seconds: 0 });
    const editingPaceSegmentId = ref(null);
    const editingPaceRunnerName = ref("");
    const isPaceDialogEditing = ref(false);
    const runnerToRemove = ref("");
    const pendingSegmentForCode = ref(null);
    const savingTeamSetup = ref(false);
    const suppressSetupAutosave = ref(false);
    let autosaveTimer = null;
    let unsubscribeTeams = null;
    let unsubscribeRaces = null;

    const resultRows = ref([]);

    const minuteOptions = computed(() =>
      Array.from({ length: 8 }, (_, index) => ({
        label: `${index + 2}`,
        value: index + 2,
      })),
    );

    const secondOptions = computed(() =>
      Array.from({ length: 12 }, (_, index) => ({
        label: `${index * 5}`.padStart(2, "0"),
        value: index * 5,
      })),
    );

    const isCaptain = computed(
      () => selectedTeam.value?.captainId === user.value?.uid,
    );

    const captainAssignedSegment = computed(() => {
      if (!selectedTeam.value || !user.value?.uid) return null;
      const runner = (selectedTeam.value.runners || []).find(
        (r) => r.id === user.value.uid,
      );
      if (!runner?.segmentId) return null;
      return (activeRace.value?.segments || []).find(
        (segment) => segment.id === runner.segmentId && segment.type === "solo",
      );
    });

    const isCaptainAssignedToAnySegment = computed(
      () => !!captainAssignedSegment.value,
    );

    const assignedSegments = computed(() => {
      if (!selectedTeam.value?.runners) return [];
      const myUid = user.value?.uid;
      return selectedTeam.value.runners
        .filter((r) => r.segmentId && r.id !== myUid)
        .map((r) => r.segmentId);
    });

    const acceptedSegments = computed(() => {
      if (!selectedTeam.value?.runners) return [];
      const myUid = user.value?.uid;
      return selectedTeam.value.runners
        .filter((r) => r.segmentId && r.id === myUid)
        .map((r) => r.segmentId);
    });

    const isSegmentAssigned = computed(() => {
      if (!selectedTeam.value || !currentCompactRow.value) return false;
      const runner = (selectedTeam.value.runners || []).find(
        (r) => r.segmentId === currentCompactRow.value.segmentId,
      );
      return !!runner;
    });

    const isAssignedToMe = computed(() => {
      if (!selectedTeam.value || !currentCompactRow.value || !user.value?.uid)
        return false;
      const runner = (selectedTeam.value.runners || []).find(
        (r) =>
          r.segmentId === currentCompactRow.value.segmentId &&
          r.id === user.value.uid,
      );
      return !!runner;
    });

    const runnerPace = computed({
      get: () => ({
        minutes: editDraft.value.minutes,
        seconds: editDraft.value.seconds,
      }),
      set: (val) => {
        editDraft.value.minutes = val.minutes;
        editDraft.value.seconds = val.seconds;
      },
    });

    const groupPace = computed({
      get: () => ({
        minutes: editDraft.value.groupMinutes,
        seconds: editDraft.value.groupSeconds,
      }),
      set: (val) => {
        editDraft.value.groupMinutes = val.minutes;
        editDraft.value.groupSeconds = val.seconds;
      },
    });

    const getSegmentRunner = (segmentId) => {
      if (!selectedTeam.value) return null;
      return (selectedTeam.value.runners || []).find(
        (r) => r.segmentId === segmentId && r.id !== user.value?.uid,
      );
    };

    const userTeams = computed(() =>
      teams.value.filter(
        (team) =>
          team.captainId === user.value?.uid ||
          (team.runners || []).some((runner) => runner.id === user.value?.uid),
      ),
    );

    const defaultRace = computed(
      () =>
        races.value.find((race) => race.isDefault) || races.value[0] || null,
    );
    const fallbackUserRace = computed(() => {
      const selectedUserTeam = userTeams.value.find(
        (team) => team.id === selectedTeamId.value,
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
        null,
    );
    const teamsForSelectedRace = computed(() =>
      userTeams.value.filter(
        (team) =>
          !selectedViewRace.value || team.raceId === selectedViewRace.value.id,
      ),
    );
    const selectedTeam = computed(
      () =>
        teamsForSelectedRace.value.find(
          (team) => team.id === selectedTeamId.value,
        ) ||
        teamsForSelectedRace.value[0] ||
        null,
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

    const canEditSetup = computed(() => {
      if (isAdmin.value) return true;
      if (selectedTeam.value?.captainId === user.value?.uid) return true;
      const raceAdmins = activeRace.value?.adminUids || [];
      return raceAdmins.includes(user.value?.uid);
    });
    const runnerSegmentIds = computed(
      () =>
        new Set(
          (selectedTeam.value?.runners || [])
            .filter((runner) => runner.id === user.value?.uid)
            .map((runner) => runner.segmentId),
        ),
    );

    const raceOptions = computed(() =>
      races.value.map((race) => ({
        label: race.name?.trim() || t("admin.unnamedRace"),
        value: race.id,
      })),
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
      }),
    );

    const getLocalSetupStorageKey = (raceId) =>
      `runnerSetup:${raceId || "default"}`;

    const parsePace = (pace) => Number(pace) || 0;

    const getPaceMinutes = (pace) => Math.floor(parsePace(pace));
    const getPaceSeconds = (pace) =>
      Math.round((parsePace(pace) - Math.floor(parsePace(pace))) * 60);
    const paceFromParts = (minutes, seconds) =>
      (Number(minutes) || 0) + (Number(seconds) || 0) / 60;

    const timelineRows = computed(() => {
      return resultRows.value.filter(
        (row) => row.id !== "planned-start" && row.id !== "real-start",
      );
    });

    const endTime = computed(() => {
      const lastSegment = timelineRows.value[timelineRows.value.length - 1];
      return lastSegment?.arrivalTime || "";
    });

    const maxPace = computed(() => {
      if (!resultRows.value?.length) return null;
      let max = 0;
      resultRows.value.forEach((row) => {
        const pace = parsePace(row.paceValue);
        if (pace > max) max = pace;
      });
      return max || null;
    });

    const formatPace = (paceValue) => {
      if (paceValue == null) return null;
      const mins = Math.floor(paceValue);
      const secs = Math.round((paceValue - mins) * 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

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
        JSON.stringify(setupValues.value),
      );
    };

    const syncSetupFromTeam = (team, race) => {
      const baseSetup = buildBaseSetup(race);
      const runnersBySegment = Object.fromEntries(
        (team?.runners || []).map((runner) => [runner.segmentId, runner]),
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

    const openDelayDialog = () => {
      if (!canEditSetup.value) {
        $q.notify({
          type: "info",
          position: "top",
          message: t("index.startDelayReadOnly"),
        });
        return;
      }
      editingDelay.value = setupValues.value.startDelay || 0;
      showDelayDialog.value = true;
    };

    const openRunnerNameDialog = ({ index }) => {
      editingRunnerNameIndex.value = index;
      const segmentId = timelineRows.value[index]?.segmentId;
      const config = setupValues.value.segmentConfigs?.[segmentId];
      editingRunnerName.value = config?.name || "";
      currentEditingSegment.value = segmentId;
      showRunnerNameDialog.value = true;
    };

    const saveRunnerName = () => {
      if (editingRunnerNameIndex.value === null) return;
      const segmentId =
        timelineRows.value[editingRunnerNameIndex.value]?.segmentId;
      if (!segmentId) return;
      showRunnerNameDialog.value = false;
      setupValues.value = {
        ...setupValues.value,
        segmentConfigs: {
          ...setupValues.value.segmentConfigs,
          [segmentId]: {
            ...setupValues.value.segmentConfigs?.[segmentId],
            name: editingRunnerName.value,
          },
        },
      };
      recalculate();
    };

    const saveDelay = () => {
      showDelayDialog.value = false;
      setupValues.value.startDelay = Number(editingDelay.value) || 0;
      recalculate();
    };

    const isMySegment = (segmentId) => {
      const runner = getSegmentRunner(segmentId);
      return runner?.id === user.value?.uid;
    };

    const handleAssignToMe = async () => {
      if (!currentEditingSegment.value) return;
      const segment = { id: currentEditingSegment.value };
      await assignCaptainToSegment(segment);
      showRunnerNameDialog.value = false;
    };

    const handleUnassign = async () => {
      if (!currentEditingSegment.value) return;
      await removeCaptainFromSpecificSegment(currentEditingSegment.value);
      showRunnerNameDialog.value = false;
    };

    const handleInvite = async () => {
      if (!currentEditingSegment.value) return;
      const segment = { id: currentEditingSegment.value };
      await inviteRunner(segment);
      showRunnerNameDialog.value = false;
    };

    const openPaceDialog = ({ row, index }) => {
      isPaceDialogEditing.value = true;
      let pace = 5;
      let segmentId;
      if (index === -1) {
        editingPaceSegmentId.value = null;
        segmentId = timelineRows.value[0]?.segmentId;
        const config = setupValues.value.segmentConfigs?.[segmentId];
        pace = config?.pace || 5;
        editingPaceRunnerName.value = config?.name || "";
      } else {
        editingPaceSegmentId.value = row.segmentId;
        segmentId = row.segmentId;
        const config = setupValues.value.segmentConfigs?.[segmentId];
        pace = config?.pace || 5;
        editingPaceRunnerName.value = config?.name || "";
      }
      editingPace.value = {
        minutes: Math.floor(pace),
        seconds: Math.round((pace - Math.floor(pace)) * 60),
      };
      showPaceDialog.value = true;
    };

    const onPaceSaved = async (value) => {
      const { minutes, seconds } = value;
      const newPace = paceFromParts(minutes, seconds);
      showPaceDialog.value = false;

      if (editingPaceSegmentId.value === null) {
        const firstSegmentId = timelineRows.value[0]?.segmentId;
        if (firstSegmentId) {
          setupValues.value = {
            ...setupValues.value,
            segmentConfigs: {
              ...setupValues.value.segmentConfigs,
              [firstSegmentId]: {
                ...setupValues.value.segmentConfigs?.[firstSegmentId],
                pace: newPace,
              },
            },
          };
        }
      } else {
        setupValues.value = {
          ...setupValues.value,
          segmentConfigs: {
            ...setupValues.value.segmentConfigs,
            [editingPaceSegmentId.value]: {
              ...setupValues.value.segmentConfigs?.[editingPaceSegmentId.value],
              pace: newPace,
            },
          },
        };
      }

      showPaceDialog.value = false;
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

    const onRunnerPaceSaved = async (value) => {
      if (!currentCompactRow.value?.editable) {
        closeCompactSegmentEdit();
        return;
      }

      const { minutes, seconds } = value;

      const updatedConfig = {
        ...(setupValues.value.segmentConfigs?.[
          currentCompactRow.value.segmentId
        ] || {}),
        pace: paceFromParts(minutes, seconds),
      };

      setupValues.value = {
        ...setupValues.value,
        segmentConfigs: {
          ...setupValues.value.segmentConfigs,
          [currentCompactRow.value.segmentId]: updatedConfig,
        },
      };

      if (!selectedTeam.value || canEditSetup.value) {
        await saveTeamSetup();
      } else {
        await saveOwnRunnerSegment(
          currentCompactRow.value.segmentId,
          updatedConfig,
        );
      }

      recalculate();
      closeCompactSegmentEdit();
    };

    const saveCompactSegmentEdit = async (row = currentCompactRow.value) => {
      if (!row?.editable || !canEditRow(row)) {
        closeCompactSegmentEdit();
        return;
      }

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
            editDraft.value.groupSeconds,
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
        await saveTeamSetup();
      } else {
        await saveOwnRunnerSegment(row.segmentId, updatedConfig);
      }
      recalculate();
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
            : runner,
        );

        await updateTeam(selectedTeam.value.id, { runners });
        selectedTeam.value = {
          ...selectedTeam.value,
          runners,
        };
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
        (runner) => runner.segmentId !== segment.id,
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
            (runner) => runner.segmentId !== segment.id,
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
        (runner) => runner.segmentId !== segment.id,
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
          runner.id !== user.value.uid || runner.segmentId !== segmentId,
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
          ]),
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
              : 0,
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

      times.forEach((time, index) => {
        const soloPaces = times
          .filter((t) => t.segmentType !== "group" && t.pace)
          .map((t) => t.pace);
        const maxSoloPace = soloPaces.length ? Math.max(...soloPaces) : 5;
        const pace = time.segmentType === "group" ? maxSoloPace : time.pace;

        rows.push({
          id: time.segmentId,
          label: buildRowLabel(time),
          segmentId: time.segmentId,
          segmentName: time.segmentName,
          segmentType: time.segmentType,
          name: time.runner || "",
          arrivalTime: formatClockDisplay(time.arrivalTime),
          duration: formatDurationMinutesSeconds(time.duration),
          pace: pace ? formatPaceDisplay(pace) : "",
          paceValue: pace || 0,
          editable: true,
          isLast: index === times.length - 1,
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
        activeRace.value.startTime || "08:00",
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
        (team) => team.id === teamId,
      )?.raceId;
      if (teamRaceId) {
        setSelectedPublicRace(teamRaceId);
      }
    };

    const handleSelectRace = (raceId) => {
      setSelectedPublicRace(raceId);
      const matchingTeams = userTeams.value.filter(
        (team) => team.raceId === raceId,
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
        (r) => r.segmentId === segmentId,
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

    const handleLogout = async () => {
      await logout();
      router.push("/login");
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
        },
      );

      unsubscribeTeams = getTeamsListener(
        (newTeams) => {
          teams.value = newTeams;
          syncSelectedTeam(user.value?.uid, teamsForSelectedRace.value);
          applySetupForCurrentContext();
        },
        (error) => {
          console.error("Error in teams listener:", error);
        },
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
            !selectedViewRace.value ||
            team.raceId === selectedViewRace.value.id,
        );
        syncSelectedTeam(user.value?.uid, nextTeamsForRace);
      },
      { deep: true },
    );

    watch([selectedTeam, activeRace], () => {
      applySetupForCurrentContext();
    });

    watch(showPaceDialog, (isOpen) => {
      if (!isOpen) {
        isPaceDialogEditing.value = false;
      }
    });

    watch(
      setupValues,
      () => {
        if (isPaceDialogEditing.value) {
          return;
        }
        if (selectedTeam.value) {
          queueTeamAutosave(0);
        } else {
          saveLocalSetup();
        }
        recalculate();
      },
      { deep: true },
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
      timelineRows,
      endTime,
      raceOptions,
      teamOptions,
      teamsForSelectedRace,
      minuteOptions,
      secondOptions,
      editDraft,
      runnerPace,
      groupPace,
      maxPace,
      formatPace,
      t,
      handleSelectTeam,
      handleSelectRace,
      handleLogout,
      notifyReadOnly,
      notifyStartDelayReadOnly,
      updateStartDelay,
      openDelayDialog,
      saveDelay,
      showDelayDialog,
      editingDelay,
      showPaceDialog,
      editingPace,
      editingPaceRunnerName,
      openPaceDialog,
      onPaceSaved,
      showRunnerNameDialog,
      editingRunnerName,
      openRunnerNameDialog,
      saveRunnerName,
      showCompactSegmentDialog,
      currentCompactRow,
      openCompactSegmentEdit,
      closeCompactSegmentEdit,
      startCompactSegmentEdit,
      onRunnerPaceSaved,
      saveCompactSegmentEdit,
      isCaptain,
      isAdmin,
      captainAssignedSegment,
      isCaptainAssignedToAnySegment,
      assignedSegments,
      acceptedSegments,
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
      currentEditingSegment,
      isMySegment,
      handleAssignToMe,
      handleUnassign,
      handleInvite,
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
