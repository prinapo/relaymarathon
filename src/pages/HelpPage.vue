<template>
  <q-page>
    <q-card class="q-pa-sm">
      <q-card-section>
        <div class="text-h6">{{ t("help.title") }}</div>
      </q-card-section>

      <q-card-section v-if="isAdmin" class="q-pt-none">
        <q-btn
          :label="t('help.add')"
          color="primary"
          icon="add"
          @click="openHelpDialog()"
        />
      </q-card-section>

      <q-card-section v-if="helpsLoading" class="text-center q-pa-md">
        <q-spinner-dots color="primary" size="40px" />
      </q-card-section>

      <q-card-section v-else-if="visibleHelps.length === 0" class="text-center text-grey-7 q-pa-md">
        {{ t("help.noHelps") }}
      </q-card-section>

      <q-card-section v-else>
        <q-list separator>
          <q-expansion-item
            v-for="(help, index) in visibleHelps"
            :key="help.id"
            expand-separator
            switch-toggle-side
            class="q-mb-sm help-item"
            :class="{ 'help-item--hidden': help.hidden }"
            header-class="q-py-sm"
          >
            <template #header>
              <div class="row items-center no-wrap full-width q-gutter-sm">
                <div class="col">
                  <div
                    class="text-subtitle1 text-primary"
                    :class="{ 'help-text--hidden': help.hidden }"
                  >
                    {{ getBilingual(help, "title") }}
                  </div>
                  <div v-if="help.hidden" class="text-caption text-grey-7">
                    {{ t("help.hidden") }}
                  </div>
                </div>

                <template v-if="isAdmin">
                  <q-btn
                    flat
                    round
                    dense
                    icon="arrow_upward"
                    :disable="index === 0 || helpReordering"
                    @click.stop="moveHelp(index, -1)"
                  >
                    <q-tooltip>Su</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    icon="arrow_downward"
                    :disable="index === visibleHelps.length - 1 || helpReordering"
                    @click.stop="moveHelp(index, 1)"
                  >
                    <q-tooltip>Giù</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    :icon="help.hidden ? 'visibility' : 'visibility_off'"
                    @click.stop="toggleHelpVisibility(help)"
                  >
                    <q-tooltip>{{ help.hidden ? t("help.show") : t("help.hide") }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    icon="edit"
                    @click.stop="openHelpDialog(help)"
                  >
                    <q-tooltip>{{ t("common.edit") }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    color="negative"
                    icon="delete"
                    @click.stop="confirmDeleteHelp(help)"
                  >
                    <q-tooltip>{{ t("common.delete") }}</q-tooltip>
                  </q-btn>
                </template>
              </div>
            </template>

            <q-card>
              <q-card-section>
                <div v-html="getBilingual(help, 'answer')" />
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>
      </q-card-section>
    </q-card>

    <q-dialog v-model="helpDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">
            {{ editingHelp ? t("help.edit") : t("help.add") }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="helpForm.question"
            :label="t('help.question')"
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="helpForm.questionEn"
            :label="t('help.questionEn')"
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="helpForm.answer"
            :label="t('help.answer')"
            type="textarea"
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="helpForm.answerEn"
            :label="t('help.answerEn')"
            type="textarea"
            outlined
            class="q-mb-md"
          />
          <q-toggle
            v-model="helpForm.hidden"
            :label="t('help.hidden')"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="t('common.cancel')" @click="closeHelpDialog" />
          <q-btn flat :label="t('common.save')" color="primary" @click="saveHelp" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirmDeleteHelpDialog">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <q-icon name="warning" color="negative" size="md" class="q-mr-md" />
          <span class="text-h6">{{ t("help.deleteConfirm") }}</span>
        </q-card-section>

        <q-card-section v-if="helpToDelete">
          "{{ getBilingual(helpToDelete, "question") }}"
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="t('common.cancel')" @click="confirmDeleteHelpDialog = false" />
          <q-btn flat :label="t('common.delete')" color="negative" @click="doDeleteHelp" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useQuasar } from "quasar";
import { useAuth } from "src/composables/useAuth.js";
import { useFirestore } from "src/composables/useFirestore.js";
import { useI18n } from "src/composables/useI18n.js";

export default {
  setup() {
    const $q = useQuasar();
    const { isAdmin } = useAuth();
    const {
      getHelpsListener,
      createHelp,
      updateHelp,
      deleteHelp,
      reorderHelps,
    } = useFirestore();
    const { t, locale } = useI18n();

    const helps = ref([]);
    const helpsLoading = ref(true);
    const helpDialog = ref(false);
    const editingHelp = ref(null);
    const helpForm = ref({
      question: "",
      questionEn: "",
      answer: "",
      answerEn: "",
      hidden: false,
    });
    const confirmDeleteHelpDialog = ref(false);
    const helpToDelete = ref(null);
    const helpReordering = ref(false);
    let helpUnsubscribe = null;

    const visibleHelps = computed(() =>
      isAdmin.value ? helps.value : helps.value.filter((help) => !help.hidden),
    );

    const getBilingual = (row, field) => {
      const currentLocale = locale?.value || "it";
      if (currentLocale === "en" && row[field + "En"]) {
        return row[field + "En"];
      }
      return row[field] || "";
    };

    const openHelpDialog = (help = null) => {
      editingHelp.value = help;
      helpForm.value = help
        ? {
            question: help.question,
            questionEn: help.questionEn || "",
            answer: help.answer,
            answerEn: help.answerEn || "",
            hidden: help.hidden || false,
          }
        : createEmptyHelpForm();
      helpDialog.value = true;
    };

    const closeHelpDialog = () => {
      helpDialog.value = false;
      editingHelp.value = null;
    };

    const createEmptyHelpForm = () => ({
      question: "",
      questionEn: "",
      answer: "",
      answerEn: "",
      hidden: false,
    });

    const saveHelp = async () => {
      if (!helpForm.value.question) {
        $q.notify({
          type: "negative",
          message: t("help.validationRequired"),
        });
        return;
      }

      try {
        if (editingHelp.value) {
          await updateHelp(editingHelp.value.id, helpForm.value);
        } else {
          await createHelp(helpForm.value);
        }
        closeHelpDialog();
        $q.notify({
          type: "positive",
          message: t("help.saved"),
        });
      } catch (error) {
        console.error("Error saving help:", error);
        $q.notify({
          type: "negative",
          message: t("help.saveError"),
        });
      }
    };

    const confirmDeleteHelp = (help) => {
      helpToDelete.value = help;
      confirmDeleteHelpDialog.value = true;
    };

    const doDeleteHelp = async () => {
      if (!helpToDelete.value) return;
      try {
        await deleteHelp(helpToDelete.value.id);
        confirmDeleteHelpDialog.value = false;
        helpToDelete.value = null;
        $q.notify({
          type: "positive",
          message: t("help.deleted"),
        });
      } catch (error) {
        console.error("Error deleting help:", error);
        $q.notify({
          type: "negative",
          message: t("help.deleteError"),
        });
      }
    };

    const toggleHelpVisibility = async (help) => {
      try {
        await updateHelp(help.id, { hidden: !help.hidden });
        $q.notify({
          type: "positive",
          message: t("help.visibilityUpdated"),
        });
      } catch (error) {
        console.error("Error toggling help visibility:", error);
        $q.notify({
          type: "negative",
          message: t("help.visibilityError"),
        });
      }
    };

    const moveHelp = async (index, direction) => {
      if (helpReordering.value) return;
      helpReordering.value = true;
      try {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= visibleHelps.value.length) return;

        const newOrder = [...helps.value];
        const [moved] = newOrder.splice(index, 1);
        newOrder.splice(targetIndex, 0, moved);

        await reorderHelps(newOrder);
        $q.notify({
          type: "positive",
          message: t("help.reordered"),
        });
      } catch (error) {
        console.error("Error reordering help:", error);
        $q.notify({
          type: "negative",
          message: t("help.reorderError"),
        });
      } finally {
        helpReordering.value = false;
      }
    };

    onMounted(async () => {
      helpsLoading.value = true;
      helpUnsubscribe = getHelpsListener(
        (data) => {
          helps.value = data;
          helpsLoading.value = false;
        },
        (error) => {
          console.error("Error loading helps:", error);
          helpsLoading.value = false;
        },
      );
    });

    onUnmounted(() => {
      if (helpUnsubscribe) helpUnsubscribe();
    });

    return {
      t,
      locale,
      isAdmin,
      helpsLoading,
      visibleHelps,
      helpDialog,
      editingHelp,
      helpForm,
      confirmDeleteHelpDialog,
      helpReordering,
      getBilingual,
      openHelpDialog,
      closeHelpDialog,
      saveHelp,
      confirmDeleteHelp,
      doDeleteHelp,
      toggleHelpVisibility,
      moveHelp,
    };
  },
};
</script>