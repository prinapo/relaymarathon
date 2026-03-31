<template>
  <q-page>
    <q-card class="q-pa-md">
      <q-card-section>
        <q-tabs v-model="tab" class="text-grey-8">
          <q-tab name="races" :label="t('admin.tab.races')" />
          <q-tab name="translations" :label="t('admin.tab.translations')" />
        </q-tabs>
      </q-card-section>

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="races">
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-8">
              <q-select
                v-model="selectedRaceId"
                :options="raceOptions"
                emit-value
                map-options
                behavior="menu"
                outlined
                :label="t('admin.selectRace')"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-btn
                :label="t('admin.addRace')"
                color="primary"
                class="full-width"
                @click="handleCreateRace"
                :loading="creatingRace"
              />
            </div>
          </div>

          <template v-if="selectedRace">
            <div v-if="!isEditing" class="text-body2 text-grey-7 q-mb-md">
              {{ t("admin.viewOnlyHint") }}
            </div>

            <div class="text-subtitle1 q-mb-sm">{{ t("admin.raceData") }}</div>

            <q-markup-table flat bordered separator="cell" class="q-mb-md">
              <thead>
                <tr>
                  <th :class="segmentHeaderClass('text-left')">
                    {{ t("admin.field") }}
                  </th>
                  <th :class="segmentHeaderClass('text-left')">
                    {{ t("admin.value") }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, index) in raceDataRows"
                  :key="row.key"
                  :class="segmentRowClass(index)"
                  @click="handleRaceFieldRowClick(row)"
                >
                  <td :class="segmentFirstColumnClass">
                    {{ row.label }}
                  </td>
                  <td
                    class="cursor-pointer"
                    :class="row.error ? 'text-negative text-weight-bold' : ''"
                  >
                    {{ row.displayValue || t("admin.emptyValue") }}
                  </td>
                </tr>
              </tbody>
            </q-markup-table>

            <div class="text-subtitle1 q-mb-sm">{{ t("admin.segments") }}</div>

            <q-markup-table flat bordered separator="cell">
              <thead>
                <tr>
                  <th :class="segmentHeaderClass('text-left')">
                    {{ t("admin.segmentName") }}
                  </th>
                  <th :class="segmentHeaderClass('text-center')">
                    {{ t("admin.segmentType") }}
                  </th>
                  <th :class="segmentHeaderClass('text-center')">
                    {{ t("admin.segmentDistance") }}
                  </th>
                  <th :class="segmentHeaderClass('text-center')">
                    {{ t("admin.segmentActions") }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(segment, index) in editableRace.segments"
                  :key="segment.id"
                  :class="segmentRowClass(index)"
                  @click="handleSegmentRowClick(segment.id)"
                >
                  <td :class="segmentFirstColumnClass">
                    {{ segment.name }}
                  </td>
                  <td class="text-center cursor-pointer">
                    {{
                      segment.type === "group"
                        ? t("admin.segmentTypeGroup")
                        : t("admin.segmentTypeSolo")
                    }}
                  </td>
                  <td
                    class="text-center cursor-pointer"
                    :class="{
                      'text-negative text-weight-bold':
                        (Number(segment.distance) || 0) <= 0,
                    }"
                  >
                    {{ segment.distance }}
                  </td>
                  <td class="text-center">
                    <q-btn
                      v-if="isEditing"
                      flat
                      dense
                      round
                      icon="add"
                      color="primary"
                      @click.stop="addSegment(index)"
                    />
                    <q-btn
                      v-if="isEditing"
                      flat
                      dense
                      round
                      icon="remove"
                      color="negative"
                      @click.stop="confirmRemoveSegment(segment.id)"
                    />
                  </td>
                </tr>
              </tbody>
            </q-markup-table>

            <div v-if="isEditing" class="text-caption text-grey-7 q-mt-md">
              {{ t("admin.autoSaveHint") }}
            </div>

            <div class="row q-col-gutter-sm q-mt-md">
              <div v-if="!isEditing" class="col-12 col-md-auto">
                <q-btn
                  :label="t('admin.editRace')"
                  color="primary"
                  @click="confirmEditDialog = true"
                />
              </div>
              <div v-else class="col-12 col-md-auto">
                <q-btn
                  :label="t('admin.doneEditing')"
                  color="primary"
                  flat
                  @click="endEdit"
                />
              </div>
              <div v-if="isEditing" class="col-12 col-md-auto">
                <q-btn
                  :label="t('index.cancel')"
                  color="grey-7"
                  flat
                  @click="cancelEdit"
                />
              </div>
              <div class="col-12 col-md-auto">
                <q-btn
                  :label="t('admin.setDefaultRace')"
                  color="secondary"
                  flat
                  :loading="savingDefaultRace"
                  @click="handleSetDefaultRace"
                />
              </div>
              <div v-if="!isEditing" class="col-12 col-md-auto">
                <q-btn
                  :label="t('admin.deleteRace')"
                  color="negative"
                  flat
                  :loading="deletingRace"
                  @click="confirmDeleteDialog = true"
                />
              </div>
            </div>

            <div
              v-if="selectedRace?.isDefault"
              class="text-caption text-grey-7 q-mt-sm"
            >
              {{ t("admin.defaultRaceHint") }}
            </div>
          </template>

          <div v-else class="text-body2 text-grey-7">
            {{ t("admin.noRaceSelected") }}
          </div>
        </q-tab-panel>

        <q-tab-panel name="translations">
          <div class="text-body2 q-mb-md text-grey-7">
            {{ t("admin.translationsInfo") }}
          </div>

          <q-markup-table flat bordered separator="cell">
            <thead>
              <tr>
                <th class="text-left">{{ t("admin.key") }}</th>
                <th class="text-left">{{ t("admin.italian") }}</th>
                <th class="text-left">{{ t("admin.english") }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="translationKey in translationKeys"
                :key="translationKey"
              >
                <td class="text-left text-caption">{{ translationKey }}</td>
                <td>
                  <q-input
                    v-model="editableTranslations[translationKey].it"
                    outlined
                    dense
                    @blur="saveTranslationIfChanged(translationKey, 'it')"
                  />
                </td>
                <td>
                  <q-input
                    v-model="editableTranslations[translationKey].en"
                    outlined
                    dense
                    @blur="saveTranslationIfChanged(translationKey, 'en')"
                  />
                </td>
              </tr>
            </tbody>
          </q-markup-table>

          <q-btn
            class="q-mt-md"
            :label="t('admin.saveTranslations')"
            color="primary"
            @click="handleSaveTranslations"
            :loading="savingTranslations"
          />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <q-dialog v-model="confirmEditDialog" persistent>
      <q-card class="dialog-card">
        <q-card-section class="text-h6">{{
          t("admin.confirmEditTitle")
        }}</q-card-section>
        <q-card-section>{{ t("admin.confirmEditBody") }}</q-card-section>
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
            :label="t('index.edit')"
            color="primary"
            @click="beginEdit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirmDeleteDialog" persistent>
      <q-card class="dialog-card">
        <q-card-section class="text-h6">{{
          t("admin.confirmDeleteTitle")
        }}</q-card-section>
        <q-card-section>{{ t("admin.confirmDeleteBody") }}</q-card-section>
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
            :label="t('admin.deleteRace')"
            color="negative"
            :loading="deletingRace"
            @click="handleDeleteRace"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirmRemoveSegmentDialog" persistent>
      <q-card class="dialog-card">
        <q-card-section class="text-h6">{{
          t("admin.confirmRemoveSegmentTitle")
        }}</q-card-section>
        <q-card-section>{{
          t("admin.confirmRemoveSegmentBody")
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
            :label="t('admin.removeSegment')"
            color="negative"
            @click="removeSegment"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="segmentEditorDialog" persistent>
      <q-card class="dialog-card">
        <q-card-section class="text-h6">{{
          t("admin.editSegment")
        }}</q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input
            v-model="segmentDraft.name"
            :label="t('admin.segmentName')"
            outlined
            dense
            autofocus
          />
          <q-select
            v-model="segmentDraft.type"
            :options="segmentTypeOptions"
            emit-value
            map-options
            behavior="menu"
            :label="t('admin.segmentType')"
            outlined
            dense
          />
          <q-input
            v-model.number="segmentDraft.distance"
            type="number"
            :label="t('admin.segmentDistance')"
            :error="Boolean(segmentDistanceError)"
            :error-message="segmentDistanceError"
            outlined
            dense
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            v-close-popup
            flat
            :label="t('index.cancel')"
            color="primary"
          />
          <q-btn
            flat
            :label="t('index.save')"
            color="primary"
            @click="saveSegmentDialog"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="raceFieldEditorDialog" persistent>
      <q-card class="dialog-card">
        <q-card-section class="text-h6">{{
          activeRaceFieldLabel
        }}</q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input
            v-model="raceFieldDraft"
            :type="activeRaceFieldType"
            :label="activeRaceFieldLabel"
            :error="Boolean(activeRaceFieldError)"
            :error-message="activeRaceFieldError"
            outlined
            dense
            autofocus
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            v-close-popup
            flat
            :label="t('index.cancel')"
            color="primary"
          />
          <q-btn
            flat
            :label="t('index.save')"
            color="primary"
            @click="saveRaceFieldDialog"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useQuasar } from "quasar";
import { useAuth, waitForAuthReady } from "src/composables/useAuth.js";
import { useFirestore } from "src/composables/useFirestore.js";
import { useI18n } from "src/composables/useI18n.js";

export default {
  setup() {
    const $q = useQuasar();
    const { isAdmin, authInitialized } = useAuth();
    const {
      getRaces,
      getTeams,
      getRacesListener,
      getTeamsListener,
      createRace,
      createSegment,
      updateRace,
      deleteRace,
      setDefaultRace,
    } = useFirestore();
    const { t, translations, saveTranslations } = useI18n();

    const tab = ref("races");
    const races = ref([]);
    const teams = ref([]);
    const selectedRaceId = ref("");
    const editableRace = ref(null);
    const creatingRace = ref(false);
    const savingRace = ref(false);
    const savingDefaultRace = ref(false);
    const savingTranslations = ref(false);
    const deletingRace = ref(false);
    const editableTranslations = ref({});
    const originalTranslations = ref({});
    const isEditing = ref(false);
    const confirmEditDialog = ref(false);
    const confirmDeleteDialog = ref(false);
    const confirmRemoveSegmentDialog = ref(false);
    const segmentEditorDialog = ref(false);
    const raceFieldEditorDialog = ref(false);
    const pendingSegmentRemovalId = ref("");
    const activeSegmentId = ref("");
    const activeRaceFieldKey = ref("");
    const raceFieldDraft = ref("");
    const newlyCreatedRaceId = ref("");
    const segmentDraft = ref({
      name: "",
      type: "solo",
      distance: 0,
    });
    const suppressRaceAutosave = ref(false);
    let autoSaveTimer = null;
    let unsubscribeTeams = null;
    let unsubscribeRaces = null;

    const segmentTypeOptions = computed(() => [
      { label: t("admin.segmentTypeSolo"), value: "solo" },
      { label: t("admin.segmentTypeGroup"), value: "group" },
    ]);

    const raceFieldMeta = computed(() => ({
      name: {
        label: t("admin.raceName"),
        type: "text",
        error: validationErrors.value.name || "",
      },
      location: {
        label: t("admin.raceLocation"),
        type: "text",
        error: validationErrors.value.location || "",
      },
      date: {
        label: t("admin.raceDate"),
        type: "date",
        error: validationErrors.value.date || "",
      },
      startTime: {
        label: t("admin.raceStartTime"),
        type: "time",
        error: validationErrors.value.startTime || "",
      },
      defaultStartDelay: {
        label: t("admin.defaultStartDelay"),
        type: "number",
        error: "",
      },
    }));

    const raceDataRows = computed(() => {
      if (!editableRace.value) return [];
      return [
        {
          key: "name",
          label: raceFieldMeta.value.name.label,
          displayValue: editableRace.value.name,
          error: raceFieldMeta.value.name.error,
        },
        {
          key: "location",
          label: raceFieldMeta.value.location.label,
          displayValue: editableRace.value.location,
          error: raceFieldMeta.value.location.error,
        },
        {
          key: "date",
          label: raceFieldMeta.value.date.label,
          displayValue: editableRace.value.date,
          error: raceFieldMeta.value.date.error,
        },
        {
          key: "startTime",
          label: raceFieldMeta.value.startTime.label,
          displayValue: editableRace.value.startTime,
          error: raceFieldMeta.value.startTime.error,
        },
        {
          key: "defaultStartDelay",
          label: raceFieldMeta.value.defaultStartDelay.label,
          displayValue: `${Number(editableRace.value.defaultStartDelay) || 0}`,
          error: "",
        },
      ];
    });

    const activeRaceFieldLabel = computed(
      () => raceFieldMeta.value[activeRaceFieldKey.value]?.label || ""
    );

    const activeRaceFieldType = computed(
      () => raceFieldMeta.value[activeRaceFieldKey.value]?.type || "text"
    );

    const activeRaceFieldError = computed(() => {
      if (!activeRaceFieldKey.value) return "";

      if (activeRaceFieldKey.value === "name") {
        return raceFieldDraft.value?.trim()
          ? ""
          : t("admin.validationRaceName");
      }

      if (activeRaceFieldKey.value === "location") {
        return raceFieldDraft.value?.trim()
          ? ""
          : t("admin.validationRaceLocation");
      }

      if (activeRaceFieldKey.value === "date") {
        return raceFieldDraft.value?.trim()
          ? ""
          : t("admin.validationRaceDate");
      }

      if (activeRaceFieldKey.value === "startTime") {
        return raceFieldDraft.value?.trim()
          ? ""
          : t("admin.validationRaceStartTime");
      }

      if (activeRaceFieldKey.value === "defaultStartDelay") {
        return Number(raceFieldDraft.value) < 0
          ? t("admin.validationStartDelay")
          : "";
      }

      return "";
    });

    const segmentHeaderClass = (alignClass) =>
      `${alignClass} ${
        isEditing.value ? "bg-secondary" : "bg-primary"
      } text-white`;

    const segmentRowClass = (index) => {
      if (isEditing.value) {
        return index % 2 === 0 ? "bg-green-1" : "bg-white";
      }
      return index % 2 === 0 ? "bg-grey-2" : "bg-white";
    };

    const segmentFirstColumnClass = computed(
      () =>
        `${
          isEditing.value ? "bg-secondary" : "bg-blue-1"
        } text-weight-medium cursor-pointer`
    );

    const translationKeys = computed(() =>
      Object.keys(editableTranslations.value)
    );
    const validationErrors = computed(() => {
      const race = editableRace.value;
      if (!race) return {};

      const errors = {};
      if (!race.name?.trim()) {
        errors.name = t("admin.validationRaceName");
      }
      if (!race.location?.trim()) {
        errors.location = t("admin.validationRaceLocation");
      }
      if (!race.date?.trim()) {
        errors.date = t("admin.validationRaceDate");
      }
      if (!race.startTime?.trim()) {
        errors.startTime = t("admin.validationRaceStartTime");
      }
      if (
        (race.segments || []).some(
          (segment) => (Number(segment.distance) || 0) <= 0
        )
      ) {
        errors.segments = t("admin.validationSegmentDistance");
      }

      return errors;
    });
    const segmentDistanceError = computed(() =>
      (Number(segmentDraft.value.distance) || 0) > 0
        ? ""
        : t("admin.validationSegmentDistance")
    );
    const raceOptions = computed(() =>
      races.value.map((race) => ({
        label: race.isDefault
          ? `${race.name?.trim() || t("admin.unnamedRace")} (${t(
              "admin.defaultBadge"
            )})`
          : race.name?.trim() || t("admin.unnamedRace"),
        value: race.id,
      }))
    );
    const selectedRace = computed(
      () => races.value.find((race) => race.id === selectedRaceId.value) || null
    );

    const cloneRace = (race) =>
      race
        ? {
            name: race.name || "",
            location: race.location || "",
            date: race.date || "",
            startTime: race.startTime || "08:00",
            defaultStartDelay: Number(race.defaultStartDelay) || 0,
            segments: (race.segments || []).map((segment) => ({ ...segment })),
          }
        : null;

    const syncEditableTranslations = () => {
      editableTranslations.value = JSON.parse(
        JSON.stringify(translations.value)
      );
      originalTranslations.value = JSON.parse(
        JSON.stringify(translations.value)
      );
    };

    const saveTranslationIfChanged = async (key, lang) => {
      const currentValue = editableTranslations.value[key]?.[lang] || "";
      const originalValue = originalTranslations.value[key]?.[lang] || "";
      if (currentValue !== originalValue) {
        originalTranslations.value[key] = originalTranslations.value[key] || {};
        originalTranslations.value[key][lang] = currentValue;
        savingTranslations.value = true;
        try {
          await saveTranslations(editableTranslations.value);
          notify(t("admin.translationsSaved"));
        } catch (error) {
          console.error("Error saving translation:", error);
          notify(t("admin.translationsSaveError"), "negative");
        } finally {
          savingTranslations.value = false;
        }
      }
    };

    const notify = (message, type = "positive") => {
      $q.notify({ type, message, position: "top" });
    };

    const notifyReadOnly = () => {
      if (isEditing.value) return;
      notify(t("admin.readOnlyNotify"), "info");
    };

    const getValidationMessage = () =>
      validationErrors.value.name ||
      validationErrors.value.location ||
      validationErrors.value.date ||
      validationErrors.value.startTime ||
      validationErrors.value.segments ||
      "";

    const openRaceFieldEditor = (row) => {
      if (!row?.key || !editableRace.value) return;
      activeRaceFieldKey.value = row.key;
      raceFieldDraft.value = String(editableRace.value[row.key] ?? "");
      raceFieldEditorDialog.value = true;
    };

    const handleRaceFieldRowClick = (row) => {
      if (!isEditing.value) {
        notifyReadOnly();
        return;
      }
      openRaceFieldEditor(row);
    };

    const beginEdit = () => {
      isEditing.value = true;
    };

    const endEdit = async () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = null;
      }
      const didSave = await handleSaveRace(false, true);
      if (!didSave) return;
      isEditing.value = false;
      newlyCreatedRaceId.value = "";
      editableRace.value = cloneRace(selectedRace.value);
    };

    const cancelEdit = async () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = null;
      }

      if (
        selectedRaceId.value &&
        selectedRaceId.value === newlyCreatedRaceId.value
      ) {
        try {
          await deleteRace(selectedRaceId.value);
          newlyCreatedRaceId.value = "";
          selectedRaceId.value = "";
          isEditing.value = false;
          await loadRaces();
          notify(t("admin.raceDeleted"));
          return;
        } catch (error) {
          console.error("Error cancelling new race:", error);
          notify(t("admin.raceDeleteError"), "negative");
          return;
        }
      }

      isEditing.value = false;
      editableRace.value = cloneRace(selectedRace.value);
    };

    const loadRaces = async () => {
      races.value = await getRaces();
      if (
        !selectedRaceId.value ||
        !races.value.some((race) => race.id === selectedRaceId.value)
      ) {
        selectedRaceId.value =
          races.value.find((race) => race.isDefault)?.id ||
          races.value[0]?.id ||
          "";
      }
    };

    const loadTeams = async () => {
      teams.value = await getTeams();
    };

    const addSegment = (index) => {
      if (!isEditing.value || !editableRace.value) return;
      const newSegment = createSegment(editableRace.value.segments.length + 1);
      editableRace.value.segments.splice(index + 1, 0, newSegment);
      openSegmentEditor(newSegment.id);
    };

    const confirmRemoveSegment = (segmentId) => {
      if (!isEditing.value || !editableRace.value) return;
      if (editableRace.value.segments.length <= 1) {
        notify(t("admin.segmentDeleteBlocked"), "negative");
        return;
      }
      pendingSegmentRemovalId.value = segmentId;
      confirmRemoveSegmentDialog.value = true;
    };

    const removeSegment = () => {
      if (!editableRace.value || !pendingSegmentRemovalId.value) return;
      editableRace.value.segments = editableRace.value.segments.filter(
        (segment) => segment.id !== pendingSegmentRemovalId.value
      );
      pendingSegmentRemovalId.value = "";
    };

    const openSegmentEditor = (segmentId) => {
      if (!editableRace.value) return;
      const segment = editableRace.value.segments.find(
        (item) => item.id === segmentId
      );
      if (!segment) return;

      activeSegmentId.value = segmentId;
      segmentDraft.value = {
        name: segment.name || "",
        type: segment.type === "group" ? "group" : "solo",
        distance: Number(segment.distance) || 0,
      };
      segmentEditorDialog.value = true;
    };

    const handleSegmentRowClick = (segmentId) => {
      if (!isEditing.value) {
        notifyReadOnly();
        return;
      }
      openSegmentEditor(segmentId);
    };

    const saveSegmentDialog = async () => {
      if (!editableRace.value || !activeSegmentId.value) return;
      if ((Number(segmentDraft.value.distance) || 0) <= 0) {
        notify(t("admin.validationSegmentDistance"), "negative");
        return;
      }

      editableRace.value.segments = editableRace.value.segments.map((segment) =>
        segment.id === activeSegmentId.value
          ? {
              ...segment,
              name: segmentDraft.value.name?.trim() || segment.name,
              type: segmentDraft.value.type === "group" ? "group" : "solo",
              distance: Number(segmentDraft.value.distance) || 0,
            }
          : segment
      );

      segmentEditorDialog.value = false;
      await handleSaveRace(false);
    };

    const saveRaceFieldDialog = async () => {
      if (!editableRace.value || !activeRaceFieldKey.value) return;
      if (activeRaceFieldError.value) {
        notify(activeRaceFieldError.value, "negative");
        return;
      }

      editableRace.value = {
        ...editableRace.value,
        [activeRaceFieldKey.value]:
          activeRaceFieldKey.value === "defaultStartDelay"
            ? Number(raceFieldDraft.value) || 0
            : raceFieldDraft.value,
      };

      raceFieldEditorDialog.value = false;
      await handleSaveRace(false);
    };

    const handleCreateRace = async () => {
      creatingRace.value = true;
      try {
        const raceId = await createRace({
          name: "",
          location: "",
          date: "",
          startTime: "08:00",
          defaultStartDelay: 0,
          segments: [createSegment(1)],
        });
        selectedRaceId.value = raceId;
        newlyCreatedRaceId.value = raceId;
        await loadRaces();
        isEditing.value = true;
        notify(t("admin.raceCreated"));
      } catch (error) {
        console.error("Error creating race:", error);
        notify(t("admin.raceCreateError"), "negative");
      } finally {
        creatingRace.value = false;
      }
    };

    const handleSaveRace = async (
      showNotify = true,
      notifyInvalid = showNotify
    ) => {
      if (!selectedRaceId.value || !editableRace.value) return;
      if (Object.keys(validationErrors.value).length > 0) {
        if (notifyInvalid) {
          notify(getValidationMessage(), "negative");
        }
        return false;
      }

      savingRace.value = true;
      try {
        await updateRace(selectedRaceId.value, {
          ...editableRace.value,
          name: editableRace.value.name?.trim() || t("admin.newRaceName"),
        });
        await loadRaces();
        editableRace.value = cloneRace(selectedRace.value);
        if (showNotify) {
          notify(t("admin.raceSaved"));
        }
        newlyCreatedRaceId.value = "";
        return true;
      } catch (error) {
        console.error("Error saving race:", error);
        notify(t("admin.raceSaveError"), "negative");
        return false;
      } finally {
        savingRace.value = false;
      }
    };

    const handleSetDefaultRace = async () => {
      if (!selectedRaceId.value) return;

      savingDefaultRace.value = true;
      try {
        await setDefaultRace(selectedRaceId.value);
        await loadRaces();
        notify(t("admin.defaultRaceSaved"));
      } catch (error) {
        console.error("Error setting default race:", error);
        notify(t("admin.defaultRaceSaveError"), "negative");
      } finally {
        savingDefaultRace.value = false;
      }
    };

    const handleDeleteRace = async () => {
      if (!selectedRaceId.value) return;

      if (teams.value.some((team) => team.raceId === selectedRaceId.value)) {
        notify(t("admin.raceDeleteBlocked"), "negative");
        return;
      }

      deletingRace.value = true;
      try {
        await deleteRace(selectedRaceId.value);
        selectedRaceId.value = "";
        await loadRaces();
        notify(t("admin.raceDeleted"));
      } catch (error) {
        console.error("Error deleting race:", error);
        notify(t("admin.raceDeleteError"), "negative");
      } finally {
        deletingRace.value = false;
      }
    };

    const handleSaveTranslations = async () => {
      savingTranslations.value = true;
      try {
        await saveTranslations(editableTranslations.value);
        notify(t("admin.translationsSaved"));
      } catch (error) {
        console.error("Error saving translations:", error);
        notify(t("admin.translationsSaveError"), "negative");
      } finally {
        savingTranslations.value = false;
      }
    };

    const scheduleRaceAutosave = () => {
      if (
        !isEditing.value ||
        !selectedRaceId.value ||
        !editableRace.value ||
        suppressRaceAutosave.value
      )
        return;
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      autoSaveTimer = setTimeout(() => {
        handleSaveRace(false, false);
      }, 500);
    };

    watch(
      selectedRace,
      (race, previousRace) => {
        if (race?.id !== previousRace?.id) {
          isEditing.value = false;
        }
        suppressRaceAutosave.value = true;
        editableRace.value = cloneRace(race);
        suppressRaceAutosave.value = false;
      },
      { immediate: true }
    );

    watch(
      translations,
      () => {
        syncEditableTranslations();
      },
      { deep: true, immediate: true }
    );

    watch(
      editableRace,
      () => {
        scheduleRaceAutosave();
      },
      { deep: true }
    );

    const loadAdminData = async () => {
      if (unsubscribeTeams || unsubscribeRaces) return;

      unsubscribeRaces = getRacesListener(
        (newRaces) => {
          races.value = newRaces;
          if (!selectedRaceId.value && newRaces.length > 0) {
            const defaultRace =
              newRaces.find((r) => r.isDefault) || newRaces[0];
            selectedRaceId.value = defaultRace?.id || "";
          }
        },
        (error) => {
          console.error("Error in races listener:", error);
        }
      );

      unsubscribeTeams = getTeamsListener(
        (newTeams) => {
          teams.value = newTeams;
        },
        (error) => {
          console.error("Error in teams listener:", error);
        }
      );
    };

    onMounted(async () => {
      await waitForAuthReady();
      if (isAdmin.value) {
        await loadAdminData();
      }
    });

    onUnmounted(() => {
      if (unsubscribeTeams) unsubscribeTeams();
      if (unsubscribeRaces) unsubscribeRaces();
    });

    watch(
      [authInitialized, isAdmin],
      async ([ready, admin]) => {
        if (!ready || !admin) return;
        await loadAdminData();
      },
      { immediate: true }
    );

    return {
      t,
      tab,
      selectedRaceId,
      editableRace,
      creatingRace,
      savingRace,
      savingDefaultRace,
      savingTranslations,
      deletingRace,
      isEditing,
      confirmEditDialog,
      confirmDeleteDialog,
      confirmRemoveSegmentDialog,
      segmentEditorDialog,
      raceFieldEditorDialog,
      translationKeys,
      editableTranslations,
      segmentTypeOptions,
      raceDataRows,
      activeRaceFieldLabel,
      activeRaceFieldType,
      activeRaceFieldError,
      raceFieldDraft,
      validationErrors,
      segmentDistanceError,
      segmentHeaderClass,
      segmentRowClass,
      segmentFirstColumnClass,
      raceOptions,
      selectedRace,
      segmentDraft,
      notifyReadOnly,
      beginEdit,
      cancelEdit,
      endEdit,
      handleRaceFieldRowClick,
      addSegment,
      handleSegmentRowClick,
      confirmRemoveSegment,
      removeSegment,
      saveRaceFieldDialog,
      saveSegmentDialog,
      handleCreateRace,
      handleSetDefaultRace,
      handleDeleteRace,
      handleSaveTranslations,
      saveTranslationIfChanged,
    };
  },
};
</script>
