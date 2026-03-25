import { openDB, type IDBPDatabase } from 'idb'

export interface HealthApp {
  id: string
  name: string
  description: string
  prompt: string
  codePath: string
  createdAt: string
  updatedAt: string
}

export interface AppData {
  id: string
  appId: string
  data: Record<string, unknown>
  createdAt: string
}

export interface SyncQueueItem {
  id: string
  operation: 'create' | 'update' | 'delete'
  payload: Record<string, unknown>
  status: 'pending' | 'synced' | 'failed'
  createdAt: string
}

const DB_NAME = 'healthcode-studio'
const DB_VERSION = 1

let dbInstance: IDBPDatabase | null = null

export async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Apps store
      if (!db.objectStoreNames.contains('apps')) {
        const appStore = db.createObjectStore('apps', { keyPath: 'id' })
        appStore.createIndex('name', 'name')
        appStore.createIndex('createdAt', 'createdAt')
      }

      // App data store
      if (!db.objectStoreNames.contains('appData')) {
        const dataStore = db.createObjectStore('appData', { keyPath: 'id' })
        dataStore.createIndex('appId', 'appId')
        dataStore.createIndex('createdAt', 'createdAt')
      }

      // Sync queue store
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' })
        syncStore.createIndex('status', 'status')
        syncStore.createIndex('createdAt', 'createdAt')
      }

      // Templates cache store
      if (!db.objectStoreNames.contains('templates')) {
        const templateStore = db.createObjectStore('templates', { keyPath: 'id' })
        templateStore.createIndex('category', 'category')
      }
    }
  })

  return dbInstance
}

// Apps CRUD
export async function saveApp(app: HealthApp): Promise<void> {
  const db = await getDB()
  await db.put('apps', app)
}

export async function getApp(id: string): Promise<HealthApp | undefined> {
  const db = await getDB()
  return db.get('apps', id)
}

export async function getAllApps(): Promise<HealthApp[]> {
  const db = await getDB()
  return db.getAll('apps')
}

export async function deleteApp(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('apps', id)
  // Also delete associated data
  const tx = db.transaction('appData', 'readwrite')
  const index = tx.store.index('appId')
  const keys = await index.getAllKeys(id)
  for (const key of keys) {
    await tx.store.delete(key)
  }
  await tx.done
}

// App Data CRUD
export async function saveAppData(data: AppData): Promise<void> {
  const db = await getDB()
  await db.put('appData', data)
  // Add to sync queue
  await addToSyncQueue({
    id: crypto.randomUUID(),
    operation: 'create',
    payload: data,
    status: 'pending',
    createdAt: new Date().toISOString()
  })
}

export async function getAppData(appId: string): Promise<AppData[]> {
  const db = await getDB()
  return db.getAllFromIndex('appData', 'appId', appId)
}

export async function deleteAppData(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('appData', id)
}

// Sync Queue
export async function addToSyncQueue(item: SyncQueueItem): Promise<void> {
  const db = await getDB()
  await db.put('syncQueue', item)
}

export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  const db = await getDB()
  return db.getAllFromIndex('syncQueue', 'status', 'pending')
}

export async function markSyncComplete(id: string): Promise<void> {
  const db = await getDB()
  const item = await db.get('syncQueue', id)
  if (item) {
    item.status = 'synced'
    await db.put('syncQueue', item)
  }
}

// Templates Cache
export async function cacheTemplates(templates: Array<{
  id: string
  name: string
  description: string
  category: string
  codeTemplate: string
  previewImage?: string
  downloads: number
  rating: number
}>): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('templates', 'readwrite')
  for (const template of templates) {
    await tx.store.put(template)
  }
  await tx.done
}

export async function getCachedTemplates(): Promise<Array<{
  id: string
  name: string
  description: string
  category: string
  codeTemplate: string
  previewImage?: string
  downloads: number
  rating: number
}>> {
  const db = await getDB()
  return db.getAll('templates')
}

// Clear all data (for testing/reset)
export async function clearAllData(): Promise<void> {
  const db = await getDB()
  await db.clear('apps')
  await db.clear('appData')
  await db.clear('syncQueue')
  await db.clear('templates')
}
