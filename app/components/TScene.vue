<script lang="ts" setup>
/* eslint-disable vue/attribute-hyphenation */
import type { Group } from "three"
import { useWindowSize } from "@vueuse/core"

const { width } = useWindowSize()

const activeModel = ref<string>("800")
const $packaging = shallowRef<Group | null>(null)

const options = computed(() => {
  if (width.value >= 1280) {
    return {
      x: 0.4,
      packagingPosition: [0, -4, 0],
      scale: 0.8,
    } as const
  }

  return {
    x: 0,
    packagingPosition: [-2.5, -5, 0],
    scale: 0.75,
  } as const
})


useLoop().onBeforeRender(() => {
  if ($packaging.value) {
    // Keep model upright while rotating
    $packaging.value.rotation.set(0, $packaging.value.rotation.y - 0.02, 0)
  }
})

</script>

<template>
	<TAbsoluteGroup :x="options.x" :distance="20">
		
		<TresGroup :position="options.packagingPosition" :scale="options.scale">
			<Levioso>
				<TresGroup ref="$packaging" :rotation="[0, 0, 0]">
					<TFilmPackaging
  :model="activeModel"
/>
				</TresGroup>
			</Levioso>
		</TresGroup>
	</TAbsoluteGroup>

	<TresMesh
		receive-shadow
		:position="[0, 0, -4]"
		:rotation="[0, 0, 0]"
	>
		<TresPlaneGeometry :args="[400, 400, 10, 10]" />
		<TresMeshStandardMaterial
			color="#ffffff"
			:roughness="0.5"
			:metalness="0.5"
		/>
	</TresMesh>

	<TresDirectionalLight
		cast-shadow
		:position="[-8, 6, 20]"
		:intensity=".5"
		:shadow-mapSize-width="512"
		:shadow-mapSize-height="512"
		:shadow-camera-left="-16"
		:shadow-camera-right="16"
		:shadow-camera-top="16"
		:shadow-camera-bottom="-16"
		:color="0xFFFFFF"
	/>

	<SoftShadows :size="50" :samples="10" />

	<Suspense>
		<Environment
			files="/textures/lobby.hdr"
			:environment-intensity="0.25"
		/>
	</Suspense>
</template>
