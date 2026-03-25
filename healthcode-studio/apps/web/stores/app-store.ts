import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { HealthApp } from '@/lib/db'

interface AppState {
  apps: HealthApp[]
  currentApp: HealthApp | null
  isGenerating: boolean
  generationProgress: number
  generationStep: string
  setApps: (apps: HealthApp[]) => void
  addApp: (app: HealthApp) => void
  removeApp: (id: string) => void
  setCurrentApp: (app: HealthApp | null) => void
  setIsGenerating: (isGenerating: boolean) => void
  setGenerationProgress: (progress: number) => void
  setGenerationStep: (step: string) => void
  resetGeneration: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      apps: [],
      currentApp: null,
      isGenerating: false,
      generationProgress: 0,
      generationStep: '',
      setApps: (apps) => set({ apps }),
      addApp: (app) => set((state) => ({ apps: [...state.apps, app] })),
      removeApp: (id) =>
        set((state) => ({
          apps: state.apps.filter((a) => a.id !== id),
          currentApp: state.currentApp?.id === id ? null : state.currentApp
        })),
      setCurrentApp: (app) => set({ currentApp: app }),
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      setGenerationProgress: (progress) => set({ generationProgress: progress }),
      setGenerationStep: (step) => set({ generationStep: step }),
      resetGeneration: () =>
        set({
          isGenerating: false,
          generationProgress: 0,
          generationStep: ''
        })
    }),
    {
      name: 'healthcode-app-store'
    }
  )
)

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'system',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme })
    }),
    {
      name: 'healthcode-ui-store'
    }
  )
)
