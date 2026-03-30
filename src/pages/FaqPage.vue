<template>
  <q-page>
    <q-card class="q-pa-sm">
      <q-card-section>
        <div class="text-h6">{{ t("faq.title") }}</div>
      </q-card-section>

      <q-card-section v-if="isAdmin" class="q-pt-none">
        <q-btn
          :label="t('faq.add')"
          color="primary"
          icon="add"
          @click="openDialog()"
        />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div v-if="loading" class="text-center q-pa-md">
          <q-spinner-dots color="primary" size="40px" />
        </div>

        <div
          v-else-if="faqs.length === 0"
          class="text-center text-grey-7 q-pa-md"
        >
          {{ t("faq.noFaqs") }}
        </div>

        <q-list v-else separator>
          <q-expansion-item
            v-for="faq in faqs"
            :key="faq.id"
            :label="getBilingual(faq, 'question')"
            header-class="text-h6 text-primary text-weight-bold"
            expand-icon-class="text-primary"
            class="q-mb-sm"
          >
            <template #default>
              <div class="q-pa-md text-body1">
                {{ getBilingual(faq, "answer") }}
              </div>
            </template>

            <template v-if="isAdmin" #header>
              <div class="text-h6 text-primary text-weight-bold q-pr-sm">
                {{ getBilingual(faq, "question") }}
              </div>
              <q-space />
              <q-btn
                flat
                round
                dense
                icon="edit"
                color="primary"
                @click.stop="openDialog(faq)"
              >
                <q-tooltip>{{ t("faq.edit") }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="negative"
                @click.stop="confirmDelete(faq)"
              >
                <q-tooltip>{{ t("faq.delete") }}</q-tooltip>
              </q-btn>
            </template>
          </q-expansion-item>
        </q-list>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 500px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">
            {{ editingFaq ? t("faq.edit") : t("faq.add") }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none q-gutter-sm">
          <q-input
            v-model="form.question"
            :label="t('faq.question')"
            type="textarea"
            outlined
            dense
            autofocus
            rows="2"
          />
          <q-input
            v-model="form.questionEn"
            :label="t('faq.questionEn')"
            type="textarea"
            outlined
            dense
            rows="2"
          />
          <q-input
            v-model="form.answer"
            :label="t('faq.answer')"
            type="textarea"
            outlined
            dense
            rows="4"
          />
          <q-input
            v-model="form.answerEn"
            :label="t('faq.answerEn')"
            type="textarea"
            outlined
            dense
            rows="4"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="t('common.cancel')" @click="closeDialog" />
          <q-btn color="primary" :label="t('common.save')" @click="saveFaq" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import { useQuasar } from "quasar";
import { useAuth } from "src/composables/useAuth.js";
import { useFirestore } from "src/composables/useFirestore.js";
import { useI18n } from "src/composables/useI18n.js";

export default {
  setup() {
    const $q = useQuasar();
    const { isAdmin } = useAuth();
    const { getFaqs, getFaqsListener, createFaq, updateFaq, deleteFaq } =
      useFirestore();
    const { t, locale } = useI18n();

    const loading = ref(true);
    const faqs = ref([]);
    const showDialog = ref(false);
    const editingFaq = ref(null);
    const form = ref({
      question: "",
      questionEn: "",
      answer: "",
      answerEn: "",
    });

    let unsubscribe = null;

    const getBilingual = (row, field) => {
      const currentLocale = locale?.value || "it";
      if (currentLocale === "en" && row[field + "En"]) {
        return row[field + "En"];
      }
      return row[field] || "";
    };

    const openDialog = (faq = null) => {
      editingFaq.value = faq;
      if (faq) {
        form.value = {
          question: faq.question || "",
          questionEn: faq.questionEn || "",
          answer: faq.answer || "",
          answerEn: faq.answerEn || "",
        };
      } else {
        form.value = {
          question: "",
          questionEn: "",
          answer: "",
          answerEn: "",
        };
      }
      showDialog.value = true;
    };

    const closeDialog = () => {
      showDialog.value = false;
      editingFaq.value = null;
    };

    const saveFaq = async () => {
      if (!form.value.question || !form.value.answer) {
        $q.notify({
          type: "warning",
          message: "Domanda e risposta sono obbligatori",
        });
        return;
      }

      try {
        if (editingFaq.value) {
          await updateFaq(editingFaq.value.id, form.value);
        } else {
          await createFaq(form.value);
        }
        $q.notify({
          type: "positive",
          message: t("faq.saved"),
        });
        closeDialog();
      } catch (error) {
        console.error("Error saving FAQ:", error);
        $q.notify({
          type: "negative",
          message: "Errore durante il salvataggio",
        });
      }
    };

    const confirmDelete = (faq) => {
      $q.dialog({
        title: t("faq.delete"),
        message: t("faq.deleteConfirm"),
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          await deleteFaq(faq.id);
          $q.notify({
            type: "positive",
            message: t("faq.deleted"),
          });
        } catch (error) {
          console.error("Error deleting FAQ:", error);
          $q.notify({
            type: "negative",
            message: "Errore durante la eliminazione",
          });
        }
      });
    };

    const refreshData = async () => {
      loading.value = true;
      try {
        faqs.value = await getFaqs();
      } catch (error) {
        console.error("Error loading FAQs:", error);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      refreshData();

      unsubscribe = getFaqsListener(
        (newFaqs) => {
          faqs.value = newFaqs;
        },
        (error) => {
          console.error("Error in FAQs listener:", error);
        }
      );
    });

    onUnmounted(() => {
      if (unsubscribe) unsubscribe();
    });

    return {
      loading,
      faqs,
      isAdmin,
      showDialog,
      editingFaq,
      form,
      getBilingual,
      openDialog,
      closeDialog,
      saveFaq,
      confirmDelete,
      t,
      locale,
    };
  },
};
</script>
