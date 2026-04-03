<template>
  <q-page>
    <q-card class="q-pa-md">
      <q-tabs v-model="mainTab" align="justify" class="text-primary q-mb-md">
        <q-tab name="myTeams" :label="t('team.tab.myTeams')" />
        <q-tab name="create" :label="t('team.tab.create')" />
        <q-tab name="join" :label="t('team.tab.join')" />
      </q-tabs>

      <q-tab-panels v-model="mainTab" animated swipeable>
        <q-tab-panel name="myTeams">
          <div v-if="userTeams.length === 0" class="text-body2 text-grey-7">
            {{ t("team.noTeamsYet") }}
          </div>

          <template v-else>
            <q-select
              :model-value="selectedTeamId"
              :options="teamOptions"
              emit-value
              map-options
              behavior="menu"
              outlined
              :label="t('team.selectTeam')"
              class="q-mb-md"
              @update:model-value="handleSelectTeam"
            />

            <q-card flat class="q-mb-md">
              <q-card-section>
                <div class="text-h6">
                  {{ selectedTeam?.name || t("team.unnamedTeam") }}
                </div>
                <div class="text-body2 text-grey-7">
                  {{ t("team.race") }}:
                  {{ selectedRace?.name || t("team.noRaceAssigned") }}
                </div>
                <div class="text-body2 text-grey-7">
                  {{ t("team.role") }}:
                  {{ isCaptain ? t("team.roleCaptain") : t("team.roleRunner") }}
                </div>
              </q-card-section>
              <q-card-actions v-if="isCaptain" align="right">
                <q-btn
                  :label="t('team.deleteTeam')"
                  color="negative"
                  flat
                  :loading="deleting"
                  @click="confirmDeleteDialog = true"
                />
              </q-card-actions>
            </q-card>

            <div v-if="!selectedRace" class="text-body2 text-grey-7 q-mb-md">
              {{ t("team.noRaceAssignedHint") }}
            </div>
          </template>
        </q-tab-panel>

        <q-tab-panel name="create">
          <q-card class="bg-primary-1 q-mb-md">
            <q-card-section class="text-caption text-primary">
              <q-icon name="info" size="sm" /> {{ t("team.infoCaptain") }}
            </q-card-section>
          </q-card>

          <q-input
            v-model="newTeamName"
            :label="t('team.teamName')"
            outlined
            class="q-mb-md"
          />
          <q-select
            v-model="createRaceId"
            :options="raceOptions"
            emit-value
            map-options
            behavior="menu"
            outlined
            :label="t('team.selectRace')"
            class="q-mb-md"
          />
          <q-btn
            :label="t('team.createTeam')"
            color="primary"
            :loading="creating"
            :disable="!createRaceId"
            @click="handleCreateTeam"
          />
        </q-tab-panel>

        <q-tab-panel name="join">
          <q-input
            v-model="invitationCode"
            :label="t('team.invitationCode')"
            outlined
          />
          <q-btn
            :label="t('team.joinTeam')"
            color="primary"
            class="q-mt-md"
            :loading="joining"
            @click="joinTeam"
          />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <q-dialog v-model="confirmDeleteDialog" persistent>
      <q-card class="dialog-card">
        <q-card-section class="text-h6">{{
          t("team.confirmDeleteTitle")
        }}</q-card-section>
        <q-card-section>{{ t("team.confirmDeleteBody") }}</q-card-section>
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
            :label="t('team.deleteTeam')"
            color="negative"
            :loading="deleting"
            @click="handleDeleteTeam"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirmRegenerateDialog" persistent>
      <q-card class="dialog-card">
        <q-card-section class="text-h6">{{
          t("team.confirmRegenerateTitle")
        }}</q-card-section>
        <q-card-section>{{
          t("team.confirmRegenerateBody", { name: runnerToRemove })
        }}</q-card-section>
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
            :label="t('team.generateCode')"
            color="negative"
            @click="confirmAndGenerateCode"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useQuasar } from "quasar";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "src/composables/useAuth.js";
import { useFirestore } from "src/composables/useFirestore.js";
import { useI18n } from "src/composables/useI18n.js";
import { useTeamContext } from "src/composables/useTeamContext.js";

