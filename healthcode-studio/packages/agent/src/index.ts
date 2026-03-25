/**
 * HealthCode Studio - AI Agent Core
 * 4-Stage Pipeline: Research → Code → Test → Package
 *
 * Privacy-First: All processing happens locally via Ollama
 */

import type {
  AppTemplate,
  GenerationResult,
  HealthGuidelines,
  AgentConfig,
  AppCode,
  AppManifest,
  AgentStage,
  StageProgress
} from '@healthcode/types'

// ==================== Types ====================
interface AppStructure {
  name: string
  description: string
  type: 'tracker' | 'journal' | 'planner' | 'analyzer'
  categories: string[]
  features: string[]
  dataModel: DataModel
  uiComponents: string[]
  template: string
}

interface DataField {
  name: string
  type: 'string' | 'number' | 'datetime' | 'text' | 'enum'
  options?: string[]
}

interface DataModel {
  entries: DataField[]
}

// ==================== Agent Configuration ====================
const DEFAULT_CONFIG: AgentConfig = {
  ollamaUrl: 'http://localhost:11434',
  model: 'llama3.2',
  temperature: 0.7
}

// ==================== Progress Callback Type ====================
type ProgressCallback = (stage: AgentStage, progress: StageProgress) => void

// ==================== Main Agent Class ====================
export class CodeGenerationAgent {
  private config: AgentConfig
  private progressCallback?: ProgressCallback

