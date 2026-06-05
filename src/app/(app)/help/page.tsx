'use client'

import { useState, useEffect, useMemo } from 'react'
import { useHelpStore, type HelpArticle } from '@/stores/help-store'
import { useUIStore } from '@/stores/ui-store'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Search, RefreshCw, BookOpen, Clock, WifiOff,
  ChevronRight, ChevronLeft, Loader2, Tag,
  Rocket, FileText, Users, LayoutTemplate,
  Settings, Wrench, CircleHelp, Sparkles,
  AlertTriangle, ArrowLeft
} from 'lucide-react'

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  'getting-started': { label: 'Getting Started', icon: Rocket, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  'prescriptions': { label: 'Prescriptions', icon: FileText, color: 'text-primary bg-primary-50 border-primary-100' },
  'patients': { label: 'Patients', icon: Users, color: 'text-violet-600 bg-violet-50 border-violet-100' },
  'templates': { label: 'Templates', icon: LayoutTemplate, color: 'text-amber-600 bg-amber-50 border-amber-100' },
  'settings': { label: 'Settings', icon: Settings, color: 'text-slate-600 bg-slate-100 border-slate-200' },
  'troubleshooting': { label: 'Troubleshooting', icon: Wrench, color: 'text-rose-600 bg-rose-50 border-rose-100' },
  'general': { label: 'General', icon: CircleHelp, color: 'text-teal-dark bg-teal-50 border-teal-100' },
}

function getCategoryConfig(cat: string) {
  return CATEGORY_CONFIG[cat] || {
    label: cat.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    icon: CircleHelp,
    color: 'text-slate-600 bg-slate-100 border-slate-200'
  }
}

