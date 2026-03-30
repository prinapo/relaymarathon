<template>
  <q-page>
    <div class="table-container">
      <q-card class="q-pa-sm">
        <q-card-section>
          <div class="text-h6">{{ t("appointments.title") }}</div>
        </q-card-section>

        <q-card-section v-if="isAdmin" class="q-pt-none">
          <q-btn
            :label="t('appointments.add')"
            color="primary"
            icon="add"
            @click="openDialog()"
          />
        </q-card-section>

        <q-card-section class="q-pt-none q-pa-none">
          <q-table
            :rows="sortedAppointments"
            :columns="columns"
            row-key="id"
            :loading="loading"
            flat
            dense
            class="full-width"
            :separator="'cell'"
            :visible-columns="visibleColumns"
            @row-click="(evt, row) => openDetails(row)"
          >
            <template #body-cell-title="props">
              <q-td :props="props">
                <div class="text-weight-medium">
                  {{ getBilingual(props.row, "title") }}
                </div>
                <div
                  v-if="getBilingual(props.row, 'description')"
                  class="text-caption text-grey-7"
                  style="
                    max-width: 150px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  "
                >
                  {{ getBilingual(props.row, "description") }}
                </div>
              </q-td>
            </template>

            <template #body-cell-date="props">
              <q-td :props="props">
                <div>{{ formatDate(props.row.date) }}</div>
                <div class="text-caption text-grey-7">{{ props.row.time }}</div>
              </q-td>
            </template>

            <template #body-cell-location="props">
              <q-td :props="props">
                <a
                  v-if="getBilingual(props.row, 'location')"
                  :href="getBilingual(props.row, 'location')"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary"
                >
                  <q-icon name="place" class="q-mr-xs" />
                  {{ t("appointments.viewMap") }}
                </a>
              </q-td>
            </template>

            <template #body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  size="sm"
                  @click="openDialog(props.row)"
                >
                  <q-tooltip>{{ t("appointments.edit") }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  size="sm"
                  @click="confirmDelete(props.row)"
                >
                  <q-tooltip>{{ t("appointments.delete") }}</q-tooltip>
                </q-btn>
              </q-td>
            </template>

            <template #no-data>
              <div class="full-width text-center text-grey-7 q-pa-md">
                {{ t("appointments.noAppointments") }}
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 400px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">
            {{
              editingAppointment
                ? t("appointments.edit")
                : t("appointments.add")
            }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none q-gutter-sm">
          <q-input
            v-model="form.title"
            :label="t('appointments.eventTitle')"
            outlined
            dense
            autofocus
          />
          <q-input
            v-model="form.titleEn"
            :label="t('appointments.eventTitleEn')"
            outlined
            dense
          />
          <q-input
            v-model="form.date"
            :label="t('appointments.date')"
            type="date"
            outlined
            dense
          />
          <q-input
            v-model="form.time"
            :label="t('appointments.time')"
            type="time"
            outlined
            dense
          />
          <q-input
            v-model="form.location"
            :label="t('appointments.location')"
            hint="Link Google Maps (es. https://maps.google.com/...)"
            outlined
            dense
          />
          <q-input
            v-model="form.locationEn"
            :label="t('appointments.locationEn')"
            hint="Google Maps link (e.g. https://maps.google.com/...)"
            outlined
            dense
          />
          <q-input
            v-model="form.description"
            :label="t('appointments.description')"
            type="textarea"
            outlined
            dense
            rows="3"
          />
          <q-input
            v-model="form.descriptionEn"
            :label="t('appointments.descriptionEn')"
            type="textarea"
            outlined
            dense
            rows="3"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="t('common.cancel')" @click="closeDialog" />
          <q-btn
            color="primary"
            :label="t('common.save')"
            @click="saveAppointment"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDetails">
      <q-card style="min-width: 350px; max-width: 90vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{ getBilingual(selectedAppointment, "title") }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="q-mb-sm">
            <q-icon name="event" class="q-mr-xs" />
            <strong>{{ formatDate(selectedAppointment?.date) }}</strong>
            <span v-if="selectedAppointment?.time">
              - {{ selectedAppointment.time }}</span
            >
          </div>

          <div
            v-if="getBilingual(selectedAppointment, 'location')"
            class="q-mb-sm"
          >
            <a
              :href="getBilingual(selectedAppointment, 'location')"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary"
            >
              <q-icon name="place" class="q-mr-xs" />
              {{ t("appointments.viewMap") }}
            </a>
          </div>

          <div
            v-if="getBilingual(selectedAppointment, 'description')"
            class="q-mt-md"
          >
            <div class="text-caption text-grey-7">
              {{ t("appointments.description") }}:
            </div>
            <div>{{ getBilingual(selectedAppointment, "description") }}</div>
          </div>
        </q-card-section>

        <q-card-actions align="right" v-if="isAdmin">
          <q-btn
            flat
            :label="t('appointments.edit')"
            @click="editFromDetails"
            color="primary"
          />
          <q-btn
            flat
            :label="t('appointments.delete')"
            @click="confirmDeleteFromDetails"
            color="negative"
          />
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
      getAppointments,
      getAppointmentsListener,
      createAppointment,
      updateAppointment,
      deleteAppointment,
    } = useFirestore();
    const { t, locale } = useI18n();

    const loading = ref(true);
    const appointments = ref([]);
    const showDialog = ref(false);
    const showDetails = ref(false);
    const selectedAppointment = ref(null);
    const editingAppointment = ref(null);
    const form = ref({
      title: "",
      titleEn: "",
      date: "",
      time: "",
      location: "",
      locationEn: "",
      description: "",
      descriptionEn: "",
    });

    let unsubscribe = null;

    const columns = computed(() => [
      {
        name: "date",
        label: t("appointments.date"),
        field: "date",
        align: "left",
        sortable: true,
        headerClasses: "bg-primary text-white",
      },
      {
        name: "title",
        label: t("appointments.eventTitle"),
        field: "title",
        align: "left",
        sortable: true,
        headerClasses: "bg-primary text-white",
      },
      {
        name: "location",
        label: t("appointments.location"),
        field: "location",
        align: "center",
        headerClasses: "bg-primary text-white",
      },
      ...(isAdmin.value
        ? [
            {
              name: "actions",
              label: t("common.actions"),
              field: "actions",
              align: "center",
              headerClasses: "bg-secondary text-white",
            },
          ]
        : []),
    ]);

    const visibleColumns = computed(() => {
      const isMobile = window.innerWidth < 600;
      if (isMobile) {
        return isAdmin.value ? ["date", "title", "actions"] : ["date", "title"];
      }
      return isAdmin.value
        ? ["date", "title", "location", "actions"]
        : ["date", "title", "location"];
    });

    const sortedAppointments = computed(() => {
      return [...appointments.value].sort((a, b) => {
        if (!a.date || !b.date) return 0;
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (a.time || "").localeCompare(b.time || "");
      });
    });

    const formatDate = (dateStr) => {
      if (!dateStr) return "";
      try {
        const [year, month, day] = dateStr.split("-");
        return `${day}/${month}/${year}`;
      } catch {
        return dateStr;
      }
    };

    const getBilingual = (row, field) => {
      const currentLocale = locale?.value || "it";
      if (currentLocale === "en" && row[field + "En"]) {
        return row[field + "En"];
      }
      return row[field] || "";
    };

    const openDetails = (appointment) => {
      selectedAppointment.value = appointment;
      showDetails.value = true;
    };

    const editFromDetails = () => {
      showDetails.value = false;
      openDialog(selectedAppointment.value);
    };

    const confirmDeleteFromDetails = () => {
      showDetails.value = false;
      confirmDelete(selectedAppointment.value);
    };

    const openDialog = (appointment = null) => {
      editingAppointment.value = appointment;
      if (appointment) {
        form.value = {
          title: appointment.title || "",
          titleEn: appointment.titleEn || "",
          date: appointment.date || "",
          time: appointment.time || "",
          location: appointment.location || "",
          locationEn: appointment.locationEn || "",
          description: appointment.description || "",
          descriptionEn: appointment.descriptionEn || "",
        };
      } else {
        form.value = {
          title: "",
          titleEn: "",
          date: "",
          time: "",
          location: "",
          locationEn: "",
          description: "",
          descriptionEn: "",
        };
      }
      showDialog.value = true;
    };

    const closeDialog = () => {
      showDialog.value = false;
      editingAppointment.value = null;
    };

    const saveAppointment = async () => {
      if (!form.value.title || !form.value.date) {
        $q.notify({
          type: "warning",
          message: "Titolo e data sono obbligatori",
        });
        return;
      }

      try {
        if (editingAppointment.value) {
          await updateAppointment(editingAppointment.value.id, form.value);
        } else {
          await createAppointment(form.value);
        }
        $q.notify({
          type: "positive",
          message: t("appointments.saved"),
        });
        closeDialog();
      } catch (error) {
        console.error("Error saving appointment:", error);
        $q.notify({
          type: "negative",
          message: "Errore durante il salvataggio",
        });
      }
    };

    const confirmDelete = (appointment) => {
      $q.dialog({
        title: t("appointments.delete"),
        message: t("appointments.deleteConfirm"),
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          await deleteAppointment(appointment.id);
          $q.notify({
            type: "positive",
            message: t("appointments.deleted"),
          });
        } catch (error) {
          console.error("Error deleting appointment:", error);
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
        appointments.value = await getAppointments();
      } catch (error) {
        console.error("Error loading appointments:", error);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      refreshData();

      unsubscribe = getAppointmentsListener(
        (newAppointments) => {
          appointments.value = newAppointments;
        },
        (error) => {
          console.error("Error in appointments listener:", error);
        }
      );
    });

    onUnmounted(() => {
      if (unsubscribe) unsubscribe();
    });

    return {
      loading,
      appointments,
      sortedAppointments,
      columns,
      visibleColumns,
      isAdmin,
      showDialog,
      showDetails,
      selectedAppointment,
      editingAppointment,
      form,
      formatDate,
      getBilingual,
      openDetails,
      editFromDetails,
      confirmDeleteFromDetails,
      openDialog,
      closeDialog,
      saveAppointment,
      confirmDelete,
      t,
      locale,
    };
  },
};
</script>

<style scoped>
.table-container {
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  overflow-x: auto;
}
.table-container :deep(.q-table__middle) {
  overflow-x: hidden;
}
</style>
