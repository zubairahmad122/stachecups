<script lang="ts" setup>
import { ACESFilmicToneMapping, SRGBColorSpace } from "three"

const mounted = ref(false)

onMounted(() => {
	mounted.value = true
})
</script>

<template>
	<figure
		class="transition-opacity delay-300 duration-1000 ease-in-out"
		:class="{ 'opacity-0': !mounted }"
	>
		<TresCanvas
			:shadows="true"
			:output-color-space="SRGBColorSpace"
			:tone-mapping="ACESFilmicToneMapping"
			:tone-mapping-exposure="1.6"
			:alpha="true"
			:clear-alpha="0"
			:antialias="true"
			:dpr="[2.0]"
		>
		

			<TresPerspectiveCamera
				:fov="48"
				:position="[-1, 10, 40]"
				:look-at="[0, 0, 0]"
			/>
			<slot />
		</TresCanvas>
	</figure>
</template>
