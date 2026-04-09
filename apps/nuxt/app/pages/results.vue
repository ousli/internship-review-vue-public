<script setup lang="ts">
import { FunnelIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import type { Offer } from '~/composables/useOffers'
import { getOffers, searchOffers } from '~/composables/useOffers'
import { addSearchHistoryEntry } from '~/composables/useSearchHistory'
import type { SearchHistoryError } from '~/composables/useSearchHistory'

useSeoMeta({
  title: 'Offres de stage',
  description: 'Recherchez et parcourez les offres de stage disponibles.',
})

const route = useRoute()
const router = useRouter()

const offers = ref<Offer[]>([])
const isLoading = ref(true)
const isError = ref(false)
const errorMessage = ref('')
const saveHistoryErrorMessage = ref('')

const searchInput = ref('')

const currentQuery = computed(() => {
  const q = route.query.q
  return typeof q === 'string' ? q.trim() : ''
})

const hasQuery = computed(() => currentQuery.value.length > 0)

async function loadOffers() {
  isLoading.value = true
  isError.value = false
  errorMessage.value = ''
  saveHistoryErrorMessage.value = ''

  try {
    const q = currentQuery.value
    offers.value = q ? await searchOffers(q) : await getOffers()

    if (!q) return

    try {
      await addSearchHistoryEntry(q)
    } catch (error: unknown) {
      const typedError = error as SearchHistoryError
      saveHistoryErrorMessage.value =
        typedError.error ?? 'Impossible d’enregistrer cette recherche.'
    }
  } catch (error: unknown) {
    const typedError = error as { error?: string }
    isError.value = true
    errorMessage.value = typedError.error ?? 'Impossible de charger les offres.'
  } finally {
    isLoading.value = false
  }
}

function handleSearch(query: string) {
  const q = query.trim()
  router.push(q ? { path: '/results', query: { q } } : { path: '/results' })
}

function clearSearch() {
  router.push({ path: '/results' })
}

watch(
  currentQuery,
  (q) => {
    searchInput.value = q
    loadOffers()
  },
  { immediate: true }
)
</script>

<template>
  <div class="min-h-[calc(100vh-200px)] bg-linear-to-b from-blue-50 to-white">
    <div class="container mx-auto px-4 py-12">
      <div class="mb-10 text-center">
        <h1 class="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">Offres de stage</h1>

        <p v-if="hasQuery" class="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
          Résultats pour
          <span class="font-semibold text-blue-600">“{{ currentQuery }}”</span>
        </p>
        <p v-else class="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
          Toutes les offres disponibles
        </p>

        <div class="mb-6">
          <SearchBar v-model="searchInput" @search="handleSearch" />
        </div>

        <div v-if="hasQuery" class="mb-6 flex justify-center">
          <div
            class="inline-flex items-center gap-3 rounded-full border border-blue-200 bg-blue-50 px-5 py-2.5 shadow-sm"
          >
            <FunnelIcon class="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
            <span class="text-sm font-medium text-blue-900">
              Filtre actif :
              <span class="font-semibold">“{{ currentQuery }}”</span>
            </span>
            <button
              type="button"
              class="rounded-full p-1.5 text-blue-600 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label="Effacer la recherche"
              title="Afficher toutes les offres"
              @click="clearSearch"
            >
              <XMarkIcon class="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          v-if="saveHistoryErrorMessage"
          class="mx-auto mt-4 max-w-2xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          {{ saveHistoryErrorMessage }}
        </div>
      </div>

      <div v-if="isLoading" class="flex items-center justify-center py-20">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="isError" class="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p class="font-medium text-red-800">{{ errorMessage }}</p>
        <button
          type="button"
          class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
          @click="loadOffers"
        >
          Réessayer
        </button>
      </div>

      <div v-else-if="offers.length === 0" class="py-20 text-center">
        <p v-if="hasQuery" class="mb-2 text-lg text-gray-600">
          Aucun résultat pour <span class="font-semibold">“{{ currentQuery }}”</span>
        </p>
        <p v-else class="text-lg text-gray-600">Aucune offre disponible pour le moment.</p>
        <p v-if="hasQuery" class="mt-2 text-sm text-gray-500">
          Essayez d’autres mots-clés ou
          <button
            type="button"
            class="text-blue-600 underline hover:text-blue-700"
            @click="clearSearch"
          >
            affichez toutes les offres
          </button>
        </p>
      </div>

      <div v-else>
        <p class="mb-6 text-center text-sm text-gray-600">
          <span class="font-semibold text-gray-900">{{ offers.length }}</span>
          {{ offers.length === 1 ? 'résultat trouvé' : 'résultats trouvés' }}
        </p>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <OfferCard v-for="offer in offers" :key="offer.id" :offer="offer" />
        </div>
      </div>
    </div>
  </div>
</template>
