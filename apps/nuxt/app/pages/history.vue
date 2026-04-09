<script setup lang="ts">
import { ClockIcon } from '@heroicons/vue/24/outline'

useSeoMeta({
  title: 'Historique des recherches',
  description: 'Consultez et relancez les recherches enregistrées.',
})

const router = useRouter()
const { entries, isLoading, isDeleting, errorMessage, fetchSearchHistory, removeEntry } =
  useSearchHistory()

onMounted(() => {
  fetchSearchHistory()
})

function handleRestartSearch(query: string) {
  router.push({
    path: '/results',
    query: { q: query },
  })
}

async function handleDeleteEntry(id: number) {
  await removeEntry(id)
}
</script>

<template>
  <div class="min-h-[calc(100vh-200px)] bg-linear-to-b from-gray-50 to-white">
    <div class="container mx-auto px-4 py-12">
      <div class="mx-auto max-w-4xl">
        <div class="mb-10 text-center">
          <div class="mb-4 flex justify-center">
            <ClockIcon class="h-12 w-12 text-blue-600" aria-hidden="true" />
          </div>
          <h1 class="text-4xl font-bold text-gray-900">Historique des recherches</h1>
          <p class="mt-4 text-lg text-gray-600">
            Retrouvez vos dernières recherches et relancez-les en un clic.
          </p>
        </div>

        <div v-if="isLoading" class="flex justify-center py-20">
          <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>

        <div
          v-else-if="errorMessage"
          class="rounded-lg border border-red-200 bg-red-50 p-6 text-center"
        >
          <p class="font-medium text-red-800">{{ errorMessage }}</p>
          <button
            type="button"
            class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
            @click="fetchSearchHistory"
          >
            Réessayer
          </button>
        </div>

        <div
          v-else-if="entries.length === 0"
          class="rounded-xl bg-white p-10 text-center shadow-sm"
        >
          <p class="text-lg font-medium text-gray-700">
            Aucune recherche n’a encore été enregistrée.
          </p>
          <p class="mt-2 text-sm text-gray-500">
            Lancez une recherche depuis la page des offres pour voir l’historique ici.
          </p>
        </div>

        <div v-else class="space-y-4">
          <p class="text-sm text-gray-500">
            {{ entries.length }}
            {{ entries.length === 1 ? 'recherche enregistrée' : 'recherches enregistrées' }}
          </p>

          <HistorySearchCard
            v-for="entry in entries"
            :key="entry.id"
            :entry="entry"
            :is-deleting="isDeleting"
            @restart="handleRestartSearch"
            @delete="handleDeleteEntry"
          />
        </div>
      </div>
    </div>
  </div>
</template>
