<template>
  <div class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center">
    <div>
      <div class="text-h2" style="font-size: 150px">404</div>
      <div class="text-h6">{{ t('notFound.message') }}</div>
      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        to="/"
        :label="t('notFound.home')"
        no-caps
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useI18n } from 'src/composables/useI18n'

export default defineComponent({
  name: 'ErrorNotFound',
  setup() {
    const { t } = useI18n()
    return { t }
  }
})
</script>

<style>
</style>
