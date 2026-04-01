<template>
  <q-page>
    <q-card class="q-pa-sm">
      <q-card-section>
        <div class="text-h6">{{ t("help.title") }}</div>
      </q-card-section>

      <q-card-section v-if="isAdmin" class="q-pt-none">
        <q-btn
          :label="t('common.add')"
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
          v-else-if="visibleHelps.length === 0"
          class="text-center text-grey-7 q-pa-md"
        >
          {{ t("help.noContent") }}
        </div>

        <q-list v-else separator>
          <q-expansion-item
            v-for="(help, index) in visibleHelps"
            :key="help.id"
            expand-separator
            switch-toggle-side
            class="q-mb-sm faq-item"
            :class="{ 'faq-item--hidden': help.hidden }"
            header-class="q-py-sm"
          >
            <template #header>
              <div class="row items-center no-wrap full-width q-gutter-sm">
                <div class="col">
                  <div
                    class="text-h6 text-primary text-weight-bold"
                    :class="{ 'faq-text--hidden': help.hidden }"
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
                    :disable="index === 0 || reordering"
                    @click.stop="moveHelp(index, -1)"
                  >
                    <q-tooltip>Su</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    icon="arrow_downward"
                    :disable="index === visibleHelps.length - 1 || reordering"
                    @click.stop="moveHelp(index, 1)"
                  >
                    <q-tooltip>Giu</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    :icon="help.hidden ? 'visibility' : 'visibility_off'"
                    color="warning"
                    @click.stop="toggleHidden(help)"
                  >
                    <q-tooltip>{{
                      help.hidden ? t("faq.show") : t("faq.hide")
                    }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    icon="edit"
                    color="primary"
                    @click.stop="openDialog(help)"
                  >
                    <q-tooltip>{{ t("common.edit") }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete"
                    color="negative"
                    @click.stop="confirmDelete(help)"
                  >
                    <q-tooltip>{{ t("common.delete") }}</q-tooltip>
                  </q-btn>
                </template>
              </div>
            </template>

            <div
              class="q-pa-md text-body1"
              :class="{ 'faq-text--hidden': help.hidden }"
            >
              {{ getBilingual(help, "body") }}
            </div>
          </q-expansion-item>
        </q-list>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showDialog" persistent>
      <q-card class="dialog-card-large">
        <q-card-section>
          <div class="text-h6">
            {{ editingHelp ? t("common.edit") : t("common.add") }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none q-gutter-sm">
          <q-input
            v-model="form.title"
            :label="t('help.sectionTitle')"
            type="text"
            outlined
            dense
            autofocus
          />
          <q-input
            v-model="form.titleEn"
            :label="t('help.sectionTitleEn')"
            type="text"
            outlined
            dense
          />
          <q-input
            v-model="form.body"
            :label="t('help.sectionBody')"
            type="textarea"
            outlined
            dense
            rows="4"
          />
          <q-input
            v-model="form.bodyEn"
            :label="t('help.sectionBodyEn')"
            type="textarea"
            outlined
            dense
            rows="4"
          />
          <q-toggle
            v-if="isAdmin"
            v-model="form.hidden"
            :label="t('help.hidden')"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="t('common.cancel')" @click="closeDialog" />
          <q-btn color="primary" :label="t('common.save')" @click="saveHelp" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirmDeleteDialog" persistent>
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
          <q-btn flat :label="t('common.cancel')" @click="cancelDelete" />
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

const createEmptyForm = () => ({
  title: "",
  titleEn: "",
  body: "",
  bodyEn: "",
  hidden: false,
});

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

    const loading = ref(true);
    const reordering = ref(false);
    const helps = ref([]);
    const showDialog = ref(false);
    const confirmDeleteDialog = ref(false);
    const helpToDelete = ref(null);
    const editingHelp = ref(null);
    const form = ref(createEmptyForm());

    let unsubscribe = null;

    const visibleHelps = computed(() =>
      isAdmin.value ? helps.value : helps.value.filter((help) => !help.hidden)
    );

    const getBilingual = (row, field) => {
      const currentLocale = locale?.value || "it";
      if (currentLocale === "en" && row[field + "En"]) {
        return row[field + "En"];
      }
      return row[field] || "";
    };

    const openDialog = (help = null) => {
      editingHelp.value = help;
      form.value = help
        ? {
            title: help.title || "",
            titleEn: help.titleEn || "",
            body: help.body || "",
            bodyEn: help.bodyEn || "",
            hidden: help.hidden === true,
          }
        : createEmptyForm();
      showDialog.value = true;
    };

    const closeDialog = () => {
      showDialog.value = false;
      editingHelp.value = null;
      form.value = createEmptyForm();
    };

    const saveHelp = async () => {
      if (!form.value.title || !form.value.body) {
        $q.notify({
          type: "warning",
          message: t("faq.validationRequired"),
        });
        return;
      }

      try {
        if (editingHelp.value) {
          await updateHelp(editingHelp.value.id, form.value);
        } else {
          await createHelp(form.value);
        }
        $q.notify({
          type: "positive",
          message: t("help.saved"),
        });
        closeDialog();
      } catch (error) {
        console.error("Error saving help content:", error);
        $q.notify({
          type: "negative",
          message: t("help.saveError"),
        });
      }
    };

    const confirmDelete = (help) => {
      helpToDelete.value = help;
      confirmDeleteDialog.value = true;
    };

    const cancelDelete = () => {
      helpToDelete.value = null;
      confirmDeleteDialog.value = false;
    };

    const deleteHelpConfirmed = async () => {
      if (!helpToDelete.value) {
        cancelDelete();
        return;
      }

      try {
        await deleteHelp(helpToDelete.value.id);
        $q.notify({
          type: "positive",
          message: t("help.deleted"),
        });
      } catch (error) {
        console.error("Error deleting help content:", error);
        $q.notify({
          type: "negative",
          message: t("help.deleteError"),
        });
      } finally {
        cancelDelete();
      }
    };

    const toggleHidden = async (help) => {
      try {
        await updateHelp(help.id, { hidden: !help.hidden });
      } catch (error) {
        console.error("Error toggling help hidden state:", error);
        $q.notify({
          type: "negative",
          message: t("help.saveError"),
        });
      }
    };

    const moveHelp = async (index, direction) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= visibleHelps.value.length) {
        return;
      }

      reordering.value = true;
      const reordered = [...helps.value];
      const [item] = reordered.splice(index, 1);
      reordered.splice(nextIndex, 0, item);

      try {
        await reorderHelps(reordered);
      } catch (error) {
        console.error("Error reordering help content:", error);
        $q.notify({
          type: "negative",
          message: t("faq.reorderError"),
        });
      } finally {
        reordering.value = false;
      }
    };

    onMounted(async () => {
      unsubscribe = getHelpsListener(
        (updatedHelps) => {
          helps.value = updatedHelps;
          loading.value = false;
        },
        (error) => {
          console.error("Help listener error:", error);
          loading.value = false;
        }
      );
    });

    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe();
      }
    });

    return {
      t,
      isAdmin,
      loading,
      visibleHelps,
      showDialog,
      confirmDeleteDialog,
      helpToDelete,
      editingHelp,
      form,
      openDialog,
      closeDialog,
      saveHelp,
      confirmDelete,
      cancelDelete,
      deleteHelpConfirmed,
      getBilingual,
      toggleHidden,
      moveHelp,
      reordering,
    };
  },
};
</script>
