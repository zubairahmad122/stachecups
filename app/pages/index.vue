<template>
  <div class="landing-page">
    <div class="container">
      <h1 class="title">Design Your Custom Cup</h1>
      <p class="subtitle">Choose a collection to get started</p>

      <!-- Collection Buttons -->
      <div class="collection-buttons">
        <NuxtLink to="/customizer?collection=general" class="btn btn-general">
          <span class="btn-label">General</span>
          <span class="btn-desc">Full Freedom</span>
        </NuxtLink>

        <NuxtLink to="/customizer?collection=greek" class="btn btn-greek">
          <span class="btn-label">Greek Life</span>
          <span class="btn-desc">Licensed</span>
        </NuxtLink>

        <NuxtLink to="/customizer?collection=furman" class="btn btn-furman">
          <span class="btn-label">Furman</span>
          <span class="btn-desc">Official</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Landing page
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  text-align: center;
  padding: 2rem;
}

.title {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
}

.collection-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
}

.btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  border-radius: 12px;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}

.btn-general {
  background: white;
  color: #667eea;
}

.btn-greek {
  background: linear-gradient(135deg, #8B4513 0%, #D4AF37 100%);
  color: white;
}

.btn-furman {
  background: linear-gradient(135deg, #582C83 0%, #8B4789 100%);
  color: white;
}

.btn-label {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.btn-desc {
  font-size: 0.875rem;
  opacity: 0.9;
}

@media (max-width: 640px) {
  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .btn-label {
    font-size: 1.25rem;
  }
}
</style>

