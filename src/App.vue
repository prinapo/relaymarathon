<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App'
})
</script>

<style>
.q-page {
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.dialog-card {
  min-width: 320px;
  max-width: 90vw;
}

.dialog-card-medium {
  min-width: 400px;
  max-width: 90vw;
}

.dialog-card-large {
  min-width: 500px;
  max-width: 90vw;
}

.splash-logo {
  max-width: 200px;
  width: 100%;
}

.text-404 {
  font-size: 150px;
  line-height: 1;
}

@media (max-width: 800px) {
  .q-page {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>