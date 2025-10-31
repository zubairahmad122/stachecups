<template>
  <q-card style="min-width: 300px">
    <q-card-section>
      <div class="flex justify-between items-center">
        <div class="text-bold">Templates</div>
        <q-btn icon="close" flat round dense v-close-popup />
      </div>
      <div>
        <q-input v-model="search" outlined style="background-color: #f4f4f7" dense placeholder="Search">
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="row q-py-sm">
        <q-chip clickable v-for="badge in badgeOptions" :key="badge">{{badge}}</q-chip>
      </div>
    </q-card-section>
  </q-card>
</template>
<script lang="ts" setup>
const search = ref()

const badgeOptions = ref(['Sorority', 'Gifts', 'Enterprise'])
</script>
