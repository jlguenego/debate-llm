<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <!-- En-tête -->
      <div class="text-center mb-4 sm:mb-8">
        <h1 class="text-2xl sm:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">
          Configuration des débatteurs
        </h1>
        <p class="text-sm sm:text-base text-gray-600">
          Personnalisez les orientations politiques et les prompts de vos
          débatteurs
        </p>
      </div>

      <!-- Configuration des débatteurs -->
      <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700"
                >Débatteur 1</label
              >
              <input
                v-model="debaterConfigs['OpenAI-1'].orientation"
                type="text"
                placeholder="Orientation politique"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 placeholder-gray-400"
              />
              <textarea
                v-model="debaterConfigs['OpenAI-1'].prompt"
                placeholder="Prompt personnalisé"
                rows="4"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 placeholder-gray-400"
              ></textarea>
            </div>
          </div>
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700"
                >Débatteur 2</label
              >
              <input
                v-model="debaterConfigs['OpenAI-2'].orientation"
                type="text"
                placeholder="Orientation politique"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 placeholder-gray-400"
              />
              <textarea
                v-model="debaterConfigs['OpenAI-2'].prompt"
                placeholder="Prompt personnalisé"
                rows="4"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 placeholder-gray-400"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Boutons de navigation -->
      <div class="flex justify-center gap-4">
        <router-link
          to="/"
          class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clip-rule="evenodd"
            />
          </svg>
          Retour au débat
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useDebateStore } from "../stores/debate";

const debateStore = useDebateStore();
const debaterConfigs = ref(debateStore.debaterConfigs);

// Mettre à jour le store lorsque les configurations changent
watch(
  debaterConfigs,
  (newConfigs) => {
    Object.entries(newConfigs).forEach(([debater, config]) => {
      debateStore.updateDebaterConfig(
        debater as "OpenAI-1" | "OpenAI-2",
        config
      );
    });
  },
  { deep: true }
);
</script>
