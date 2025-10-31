<template>
  <div class="editor-layout min-h-screen bg-primaryBg">
    <!-- Top Bar -->
    <slot name="top-bar" />

    <!-- Preview Card (Top Right) - Desktop Only -->
    <slot name="preview-card" />

    <!-- Main Content Area -->
    <div class="editor-content relative pt-16">
      <slot name="main-content" />

      <slot />
    </div>

    <!-- Visualization Toggle (Mobile) -->
    <slot name="visualization-toggle" />

    <!-- Bottom Toolbar -->
    <slot name="bottom-toolbar" />
  </div>
</template>

<script setup>


</script>

<style scoped>
.editor-layout {
  position: relative;
  min-height: 100vh;
}


@media (max-width: 768px) {
  .editor-content {
    margin-left: 0;
    padding-top: 0;
  }
}
</style>

