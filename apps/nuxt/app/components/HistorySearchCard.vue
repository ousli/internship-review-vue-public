<script setup lang="ts">
import type { SearchHistoryEntry } from '~/composables/useSearchHistory'
import { ArrowPathIcon, TrashIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  entry: SearchHistoryEntry
  isDeleting?: boolean
}>()

const emit = defineEmits<{
  restart: [query: string]
  delete: [id: number]
}>()

function formatEntryDate(value: string | Date) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'date inconnue'
  return date.toLocaleString('fr-FR')
}

const createdAtLabel = computed(() => formatEntryDate(props.entry.createdAt))
const deleteLabel = computed(() => (props.isDeleting ? 'Suppression...' : 'Supprimer'))

function onRestartClick() {
  emit('restart', props.entry.query)
}

function onDeleteClick() {
  if (props.isDeleting) return
  emit('delete', props.entry.id)
}
</script>

<template>
  <article class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
    <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-blue-700">
          Recherche sauvegardée
        </p>

        <h2 class="mt-2 break-words text-lg font-semibold text-gray-900">
          {{ entry.query }}
        </h2>

        <p class="mt-2 text-sm text-gray-500">Enregistrée le {{ createdAtLabel }}</p>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          @click="onRestartClick"
        >
          <ArrowPathIcon class="h-4 w-4" aria-hidden="true" />
          Relancer la recherche
        </button>

        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isDeleting"
          :aria-busy="isDeleting ? 'true' : 'false'"
          @click="onDeleteClick"
        >
          <TrashIcon class="h-4 w-4" aria-hidden="true" />
          {{ deleteLabel }}
        </button>
      </div>
    </div>
  </article>
</template>
