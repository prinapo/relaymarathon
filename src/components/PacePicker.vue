<template>
  <div class="pace-picker">
    <div v-if="runnerName" class="runner-name">{{ runnerName }}</div>
    <div class="pace-picker-row">
      <RollerPicker
        v-model="selectedMinutes"
        :options="minuteOptions"
        :big-roller="true"
        :line-height-px="60"
        font-size="32px"
      />
      <span class="separator">:</span>
      <RollerPicker
        v-model="selectedSeconds"
        :options="secondOptions"
        :big-roller="true"
        :line-height-px="60"
        font-size="32px"
      />
    </div>
    <q-btn color="primary" label="Salva" @click="handleSave" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { RollerPicker } from "vue-roller-picker";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    validator: (val) =>
      typeof val.minutes === "number" && typeof val.seconds === "number",
  },
  minuteRange: {
    type: Array,
    default: () => [2, 3, 4, 5, 6, 7],
  },
  secondInterval: {
    type: Number,
    default: 5,
  },
  runnerName: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["save"]);

const selectedMinutes = ref(5);
const selectedSeconds = ref(0);

const minuteOptions = computed(() =>
  [...props.minuteRange]
    .sort((a, b) => a - b)
    .map((n) => String(n).padStart(2, "0")),
);

const secondOptions = computed(() => {
  const opts = [];
  for (let i = 0; i < 60; i += props.secondInterval) {
    opts.push(String(i).padStart(2, "0"));
  }
  return opts;
});

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      selectedMinutes.value = String(val.minutes).padStart(2, "0");
      selectedSeconds.value = String(val.seconds).padStart(2, "0");
    }
  },
  { immediate: true },
);

const handleSave = () => {
  emit("save", {
    minutes: parseInt(selectedMinutes.value, 10),
    seconds: parseInt(selectedSeconds.value, 10),
  });
};
</script>

<style scoped>
.pace-picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
}
.runner-name {
  font-size: 18px;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 8px;
}
.pace-picker-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.separator {
  font-size: 48px;
  font-weight: bold;
}
:deep(.pick-option-active) {
  background: #1976d2 !important;
  color: white !important;
  border-radius: 8px;
  padding: 0 24px;
}
</style>
