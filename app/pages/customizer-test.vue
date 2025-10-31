<template>
<div class="min-h-[60vh] bg-red-600  flex item-center justify-center w-full">
  <TCanvas class="fixed top-0 left-0 right-0 h-lvh -z-1">
    <TScene />
  </TCanvas>
</div>
</template>

<script setup lang="ts">
import TScene from '~/components/TScene.vue'
import TCanvas from '~/components/TCanvas'
</script>
