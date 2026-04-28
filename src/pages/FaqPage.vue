<template>
  <q-page>
    <q-card class="q-pa-sm">
      <q-card-section>
        <div class="text-h6">{{ t("faq.title") }}</div>
      </q-card-section>
          <q-card-section v-if="isAdmin">
            <q-btn
              :label="t('faq.add')"
              color="primary"
              icon="add"
              @click="openFaqDialog()"
            />
          </q-card-section>

          <q-card-section v-if="faqsLoading" class="text-center q-pa-md">
            <q-spinner-dots color="primary" size="40px" />
          </q-card-section>

          <q-card-section
            v-else-if="visibleFaqs.length === 0"
            class="text-center text-grey-7 q-pa-md"
          >
            {{ t("faq.noFaqs") }}
          </q-card-section>

          <q-card-section v-else>
            <q-list separator>
              <q-expansion-item
                v-for="(faq, index) in visibleFaqs"
                :key="faq.id"
                expand-separator
                switch-toggle-side
                class="q-mb-sm faq-item"
                :class="{ 'faq-item--hidden': faq.hidden }"
                header-class="q-py-sm"
              >
                <template #header>
                  <div class="row items-center no-wrap full-width q-gutter-sm">
                    <div class="col">
                      <div
                        class="text-subtitle1 text-primary"
                        :class="{ 'faq-text--hidden': faq.hidden }"
                      >
                        {{ getBilingual(faq, "question") }}
                      </div>
                      <div v-if="faq.hidden" class="text-caption text-grey-7">
                        {{ t("faq.hidden") }}
                      </div>
                    </div>

                    <template v-if="isAdmin">
                      <q-btn
                        flat
                        round
                        dense
                        icon="arrow_upward"
                        :disable="index === 0 || faqReordering"
                        @click.stop="moveFaq(index, -1)"
                      >
                        <q-tooltip>Su</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        round
                        dense
                        icon="arrow_downward"
                        :disable="
                          index === visibleFaqs.length - 1 || faqReordering
                        "
                        @click.stop="moveFaq(index, 1)"
                      >
                        <q-tooltip>Giu</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        round
                        dense
                        :icon="faq.hidden ? 'visibility' : 'visibility_off'"
                        color="warning"
                        @click.stop="toggleFaqHidden(faq)"
                      >
                        <q-tooltip>{{
                          faq.hidden ? t("faq.show") : t("faq.hide")
                        }}</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        round
                        dense
                        icon="edit"
                        color="primary"
                        @click.stop="openFaqDialog(faq)"
                      >
                        <q-tooltip>{{ t("faq.edit") }}</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        round
                        dense
                        icon="delete"
                        color="negative"
                        @click.stop="confirmFaqDelete(faq)"
                      >
                        <q-tooltip>{{ t("faq.delete") }}</q-tooltip>
                      </q-btn>
                    </template>
                  </div>
                </template>

                <div
                  class="q-pa-md text-body1"
                  :class="{ 'faq-text--hidden': faq.hidden }"
                >
{{ getBilingual(faq, "answer") }}
                </div>
              </q-expansion-item>
            </q-list>
          </q-card-section>
        </q-card>

        <!-- FAQ DIALOG -->
    <q-dialog v-model="showFaqDialog" persistent>
      <q-card class="dialog-card-large">
        <q-card-section>
          <div class="text-h6">
            {{ editingFaq ? t("faq.edit") : t("faq.add") }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none q-gutter-sm">
          <q-input
            v-model="faqForm.question"
            :label="t('faq.question')"
            type="textarea"
            outlined
            dense
            autofocus
            rows="2"
          />
          <q-input
            v-model="faqForm.questionEn"
            :label="t('faq.questionEn')"
            type="textarea"
            outlined
            dense
            rows="2"
          />
          <q-input
            v-model="faqForm.answer"
            :label="t('faq.answer')"
            type="textarea"
            outlined
            dense
            rows="4"
          />
          <q-input
            v-model="faqForm.answerEn"
            :label="t('faq.answerEn')"
            type="textarea"
            outlined
            dense
            rows="4"
          />
          <q-toggle
            v-if="isAdmin"
            v-model="faqForm.hidden"
            :label="t('faq.hidden')"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="t('common.cancel')" @click="closeFaqDialog" />
          <q-btn color="primary" :label="t('common.save')" @click="saveFaq" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- HELP DIALOG -->
    <q-dialog v-model="showHelpDialog" persistent>
      <q-card class="dialog-card-large">
        <q-card-section>
          <div class="text-h6">
            {{ editingHelp ? t("common.edit") : t("common.add") }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none q-gutter-sm">
          <q-input
            v-model="helpForm.title"
            :label="t('help.sectionTitle')"
            type="text"
            outlined
            dense
            autofocus
          />
          <q-input
            v-model="helpForm.titleEn"
            :label="t('help.sectionTitleEn')"
            type="text"
            outlined
            dense
          />
          <q-input
            v-model="helpForm.body"
            :label="t('help.sectionBody')"
            type="textarea"
            outlined
            dense
            rows="4"
          />
          <q-input
            v-model="helpForm.bodyEn"
            :label="t('help.sectionBodyEn')"
            type="textarea"
            outlined
            dense
            rows="4"
          />
          <q-toggle
            v-if="isAdmin"
            v-model="helpForm.hidden"
            :label="t('help.hidden')"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="t('common.cancel')" @click="closeHelpDialog" />
          <q-btn color="primary" :label="t('common.save')" @click="saveHelp" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DELETE FAQ DIALOG -->
    <q-dialog v-model="confirmFaqDeleteDialog" persistent>
      <q-card class="dialog-card-medium">
        <q-card-section>
          <div class="text-h6">{{ t("faq.delete") }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div>{{ t("faq.deleteConfirm") }}</div>
          <div v-if="faqToDelete" class="text-subtitle2 q-mt-sm">
            "{{ getBilingual(faqToDelete, "question") }}"
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('common.cancel')" @click="cancelFaqDelete" />
          <q-btn
            color="negative"
            :label="t('faq.delete')"
            @click="deleteFaqConfirmed"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DELETE HELP DIALOG -->
    <q-dialog v-model="confirmHelpDeleteDialog" persistent>
      <q-card class="dialog-card-medium">
        <q-card-section>
          <div class="text-h6">{{ t("common.delete") }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div>{{ t("help.deleteConfirm") }}</div>
          <div v-if="helpToDelete" class="text-subtitle2 q-mt-sm">
            "{{ getBilingual(helpToDelete, "title") }}"
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('common.cancel')" @click="cancelHelpDelete" />
          <q-btn
            color="negative"
            :label="t('common.delete')"
            @click="deleteHelpConfirmed"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useQuasar } from "quasar";
import { useAuth } from "src/composables/useAuth.js";
import { useFirestore } from "src/composables/useFirestore.js";
import { useI18n } from "src/composables/useI18n.js";
import { useTeamContext } from "src/composables/useTeamContext.js";

const createEmptyFaqForm = () => ({
  question: "",
  questionEn: "",
  answer: "",
  answerEn: "",
  hidden: false,
});

export default {
  setup() {
    const $q = useQuasar();
    const { isAdmin } = useAuth();
    const { selectedPublicRaceId } = useTeamContext();
    const {
      getFaqsListener,
      getHelpsListener,
      createFaq,
      updateFaq,
      deleteFaq: deleteFaqService,
      reorderFaqs,
      createHelp,
      updateHelp,
      deleteHelp: deleteHelpService,
      reorderHelps,
    } = useFirestore();
    const { t, locale } = useI18n();

    const currentTab = ref("faq");

    const faqsLoading = ref(true);
    const helpsLoading = ref(true);
    const faqs = ref([]);
    const helps = ref([]);
    const showFaqDialog = ref(false);
    const showHelpDialog = ref(false);
    const confirmFaqDeleteDialog = ref(false);
    const faqToDelete = ref(null);
    const editingFaq = ref(null);
    const faqForm = ref(createEmptyFaqForm());
    const faqReordering = ref(false);
    const helpReordering = ref(false);
    const confirmHelpDeleteDialog = ref(false);
    const helpToDelete = ref(null);
    const editingHelp = ref(null);
    const helpForm = ref({ title: "", titleEn: "", body: "", bodyEn: "", hidden: false });

    let faqUnsubscribe = null;
    let helpUnsubscribe = null;

    const visibleFaqs = computed(() => {
      const currentRaceId = selectedPublicRaceId.value;
      const filtered = faqs.value.filter((faq) => {
        if (!faq.raceId) return true;
        return faq.raceId === currentRaceId;
      });
      return isAdmin.value ? filtered : filtered.filter((faq) => !faq.hidden);
    });

    const visibleHelps = computed(() => {
      const currentRaceId = selectedPublicRaceId.value;
      const filtered = helps.value.filter((help) => {
        if (!help.raceId) return true;
        return help.raceId === currentRaceId;
      });
      return isAdmin.value ? filtered : filtered.filter((help) => !help.hidden);
    });

    const getBilingual = (row, field) => {
      const currentLocale = locale?.value || "it";
      if (currentLocale === "en" && row[field + "En"]) {
        return row[field + "En"];
      }
      return row[field] || "";
    };

    const openFaqDialog = (faq = null) => {
      editingFaq.value = faq;
      faqForm.value = faq
        ? {
            question: faq.question || "",
            questionEn: faq.questionEn || "",
            answer: faq.answer || "",
            answerEn: faq.answerEn || "",
            hidden: faq.hidden === true,
          }
        : createEmptyFaqForm();
      showFaqDialog.value = true;
    };

    const closeFaqDialog = () => {
      showFaqDialog.value = false;
      editingFaq.value = null;
      faqForm.value = createEmptyFaqForm();
    };

    const saveFaq = async () => {
      if (!faqForm.value.question || !faqForm.value.answer) {
        $q.notify({ type: "warning", message: t("faq.validationRequired") });
        return;
      }
      try {
        if (editingFaq.value) {
          await updateFaq(editingFaq.value.id, faqForm.value);
        } else {
          await createFaq(faqForm.value);
        }
        $q.notify({ type: "positive", message: t("faq.saved") });
        closeFaqDialog();
      } catch (error) {
        console.error("Error saving FAQ:", error);
        $q.notify({ type: "negative", message: t("faq.saveError") });
      }
    };

    const confirmFaqDelete = (faq) => {
      faqToDelete.value = faq;
      confirmFaqDeleteDialog.value = true;
    };

    const cancelFaqDelete = () => {
      faqToDelete.value = null;
      confirmFaqDeleteDialog.value = false;
    };

    const deleteFaqConfirmed = async () => {
      if (!faqToDelete.value) {
        cancelFaqDelete();
        return;
      }
      try {
        await deleteFaqService(faqToDelete.value.id);
        $q.notify({ type: "positive", message: t("faq.deleted") });
      } catch (error) {
        console.error("Error deleting FAQ:", error);
        $q.notify({ type: "negative", message: t("faq.deleteError") });
      } finally {
        cancelFaqDelete();
      }
    };

    const toggleFaqHidden = async (faq) => {
      try {
        await updateFaq(faq.id, {
          question: faq.question,
          questionEn: faq.questionEn,
          answer: faq.answer,
          answerEn: faq.answerEn,
          hidden: !faq.hidden,
          order: faq.order,
        });
        $q.notify({ type: "positive", message: t("faq.visibilityUpdated") });
      } catch (error) {
        console.error("Error updating FAQ visibility:", error);
        $q.notify({ type: "negative", message: t("faq.visibilityError") });
      }
    };

    const moveFaq = async (index, direction) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= visibleFaqs.value.length) return;

      const reorderedFaqs = [...faqs.value];
      const sourceFaq = visibleFaqs.value[index];
      const targetFaq = visibleFaqs.value[targetIndex];
      const sourceIndex = reorderedFaqs.findIndex(
        (faq) => faq.id === sourceFaq.id,
      );
      const destinationIndex = reorderedFaqs.findIndex(
        (faq) => faq.id === targetFaq.id,
      );
      if (sourceIndex === -1 || destinationIndex === -1) return;

      const [movedFaq] = reorderedFaqs.splice(sourceIndex, 1);
      reorderedFaqs.splice(destinationIndex, 0, movedFaq);

      faqReordering.value = true;
      try {
        await reorderFaqs(reorderedFaqs);
        $q.notify({ type: "positive", message: t("faq.reordered") });
      } catch (error) {
        console.error("Error reordering FAQs:", error);
        $q.notify({ type: "negative", message: t("faq.reorderError") });
      } finally {
        faqReordering.value = false;
      }
    };

    const openHelpDialog = (help = null) => {
      editingHelp.value = help;
      helpForm.value = help
        ? {
            title: help.title || "",
            titleEn: help.titleEn || "",
            body: help.body || "",
            bodyEn: help.bodyEn || "",
            hidden: help.hidden === true,
          }
        : { title: "", titleEn: "", body: "", bodyEn: "", hidden: false };
      showHelpDialog.value = true;
    };

    const closeHelpDialog = () => {
      showHelpDialog.value = false;
      editingHelp.value = null;
      helpForm.value = { title: "", titleEn: "", body: "", bodyEn: "", hidden: false };
    };

    const saveHelp = async () => {
      try {
        if (editingHelp.value) {
          await updateHelp(editingHelp.value.id, helpForm.value);
        } else {
          await createHelp(helpForm.value);
        }
        $q.notify({ type: "positive", message: t("help.saved") });
        closeHelpDialog();
      } catch (error) {
        console.error("Error saving help:", error);
        $q.notify({ type: "negative", message: t("help.saveError") });
      }
    };

    const confirmHelpDelete = (help) => {
      helpToDelete.value = help;
      confirmHelpDeleteDialog.value = true;
    };

    const cancelHelpDelete = () => {
      helpToDelete.value = null;
      confirmHelpDeleteDialog.value = false;
    };

    const deleteHelpConfirmed = async () => {
      if (!helpToDelete.value) {
        cancelHelpDelete();
        return;
      }
      try {
        await deleteHelpService(helpToDelete.value.id);
        $q.notify({ type: "positive", message: t("help.deleted") });
      } catch (error) {
        console.error("Error deleting help:", error);
        $q.notify({ type: "negative", message: t("help.deleteError") });
      } finally {
        cancelHelpDelete();
      }
    };

    const toggleHelpHidden = async (help) => {
      try {
        await updateHelp(help.id, {
          title: help.title,
          titleEn: help.titleEn,
          body: help.body,
          bodyEn: help.bodyEn,
          hidden: !help.hidden,
          order: help.order,
        });
        $q.notify({ type: "positive", message: t("help.visibilityUpdated") });
      } catch (error) {
        console.error("Error updating help visibility:", error);
        $q.notify({ type: "negative", message: t("help.visibilityError") });
      }
    };

    const moveHelp = async (index, direction) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= visibleHelps.value.length) return;

      const reorderedHelps = [...helps.value];
      const sourceHelp = visibleHelps.value[index];
      const targetHelp = visibleHelps.value[targetIndex];
      const sourceIndex = reorderedHelps.findIndex((h) => h.id === sourceHelp.id);
      const targetIndexInArray = reorderedHelps.findIndex((h) => h.id === targetHelp.id);

      reorderedHelps[sourceIndex] = targetHelp;
      reorderedHelps[targetIndexInArray] = sourceHelp;

      helpReordering.value = true;
      try {
        await reorderHelps(reorderedHelps);
        $q.notify({ type: "positive", message: t("help.reordered") });
      } catch (error) {
        console.error("Error reordering helps:", error);
        $q.notify({ type: "negative", message: t("help.reorderError") });
      } finally {
        helpReordering.value = false;
      }
    };

    onMounted(() => {
      faqUnsubscribe = getFaqsListener(
        (newFaqs) => {
          faqs.value = newFaqs;
          faqsLoading.value = false;
        },
        (error) => {
          console.error("Error in FAQs listener:", error);
          faqsLoading.value = false;
        },
      );

      helpUnsubscribe = getHelpsListener(
        (updatedHelps) => {
          helps.value = updatedHelps;
          helpsLoading.value = false;
        },
        (error) => {
          console.error("Help listener error:", error);
          helpsLoading.value = false;
        },
      );
    });

    onUnmounted(() => {
      if (faqUnsubscribe) faqUnsubscribe();
      if (helpUnsubscribe) helpUnsubscribe();
    });

    return {
      currentTab,
      t,
      isAdmin,
      faqsLoading,
      visibleFaqs,
      showFaqDialog,
      confirmFaqDeleteDialog,
      faqToDelete,
      editingFaq,
      faqForm,
      faqReordering,
      helpsLoading,
      visibleHelps,
      showHelpDialog,
      confirmHelpDeleteDialog,
      helpToDelete,
      editingHelp,
      helpForm,
      helpReordering,
      getBilingual,
      openFaqDialog,
      closeFaqDialog,
      saveFaq,
      confirmFaqDelete,
      cancelFaqDelete,
      deleteFaqConfirmed,
      toggleFaqHidden,
      moveFaq,
      openHelpDialog,
      closeHelpDialog,
      saveHelp,
      confirmHelpDelete,
      cancelHelpDelete,
      deleteHelpConfirmed,
      toggleHelpHidden,
      moveHelp,
    };
  },
};
</script>

<style scoped>
.faq-item--hidden {
  opacity: 0.75;
}

.faq-text--hidden {
  text-decoration: line-through;
}
</style>
