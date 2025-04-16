<template>
  <div class="w-full min-h-screen bg-gray-50">
    <div class="w-fullmax-w-4xl mx-auto sm:px-6 py-4 sm:py-6">
      <!-- En-tête -->
      <div class="text-center mb-4 sm:mb-8 px-4">
        <h1 class="text-2xl sm:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">
          Débat entre LLM
        </h1>
        <p class="text-sm sm:text-base text-gray-600">
          Créez un débat entre deux modèles de langage sur un sujet de votre
          choix
        </p>
      </div>

      <!-- Zone de contrôle -->
      <div
        class="sticky top-0 sm:top-6 z-10 bg-white shadow-sm p-4 sm:p-6 mb-4 sm:mb-8"
      >
        <div class="space-y-3 sm:space-y-4">
          <div>
            <label
              for="debate-topic"
              class="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
            >
              Sujet du débat
            </label>
            <div class="relative">
              <input
                id="debate-topic"
                v-model="debateTopic"
                type="text"
                placeholder="Ex: Les avantages et inconvénients de l'intelligence artificielle"
                :disabled="isDebateActive"
                @keyup.enter="startDebate"
                class="w-full px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 placeholder-gray-400 transition-colors duration-200"
              />
              <div
                v-if="isDebateActive"
                class="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <span class="text-green-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 sm:h-5 sm:w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 sm:gap-3 pt-2">
            <button
              v-if="!isDebateActive"
              @click="startDebate"
              :disabled="!debateTopic"
              class="w-[calc(50%-0.25rem)] sm:w-[calc(33.333%-0.5rem)] px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="truncate">Démarrer</span>
            </button>
            <button
              v-else
              @click="continueDebate"
              :disabled="isLoading"
              class="w-[calc(50%-0.25rem)] sm:w-[calc(33.333%-0.5rem)] px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
            >
              <svg
                v-if="isLoading"
                class="animate-spin h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="truncate">{{
                isLoading ? "Chargement..." : "Continuer"
              }}</span>
            </button>
            <button
              @click="resetDebate"
              :disabled="isLoading"
              class="w-[calc(50%-0.25rem)] sm:w-[calc(33.333%-0.5rem)] px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="truncate">Réinitialiser</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Zone de débat -->
      <div class="flex flex-col gap-4">
        <div
          v-for="(message, index) in debateStore.messages"
          :key="index"
          class="bg-white rounded-xl shadow-sm p-4 sm:p-6"
          :class="{
            'border-l-4 border-green-500': message.sender === 'OpenAI-1',
            'border-l-4 border-blue-500': message.sender === 'OpenAI-2',
          }"
        >
          <div class="flex justify-between items-center mb-2 sm:mb-3">
            <div class="flex items-center gap-2 min-w-0">
              <span
                class="text-xs sm:text-sm font-medium text-gray-900 truncate"
                >{{ message.sender }}</span
              >
              <span
                class="text-[10px] sm:text-xs text-gray-500 bg-gray-100 px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap"
              >
                {{ message.timestamp }}
              </span>
            </div>
          </div>
          <div class="prose prose-sm sm:prose max-w-none text-gray-700">
            {{ message.content }}
          </div>
        </div>

        <!-- Message en cours de génération -->
        <div
          v-if="debateStore.isLoading"
          class="bg-white rounded-xl shadow-sm p-4 sm:p-6"
          :class="{
            'border-l-4 border-green-500':
              debateStore.currentSpeaker === 'OpenAI-1',
            'border-l-4 border-blue-500':
              debateStore.currentSpeaker === 'OpenAI-2',
          }"
        >
          <div class="flex justify-between items-center mb-2 sm:mb-3">
            <div class="flex items-center gap-2 min-w-0">
              <span
                class="text-xs sm:text-sm font-medium text-gray-900 truncate"
                >{{ debateStore.currentSpeaker }}</span
              >
              <span
                class="text-[10px] sm:text-xs text-gray-500 bg-gray-100 px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap"
              >
                {{ new Date().toLocaleTimeString() }}
              </span>
            </div>
          </div>
          <div class="prose prose-sm sm:prose max-w-none text-gray-700">
            {{ debateStore.currentMessage }}
            <span class="animate-pulse">▋</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useDebateStore } from "../stores/debate";

const debateStore = useDebateStore();
const debateTopic = ref("");
const isDebateActive = computed(() => debateStore.isActive);
const isLoading = computed(() => debateStore.isLoading);
const currentSpeaker = computed(() => debateStore.currentSpeaker);

const startDebate = async () => {
  if (!debateTopic.value.trim()) return;
  await debateStore.startDebate(debateTopic.value);
};

const continueDebate = async () => {
  await debateStore.continueDebate();
};

const resetDebate = () => {
  debateStore.stopDebate();
  debateTopic.value = "";
};
</script>
