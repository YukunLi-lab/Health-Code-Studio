'use client'

import { useState } from 'react'
import {
  Heart,
  Sparkles,
  Download,
  Play,
  LayoutDashboard,
  Code2,
  TestTube,
  Package,
  ChevronRight,
  Zap,
  Shield,
  Smartphone,
  Menu,
  X,
  Moon,
  Sun
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useAppStore, useUIStore } from '@/stores/app-store'
import { generateId } from '@/lib/utils'

const AGENT_STEPS = [
  { id: 1, name: 'Research', icon: Sparkles, description: 'Analyzing health guidelines' },
  { id: 2, name: 'Code', icon: Code2, description: 'Generating application' },
  { id: 3, name: 'Test', icon: TestTube, description: 'Running offline tests' },
  { id: 4, name: 'Package', icon: Package, description: 'Building PWA bundle' }
]

const TEMPLATES = [
  {
    id: 'mood-workout',
    name: 'Mood & Workout Tracker',
    description: 'Daily mood logging with AI-powered workout suggestions',
    category: 'Fitness',
    icon: Heart,
    color: 'text-health-emerald'
  },
  {
    id: 'nutrition',
    name: 'Nutrition Planner',
    description: 'Macro tracking with personalized meal plans',
    category: 'Nutrition',
    icon: Zap,
    color: 'text-health-amber'
  },
  {
    id: 'sleep',
    name: 'Sleep Analyzer',
    description: 'Track sleep patterns and get quality insights',
    category: 'Wellness',
    icon: Moon,
    color: 'text-health-blue'
  },
  {
    id: 'meditation',
    name: 'Mindfulness Journal',
    description: 'Guided meditation with mood tracking',
    category: 'Mental Health',
    icon: Sun,
    color: 'text-health-amber'
  },
  {
    id: 'hydration',
    name: 'Hydration Reminder',
    description: 'Smart water tracking with reminders',
    category: 'Wellness',
    icon: Shield,
    color: 'text-health-blue'
  },
  {
    id: 'habits',
    name: 'Habit Streak Tracker',
    description: 'Build lasting habits with streak gamification',
    category: 'Lifestyle',
    icon: Sparkles,
    color: 'text-health-emerald'
  }
]

const FEATURES = [
  {
    title: 'Privacy-First',
    description: 'All data stored locally on your device. No cloud required.',
    icon: Shield
  },
  {
    title: 'AI-Powered',
    description: 'Powered by Ollama for intelligent app generation.',
    icon: Sparkles
  },
  {
    title: 'Offline Ready',
    description: 'Works completely offline as a PWA.',
    icon: Smartphone
  },
  {
    title: 'One-Click Export',
    description: 'Download as desktop app or deploy anywhere.',
    icon: Download
  }
]

