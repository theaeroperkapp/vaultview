import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type { PurchaseRequest, RequestVote } from '@/lib/supabase/types'

interface RequestState {
  requests: PurchaseRequest[]
  votes: Record<string, RequestVote[]> // keyed by request_id
  isLoading: boolean

  setRequests: (requests: PurchaseRequest[]) => void
  addRequest: (request: PurchaseRequest) => void
  updateRequest: (id: string, updates: Partial<PurchaseRequest>) => void
  setVotes: (requestId: string, votes: RequestVote[]) => void
  addVote: (vote: RequestVote) => void
  setLoading: (loading: boolean) => void
}

export const useRequestStore = create<RequestState>((set) => ({
  requests: [],
  votes: {},
  isLoading: true,

  setRequests: (requests) => set({ requests }),

  addRequest: (request) =>
    set((state) => {
      if (state.requests.some((r) => r.id === request.id)) return state
      return { requests: [request, ...state.requests] }
    }),

  updateRequest: (id, updates) =>
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  setVotes: (requestId, votes) =>
    set((state) => ({
      votes: { ...state.votes, [requestId]: votes },
    })),

  addVote: (vote) =>
    set((state) => {
      const existing = state.votes[vote.request_id] || []
      if (existing.some((v) => v.id === vote.id)) return state
      return {
        votes: {
          ...state.votes,
          [vote.request_id]: [...existing, vote],
        },
      }
    }),

  setLoading: (isLoading) => set({ isLoading }),
}))

export function useRequestCounts() {
  return useRequestStore(
    useShallow((s) => ({
      pendingCount: s.requests.filter((r) => r.status === 'pending').length,
    }))
  )
}
