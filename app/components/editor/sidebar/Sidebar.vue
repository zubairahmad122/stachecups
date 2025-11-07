<template>
  <div>
    <div
      v-if="!isMobile"
      class="fixed left-0 top-16 h-[calc(100vh_-_75px)] w-20  flex flex-col z-40     bg-gradient-to-r from-[#e0f2ff] via-[#c7f0ff] to-[#b3e5fc]
           backdrop-blur-xl border-b border-[#38bdf8]/30
           shadow-sm shadow-cyan-200/50 transition-all"
    >

      <div class="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <div
          class="relative sidebar-item"
        >
          <button
            class="w-full h-14 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all duration-200"
            :class="{ 'bg-purple-50 text-purple-600': activeMenu === 'stickers' }"
            @click="toggleMenu('stickers')"
          >
            <Sticker class="w-6 h-6" :class="activeMenu === 'stickers' ? 'text-purple-600' : 'text-gray-600'" :stroke-width="2" />
          </button>
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]" v-if="activeMenu !== 'stickers'">
            Stickers
          </q-tooltip>

          <div
            v-if="activeMenu === 'stickers'"
            class="fixed top-0 left-20 w-80 h-[calc(100vh-4rem)] bg-white border border-gray-200 shadow-xl z-50 flex flex-col rounded-r-lg overflow-hidden"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 class="text-lg font-semibold text-gray-900">Stickers</h3>
              <button @click="closeMenu" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
                <X class="w-5 h-5" :stroke-width="2" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto px-4 py-4">
              <toolbar-sticker-picker @select="handleStickerSelect" />
            </div>
          </div>
        </div>

        <div
          class="relative sidebar-item"
        >
          <button
            class="w-full h-14 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all duration-200"
            :class="{ 'bg-purple-50 text-purple-700': activeMenu === 'emoji' }"
            @click="toggleMenu('emoji')"
          >
            <Smile class="w-6 h-6" :class="activeMenu === 'emoji' ? 'text-purple-600' : 'text-gray-600'" :stroke-width="2" />
          </button>
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]" v-if="activeMenu !== 'emoji'">
            Elements
          </q-tooltip>

          <div
            v-if="activeMenu === 'emoji'"
            class="fixed top-0 left-20 w-80 h-[calc(100vh-4rem)] bg-white border border-gray-200 shadow-xl z-50 flex flex-col rounded-r-lg"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 class="text-lg font-semibold text-gray-900">Elements</h3>
              <button @click="closeMenu" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
                <X class="w-5 h-5" :stroke-width="2" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto px-4 py-4 emoji-picker-wrapper">
              <ClientOnly>
                <EmojiPicker v-if="EmojiPicker" :native="true" @select="handleEmojiSelect"  disable-skin-tones="true" class="min-h-[300px]" />
                <div v-else class="flex items-center justify-center h-full text-gray-500">Loading...</div>
              </ClientOnly>
            </div>
          </div>
        </div>

        <div
          class="relative sidebar-item"
        >
          <button
            class="w-full h-14 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all duration-200"
            :class="{ 'bg-purple-50 text-purple-700': activeMenu === 'background' }"
            @click="toggleMenu('background')"
          >
            <Palette class="w-6 h-6" :class="activeMenu === 'background' ? 'text-purple-600' : 'text-gray-600'" :stroke-width="2" />
          </button>
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]" v-if="activeMenu !== 'background'">
            Background
          </q-tooltip>

          <div
            v-if="activeMenu === 'background'"
            class="fixed top-0 left-20 w-80 h-[calc(100vh-4rem)] bg-white border border-gray-200 shadow-xl z-50 flex flex-col rounded-r-lg overflow-hidden"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 class="text-lg font-semibold text-gray-900">Background</h3>
              <button @click="closeMenu" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
                <X class="w-5 h-5" :stroke-width="2" />
              </button>
            </div>
            <div class="flex-1 overflow-hidden">
              <BackgroundPicker />
            </div>
          </div>
        </div>

        <!-- Monogram Button -->
        <div
          class="relative sidebar-item"
        >
          <button
            class="w-full h-14 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all duration-200"
            :class="{ 'bg-purple-50 text-purple-700': activeMenu === 'monogram' }"
            @click="toggleMenu('monogram')"
          >
            <q-icon name="mdi-alpha-m-circle" size="24px" :class="activeMenu === 'monogram' ? 'text-purple-600' : 'text-gray-600'" />
          </button>
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]" v-if="activeMenu !== 'monogram'">
            Monogram
          </q-tooltip>

          <div
            v-if="activeMenu === 'monogram'"
            class="fixed top-0 left-20 w-80 h-[calc(100vh-4rem)] bg-white border border-gray-200 shadow-xl z-50 flex flex-col rounded-r-lg overflow-hidden"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 class="text-lg font-semibold text-gray-900">Create Monogram</h3>
              <button @click="closeMenu" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
                <X class="w-5 h-5" :stroke-width="2" />
              </button>
            </div>
            <div class="flex-1 overflow-hidden">
              <SidebarMonogramPicker
                :editing-element="editingMonogramElement"
                @add="handleMonogramAdd"



                @update="handleMonogramUpdate"
                @cancel="closeMenu"
              />
            </div>
          </div>
        </div>

        <div class="relative sidebar-item">
          <button
            class="w-full h-14 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all duration-200"
            :class="{ 'bg-purple-50 text-purple-700': activeMenu === 'layers' }"
            @click="toggleMenu('layers')"
          >
            <Layers class="w-6 h-6" :class="activeMenu === 'layers' ? 'text-purple-600' : 'text-gray-600'" :stroke-width="2" />
          </button>
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]" v-if="activeMenu !== 'layers'">
            Layers
          </q-tooltip>

          <div
            v-if="activeMenu === 'layers'"
            class="fixed top-0 left-20 w-80 h-[calc(100vh-4rem)] bg-white border border-gray-200 shadow-xl z-50 flex flex-col rounded-r-lg overflow-hidden"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 class="text-lg font-semibold text-gray-900">Layers</h3>
              <button @click="closeMenu" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
                <X class="w-5 h-5" :stroke-width="2" />
              </button>
            </div>
            <div class="flex-1 overflow-hidden">
              <LayerPanel @layer-update="handleLayerUpdate" @layer-select="handleLayerSelect" />
            </div>
          </div>
        </div>

        <div class="relative sidebar-item">
          <button
            class="w-full h-14 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all duration-200"
            :class="{ 'bg-purple-50 text-purple-700': activeMenu === 'text' || textToolActive }"
            @click="toggleTextMenu"
          >
            <Type class="w-6 h-6" :class="(activeMenu === 'text' || textToolActive) ? 'text-purple-600' : 'text-gray-600'" :stroke-width="2" />
          </button>
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]" v-if="activeMenu !== 'text'">
            Text
          </q-tooltip>

          <div
            v-if="activeMenu === 'text'"
            class="fixed top-0 left-20 w-96 h-[calc(100vh-4rem)] bg-white border border-gray-200 shadow-xl z-50 flex flex-col rounded-r-lg overflow-hidden"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 class="text-lg font-semibold text-gray-900">Text</h3>
              <button @click="closeMenu" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
                <X class="w-5 h-5" :stroke-width="2" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto  p-6">
              <div class="space-y-4">
                <!-- Add Text Button -->
                <button
                  class="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 flex flex-col items-center justify-center text-center"
                  @click="handleAddText"
                >
                  <Type class="w-8 h-8 text-gray-400 mb-2" :stroke-width="2" />
                  <div class="font-medium text-gray-900 mb-1">Add Text</div>
                  <div class="text-sm text-gray-500">Click canvas to add text box</div>
                </button>

                <div class="border-t border-gray-200 my-4"></div>

                <!-- Advanced Options -->
                <div class="space-y-3">
                  <h4 class="text-sm font-medium text-gray-700 uppercase tracking-wide">Advanced Options</h4>

                  <!-- Monogram button removed - now has its own dedicated sidebar button -->
                </div>

                <div class="border-t border-gray-200 my-4"></div>

                <!-- Enhanced Font Picker -->
                <div class="enhanced-font-section">
                  <div class="font-section-header">
                    <h4 class="text-sm font-medium text-gray-700 uppercase tracking-wide">Typography</h4>
                  </div>
                  <EnhancedFontPicker
                    :selected-font="selectedFont"
                    :font-size="fontSize"
                    :text-color="textColor"
                    :is-bold="isBold"
                    :is-italic="isItalic"
                    :is-underline="isUnderline"
                    :letter-spacing="letterSpacing"
                    :line-height="lineHeight"
                    preview-text="Aa"
                    @font-change="handleFontChange"
                    @font-size-change="handleFontSizeChange"
                    @color-change="handleColorChange"
                    @bold-change="toggleBold"
                    @italic-change="toggleItalic"
                    @underline-change="toggleUnderline"
                    @letter-spacing-change="handleLetterSpacingChange"
                    @line-height-change="handleLineHeightChange"
                  />
                </div>

                <div class="border-t border-gray-200 my-4"></div>

                <!-- Advanced Text Effects -->
                <div class="space-y-4">
                  <h4 class="text-sm font-medium text-gray-700 uppercase tracking-wide">Advanced Effects</h4>

                  <!-- Stroke -->
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-medium text-gray-600">Stroke</label>
                      <q-toggle
                        v-model="strokeEnabled"
                        color="purple"
                        size="sm"
                        @update:model-value="toggleStroke"
                      />
                    </div>
                    <div v-if="strokeEnabled" class="space-y-2 pl-4">
                      <q-input
                        v-model="strokeColor"
                        type="color"
                        dense
                        outlined
                        label="Color"
                        @update:model-value="handleStrokeColorChange"
                      />
                      <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-500">Width:</span>
                        <q-slider
                          v-model="strokeWidth"
                          :min="1"
                          :max="10"
                          :step="1"
                          color="purple"
                          class="flex-1"
                          @update:model-value="handleStrokeWidthChange"
                        />
                        <span class="text-xs text-gray-500 w-10">{{ strokeWidth }}px</span>
                      </div>
                    </div>
                  </div>

                  <!-- Shadow -->
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-medium text-gray-600">Shadow</label>
                      <q-toggle
                        v-model="shadowEnabled"
                        color="purple"
                        size="sm"
                        @update:model-value="toggleShadow"
                      />
                    </div>
                    <div v-if="shadowEnabled" class="space-y-2 pl-4">
                      <q-input
                        v-model="shadowColor"
                        type="color"
                        dense
                        outlined
                        label="Color"
                        @update:model-value="handleShadowColorChange"
                      />
                      <div class="space-y-1">
                        <div class="flex items-center gap-2">
                          <span class="text-xs text-gray-500 w-16">Blur:</span>
                          <q-slider
                            v-model="shadowBlur"
                            :min="0"
                            :max="20"
                            :step="1"
                            color="purple"
                            class="flex-1"
                            @update:model-value="handleShadowBlurChange"
                          />
                          <span class="text-xs text-gray-500 w-10">{{ shadowBlur }}px</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <span class="text-xs text-gray-500 w-16">X Offset:</span>
                          <q-slider
                            v-model="shadowOffsetX"
                            :min="-20"
                            :max="20"
                            :step="1"
                            color="purple"
                            class="flex-1"
                            @update:model-value="handleShadowOffsetXChange"
                          />
                          <span class="text-xs text-gray-500 w-10">{{ shadowOffsetX }}px</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <span class="text-xs text-gray-500 w-16">Y Offset:</span>
                          <q-slider
                            v-model="shadowOffsetY"
                            :min="-20"
                            :max="20"
                            :step="1"
                            color="purple"
                            class="flex-1"
                            @update:model-value="handleShadowOffsetYChange"
                          />
                          <span class="text-xs text-gray-500 w-10">{{ shadowOffsetY }}px</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <span class="text-xs text-gray-500 w-16">Opacity:</span>
                          <q-slider
                            v-model="shadowOpacity"
                            :min="0"
                            :max="1"
                            :step="0.1"
                            color="purple"
                            class="flex-1"
                            @update:model-value="handleShadowOpacityChange"
                          />
                          <span class="text-xs text-gray-500 w-10">{{ Math.round(shadowOpacity * 100) }}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Engrave -->
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-medium text-gray-600">Engrave Effect</label>
                      <q-toggle
                        v-model="engraveEnabled"
                        color="purple"
                        size="sm"
                        @update:model-value="toggleEngrave"
                      />
                    </div>
                    <div class="text-xs text-gray-500 pl-4">
                      Creates a knockout effect where text cuts through the background
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
                    </div>

        <div class="relative sidebar-item">
                      <button
            class="w-full h-14 rounded-xl flex items-center justify-center transition-all duration-200"
            :class="activeMenu === 'draw' ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-100 text-gray-700'"
            @click="toggleMenu('draw')"
          >
            <PenTool class="w-6 h-6" :class="activeMenu === 'draw' ? 'text-purple-600' : 'text-gray-600'" :stroke-width="2" />
                      </button>
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]" v-if="activeMenu !== 'draw'">
            Draw
          </q-tooltip>

          <div
            v-if="activeMenu === 'draw'"
            class="fixed top-0 left-20 w-80 h-[calc(100vh-4rem)] bg-white border border-gray-200 shadow-xl z-50 flex flex-col rounded-r-lg overflow-hidden"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 class="text-lg font-semibold text-gray-900">Draw Tool</h3>
              <button @click="closeMenu" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
                <X class="w-5 h-5" :stroke-width="2" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto px-4 py-4">
              <DrawToolbar
                :brush-size="currentBrushSize"
                :brush-color="currentBrushColor"
                :tool-mode="drawToolStore.toolMode"
                :eraser-size="drawToolStore.eraserSize"
                :bucket-color="drawToolStore.bucketColor"
                @update:brush-size="drawToolStore.setBrushSize"
                @update:brush-color="drawToolStore.setBrushColor"
                @update:tool-mode="drawToolStore.setToolMode"
                @update:eraser-size="drawToolStore.setEraserSize"
                @update:bucket-color="drawToolStore.setBucketColor"
                @undo="undoDrawing"
                @clear="clearDrawing"
                @done="finishDrawing"
              />
            </div>
          </div>
        </div>

        <button
          class="w-full h-14 rounded-xl flex items-center justify-center transition-all duration-200"
          :class="collectionStore.canUpload ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-400 cursor-not-allowed'"
          :disabled="!collectionStore.canUpload"
          @click="collectionStore.canUpload && fileInputRef?.pickFiles()"
        >
          <Upload class="w-6 h-6" :class="collectionStore.canUpload ? 'text-gray-600' : 'text-gray-400'" :stroke-width="2" />
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]">
            {{ collectionStore.canUpload ? 'Upload' : (collectionStore.uploadDisabledMessage || 'Upload disabled for this collection') }}
          </q-tooltip>
        </button>
      </div>

      <div class="px-2 pb-6">
        <div class="h-px bg-gray-200 mb-4"></div>

        <button
          class="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl py-3 hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
          @click="handleCheckout"
        >
          <ShoppingCart class="w-5 h-5" :stroke-width="2.5" />
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]">
            Done
          </q-tooltip>
        </button>
      </div>
    </div>

    <div
      v-else
      class="fixed bottom-0 left-0 right-0  z-40   bg-gradient-to-r from-[#e0f2ff] via-[#c7f0ff] to-[#b3e5fc]
           backdrop-blur-xl border-b border-[#38bdf8]/30
           shadow-sm shadow-cyan-200/50 transition-all"
    >
      <div class="flex items-center justify-between  flex-nowrap   overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent gap-0 px-2 py-3">
        <button
          class="flex flex-col items-center justify-center w-16 py-2 rounded-lg transition-all min-w-16"
          :class="activeMenu === 'stickers' ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50'"
          @click="toggleMenu('stickers')"
        >
          <Sticker class="w-5 h-5 mb-1" :stroke-width="2" />
          <span class="text-xs font-medium">Stickers</span>
        </button>


        <button
          class="flex flex-col items-center justify-center w-16 py-2 rounded-lg transition-all min-w-16"
          :class="activeMenu === 'emoji' ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50'"
          @click="toggleMenu('emoji')"
        >
          <Smile class="w-5 h-5 mb-1" :stroke-width="2" />
          <span class="text-xs font-medium">Elements</span>
        </button>

        <button
          class="flex flex-col items-center justify-center w-16 py-2 rounded-lg transition-all min-w-16"
          :class="activeMenu === 'background' ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50'"
          @click="toggleMenu('background')"
        >
          <Palette class="w-5 h-5 mb-1" :stroke-width="2" />
          <span class="text-xs font-medium">BG</span>
        </button>

        <button
          class="flex flex-col items-center justify-center w-16 py-2 rounded-lg transition-all min-w-16"
          :class="activeMenu === 'layers' ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50'"
          @click="toggleMenu('layers')"
        >
          <Layers class="w-5 h-5 mb-1" :stroke-width="2" />
          <span class="text-xs font-medium">Layers</span>
        </button>

        <button
          class="flex flex-col items-center justify-center w-16 py-2 rounded-lg transition-all min-w-16"
          :class="activeMenu === 'monogram' ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50'"
          @click="toggleMenu('monogram')"
        >
          <q-icon name="mdi-alpha-m-circle" size="20px" class="mb-1" :class="activeMenu === 'monogram' ? 'text-purple-600' : 'text-gray-600'" />
          <span class="text-xs font-medium">Monogram</span>
        </button>

        <button
          class="flex flex-col items-center justify-center w-16 py-2 rounded-lg transition-all min-w-16"
          :class="(activeMenu === 'text' || textToolActive) ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50'"
          @click="toggleTextMenu"
        >
          <Type class="w-5 h-5 mb-1" :stroke-width="2" />
          <span class="text-xs font-medium">Text</span>
        </button>

        <button
          class="flex flex-col items-center justify-center w-16 py-2 rounded-lg transition-all min-w-16"
          :class="activeMenu === 'draw' ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50'"
          @click="toggleMenu('draw')"
        >
          <PenTool class="w-5 h-5 mb-1" :stroke-width="2" />
          <span class="text-xs font-medium">Draw</span>
        </button>

        <button
          class="flex flex-col items-center justify-center w-16 py-2 rounded-lg transition-all min-w-16"
          :class="collectionStore.canUpload ? 'hover:bg-gray-50' : 'text-gray-400 cursor-not-allowed'"
          :disabled="!collectionStore.canUpload"
          @click="collectionStore.canUpload && fileInputRef?.pickFiles()"
        >
          <Upload class="w-5 h-5 mb-1" :class="collectionStore.canUpload ? '' : 'text-gray-400'" :stroke-width="2" />
          <span class="text-xs font-medium">Upload</span>
        </button>

        <button
          class="flex flex-col items-center justify-center w-16 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white transition-all min-w-16"
          @click="handleCheckout"
        >
          <ShoppingCart class="w-5 h-5 mb-1" :stroke-width="2" />
          <span class="text-xs font-semibold">Done</span>
        </button>
      </div>
    </div>

    <div v-if="isMobile && activeMenu" class="fixed inset-0 top-[40%] z-50 flex items-end transition-opacity duration-200" @click="activeMenu = null">
      <div class="bg-white rounded-t-3xl w-full max-h-[45vh] overflow-y-auto shadow-2xl" @click.stop>
        <!-- Header with handle -->
        <div class="flex flex-col sticky z-50 bg-white top-0 border-b border-gray-200">
          <!-- Drag Handle -->
          <div class="flex justify-center bg-white pt-2 pb-2">

          </div>

          <!-- Title & Close Button -->
          <div class="flex items-center justify-between m px-4 pb-3">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ activeMenu === 'stickers' ? 'Stickers' :
                 activeMenu === 'emoji' ? 'Elements' :
                 activeMenu === 'background' ? 'Background' :
                 activeMenu === 'layers' ? 'Layers' :
                 activeMenu === 'monogram' ? 'Create Monogram' :
                 activeMenu === 'text' ? 'Text' :
                 activeMenu === 'draw' ? 'Draw Tool' : '' }}
            </h3>
            <button
              @click="activeMenu = null"
              class="w-8 h-8 rounded-lg hover:bg-gray-100 active:bg-gray-200 flex items-center justify-center text-gray-500 transition-all touch-manipulation"
            >
              <X class="w-5 h-5" :stroke-width="2" />
            </button>
          </div>
        </div>

        <!-- Content Area with better padding and overflow -->
        <div class="  px-4 pb-6">

          <!-- Stickers Content -->
          <div v-if="activeMenu === 'stickers'" class="mobile-content pt-2">
            <toolbar-sticker-picker @select="handleStickerSelect" />
          </div>

          <!-- Emoji Picker Content -->
          <div v-else-if="activeMenu === 'emoji'" class="mobile-content pt-2">
            <ClientOnly>
              <EmojiPicker v-if="EmojiPicker" :native="true" @select="handleEmojiSelect" />
              <div v-else class="flex items-center justify-center h-40 text-gray-500">
                <div class="flex flex-col items-center gap-2">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span class="text-sm">Loading...</span>
                </div>
              </div>
            </ClientOnly>
          </div>

          <!-- Background Picker Content -->
          <div v-else-if="activeMenu === 'background'" class="mobile-content pt-2">
            <BackgroundPicker />
          </div>

          <!-- Layers Content -->
          <div v-else-if="activeMenu === 'layers'" class="mobile-content pt-2">
            <LayerPanel @layer-update="handleLayerUpdate" />
          </div>

          <!-- Monogram Content -->
          <div v-else-if="activeMenu === 'monogram'" class="mobile-content pt-2">
            <SidebarMonogramPicker
              :editing-element="editingMonogramElement"
              @add="handleMonogramAdd"
              @update="handleMonogramUpdate"
              @cancel="closeMenu"
            />
          </div>

          <!-- Text Content -->
          <div v-else-if="activeMenu === 'text'" class="mobile-content space-y-5 pt-4">
            <button
              class="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl active:border-purple-500 active:bg-purple-50 transition-all duration-200 flex flex-col items-center justify-center text-center touch-manipulation"
              @click="handleAddText"
            >
              <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                <Type class="w-6 h-6 text-purple-600" :stroke-width="2" />
              </div>
              <div class="text-base font-semibold text-gray-900 mb-1">Add Text</div>
              <div class="text-xs text-gray-500">Tap canvas to add</div>
            </button>

            <div class="h-px bg-gray-200"></div>

            <!-- Text Styling Panel (Mobile) -->
            <div class="space-y-5">

              <!-- Font Family Section (Mobile) -->
              <div class="space-y-3">
                <h5 class="text-base font-bold text-gray-900">Font</h5>

                <!-- Font Category Tabs -->
                <div class="grid grid-cols-2 gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    v-for="category in fontCategories"
                    :key="category.value"
                    class="px-3 py-2 text-xs font-semibold rounded-md transition-all duration-200 touch-manipulation"
                    :class="selectedFontCategory === category.value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'bg-transparent text-gray-600 active:bg-gray-200'"
                    @click="selectedFontCategory = category.value"
                  >
                    {{ category.label }}
                  </button>
                </div>

                <!-- Font Search -->
                <q-input
                  v-model="fontSearchQuery"
                  placeholder="Search fonts..."
                  outlined
                  dense
                  class="text-sm"
                  bg-color="white"
                >
                  <template #prepend>
                    <q-icon name="search" size="18px" class="text-gray-400" />
                  </template>
                </q-input>

                <!-- Font Grid -->
                <div class="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  <button
                    v-for="font in filteredFonts"
                    :key="font.value"
                    class="p-3 text-left border rounded-lg transition-all duration-200 touch-manipulation min-h-[50px] flex items-center justify-center"
                    :class="selectedFont === font.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300 bg-white active:border-purple-400'"
                    @click="handleFontChange(font.value)"
                  >
                    <div class="text-sm font-medium text-gray-900 truncate" :style="{ fontFamily: font.value }">
                      {{ font.label }}
                    </div>
                  </button>
                </div>
              </div>

              <!-- Font Size (Mobile) -->
              <div class="space-y-3">
                <h5 class="text-base font-bold text-gray-900">Size</h5>

                <!-- Font Size Slider -->
                <div class="flex items-center gap-3">
                  <q-slider
                    v-model="fontSize"
                    :min="12"
                    :max="200"
                    :step="1"
                    color="purple"
                    track-size="4px"
                    thumb-size="20px"
                    class="flex-1"
                    @update:model-value="handleFontSizeChange"
                  />
                  <div class="min-w-[60px] px-3 py-2 bg-gray-100 rounded-lg text-center">
                    <span class="text-sm font-semibold text-gray-900">{{ fontSize }}</span>
                  </div>
                </div>

                <!-- Font Size Presets -->
                <div class="grid grid-cols-3 gap-2">
                  <button
                    v-for="preset in fontSizePresets"
                    :key="preset.label"
                    class="px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 touch-manipulation border"
                    :class="isFontSizePresetActive(preset.value)
                      ? 'bg-purple-500 text-white border-purple-500'
                      : 'bg-white text-gray-700 border-gray-300 active:border-purple-400'"
                    @click="handleFontSizePreset(preset.value)"
                  >
                    {{ preset.label }}
                  </button>
                </div>
              </div>

              <!-- Text Color (Mobile) -->
              <div class="space-y-3">
                <h5 class="text-base font-bold text-gray-900">Color</h5>
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-lg border-2 border-gray-300 overflow-hidden shadow-sm">
                    <input
                      v-model="textColor"
                      type="color"
                      class="w-full h-full cursor-pointer"
                      @input="handleColorChange"
                    />
                  </div>
                  <span class="text-sm text-gray-600 font-mono">{{ textColor }}</span>
                </div>
              </div>

              <!-- Text Formatting -->
              <div class="space-y-3">
                <h5 class="text-base font-bold text-gray-900">Format</h5>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    class="h-12 rounded-lg flex items-center justify-center gap-1.5 transition-all touch-manipulation border"
                    :class="isBold
                      ? 'bg-purple-500 text-white border-purple-500'
                      : 'bg-white border-gray-300 text-gray-700 active:border-purple-400'"
                    @click="toggleBold"
                  >
                    <q-icon name="format_bold" size="18px" />
                    <span class="text-xs font-semibold">Bold</span>
                  </button>
                  <button
                    class="h-12 rounded-lg flex items-center justify-center gap-1.5 transition-all touch-manipulation border"
                    :class="isItalic
                      ? 'bg-purple-500 text-white border-purple-500'
                      : 'bg-white border-gray-300 text-gray-700 active:border-purple-400'"
                    @click="toggleItalic"
                  >
                    <q-icon name="format_italic" size="18px" />
                    <span class="text-xs font-semibold">Italic</span>
                  </button>
                  <button
                    class="h-12 rounded-lg flex items-center justify-center gap-1.5 transition-all touch-manipulation border"
                    :class="isUnderline
                      ? 'bg-purple-500 text-white border-purple-500'
                      : 'bg-white border-gray-300 text-gray-700 active:border-purple-400'"
                    @click="toggleUnderline"
                  >
                    <q-icon name="format_underlined" size="18px" />
                    <span class="text-xs font-semibold">Underline</span>
                  </button>
                </div>
              </div>

              <div class="h-px bg-gray-200"></div>

              <!-- Spacing Section -->
              <div class="space-y-4">
                <h5 class="text-base font-bold text-gray-900">Spacing</h5>

                <!-- Letter Spacing -->
                <div class="space-y-2">
                  <label class="text-sm text-gray-700 font-medium">Letter spacing</label>
                  <div class="flex items-center gap-3">
                    <q-slider
                      v-model="letterSpacing"
                      :min="-5"
                      :max="20"
                      :step="0.5"
                      color="purple"
                      track-size="4px"
                      thumb-size="20px"
                      class="flex-1"
                      @update:model-value="handleLetterSpacingChange"
                    />
                    <div class="min-w-[50px] px-3 py-1.5 bg-gray-100 rounded-lg text-center">
                      <span class="text-sm font-semibold text-gray-900">{{ letterSpacing }}</span>
                    </div>
                  </div>
                </div>

                <!-- Line Spacing -->
                <div class="space-y-2">
                  <label class="text-sm text-gray-700 font-medium">Line spacing</label>
                  <div class="flex items-center gap-3">
                    <q-slider
                      v-model="lineHeight"
                      :min="0.5"
                      :max="3"
                      :step="0.1"
                      color="purple"
                      track-size="4px"
                      thumb-size="20px"
                      class="flex-1"
                      @update:model-value="handleLineHeightChange"
                    />
                    <div class="min-w-[50px] px-3 py-1.5 bg-gray-100 rounded-lg text-center">
                      <span class="text-sm font-semibold text-gray-900">{{ lineHeight.toFixed(1) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Divider -->
              <div class="h-px bg-gray-200 my-6"></div>

              <!-- Effects Section -->
              <div class="space-y-4">
                <h5 class="text-base font-bold text-gray-900">Effects</h5>

                <!-- Stroke -->
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <label class="text-sm text-gray-700 font-medium">Stroke</label>
                    <q-toggle
                      v-model="strokeEnabled"
                      color="purple"
                      size="md"
                      @update:model-value="toggleStroke"
                    />
                  </div>
                  <div v-if="strokeEnabled" class="space-y-3 pl-4 border-l-2 border-purple-200">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-lg border-2 border-gray-300 overflow-hidden cursor-pointer shadow-sm">
                        <input
                          v-model="strokeColor"
                          type="color"
                          class="w-full h-full cursor-pointer"
                          @input="handleStrokeColorChange"
                        />
                      </div>
                      <span class="text-sm text-gray-600">Color</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <q-slider
                        v-model="strokeWidth"
                        :min="1"
                        :max="10"
                        :step="1"
                        color="purple"
                        track-size="4px"
                        thumb-size="20px"
                        class="flex-1"
                        @update:model-value="handleStrokeWidthChange"
                      />
                      <div class="min-w-[50px] px-3 py-1.5 bg-gray-100 rounded-lg text-center">
                        <span class="text-sm font-semibold text-gray-900">{{ strokeWidth }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Shadow -->
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <label class="text-sm text-gray-700 font-medium">Shadow</label>
                    <q-toggle
                      v-model="shadowEnabled"
                      color="purple"
                      size="md"
                      @update:model-value="toggleShadow"
                    />
                  </div>
                  <div v-if="shadowEnabled" class="space-y-3 pl-4 border-l-2 border-purple-200">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-lg border-2 border-gray-300 overflow-hidden cursor-pointer shadow-sm">
                        <input
                          v-model="shadowColor"
                          type="color"
                          class="w-full h-full cursor-pointer"
                          @input="handleShadowColorChange"
                        />
                      </div>
                      <span class="text-sm text-gray-600">Color</span>
                    </div>
                    <div class="space-y-2">
                      <span class="text-xs text-gray-500">Blur</span>
                      <div class="flex items-center gap-3">
                        <q-slider
                          v-model="shadowBlur"
                          :min="0"
                          :max="20"
                          :step="1"
                          color="purple"
                          track-size="4px"
                          thumb-size="20px"
                          class="flex-1"
                          @update:model-value="handleShadowBlurChange"
                        />
                        <div class="min-w-[50px] px-3 py-1.5 bg-gray-100 rounded-lg text-center">
                          <span class="text-sm font-semibold text-gray-900">{{ shadowBlur }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="space-y-2">
                      <span class="text-xs text-gray-500">Offset X</span>
                      <div class="flex items-center gap-3">
                        <q-slider
                          v-model="shadowOffsetX"
                          :min="-20"
                          :max="20"
                          :step="1"
                          color="purple"
                          track-size="4px"
                          thumb-size="20px"
                          class="flex-1"
                          @update:model-value="handleShadowOffsetXChange"
                        />
                        <div class="min-w-[50px] px-3 py-1.5 bg-gray-100 rounded-lg text-center">
                          <span class="text-sm font-semibold text-gray-900">{{ shadowOffsetX }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="space-y-2">
                      <span class="text-xs text-gray-500">Offset Y</span>
                      <div class="flex items-center gap-3">
                        <q-slider
                          v-model="shadowOffsetY"
                          :min="-20"
                          :max="20"
                          :step="1"
                          color="purple"
                          track-size="4px"
                          thumb-size="20px"
                          class="flex-1"
                          @update:model-value="handleShadowOffsetYChange"
                        />
                        <div class="min-w-[50px] px-3 py-1.5 bg-gray-100 rounded-lg text-center">
                          <span class="text-sm font-semibold text-gray-900">{{ shadowOffsetY }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Engrave -->
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm text-gray-700 font-medium">Engrave</label>
                    <p class="text-xs text-gray-500 mt-0.5">Knockout effect</p>
                  </div>
                  <q-toggle
                    v-model="engraveEnabled"
                    color="purple"
                    size="md"
                    @update:model-value="toggleEngrave"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Draw Content -->
          <div v-else-if="activeMenu === 'draw'" class="mobile-content pt-4">
            <DrawToolbar
              :brush-size="currentBrushSize"
              :brush-color="currentBrushColor"
              :tool-mode="drawToolStore.toolMode"
              :eraser-size="drawToolStore.eraserSize"
              :bucket-color="drawToolStore.bucketColor"
              @update:brush-size="drawToolStore.setBrushSize"
              @update:brush-color="drawToolStore.setBrushColor"
              @update:tool-mode="drawToolStore.setToolMode"
              @update:eraser-size="drawToolStore.setEraserSize"
              @update:bucket-color="drawToolStore.setBucketColor"
              @undo="undoDrawing"
              @clear="clearDrawing"
              @done="finishDrawing"
            />
          </div>
        </div>
      </div>
    </div>

    <q-file
      ref="fileInputRef"
      v-model="fileInput"
      style="display: none"
      accept="image/*"
      @update:model-value="handleFileSelected"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import {
  Sticker,
  Smile,
  Type,
  PenTool,
  Upload,
  ShoppingCart,
  X,
  Palette,
  Layers
} from 'lucide-vue-next';

let EmojiPicker = null;
if (process.client) {
  EmojiPicker = (await import('vue3-emoji-picker')).default;
  await import('vue3-emoji-picker/css');
}
import ToolbarStickerPicker from '~/components/editor/pickers/StickerPicker.vue';
import BackgroundPicker from '~/components/editor/pickers/BackgroundPicker.vue';
import LayerPanel from '~/components/editor/pickers/LayerPanel.vue';
import EnhancedFontPicker from '~/components/editor/pickers/EnhancedFontPicker.vue';
import SidebarMonogramPicker from '~/components/editor/pickers/SidebarMonogramPicker.vue';
import DrawToolbar from '~/components/editor/sidebar/DrawToolbar.vue';
import { useTextEditorStore } from '~/store/textEditor';
import { useEditorStore } from '~/store/editor';
import { useDrawToolStore } from '~/store/drawTool';
import { useCollectionStore } from '~/store/collection';
import { AVAILABLE_FONTS, CUSTOM_MONOGRAM_FONTS } from '~/config/fonts';

const $q = useQuasar();
const textEditorStore = useTextEditorStore();
const editorStore = useEditorStore();
const drawToolStore = useDrawToolStore();
const collectionStore = useCollectionStore();

const props = defineProps({
  textToolActive: {
    type: Boolean,
    default: false,
  },
  drawToolActive: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits([
  'upload', 'activate-text-tool', 'activate-draw-tool', 'deactivate-draw-tool', 'add-emoji', 'checkout', 'add-image',
  'open-advanced-text', 'add-monogram', 'update-monogram', 'switch-product',
  'font-change', 'font-size-change', 'color-change', 'bold-change', 'italic-change', 'underline-change',
  'stroke-toggle', 'stroke-color-change', 'stroke-width-change',
  'shadow-toggle', 'shadow-color-change', 'shadow-blur-change', 'shadow-offset-x-change', 'shadow-offset-y-change', 'shadow-opacity-change',
  'engrave-toggle', 'letter-spacing-change', 'line-height-change',
  'update:brush-size', 'update:brush-color', 'undo-drawing', 'clear-drawing', 'finish-drawing'
]);

const fileInput = ref(null);
const fileInputRef = ref(null);
const activeMenu = ref(null);

const selectedFont = ref('Roboto');
const fontSize = ref(32);
const textColor = ref('#000000');
const isBold = ref(false);
const isItalic = ref(false);
const isUnderline = ref(false);
const strokeEnabled = ref(false);
const strokeColor = ref('#FFFFFF');
const strokeWidth = ref(2);
const shadowEnabled = ref(false);
const shadowColor = ref('#000000');
const shadowBlur = ref(5);
const shadowOffsetX = ref(2);
const shadowOffsetY = ref(2);
const shadowOpacity = ref(0.5);
const engraveEnabled = ref(false);
const letterSpacing = ref(0);
const lineHeight = ref(1.2);
const fontSearchQuery = ref('');
const selectedFontCategory = ref('all');

const fontCategories = computed(() => {
  const selectedElement = editorStore.selectedElement;

  if (selectedElement && selectedElement.type === 'monogram') {
    return [
      { label: 'MONOGRAM', value: 'monogram' },
    ];
  }

  return [
    { label: 'ALL FONTS', value: 'all' },
    { label: 'SANS SERIF', value: 'sans-serif' },
    { label: 'SERIF', value: 'serif' },
    { label: 'HANDWRIT', value: 'handwriting' },
  ];
});

const fontSizePresets = [
  { label: 'Small', value: 12 },
  { label: 'Medium', value: 16 },
  { label: 'Large', value: 24 },
  { label: 'X-Large', value: 32 },
  { label: 'XX-Large', value: 48 },
  { label: 'Huge', value: 64 },
];

const fontOptions = computed(() => {
  const selectedElement = editorStore.selectedElement;

  if (selectedElement && selectedElement.type === 'monogram') {
    return CUSTOM_MONOGRAM_FONTS.map(font => ({
      label: font.label,
      value: font.value,
      category: 'monogram'
    }));
  }

  return AVAILABLE_FONTS.map(font => ({
    label: font.label,
    value: font.value,
    category: font.category
  }));
});

const isMobile = computed(() => $q.screen.lt.md);

const editingMonogramElement = computed(() => {
  const selectedElement = editorStore.selectedElement;
  if (selectedElement && selectedElement.type === 'monogram') {
    return selectedElement;
  }
  return null;
});

const currentBrushSize = computed(() => drawToolStore.brushSize);
const currentBrushColor = computed(() => drawToolStore.brushColor);

const filteredFonts = computed(() => {
  let fonts = fontOptions.value;

  if (selectedFontCategory.value !== 'all') {
    fonts = fonts.filter(font => font.category === selectedFontCategory.value);
  }

  if (fontSearchQuery.value) {
    const query = fontSearchQuery.value.toLowerCase();
    fonts = fonts.filter(font =>
      font.label.toLowerCase().includes(query)
    );
  }

  return fonts;
});

const isFontSizePresetActive = (presetValue) => {
  return fontSize.value === presetValue;
};

watch(() => textEditorStore.selectedFont, (newFont) => {
  if (newFont && newFont !== selectedFont.value) {
    selectedFont.value = newFont;
  }
}, { immediate: true });

watch(() => textEditorStore.selectedFontSize, (newSize) => {
  if (newSize && newSize !== fontSize.value) {
    fontSize.value = newSize;
  }
}, { immediate: true });

watch(() => textEditorStore.selectedFontColor, (newColor) => {
  if (newColor && newColor !== textColor.value) {
    textColor.value = newColor;
  }
}, { immediate: true });

watch(() => textEditorStore.selectedBold, (newBold) => {
  isBold.value = newBold;
}, { immediate: true });

watch(() => textEditorStore.selectedItalic, (newItalic) => {
  isItalic.value = newItalic;
}, { immediate: true });

watch(() => textEditorStore.selectedUnderline, (newUnderline) => {
  isUnderline.value = newUnderline;
}, { immediate: true });

watch(() => textEditorStore.selectedStroke, (newStroke) => {
  if (newStroke) {
    strokeEnabled.value = newStroke.enabled || false;
    strokeColor.value = newStroke.color || '#FFFFFF';
    strokeWidth.value = newStroke.width || 2;
  } else {
    strokeEnabled.value = false;
    strokeColor.value = '#FFFFFF';
    strokeWidth.value = 2;
  }
}, { immediate: true });

watch(() => textEditorStore.selectedShadow, (newShadow) => {
  if (newShadow) {
    shadowEnabled.value = newShadow.enabled || false;
    shadowColor.value = newShadow.color || '#000000';
    shadowBlur.value = newShadow.blur || 5;
    shadowOffsetX.value = newShadow.offsetX || 2;
    shadowOffsetY.value = newShadow.offsetY || 2;
    shadowOpacity.value = newShadow.opacity || 0.5;
  } else {
    shadowEnabled.value = false;
    shadowColor.value = '#000000';
    shadowBlur.value = 5;
    shadowOffsetX.value = 2;
    shadowOffsetY.value = 2;
    shadowOpacity.value = 0.5;
  }
}, { immediate: true });

watch(() => textEditorStore.selectedEngrave, (newEngrave) => {
  engraveEnabled.value = newEngrave;
}, { immediate: true });

watch(() => textEditorStore.selectedLetterSpacing, (newSpacing) => {
  letterSpacing.value = newSpacing;
}, { immediate: true });

watch(() => textEditorStore.selectedLineHeight, (newHeight) => {
  lineHeight.value = newHeight;
}, { immediate: true });

watch(() => editorStore.selectedElement?.type, (newType, oldType) => {
  if (newType === 'monogram') {
    selectedFontCategory.value = 'monogram';
  } else if (oldType === 'monogram' && newType !== 'monogram') {
    selectedFontCategory.value = 'all';
  }
});

watch(() => props.textToolActive, (isActive) => {
  if (isActive) {
    if (activeMenu.value && activeMenu.value !== 'text') {
      activeMenu.value = null;
    }
  } else {
    if (activeMenu.value === 'text') {
      activeMenu.value = null;
    }
  }
});

watch(() => props.drawToolActive, (isActive) => {
  if (isActive) {
    if (activeMenu.value && activeMenu.value !== 'draw') {
      activeMenu.value = null;
    }
  } else {
    if (activeMenu.value === 'draw') {
      activeMenu.value = null;
    }
  }
});

const closeMenu = () => {
  if (activeMenu.value === 'draw') {
    drawToolStore.isActive = false;
  }
  activeMenu.value = null;
};

const toggleMenu = (menu) => {
  const previousMenu = activeMenu.value;

  if (activeMenu.value === menu) {
    activeMenu.value = null;
    if (menu === 'draw') {
      drawToolStore.isActive = false;
    }
  } else {
    // Clear previous menu state when switching
    if (previousMenu === 'draw') {
      drawToolStore.isActive = false;
      emit('deactivate-draw-tool');
    }

    activeMenu.value = menu;

    if (menu === 'draw') {
      drawToolStore.isActive = true;
      emit('activate-draw-tool');
    }
  }
};

const toggleTextMenu = () => {
  if (activeMenu.value === 'text') {
    activeMenu.value = null;
  } else {
    activeMenu.value = 'text';
  }
};

const openMonogramPanel = () => {
  activeMenu.value = 'monogram';
};

const closeMonogramPanel = () => {
  if (activeMenu.value === 'monogram') {
    activeMenu.value = null;
  }
};

const handleAddText = () => {
  emit('activate-text-tool');
  activeMenu.value = null;
};

const handleAdvancedText = () => {
  emit('open-advanced-text');
  activeMenu.value = null;
};



const handleMonogramAdd = (config) => {
  emit('add-monogram', config);
  activeMenu.value = null;
};

const handleMonogramUpdate = (config) => {
  emit('update-monogram', config);
};

const handleFontChange = (font) => {
  emit('font-change', font);
};

const handleFontSizeChange = (size) => {
  emit('font-size-change', size);
};

let colorChangeTimeout = null;
const handleColorChange = (color) => {
  if (colorChangeTimeout) {
    clearTimeout(colorChangeTimeout);
  }
  colorChangeTimeout = setTimeout(() => {
    emit('color-change', color);
  }, 50);
};

const toggleBold = () => {
  isBold.value = !isBold.value;
  emit('bold-change', isBold.value);
};

const toggleItalic = () => {
  isItalic.value = !isItalic.value;
  emit('italic-change', isItalic.value);
};

const toggleUnderline = () => {
  isUnderline.value = !isUnderline.value;
  emit('underline-change', isUnderline.value);
};

const toggleStroke = () => {
  emit('stroke-toggle', strokeEnabled.value);
};

let strokeColorTimeout = null;
const handleStrokeColorChange = (color) => {
  if (strokeColorTimeout) {
    clearTimeout(strokeColorTimeout);
  }
  strokeColorTimeout = setTimeout(() => {
    emit('stroke-color-change', color);
  }, 50);
};

const handleStrokeWidthChange = (width) => {
  emit('stroke-width-change', width);
};

const toggleShadow = () => {
  emit('shadow-toggle', shadowEnabled.value);
};

let shadowColorTimeout = null;
const handleShadowColorChange = (color) => {
  if (shadowColorTimeout) {
    clearTimeout(shadowColorTimeout);
  }
  shadowColorTimeout = setTimeout(() => {
    emit('shadow-color-change', color);
  }, 50);
};

const handleShadowBlurChange = (blur) => {
  emit('shadow-blur-change', blur);
};

const handleShadowOffsetXChange = (offsetX) => {
  emit('shadow-offset-x-change', offsetX);
};

const handleShadowOffsetYChange = (offsetY) => {
  emit('shadow-offset-y-change', offsetY);
};

const handleShadowOpacityChange = (opacity) => {
  emit('shadow-opacity-change', opacity);
};

const toggleEngrave = () => {
  emit('engrave-toggle', engraveEnabled.value);
};

const handleLetterSpacingChange = (spacing) => {
  emit('letter-spacing-change', spacing);
};

const handleLineHeightChange = (height) => {
  emit('line-height-change', height);
};

const handleFontSizePreset = (size) => {
  fontSize.value = size;
  handleFontSizeChange(size);
};

const activateTextTool = () => {
  emit('activate-text-tool');
};

const openTextPanel = () => {
  activeMenu.value = 'text';
};

const closeTextPanel = () => {
  if (activeMenu.value === 'text') {
    activeMenu.value = null;
  }
};

defineExpose({
  openTextPanel,
  closeTextPanel,
  openMonogramPanel,
  closeMonogramPanel
});

const activateDrawTool = () => {
  emit('activate-draw-tool');
};

const deactivateDrawTool = () => {
  emit('deactivate-draw-tool');
};

const handleFileSelected = (file) => {
  if (file) {
    emit('upload', file);
    nextTick(() => {
      fileInput.value = null;
    });
  }
};

const handleEmojiSelect = (emoji) => {
  emit('add-emoji', emoji);
  activeMenu.value = null;
};

const handleStickerSelect = (sticker) => {
  emit('add-image', sticker);
  activeMenu.value = null;
};

const handleCheckout = () => {
  emit('checkout');
};

const handleLayerUpdate = () => {
};

const handleLayerSelect = (id) => {
  emit('layer-select', id);
};

const undoDrawing = () => {
  emit('undo-drawing');
};

const clearDrawing = () => {
  emit('clear-drawing');
};

const finishDrawing = () => {
  emit('finish-drawing');
  drawToolStore.isActive = false;
  activeMenu.value = null;
};

watch(() => drawToolStore.isActive, (isActive) => {
  // Only auto-open draw menu on desktop, not mobile
  if (!isMobile.value) {
    if (isActive && activeMenu.value !== 'draw') {
      activeMenu.value = 'draw'
    } else if (!isActive && activeMenu.value === 'draw') {
      activeMenu.value = null
    }
  }
})

</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 3px;
}

.scrollbar-track-transparent::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}

* {
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, width;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slide-in {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
.emoji-picker-wrapper :deep(.v3-emoji-picker) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

.emoji-picker-wrapper :deep(.v3-header) {
  padding: 12px 0 !important;
  border-bottom: 1px solid #e5e7eb !important;
  margin-bottom: 12px !important;
}

.emoji-picker-wrapper :deep(.v3-search) {
  background: #f5f5f5 !important;
  border: none !important;
  border-radius: 8px !important;
  padding: 10px 12px !important;
  font-size: 14px !important;
}

.emoji-picker-wrapper :deep(.v3-search:focus) {
  outline: none !important;
  border: 1px solid #a855f7 !important;
}

.emoji-picker-wrapper :deep(.v3-group) {
  padding: 4px 0 !important;
}

.emoji-picker-wrapper :deep(.v3-group-title) {
  font-size: 13px !important;
  font-weight: 600 !important;
  color: #374151 !important;
  padding: 8px 0 !important;
  margin-bottom: 8px !important;
}

.emoji-picker-wrapper :deep(.v3-emoji) {
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
  cursor: pointer !important;
  padding: 8px !important;
}

.emoji-picker-wrapper :deep(.v3-emoji:hover) {
  background: #faf5ff !important;
  transform: scale(1.2) !important;
}

.emoji-picker-wrapper :deep(.v3-tabs) {
  border-top: 1px solid #e5e7eb !important;
  padding-top: 12px !important;
  margin-top: 12px !important;
}

.emoji-picker-wrapper :deep(.v3-tab) {
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}

.emoji-picker-wrapper :deep(.v3-tab:hover) {
  background: #f3f4f6 !important;
}

.emoji-picker-wrapper :deep(.v3-tab-active) {
  background: #faf5ff !important;
}

/* DrawToolbar styles are now in DrawToolbar.vue component */

/* Mobile color picker styling */
input[type="color"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border: none;
  cursor: pointer;
}

input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 6px;
}

input[type="color"]::-moz-color-swatch {
  border: none;
  border-radius: 6px;
}
</style>