export default function HomePage() {
  const [prompt, setPrompt] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const { isGenerating, generationProgress, setIsGenerating, setGenerationProgress, setGenerationStep, resetGeneration, addApp } = useAppStore()
  const { sidebarOpen, toggleSidebar } = useUIStore()

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setGenerationProgress(0)
    setActiveStep(0)

    // Simulate agentic flow
    for (let i = 0; i < AGENT_STEPS.length; i++) {
      setGenerationStep(AGENT_STEPS[i].description)
      setActiveStep(i)

      // Simulate progress within each step
      for (let p = 0; p < 100; p += 20) {
        setGenerationProgress(Math.min(((i * 100 + p) / AGENT_STEPS.length), 100))
        await new Promise((r) => setTimeout(r, 200))
      }
    }

    // Create the app
    const newApp = {
      id: generateId(),
      name: prompt.split(' ').slice(0, 3).join(' ').replace(/^./, (c) => c.toUpperCase()),
      description: `AI-generated ${prompt}`,
      prompt,
      codePath: `/apps/generated/${generateId()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    addApp(newApp)
    resetGeneration()
    setPrompt('')
  }

  const handleTemplateUse = (templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId)
    if (template) {
      setPrompt(`Build me a ${template.name.toLowerCase()} ${template.description.toLowerCase()}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-background via-white to-health-emerald/5">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-health-emerald text-white">
              <Heart className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">HealthCode Studio</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium hover:text-health-emerald transition-colors">Features</a>
            <a href="#templates" className="text-sm font-medium hover:text-health-emerald transition-colors">Templates</a>
            <a href="#docs" className="text-sm font-medium hover:text-health-emerald transition-colors">Docs</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-health-emerald/10 px-4 py-1.5 text-sm font-medium text-health-emerald mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered App Generator
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Build Health Apps with{' '}
            <span className="bg-gradient-to-r from-health-emerald via-health-blue to-health-amber bg-clip-text text-transparent">
              Natural Language
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Describe your dream health app and watch it come to life. Fitness trackers,
            mental health journals, nutrition planners — all powered by AI.
          </p>

          {/* Prompt Input */}
          <div className="relative max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <Input
                type="text"
                placeholder="Build me a daily mood + workout tracker with AI tips..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="h-14 pl-12 pr-32 text-lg rounded-xl border-2 border-health-emerald/20 focus:border-health-emerald transition-colors"
                disabled={isGenerating}
              />
              <Heart className="absolute left-4 h-5 w-5 text-health-emerald" />
              <Button
                size="lg"
                className="absolute right-2 h-10 px-6 health-gradient"
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Generating...
                  </span>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>

            {/* Generation Progress */}
            {isGenerating && (
              <Card className="mt-4 overflow-hidden">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{generationProgress.toFixed(0)}%</span>
                      <span className="text-muted-foreground">{AGENT_STEPS[activeStep]?.description}</span>
                    </div>
                    <Progress value={generationProgress} className="h-2" />
                    <div className="flex justify-between">
                      {AGENT_STEPS.map((step, i) => (
                        <div
                          key={step.id}
                          className={`flex items-center gap-1 text-xs ${
                            i <= activeStep ? 'text-health-emerald' : 'text-muted-foreground'
                          }`}
                        >
                          <step.icon className="h-3 w-3" />
                          {step.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why HealthCode Studio?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-health-emerald/10 flex items-center justify-center mb-4 group-hover:bg-health-emerald/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-health-emerald" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Start with Templates</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Choose from pre-built health app templates or customize them to your needs.
          </p>
        </div>

        <Tabs defaultValue="all" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="fitness">Fitness</TabsTrigger>
            <TabsTrigger value="wellness">Wellness</TabsTrigger>
            <TabsTrigger value="mental">Mental Health</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATES.map((template) => (
              <Card key={template.id} className="group cursor-pointer hover:shadow-md transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`h-10 w-10 rounded-lg bg-current/10 flex items-center justify-center ${template.color}`}>
                      <template.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs text-muted-foreground">{template.category}</span>
                  </div>
                  <CardTitle className="text-base mt-4">{template.name}</CardTitle>
                  <CardDescription className="text-sm">{template.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" className="w-full group-hover:border-health-emerald transition-colors" onClick={() => handleTemplateUse(template.id)}>
                    Use Template
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </TabsContent>

          {['fitness', 'wellness', 'mental'].map((category) => (
            <TabsContent key={category} value={category} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TEMPLATES.filter((t) => t.category.toLowerCase() === category || (category === 'fitness' && t.category === 'Fitness') || (category === 'wellness' && t.category === 'Wellness') || (category === 'mental' && t.category === 'Mental Health')).map((template) => (
                <Card key={template.id} className="group cursor-pointer hover:shadow-md transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`h-10 w-10 rounded-lg bg-current/10 flex items-center justify-center ${template.color}`}>
                        <template.icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs text-muted-foreground">{template.category}</span>
                    </div>
                    <CardTitle className="text-base mt-4">{template.name}</CardTitle>
                    <CardDescription className="text-sm">{template.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="outline" className="w-full group-hover:border-health-emerald transition-colors" onClick={() => handleTemplateUse(template.id)}>
                      Use Template
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* Agentic Flow Demo */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Our AI agent follows a proven workflow to build production-ready health apps.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="grid md:grid-cols-4 gap-4">
            {AGENT_STEPS.map((step, index) => (
              <div key={step.id} className="relative">
                <Card className="text-center h-full">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-health-emerald/10 flex items-center justify-center mb-4">
                        <step.icon className="h-6 w-6 text-health-emerald" />
                      </div>
                      <h3 className="font-semibold mb-2">{step.name}</h3>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </CardContent>
                </Card>
                {index < AGENT_STEPS.length - 1 && (
                  <ChevronRight className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-health-emerald/30 z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-health-emerald text-white">
                <Heart className="h-4 w-4" />
              </div>
              <span className="font-semibold">HealthCode Studio</span>
            </div>
            <p className="text-sm text-muted-foreground">
              MIT License · Built with Next.js, Tauri, and Ollama
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm">Documentation</Button>
              <Button variant="ghost" size="sm">GitHub</Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
