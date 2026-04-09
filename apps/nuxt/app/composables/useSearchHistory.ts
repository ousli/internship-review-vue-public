export interface SearchHistoryEntry {
  id: number
  query: string
  createdAt: string
}

export interface SearchHistoryError {
  error: string
  status?: number
}

const toSearchHistoryError = (err: unknown, fallback: string): SearchHistoryError => {
  const e = err as { data?: { error?: string }; statusCode?: number }
  return {
    error: e?.data?.error || (err instanceof Error ? err.message : fallback),
    status: e?.statusCode,
  }
}

const getBaseUrl = () => {
  const { public: publicConfig } = useRuntimeConfig()
  return `${String(publicConfig.apiBase).replace(/\/$/, '')}/searchHistory`
}

export const getSearchHistory = async (): Promise<SearchHistoryEntry[]> => {
  try {
    const res = await $fetch<SearchHistoryEntry[]>(`${getBaseUrl()}?_sort=createdAt&_order=desc`)
    return Array.isArray(res) ? res : []
  } catch (err) {
    throw toSearchHistoryError(err, "Impossible de charger l'historique")
  }
}

export const addSearchHistoryEntry = async (query: string): Promise<SearchHistoryEntry> => {
  const cleanQuery = query.trim()
  if (!cleanQuery) {
    throw { error: 'La recherche ne peut pas être vide', status: 400 }
  }

  try {
    return await $fetch<SearchHistoryEntry>(getBaseUrl(), {
      method: 'POST',
      body: {
        query: cleanQuery,
        createdAt: new Date().toISOString(),
      },
    })
  } catch (err) {
    throw toSearchHistoryError(err, "Impossible d'enregistrer la recherche")
  }
}

export const deleteSearchHistoryEntry = async (id: number): Promise<void> => {
  if (!Number.isFinite(id) || id <= 0) return

  try {
    await $fetch(`${getBaseUrl()}/${id}`, { method: 'DELETE' })
  } catch (err) {
    throw toSearchHistoryError(err, 'Impossible de supprimer cette entrée')
  }
}

export const useSearchHistory = () => {
  const entries = useState<SearchHistoryEntry[]>('search-history-entries', () => [])
  const isLoading = useState('search-history-loading', () => false)
  const isDeleting = useState('search-history-deleting', () => false)
  const errorMessage = useState('search-history-error-message', () => '')

  const fetchSearchHistory = async () => {
    isLoading.value = true
    errorMessage.value = ''
    try {
      entries.value = await getSearchHistory()
    } catch (err) {
      errorMessage.value = (err as SearchHistoryError).error
    } finally {
      isLoading.value = false
    }
  }

  const removeEntry = async (id: number) => {
    isDeleting.value = true
    errorMessage.value = ''
    try {
      await deleteSearchHistoryEntry(id)
      entries.value = entries.value.filter((entry) => entry.id !== id)
    } catch (err) {
      errorMessage.value = (err as SearchHistoryError).error
    } finally {
      isDeleting.value = false
    }
  }

  return { entries, isLoading, isDeleting, errorMessage, fetchSearchHistory, removeEntry }
}