export default {
  setup() {
    const $q = useQuasar();
    const route = useRoute();
    const router = useRouter();
    const { user } = useAuth();
    const {
      getTeams,
      getTeamsListener,
      getRacesListener,
      createTeam,
      updateTeam,
      deleteTeam,
    } = useFirestore();
    const { t } = useI18n();
    const {
      selectedTeamId,
      selectedPublicRaceId,
      syncSelectedTeam,
      setSelectedTeam,
    } = useTeamContext();

    const newTeamName = ref("");
    const createRaceId = ref("");
    const creating = ref(false);
    const deleting = ref(false);
    const mainTab = ref("myTeams");
    const teams = ref([]);
    const races = ref([]);
    const invitationCode = ref("");
    const joining = ref(false);
    const confirmDeleteDialog = ref(false);
    const confirmRegenerateDialog = ref(false);
    const runnerToRemove = ref("");
    const pendingSegmentForCode = ref(null);
    const captainSelectedSegment = ref(null);
    let unsubscribeTeams = null;
    let unsubscribeRaces = null;

    const syncMainTabFromRoute = () => {
      const tab = route.query.tab;
      if (tab === "create" || tab === "join" || tab === "myTeams") {
        mainTab.value = tab;
      }
    };

    const syncCreateRaceFromContext = () => {
      const routeRaceId =
        typeof route.query.race === "string" ? route.query.race : "";
      const preferredRaceId = routeRaceId || selectedPublicRaceId.value || "";
      if (
        preferredRaceId &&
        races.value.some((race) => race.id === preferredRaceId)
      ) {
        createRaceId.value = preferredRaceId;
        return;
      }

      if (
        !createRaceId.value ||
        !races.value.some((race) => race.id === createRaceId.value)
      ) {
        createRaceId.value = races.value[0]?.id || "";
      }
    };

    const clearTeamRouteTab = async () => {
      if (!route.query.tab) return;
      const nextQuery = { ...route.query };
      delete nextQuery.tab;
      await router.replace({ path: route.path, query: nextQuery });
    };

    const notify = (message, type = "positive") => {
      $q.notify({ type, message, position: "top" });
    };

    const userTeams = computed(() =>
      teams.value.filter(
        (team) =>
          team.captainId === user.value?.uid ||
          (team.runners || []).some((runner) => runner.id === user.value?.uid),
      ),
    );

    const selectedTeam = computed(
      () =>
        userTeams.value.find((team) => team.id === selectedTeamId.value) ||
        userTeams.value[0] ||
        null,
    );
    const selectedRace = computed(
      () =>
        races.value.find((race) => race.id === selectedTeam.value?.raceId) ||
        null,
    );
    const soloSegments = computed(() =>
      (selectedRace.value?.segments || []).filter(
        (segment) => segment.type !== "group",
      ),
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
      return soloSegments.value.find((s) => s.id === runner.segmentId) || null;
    });

    const runnerAssignedSegment = computed(() => {
      if (!selectedTeam.value || !user.value?.uid) return null;
      const runner = (selectedTeam.value.runners || []).find(
        (r) => r.id === user.value.uid,
      );
      if (!runner?.segmentId) return null;
      return soloSegments.value.find((s) => s.id === runner.segmentId) || null;
    });

    const runnerAssignedCode = computed(() => {
      if (!selectedTeam.value || !runnerAssignedSegment.value) return null;
      return (
        selectedTeam.value.invitationCodes?.[runnerAssignedSegment.value.id] ||
        null
      );
    });

    const isSegmentAssignedToAnyone = (segmentId) => {
      if (!selectedTeam.value || !segmentId) return false;
      const runner = (selectedTeam.value.runners || []).find(
        (r) => r.segmentId === segmentId,
      );
      return !!runner;
    };

    const isAssignedToMe = (segmentId) => {
      if (!selectedTeam.value || !segmentId || !user.value?.uid) return false;
      const runner = (selectedTeam.value.runners || []).find(
        (r) => r.segmentId === segmentId && r.id === user.value.uid,
      );
      return !!runner;
    };

    const getSegmentRunner = (segmentId) => {
      if (!selectedTeam.value) return null;
      return (selectedTeam.value.runners || []).find(
        (r) => r.segmentId === segmentId && r.id !== user.value?.uid,
      );
    };

    const isCaptainAssignedToAnySegment = computed(() => {
      return !!captainAssignedSegment.value;
    });

    const raceOptions = computed(() =>
      races.value.map((race) => ({
        label: race.name?.trim() || t("admin.unnamedRace"),
        value: race.id,
      })),
    );

    const teamOptions = computed(() =>
      userTeams.value.map((team) => {
        const race = races.value.find((item) => item.id === team.raceId);
        return {
          label: `${team.name || t("team.unnamedTeam")} - ${
            race?.name?.trim() || t("team.noRaceAssigned")
          }`,
          value: team.id,
        };
      }),
    );

    const loadTeams = async () => {
      teams.value = await getTeams();
      syncSelectedTeam(user.value?.uid, userTeams.value);
    };

    const handleSelectTeam = (teamId) => {
      setSelectedTeam(user.value?.uid, teamId);
    };

    const handleCreateTeam = async () => {
      if (!newTeamName.value.trim() || !createRaceId.value) return;

      creating.value = true;
      try {
        const teamId = await createTeam({
          name: newTeamName.value.trim(),
          captainId: user.value.uid,
          raceId: createRaceId.value,
          runners: [],
          invitationCodes: {},
          groupPaces: {},
          startDelay: null,
          hasCustomStartDelay: false,
        });

        newTeamName.value = "";
        await loadTeams();
        setSelectedTeam(user.value?.uid, teamId);
        mainTab.value = "myTeams";
        await clearTeamRouteTab();
      } catch (error) {
        console.error("Error creating team:", error);
        notify(t("team.createTeamError"), "negative");
      } finally {
        creating.value = false;
      }
    };

    const handleDeleteTeam = async () => {
      if (!selectedTeam.value || !isCaptain.value) return;

      deleting.value = true;
      try {
        const deletingId = selectedTeam.value.id;
        await deleteTeam(deletingId);
        setSelectedTeam(user.value?.uid, "");
        await loadTeams();
        notify(t("team.teamDeleted"));
        if (selectedTeamId.value === deletingId) {
          setSelectedTeam(user.value?.uid, userTeams.value[0]?.id || "");
        }
      } catch (error) {
        console.error("Error deleting team:", error);
        notify(t("team.deleteTeamError"), "negative");
      } finally {
        deleting.value = false;
      }
    };

    const inviteRunner = async (segment) => {
      if (!selectedTeam.value || !isCaptain.value || !segment?.id) return;
      const existingCode = selectedTeam.value?.invitationCodes?.[segment.id];
      if (existingCode) {
        const existingRunner = (selectedTeam.value.runners || []).find(
          (r) => r.segmentId === segment.id,
        );
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
        const existingRunner = (selectedTeam.value.runners || []).find(
          (r) => r.segmentId === segment.id,
        );
        pendingSegmentForCode.value = segment;
        runnerToRemove.value = existingRunner?.name || "runner";
        confirmRegenerateDialog.value = true;
        return;
      }

      await doGenerateCode(segment);
    };

    const doGenerateCode = async (segment) => {
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
      await loadTeams();
    };

    const assignCaptainToSegment = async (segment) => {
      if (!selectedTeam.value || !isCaptain.value || !segment?.id) return;

      const existingRunner = getSegmentRunner(segment.id);
      const invitationCodes = { ...(selectedTeam.value.invitationCodes || {}) };
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
      await loadTeams();
    };

    const removeCaptainFromSegment = async () => {
      if (!selectedTeam.value || !captainAssignedSegment.value) return;

      const runners = (selectedTeam.value.runners || []).filter(
        (runner) => runner.id !== user.value.uid,
      );

      await updateTeam(selectedTeam.value.id, { runners });
      await loadTeams();
    };

    const removeCaptainFromSpecificSegment = async (segmentId) => {
      if (!selectedTeam.value || !segmentId) return;

      const runners = (selectedTeam.value.runners || []).filter(
        (runner) =>
          runner.id !== user.value.uid || runner.segmentId !== segmentId,
      );

      await updateTeam(selectedTeam.value.id, { runners });
      await loadTeams();
    };

    const confirmAndGenerateCode = async () => {
      if (pendingSegmentForCode.value) {
        await doGenerateCode(pendingSegmentForCode.value);
        pendingSegmentForCode.value = null;
      }
    };

    const shareCode = async (segment) => {
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

    const joinTeam = async () => {
      if (!invitationCode.value.trim()) return;

      joining.value = true;
      try {
        const team = teams.value.find((item) =>
          Object.values(item.invitationCodes || {}).includes(
            invitationCode.value.trim(),
          ),
        );

        if (!team) {
          notify(t("team.invalidInvitationCode"), "negative");
          return;
        }

        const segmentId = Object.keys(team.invitationCodes || {}).find(
          (key) => team.invitationCodes[key] === invitationCode.value.trim(),
        );

        if (!segmentId) {
          notify(t("team.invalidInvitationCode"), "negative");
          return;
        }

        const existingRunner = (team.runners || []).find(
          (runner) => runner.segmentId === segmentId,
        );
        const runners = (team.runners || []).filter(
          (runner) =>
            runner.segmentId !== segmentId && runner.id !== user.value.uid,
        );

        runners.push({
          id: user.value.uid,
          segmentId,
          name:
            existingRunner?.name ||
            user.value.displayName ||
            user.value.email ||
            "",
          pace: Number(existingRunner?.pace) || 5,
        });

        await updateTeam(team.id, { runners });
        invitationCode.value = "";
        await loadTeams();
        setSelectedTeam(user.value?.uid, team.id);
        notify(t("team.joinTeamSuccess"), "positive");
        await router.push("/");
      } catch (error) {
        console.error("Error joining team:", error);
        notify(t("team.joinTeamError"), "negative");
      } finally {
        joining.value = false;
      }
    };

    watch(userTeams, (nextTeams) => {
      syncSelectedTeam(user.value?.uid, nextTeams);
    });

    watch(
      () => route.query.tab,
      () => {
        syncMainTabFromRoute();
      },
    );

    watch(
      () => route.query.race,
      () => {
        syncCreateRaceFromContext();
      },
    );

    onMounted(async () => {
      syncMainTabFromRoute();

      unsubscribeRaces = getRacesListener(
        (newRaces) => {
          races.value = newRaces;
          const defaultRace =
            newRaces.find((r) => r.isDefault) || newRaces[0] || null;
          if (!newRaces.length && defaultRace?.id) {
            createRaceId.value = defaultRace.id;
            return;
          }
          syncCreateRaceFromContext();
          if (!createRaceId.value) {
            createRaceId.value = defaultRace?.id || newRaces[0]?.id || "";
          }
        },
        (error) => {
          console.error("Error in races listener:", error);
        },
      );

      unsubscribeTeams = getTeamsListener(
        (newTeams) => {
          teams.value = newTeams;
          syncSelectedTeam(user.value?.uid, userTeams.value);
        },
        (error) => {
          console.error("Error in teams listener:", error);
        },
      );
    });

    onUnmounted(() => {
      if (unsubscribeTeams) unsubscribeTeams();
      if (unsubscribeRaces) unsubscribeRaces();
    });

    return {
      t,
      mainTab,
      userTeams,
      selectedTeamId,
      selectedTeam,
      selectedRace,
      soloSegments,
      isCaptain,
      captainAssignedSegment,
      isCaptainAssignedToAnySegment,
      captainSelectedSegment,
      runnerAssignedSegment,
      runnerAssignedCode,
      assignCaptainToSegment,
      removeCaptainFromSegment,
      removeCaptainFromSpecificSegment,
      getSegmentRunner,
      isSegmentAssignedToAnyone,
      isAssignedToMe,
      newTeamName,
      createRaceId,
      creating,
      deleting,
      invitationCode,
      joining,
      confirmDeleteDialog,
      confirmRegenerateDialog,
      runnerToRemove,
      raceOptions,
      teamOptions,
      handleSelectTeam,
      handleCreateTeam,
      handleDeleteTeam,
      joinTeam,
      inviteRunner,
      generateCode,
      confirmAndGenerateCode,
      shareCode,
    };
  },
};
</script>