function formatDate(ts: number | null) {
  if (!ts) return 'Never synced'
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return 'Synced just now'
  if (diff < 3600000) return `Synced ${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `Synced ${Math.floor(diff / 3600000)}h ago`
  return `Synced ${d.toLocaleDateString()}`
}

function readingTime(text: string) {
  const words = text.trim().split(/\s+/).length
  const mins = Math.ceil(words / 200)
  return mins < 1 ? '< 1 min read' : `${mins} min read`
}

function ArticleContent({ article }: { article: HelpArticle }) {
  const lines = article.content.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: string[] = []
  let inList = false

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc pl-5 space-y-1.5 my-4 marker:text-slate-300">
          {listItems.map((item, i) => (
            <li key={i} className="text-sm text-slate-600 leading-relaxed">{item}</li>
          ))}
        </ul>
      )
      listItems = []
      inList = false
    }
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (!trimmed) {
      flushList()
      elements.push(<div key={`br-${idx}`} className="h-3" />)
      return
    }
    if (trimmed.startsWith('# ')) {
      flushList()
      elements.push(
        <h1 key={idx} className="text-xl font-extrabold text-slate-900 mt-8 mb-4 tracking-tight">
          {trimmed.slice(2)}
        </h1>
      )
      return
    }
    if (trimmed.startsWith('## ')) {
      flushList()
      elements.push(
        <h2 key={idx} className="text-base font-bold text-slate-800 mt-6 mb-3 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-primary" />
          {trimmed.slice(3)}
        </h2>
      )
      return
    }
    if (trimmed.startsWith('### ')) {
      flushList()
      elements.push(
        <h3 key={idx} className="text-sm font-bold text-slate-700 mt-5 mb-2 uppercase tracking-wide">
          {trimmed.slice(4)}
        </h3>
      )
      return
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listItems.push(trimmed.slice(2))
      inList = true
      return
    }
    if (inList) {
      flushList()
    }
    let text = trimmed
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-900">$1</strong>')
      .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 bg-slate-100 rounded-md text-xs font-mono text-primary-dark border border-slate-200">$1</code>')
    elements.push(
      <p key={idx} className="text-sm text-slate-600 leading-[1.7] my-3" dangerouslySetInnerHTML={{ __html: text }} />
    )
  })

  flushList()
  return <div className="max-w-none">{elements}</div>
}

export default function HelpPage() {
  const { articles, loading, error, lastSyncAt, loadFromStorage, fetchArticles, getCategories, getArticlesByCategory, searchArticles } = useHelpStore()
  const { addToast } = useUIStore()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null)

  useEffect(() => {
    loadFromStorage()
    fetchArticles()
  }, [loadFromStorage, fetchArticles])

  const categories = useMemo(() => getCategories(), [articles])
  const displayedArticles = useMemo(() => {
    if (search.trim()) return searchArticles(search)
    if (selectedCategory) return getArticlesByCategory(selectedCategory)
    return articles
  }, [search, selectedCategory, articles, searchArticles, getArticlesByCategory])

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-[240px] bg-white border-r border-border flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-light to-teal flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">Help Center</h1>
          </div>
          <p className="text-[0.7rem] text-slate-400 font-medium ml-[42px]">{formatDate(lastSyncAt)}</p>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelectedCategory(null) }}
              placeholder="Search articles..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-bg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-100 transition-all"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {!search.trim() && (
            <div className="space-y-0.5">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2.5',
                  selectedCategory === null
                    ? 'bg-primary-50 text-primary font-bold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Sparkles className="w-3.5 h-3.5" />
                All Articles
                <span className={cn(
                  'ml-auto text-[0.65rem] px-1.5 py-0.5 rounded-full',
                  selectedCategory === null ? 'bg-primary-100 text-primary-dark' : 'bg-slate-100 text-slate-400'
                )}>
                  {articles.length}
                </span>
              </button>
              {categories.map((cat) => {
                const cfg = getCategoryConfig(cat)
                const count = getArticlesByCategory(cat).length
                const isActive = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2.5',
                      isActive
                        ? 'bg-primary-50 text-primary font-bold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    <cfg.icon className="w-3.5 h-3.5" />
                    <span className="flex-1 truncate">{cfg.label}</span>
                    <span className={cn(
                      'text-[0.65rem] px-1.5 py-0.5 rounded-full',
                      isActive ? 'bg-primary-100 text-primary-dark' : 'bg-slate-100 text-slate-400'
                    )}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {articles.length === 0 && !loading && (
            <div className="text-center py-8 px-2">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                <WifiOff className="w-5 h-5 text-slate-300" />
              </div>
              <p className="text-xs text-slate-400 font-medium">No cached articles</p>
              <button
                onClick={() => fetchArticles()}
                className="mt-2 text-xs text-primary font-semibold hover:underline"
              >
                Sync from cloud
              </button>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 pb-3">
            <div className="p-3 rounded-lg bg-danger-50 border border-red-100 text-xs text-danger flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold">Sync failed</p>
                <p className="opacity-80 truncate">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Sync button */}
        <div className="p-4 border-t border-border">
          <button
            onClick={() => { fetchArticles(); addToast('Help articles refreshed', 'success') }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-bg border border-border text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
            {loading ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto bg-bg min-w-0">
        {selectedArticle ? (
          <div className="max-w-3xl mx-auto p-8">
            {/* Back button */}
            <button
              onClick={() => setSelectedArticle(null)}
              className="group flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors mb-5"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Back to articles
            </button>

            {/* Article card */}
            <Card className="overflow-hidden">
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-border">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {(() => {
                    const cfg = getCategoryConfig(selectedArticle.category)
                    return (
                      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.65rem] font-bold border uppercase tracking-wider', cfg.color)}>
                        <cfg.icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    )
                  })()}
                  {selectedArticle.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {selectedArticle.title}
                </h1>
                <div className="flex items-center gap-3 mt-3 text-[0.7rem] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {readingTime(selectedArticle.content)}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span>Updated {new Date(selectedArticle.updated_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-6">
                <ArticleContent article={selectedArticle} />
              </div>
            </Card>
          </div>
        ) : (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              {/* Page header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {search.trim() ? `Search: "${search}"` : selectedCategory ? getCategoryConfig(selectedCategory).label : 'All Articles'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {displayedArticles.length} article{displayedArticles.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3 h-3" /> All categories
                  </button>
                )}
              </div>

              {/* States */}
              {loading && articles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  </div>
                  <p className="text-sm text-slate-400 font-medium">Loading articles...</p>
                </div>
              ) : displayedArticles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-semibold text-slate-500">
                    {search.trim() ? 'No matching articles' : 'No articles yet'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {search.trim() ? 'Try a different search term' : 'Articles will appear after syncing'}
                  </p>
                </div>
              ) : (
                /* Article grid */
                <div className="grid grid-cols-1 gap-3">
                  {displayedArticles.map((article) => {
                    const cfg = getCategoryConfig(article.category)
                    return (
                      <button
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className="group text-left bg-white border border-border rounded-xl p-5 hover:border-primary-light hover:shadow-md hover:-translate-y-0.5 transition-all relative overflow-hidden"
                      >
                        {/* Gradient top bar on hover */}
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-teal opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex items-start gap-4">
                          {/* Category icon */}
                          <div className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border',
                            cfg.color
                          )}>
                            <cfg.icon className="w-4 h-4" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                                {article.title}
                              </h3>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                              {article.content.replace(/#/g, '').replace(/\*\*/g, '').replace(/`/g, '').slice(0, 180).trim()}...
                            </p>
                            <div className="flex items-center gap-3 mt-3">
                              <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-bold border', cfg.color)}>
                                {cfg.label}
                              </span>
                              {article.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="text-[0.7rem] text-slate-400 font-medium">
                                  #{tag}
                                </span>
                              ))}
                              {article.tags.length > 2 && (
                                <span className="text-[0.7rem] text-slate-400 font-medium">+{article.tags.length - 2}</span>
                              )}
                              <span className="ml-auto text-[0.7rem] text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {readingTime(article.content)}
                              </span>
                            </div>
                          </div>

                          {/* Arrow */}
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
