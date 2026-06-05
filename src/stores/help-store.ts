'use client'

import { create } from 'zustand'

const HELP_API_URL = process.env.NEXT_PUBLIC_HELP_API_URL || 'https://prescribo.app'
const STORAGE_KEY = 'prescribo_help_articles'
const STORAGE_TS_KEY = 'prescribo_help_articles_ts'

export interface HelpArticle {
  id: number
  title: string
  slug: string
  content: string
  category: string
  tags: string[]
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

interface HelpState {
  articles: HelpArticle[]
  loading: boolean
  error: string | null
  lastSyncAt: number | null
  setArticles: (articles: HelpArticle[]) => void
  loadFromStorage: () => void
  fetchArticles: () => Promise<void>
  getCategories: () => string[]
  getArticlesByCategory: (category: string) => HelpArticle[]
  searchArticles: (query: string) => HelpArticle[]
}

export const useHelpStore = create<HelpState>((set, get) => ({
  articles: [],
  loading: false,
  error: null,
  lastSyncAt: null,

  setArticles: (articles) => {
    set({ articles, lastSyncAt: Date.now(), error: null })
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(articles))
      localStorage.setItem(STORAGE_TS_KEY, String(Date.now()))
    }
  },

  loadFromStorage: () => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const ts = localStorage.getItem(STORAGE_TS_KEY)
      if (raw) {
        const articles = JSON.parse(raw) as HelpArticle[]
        set({ articles, lastSyncAt: ts ? Number(ts) : null })
      }
    } catch (e) {
      console.warn('Failed to load help articles from storage:', e)
    }
  },

  fetchArticles: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${HELP_API_URL}/api/help-articles`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || body.detail || `HTTP ${res.status}`)
      }
      const data = await res.json()
      const articles: HelpArticle[] = data.help_articles || []
      if (articles.length === 0) {
        throw new Error('No published articles found on server.')
      }
      get().setArticles(articles)
    } catch (err: any) {
      console.warn('Failed to fetch help articles:', err.message)
      set({ error: err.message || 'Failed to sync' })
    } finally {
      set({ loading: false })
    }
  },

  getCategories: () => {
    const cats = new Set<string>()
    get().articles.forEach((a) => cats.add(a.category))
    return Array.from(cats).sort()
  },

  getArticlesByCategory: (category) => {
    return get().articles
      .filter((a) => a.category === category)
      .sort((a, b) => a.sort_order - b.sort_order)
  },

  searchArticles: (query) => {
    const q = query.toLowerCase()
    return get().articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    )
  },
}))
