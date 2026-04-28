<template>
  <div class="q-pt-md">
    <q-card flat bordered dense class="q-mx-md">
      <q-card-section
        class="text-center text-caption text-grey text-uppercase q-py-xs"
      >
        {{ startLocation || "Partenza" }}
      </q-card-section>
      <q-card-section class="text-center text-h5 text-weight-bold q-py-xs">
        {{ startTime }}
      </q-card-section>
      <q-card-section class="text-center q-py-xs">
        <q-chip
          color="warning"
          text-color="dark"
          size="md"
          square
          clickable
          @click="handleEditDelay"
        >
          {{ startDelay > 0 ? `+ ${startDelay} min` : '0 min' }}
        </q-chip>
      </q-card-section>
    </q-card>

    <q-timeline color="primary" layout="loose" class="q-pl-sm">
      <q-timeline-entry
        v-if="rows.length > 0 && rows[0].pace"
        side="left"
        icon="trip_origin"
      >
        <div class="row items-center justify-end q-gutter-sm q-mt-sm">
          <q-chip
            v-if="rows[0].segmentType !== 'group'"
            :color="getNameChipColor(rows[0])"
            text-color="white"
            size="md"
            square
            clickable
            @click="handleEditRunnerName(0)"
          >
            {{ rows[0].name || "---" }}
          </q-chip>
          <q-chip
            color="primary"
            text-color="white"
            size="md"
            square
            clickable
            @click="handleEditFirstPace"
          >
            {{ rows[0].pace }}
          </q-chip>
        </div>
      </q-timeline-entry>

      <q-timeline-entry
        v-for="(row, index) in rows.slice(0, -1)"
        :key="row.id"
        side="left"
        icon="circle"
        :title="row.label?.segment"
        :subtitle="row.arrivalTime"
      >
        <div class="row items-center justify-end q-gutter-sm q-mt-sm">
          <q-chip
            v-if="rows[index + 1]?.segmentType !== 'group'"
            :color="getNameChipColor(rows[index + 1])"
            text-color="white"
            size="md"
            square
            clickable
            @click="handleEditRunnerName(index + 1)"
          >
            {{ rows[index + 1]?.name || "---" }}
          </q-chip>
          <q-chip
            v-if="rows[index + 1]?.pace"
            color="primary"
            text-color="white"
            size="md"
            square
            clickable
            @click="handleEditPace(rows[index + 1], index + 1)"
          >
            {{ rows[index + 1]?.pace }}
          </q-chip>
        </div>
      </q-timeline-entry>

      <q-timeline-entry side="left" icon="flag">
        <div style="min-height: 20px"></div>
      </q-timeline-entry>
    </q-timeline>

    <q-card v-if="endTime" flat bordered dense class="q-mx-md q-mt-md">
      <q-card-section
        class="text-center text-caption text-grey text-uppercase q-py-xs"
      >
        {{ endLocation }}
      </q-card-section>
      <q-card-section class="text-center text-h5 text-weight-bold q-py-xs">
        {{ endTime }}
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  startTime: {
    type: String,
    default: "09:00",
  },
  startLocation: {
    type: String,
    default: "",
  },
  startDelay: {
    type: Number,
    default: 0,
  },
  endTime: {
    type: String,
    default: "",
  },
  endLocation: {
    type: String,
    default: "",
  },
  assignedSegments: {
    type: Array,
    default: () => [],
  },
  acceptedSegments: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["edit-delay", "edit-pace", "edit-runner-name"]);

const handleEditDelay = () => {
  emit("edit-delay");
};

const handleEditRunnerName = (index) => {
  emit("edit-runner-name", { index });
};

const handleEditFirstPace = () => {
  if (props.rows.length > 0) {
    emit("edit-pace", { row: props.rows[0], index: -1 });
  }
};

const handleEditPace = (row, index) => {
  emit("edit-pace", { row, index });
};

const getNameChipColor = (row) => {
  if (props.acceptedSegments.includes(row.segmentId)) return "positive";
  if (props.assignedSegments.includes(row.segmentId)) return "info";
  return "secondary";
};
</script>

<style scoped></style>