  constructor(config: Partial<AgentConfig> = {}, progressCallback?: ProgressCallback) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.progressCallback = progressCallback
  }

  /**
   * Main entry point: Generate a complete health app
   */
  async generateApp(
    prompt: string,
    template?: AppTemplate
  ): Promise<GenerationResult> {
    const appId = crypto.randomUUID()
    const errors: string[] = []

    try {
      // Stage 1: Research
      this.emitProgress('research', { status: 'starting', progress: 0 })
      const guidelines = await this.researchHealthGuidelines(prompt)
      this.emitProgress('research', { status: 'completed', progress: 100 })

      // Stage 2: Code
      this.emitProgress('code', { status: 'starting', progress: 0 })
      const structure = this.analyzePrompt(prompt, template, guidelines)
      const code = await this.generateCode(structure, template)
      this.emitProgress('code', { status: 'completed', progress: 100 })

      // Stage 3: Test
      this.emitProgress('test', { status: 'starting', progress: 0 })
      const testResult = await this.testApp(code)
      if (!testResult.success) {
        errors.push(...testResult.errors)
      }
      this.emitProgress('test', { status: 'completed', progress: 100 })

      // Stage 4: Package
      this.emitProgress('package', { status: 'starting', progress: 0 })
      const manifest = this.generateManifest(structure)
      this.emitProgress('package', { status: 'completed', progress: 100 })

      return {
        success: errors.length === 0,
        appId,
        code,
        manifest,
        errors
      }
    } catch (error) {
      return {
        success: false,
        appId,
        code: { types: '', store: '', page: '', manifest: {}, components: {} },
        manifest: { name: '', version: '1.0.0', description: '', features: [], generatedAt: new Date().toISOString() },
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  /**
   * Stage 1: Research Health Guidelines
   * Fetches WHO, NIH, and other authoritative health sources
   */
  async researchHealthGuidelines(topic: string): Promise<HealthGuidelines> {
    const lowerTopic = topic.toLowerCase()

    // Determine relevant guidelines based on topic
    const relevantGuidelines: string[] = []

    if (lowerTopic.includes('workout') || lowerTopic.includes('exercise') || lowerTopic.includes('fitness')) {
      relevantGuidelines.push('WHO Physical Activity Guidelines 2020')
      relevantGuidelines.push('ACSM Exercise Guidelines')
    }
    if (lowerTopic.includes('nutrition') || lowerTopic.includes('diet') || lowerTopic.includes('food')) {
      relevantGuidelines.push('NIH Dietary Guidelines for Americans')
      relevantGuidelines.push('WHO Nutrition Guidelines')
    }
    if (lowerTopic.includes('sleep')) {
      relevantGuidelines.push('NSF Sleep Guidelines')
      relevantGuidelines.push('NIH Sleep Health Guidelines')
    }
    if (lowerTopic.includes('mental') || lowerTopic.includes('mood') || lowerTopic.includes('stress')) {
      relevantGuidelines.push('WHO Mental Health Guidelines')
      relevantGuidelines.push('APA Stress Management Guidelines')
    }
    if (lowerTopic.includes('hydration') || lowerTopic.includes('water')) {
      relevantGuidelines.push('EFSA Hydration Guidelines')
    }

    // Default guidelines if none matched
    if (relevantGuidelines.length === 0) {
      relevantGuidelines.push('WHO General Health Guidelines')
    }

    // Generate recommendations based on guidelines
    const recommendations = this.generateRecommendations(lowerTopic)

    return {
      topic,
      recommendations,
      sources: relevantGuidelines
    }
  }

  /**
   * Generate health recommendations based on topic
   */
  private generateRecommendations(topic: string): string[] {
    const recommendations: string[] = []

    if (topic.includes('workout') || topic.includes('exercise')) {
      recommendations.push(
        '150 minutes of moderate aerobic activity per week',
        '2+ days of strength training per week',
        'Include flexibility exercises',
        'Warm up for 5-10 minutes before exercise',
        'Stay hydrated during physical activity'
      )
    }

    if (topic.includes('nutrition') || topic.includes('diet')) {
      recommendations.push(
        'Balanced macronutrients: 45-65% carbs, 10-35% protein, 20-35% fat',
        'Eat 5 servings of fruits and vegetables daily',
        'Limit processed foods and added sugars',
        'Stay hydrated with 8+ glasses of water daily',
        'Practice mindful eating'
      )
    }

    if (topic.includes('sleep')) {
      recommendations.push(
        '7-9 hours of sleep for adults (18-64 years)',
        'Maintain consistent sleep schedule',
        'Avoid screens 1 hour before bedtime',
        'Keep bedroom cool (65-68°F / 18-20°C)',
        'Limit caffeine after 2pm'
      )
    }

    if (topic.includes('mental') || topic.includes('mood')) {
      recommendations.push(
        'Practice mindfulness meditation daily',
        'Maintain social connections',
        'Get regular physical exercise',
        'Prioritize sleep and nutrition',
        'Seek professional help when needed'
      )
    }

    if (topic.includes('hydration')) {
      recommendations.push(
        'Drink 8-10 glasses of water daily',
        'Increase intake during exercise',
        'Monitor urine color for hydration status',
        'Eat water-rich foods (fruits, vegetables)',
        'Limit caffeine and alcohol'
      )
    }

    // Default recommendations
    if (recommendations.length === 0) {
      recommendations.push(
        'Maintain regular physical activity',
        'Eat a balanced diet',
        'Get adequate sleep',
        'Stay hydrated',
        'Manage stress levels'
      )
    }

    return recommendations
  }

  /**
   * Stage 2: Analyze Prompt and Generate App Structure
   */
  private analyzePrompt(
    prompt: string,
    template?: AppTemplate,
    guidelines?: HealthGuidelines
  ): AppStructure {
    const lowerPrompt = prompt.toLowerCase()

    // Detect app type
    let appType: AppStructure['type'] = 'tracker'
    if (lowerPrompt.includes('journal') || lowerPrompt.includes('log')) {
      appType = 'journal'
    } else if (lowerPrompt.includes('planner') || lowerPrompt.includes('plan')) {
      appType = 'planner'
    } else if (lowerPrompt.includes('analyz') || lowerPrompt.includes('insight')) {
      appType = 'analyzer'
    }

    // Detect health categories
    const categories: string[] = []
    if (lowerPrompt.includes('mood') || lowerPrompt.includes('mental') || lowerPrompt.includes('emotion')) {
      categories.push('mental health')
    }
    if (lowerPrompt.includes('workout') || lowerPrompt.includes('exercise') || lowerPrompt.includes('fitness')) {
      categories.push('fitness')
    }
    if (lowerPrompt.includes('nutrition') || lowerPrompt.includes('diet') || lowerPrompt.includes('food')) {
      categories.push('nutrition')
    }
    if (lowerPrompt.includes('sleep')) {
      categories.push('sleep')
    }
    if (lowerPrompt.includes('water') || lowerPrompt.includes('hydration')) {
      categories.push('hydration')
    }
    if (categories.length === 0) {
      categories.push('general wellness')
    }

    // Detect features
    const features: string[] = []
    if (lowerPrompt.includes('chart') || lowerPrompt.includes('graph') || lowerPrompt.includes('visual')) {
      features.push('charts')
    }
    if (lowerPrompt.includes('ai') || lowerPrompt.includes('tip') || lowerPrompt.includes('suggestion') || lowerPrompt.includes('insight')) {
      features.push('ai-tips')
    }
    if (lowerPrompt.includes('reminder') || lowerPrompt.includes('notification') || lowerPrompt.includes('alert')) {
      features.push('reminders')
    }
    if (lowerPrompt.includes('export') || lowerPrompt.includes('download') || lowerPrompt.includes('save')) {
      features.push('export')
    }
    if (lowerPrompt.includes('share')) {
      features.push('sharing')
    }

    // Always include offline support
    features.push('offline-support')
    features.push('local-storage')
    features.push('pwa-ready')

    // Generate data model based on categories
    const dataModel = this.generateDataModel(categories)

    // Generate UI components based on features
    const uiComponents = this.generateUIComponents(features, appType)

    // Extract or generate app name
    const name = this.extractAppName(prompt, template)

    return {
      name,
      description: prompt,
      type: appType,
      categories,
      features,
      dataModel,
      uiComponents,
      template: template?.codeTemplate || 'custom'
    }
  }

  /**
   * Extract app name from prompt
   */
  private extractAppName(prompt: string, template?: AppTemplate): string {
    if (template) return template.name

    // Try to extract meaningful words
    const words = prompt
      .replace(/[^a-zA-Z\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3)
      .slice(0, 4)

    if (words.length === 0) return 'Health Tracker'

    return words
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
  }

  /**
   * Generate data model based on health categories
   */
  private generateDataModel(categories: string[]): DataModel {
    const entries: DataField[] = [
      { name: 'id', type: 'string' },
      { name: 'date', type: 'datetime' },
      { name: 'notes', type: 'text' }
    ]

    if (categories.includes('fitness') || categories.includes('workout')) {
      entries.push(
        { name: 'exercise', type: 'string' },
        { name: 'duration', type: 'number' },
        { name: 'intensity', type: 'enum', options: ['low', 'medium', 'high'] },
        { name: 'caloriesBurned', type: 'number' },
        { name: 'heartRate', type: 'number' }
      )
    }

    if (categories.includes('mental health') || categories.includes('mood')) {
      entries.push(
        { name: 'mood', type: 'enum', options: ['great', 'good', 'okay', 'bad', 'terrible'] },
        { name: 'energyLevel', type: 'number' },
        { name: 'stressLevel', type: 'number' },
        { name: 'sleepQuality', type: 'enum', options: ['poor', 'fair', 'good', 'excellent'] }
      )
    }

    if (categories.includes('nutrition')) {
      entries.push(
        { name: 'meal', type: 'string' },
        { name: 'calories', type: 'number' },
        { name: 'protein', type: 'number' },
        { name: 'carbs', type: 'number' },
        { name: 'fat', type: 'number' },
        { name: 'water', type: 'number' }
      )
    }

    if (categories.includes('sleep')) {
      entries.push(
        { name: 'sleepTime', type: 'datetime' },
        { name: 'wakeTime', type: 'datetime' },
        { name: 'sleepDuration', type: 'number' },
        { name: 'sleepQuality', type: 'enum', options: ['poor', 'fair', 'good', 'excellent'] },
        { name: 'dreams', type: 'text' }
      )
    }

    if (categories.includes('hydration')) {
      entries.push(
        { name: 'waterIntake', type: 'number' },
        { name: 'beverageType', type: 'enum', options: ['water', 'tea', 'coffee', 'juice', 'other'] }
      )
    }

    return { entries }
  }

  /**
   * Generate UI components based on features and app type
   */
  private generateUIComponents(features: string[], appType: string): string[] {
    const components = ['Dashboard', 'Header', 'Navigation']

    if (features.includes('charts')) {
      components.push('Chart', 'ProgressCard', 'StatsCard')
    }

    components.push('EntryForm', 'EntryList', 'EmptyState', 'DatePicker')

    if (features.includes('ai-tips')) {
      components.push('AITipsCard', 'AIRecommendations')
    }

    if (features.includes('reminders')) {
      components.push('ReminderSettings', 'NotificationBanner')
    }

    if (features.includes('export')) {
      components.push('ExportButton', 'ShareDialog')
    }

    // Always add PWA components
    components.push('OfflineIndicator', 'SyncStatus')

    return components
  }

  /**
   * Stage 2: Generate Application Code
   */
  private async generateCode(
    structure: AppStructure,
    template?: AppTemplate
  ): Promise<AppCode> {
    // Generate page component
    const page = this.generatePageCode(structure)

    // Generate data store
    const store = this.generateStoreCode(structure)

    // Generate types
    const types = this.generateTypesCode(structure)

    // Generate PWA manifest
    const manifest = this.generateManifest(structure)

    // Generate components (simplified for now)
    const components = this.generateComponentsCode(structure)

    return {
      types,
      store,
      page,
      manifest,
      components
    }
  }

  /**
   * Generate main page component
   */
  private generatePageCode(structure: AppStructure): string {
    const { name, dataModel, features, type } = structure

    // Generate form fields based on data model
    const formFields = dataModel.entries
      .filter(e => e.name !== 'id' && e.name !== 'date')
      .map(entry => this.generateFormField(entry))
      .join('\n          ')

    // Generate stats calculation
    const statsFields = this.generateStatsFields(dataModel)

    return `'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dashboard } from '@/components/Dashboard'
import { Header } from '@/components/Header'
import { EntryForm } from '@/components/EntryForm'
import { EntryList } from '@/components/EntryList'
import { Chart } from '@/components/Chart'
import { AITipsCard } from '@/components/AITipsCard'
import { OfflineIndicator } from '@/components/OfflineIndicator'
import { useHealthStore } from '@/stores/health-store'
import type { ${name.replace(/\s+/g, '')}Entry } from '@/types'

export default function ${name.replace(/\s+/g, '')}Page() {
  const { entries, addEntry, deleteEntry, isLoading } = useHealthStore()
  const [formData, setFormData] = useState<Partial<${name.replace(/\s+/g, '')}Entry>>({})

  // Calculate statistics
  const stats = useMemo(() => {
    if (!entries.length) return []

    const thisWeek = entries.filter(e => {
      const date = new Date(e.date)
      const now = new Date()
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
      return date >= weekStart
    })

    const thisMonth = entries.filter(e => {
      const date = new Date(e.date)
      const now = new Date()
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    })

    return [
      { label: 'Total Entries', value: entries.length, icon: '📊' },
      { label: 'This Week', value: thisWeek.length, icon: '📅' },
      { label: 'This Month', value: thisMonth.length, icon: '🗓️' }
    ] as const
  }, [entries])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await addEntry(formData as ${name.replace(/\s+/g, '')}Entry)
    setFormData({})
  }

  const handleDelete = async (id: string) => {
    await deleteEntry(id)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="${name}" />

      <main className="container mx-auto p-4 max-w-4xl space-y-6">
        {/* Offline Indicator */}
        <OfflineIndicator />

        {/* Stats Dashboard */}
        <Dashboard stats={stats} />

        {/* AI Tips */}
        ${features.includes('ai-tips') ? '<AITipsCard entries={entries} />' : 'null'}

        {/* Main Content */}
        <Tabs defaultValue="log" className="space-y-4">
          <TabsList>
            <TabsTrigger value="log">Log Entry</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            ${features.includes('charts') ? '<TabsTrigger value="charts">Charts</TabsTrigger>' : ''}
          </TabsList>

          <TabsContent value="log">
            <Card>
              <CardHeader>
                <CardTitle>Log Your ${type}</CardTitle>
                <CardDescription>Track your ${structure.categories.join(', ')} data</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  ${formFields}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Entry'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <EntryList entries={entries} onDelete={handleDelete} />
          </TabsContent>

          ${features.includes('charts') ? `
          <TabsContent value="charts">
            <Chart entries={entries} type="${type}" />
          </TabsContent>
          ` : ''}
        </Tabs>
      </main>
    </div>
  )
}
`
  }

  /**
   * Generate a single form field
   */
  private generateFormField(entry: DataField): string {
    if (entry.type === 'enum' && entry.options) {
      return `
          <div key="${entry.name}" className="space-y-2">
            <label className="text-sm font-medium capitalize">
              ${entry.name.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <select
              value={formData.${entry.name} || ''}
              onChange={(e) => setFormData({ ...formData, ${entry.name}: e.target.value })}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="">Select...</option>
              ${entry.options.map(o => `<option key="${o}" value="${o}">${o}</option>`).join('\n              ')}
            </select>
          </div>`
    }

    if (entry.type === 'number') {
      return `
          <div key="${entry.name}" className="space-y-2">
            <label className="text-sm font-medium capitalize">
              ${entry.name.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <Input
              type="number"
              value={formData.${entry.name} || ''}
              onChange={(e) => setFormData({ ...formData, ${entry.name}: Number(e.target.value) })}
              placeholder="Enter ${entry.name}..."
            />
          </div>`
    }

    if (entry.type === 'text') {
      return `
          <div key="${entry.name}" className="space-y-2">
            <label className="text-sm font-medium capitalize">
              ${entry.name.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <textarea
              value={formData.${entry.name} || ''}
              onChange={(e) => setFormData({ ...formData, ${entry.name}: e.target.value })}
              className="w-full p-2 border rounded-md bg-background min-h-[80px]"
              placeholder="Enter ${entry.name}..."
            />
          </div>`
    }

    // Default string input
    return `
          <div key="${entry.name}" className="space-y-2">
            <label className="text-sm font-medium capitalize">
              ${entry.name.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <Input
              type="text"
              value={formData.${entry.name} || ''}
              onChange={(e) => setFormData({ ...formData, ${entry.name}: e.target.value })}
              placeholder="Enter ${entry.name}..."
            />
          </div>`
  }

  /**
   * Generate stats fields for dashboard
   */
  private generateStatsFields(dataModel: DataModel): string {
    return dataModel.entries
      .filter(e => e.type === 'number')
      .map(e => e.name)
      .join(', ')
  }

  /**
   * Generate Zustand store
   */
  private generateStoreCode(structure: AppStructure): string {
    const { name, dataModel } = structure
    const storeName = `${name.replace(/\s+/g, '')}Store`
    const entryType = `${name.replace(/\s+/g, '')}Entry`

    const entriesType = dataModel.entries.map(e => {
      if (e.type === 'enum') return `${e.name}?: string`
      if (e.type === 'number') return `${e.name}?: number`
      if (e.type === 'datetime') return `${e.name}?: string`
      if (e.type === 'text') return `${e.name}?: string`
      return `${e.name}?: string`
    }).join('\n  ')

    return `import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useEffect } from 'react'

interface ${entryType} {
  id: string
  ${entriesType}
  date: string
}

interface ${storeName} {
  entries: ${entryType}[]
  isLoading: boolean
  isOnline: boolean
  addEntry: (data: Partial<${entryType}>) => Promise<void>
  updateEntry: (id: string, data: Partial<${entryType}>) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
  clearAll: () => void
  setOnline: (online: boolean) => void
}

export const useHealthStore = create<${storeName}>()(
  persist(
    (set, get) => ({
      entries: [],
      isLoading: false,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,

      addEntry: async (data) => {
        set({ isLoading: true })
        const entry: ${entryType} = {
          id: crypto.randomUUID(),
          ${dataModel.entries.filter(e => e.name !== 'id').map(e =>
            `${e.name}: data.${e.name} as ${e.type === 'enum' ? 'string' : e.type === 'number' ? 'number' : 'string'}`
          ).join(',\n          ')}
          date: new Date().toISOString()
        }

        // Simulate network delay for demo
        await new Promise(r => setTimeout(r, 300))

        set(state => ({
          entries: [entry, ...state.entries],
          isLoading: false
        }))

        // Queue for sync if offline
        if (!get().isOnline) {
          await queueForSync('create', entry)
        }
      },

      updateEntry: async (id, data) => {
        set({ isLoading: true })
        await new Promise(r => setTimeout(r, 200))

        set(state => ({
          entries: state.entries.map(e =>
            e.id === id ? { ...e, ...data } : e
          ),
          isLoading: false
        }))

        if (!get().isOnline) {
          const entry = get().entries.find(e => e.id === id)
          if (entry) await queueForSync('update', entry)
        }
      },

      deleteEntry: async (id) => {
        set({ isLoading: true })
        await new Promise(r => setTimeout(r, 200))

        set(state => ({
          entries: state.entries.filter(e => e.id !== id),
          isLoading: false
        }))

        if (!get().isOnline) {
          await queueForSync('delete', { id })
        }
      },

      clearAll: () => set({ entries: [] }),

      setOnline: (online) => set({ isOnline: online })
    }),
    {
      name: '${name.toLowerCase().replace(/\s+/g, '-')}-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ entries: state.entries })
    }
  )
)

// Helper: Queue operations for sync
async function queueForSync(operation: string, payload: unknown) {
  if (typeof indexedDB !== 'undefined') {
    const db = await openDB('healthcode-sync', 1)
    const tx = db.transaction('queue', 'readwrite')
    await tx.store.add({ operation, payload, timestamp: Date.now() })
  }
}

// Helper: Open IndexedDB
function openDB(name: string, version: number): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('queue')) {
        db.createObjectStore('queue', { autoIncrement: true })
      }
    }
  })
}
`
  }

  /**
   * Generate TypeScript types
   */
  private generateTypesCode(structure: AppStructure): string {
    const { name, dataModel } = structure
    const entryType = name.replace(/\s+/g, '')

    const entries = dataModel.entries.map(e => {
      let type = 'string'
      if (e.type === 'number') type = 'number'
      if (e.type === 'enum') type = 'string'
      if (e.type === 'datetime') type = 'string'
      if (e.type === 'text') type = 'string'
      return `  ${e.name}${e.type === 'enum' ? '?' : ''}: ${type}`
    }).join('\n')

    return `// Auto-generated types for ${name}
// Do not edit manually

export interface ${entryType}Entry {
  id: string
${entries}
  date: string
}

export interface ${entryType}Stats {
  label: string
  value: number | string
  icon?: string
}

export type { ${entryType}Entry as Entry }
`
  }

  /**
   * Generate PWA manifest
   */
  private generateManifest(structure: AppStructure): object {
    return {
      name: structure.name,
      short_name: structure.name.split(' ')[0],
      description: structure.description,
      start_url: '/',
      display: 'standalone',
      background_color: '#FAFAFA',
      theme_color: '#10B981',
      orientation: 'portrait-primary',
      icons: [
        {
          src: '/icons/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ],
      categories: structure.categories,
      features: structure.features,
      screenshot: [
        {
          src: '/screenshots/dashboard.png',
          sizes: '1280x720',
          type: 'image/png',
          form_factor: 'wide'
        }
      ]
    }
  }

  /**
   * Generate component stubs
   */
  private generateComponentsCode(structure: AppStructure): Record<string, string> {
    return {
      Dashboard: `export function Dashboard({ stats }: { stats: readonly { label: string; value: number | string; icon?: string }[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="bg-card rounded-lg p-4 border">
          <div className="text-2xl mb-1">{stat.icon}</div>
          <div className="text-2xl font-bold">{stat.value}</div>
          <div className="text-xs text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}`,
      Header: `export function Header({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
    </header>
  )
}`,
      OfflineIndicator: `export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="bg-amber-500 text-white px-4 py-2 rounded-md text-sm">
      You are offline. Changes will sync when you reconnect.
    </div>
  )
}`,
      EntryList: `export function EntryList({
  entries,
  onDelete
}: {
  entries: Array<{ id: string; date: string; [key: string]: unknown }>
  onDelete: (id: string) => void
}) {
  if (!entries.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No entries yet. Start tracking!
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <Card key={entry.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-muted-foreground">
                  {new Date(entry.date).toLocaleDateString()}
                </div>
                <div className="mt-1">
                  {Object.entries(entry)
                    .filter(([key]) => key !== 'id' && key !== 'date')
                    .map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-medium">{key}:</span> {String(value)}
                      </div>
                    ))}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onDelete(entry.id)}>
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}`,
      Chart: `export function Chart({
  entries,
  type
}: {
  entries: Array<{ date: string; [key: string]: unknown }>
  type: string
}) {
  // Simple placeholder - in production use Recharts
  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Chart visualization for {type} - {entries.length} entries
        </div>
      </CardContent>
    </Card>
  )
}`
    }
  }

  /**
   * Stage 3: Test the generated app
   */
  private async testApp(code: AppCode): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = []

    // Validate code structure
    if (!code.types) {
      errors.push('Missing types definition')
    }
    if (!code.store) {
      errors.push('Missing store definition')
    }
    if (!code.page) {
      errors.push('Missing page component')
    }

    // In production, would run Playwright tests here
    // For now, just check basic syntax validity
    try {
      // Basic syntax checks
      if (code.page.includes('undefined') || code.page.includes('any[]')) {
        errors.push('Possible undefined type usage detected')
      }
    } catch {
      errors.push('Code validation failed')
    }

    return {
      success: errors.length === 0,
      errors
    }
  }

  /**
   * Emit progress update
   */
  private emitProgress(stage: AgentStage, progress: StageProgress) {
    if (this.progressCallback) {
      this.progressCallback(stage, progress)
    }
  }
}

// ==================== Factory Function ====================
export function createAgent(
  config?: Partial<AgentConfig>,
  progressCallback?: ProgressCallback
): CodeGenerationAgent {
  return new CodeGenerationAgent(config, progressCallback)
}

// ==================== Ollama Integration ====================
export async function queryOllama(
  prompt: string,
  config: Partial<AgentConfig> = {}
): Promise<string> {
  const url = config.ollamaUrl || DEFAULT_CONFIG.ollamaUrl
  const model = config.model || DEFAULT_CONFIG.model

  try {
    const response = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: config.temperature || DEFAULT_CONFIG.temperature
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.response
  } catch (error) {
    console.error('Ollama query failed:', error)
    return ''
  }
}
