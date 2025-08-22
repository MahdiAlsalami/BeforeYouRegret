"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  AlertTriangle,
  Shield,
  Edit3,
  Brain,
  Gauge,
  MessageSquare,
  Copy,
  Check,
  X,
  Loader2,
  ArrowLeft,
} from "lucide-react"

interface AnalysisResult {
  misinterpretations: Array<{
    interpretation: string
    likelihood: "low" | "medium" | "high"
    reason: string
  }>
  futureRegretRisk: {
    score: number
    reasons: string[]
    timeframe: string
  }
  saferRewrites: Array<{
    version: string
    tone: string
    changes: string
  }>
  detectedTone: string
  detectedStyle: string
  contextualRisks: string[]
}

export default function AnalyzePage() {
  const [text, setText] = useState("")
  const [context, setContext] = useState("general")
  const [preserveTone, setPreserveTone] = useState(true)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const { toast } = useToast()

  const MAX_CHARS = 2000
  const isOverLimit = text.length > MAX_CHARS

  const handleAnalyze = async () => {
    if (!text.trim() || isOverLimit) return

    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, context, preserveTone }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Analysis failed")
      }

      const result = await response.json()
      setAnalysis(result)
      toast({
        title: "Analysis Complete",
        description: "Your text has been analyzed successfully.",
      })
    } catch (error) {
      console.error("Analysis error:", error)
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCopyRewrite = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      toast({
        title: "Copied!",
        description: "Rewrite copied to clipboard.",
      })
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  const handleClear = () => {
    setText("")
    setAnalysis(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      handleAnalyze()
    }
  }

  const getRiskColor = (score: number) => {
    if (score < 30) return "text-green-600"
    if (score < 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getLikelihoodColor = (likelihood: string) => {
    switch (likelihood) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Link>
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-secondary" />
                <span className="text-lg font-semibold text-foreground">Analyzer</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2 animate-in fade-in duration-500">
          <h1 className="text-3xl font-bold text-foreground">Analyze Your Message</h1>
          <p className="text-muted-foreground">Get AI-powered insights before you post</p>
        </div>

        {/* Input Section */}
        <Card className="animate-in slide-in-from-bottom duration-500 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              What are you about to post?
            </CardTitle>
            <CardDescription>
              Paste your text below and we'll analyze it for potential misinterpretations and future regret risks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Textarea
                placeholder="Type or paste your message here... (Ctrl/Cmd + Enter to analyze)"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`min-h-32 resize-none transition-colors ${
                  isOverLimit ? "border-destructive focus:border-destructive" : ""
                }`}
              />
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                <span className={isOverLimit ? "text-destructive" : ""}>
                  {text.length}/{MAX_CHARS}
                </span>
              </div>
            </div>

            {isOverLimit && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                Text exceeds {MAX_CHARS} character limit
              </div>
            )}

            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Label htmlFor="preserve-tone">Preserve tone</Label>
                <Switch id="preserve-tone" checked={preserveTone} onCheckedChange={setPreserveTone} />
              </div>

              <div className="flex items-center space-x-2">
                <Label htmlFor="context">Context:</Label>
                <Select value={context} onValueChange={setContext}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="work">Work/Professional</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="personal">Personal/Family</SelectItem>
                    <SelectItem value="dating">Dating/Romance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAnalyze} disabled={!text.trim() || isAnalyzing || isOverLimit} className="flex-1">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Before Posting"
                )}
              </Button>
              {text && (
                <Button variant="outline" onClick={handleClear}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {analysis && (
          <div className="animate-in slide-in-from-bottom duration-700">
            <Tabs defaultValue="misinterpretations" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="misinterpretations">Misinterpretations</TabsTrigger>
                <TabsTrigger value="regret-risk">Regret Risk</TabsTrigger>
                <TabsTrigger value="rewrites">Safer Rewrites</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="misinterpretations">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Potential Misinterpretations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysis.misinterpretations.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No significant misinterpretation risks detected!</p>
                      </div>
                    ) : (
                      analysis.misinterpretations.map((item, index) => (
                        <div
                          key={index}
                          className="border border-border rounded-lg p-4 space-y-2 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Scenario {index + 1}</h4>
                            <Badge className={getLikelihoodColor(item.likelihood)}>{item.likelihood} likelihood</Badge>
                          </div>
                          <p className="text-foreground">{item.interpretation}</p>
                          <p className="text-sm text-muted-foreground">{item.reason}</p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="regret-risk">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gauge className="h-5 w-5" />
                      Future Regret Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div
                        className={`text-6xl font-bold ${getRiskColor(analysis.futureRegretRisk.score)} animate-in zoom-in duration-500`}
                      >
                        {analysis.futureRegretRisk.score}%
                      </div>
                      <p className="text-muted-foreground">Risk Score</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Timeframe: {analysis.futureRegretRisk.timeframe}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Risk Factors:</h4>
                      <ul className="space-y-1">
                        {analysis.futureRegretRisk.reasons.map((reason, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-destructive mt-1">•</span>
                            <span className="text-foreground">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rewrites">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Edit3 className="h-5 w-5" />
                      Safer Alternatives
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysis.saferRewrites.map((rewrite, index) => (
                      <div
                        key={index}
                        className="border border-border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Version {index + 1}</h4>
                          <Badge variant="outline">{rewrite.tone}</Badge>
                        </div>
                        <div className="bg-muted p-3 rounded border-l-4 border-secondary relative group">
                          <p className="text-foreground pr-8">{rewrite.version}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleCopyRewrite(rewrite.version, index)}
                          >
                            {copiedIndex === index ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <strong>Changes:</strong> {rewrite.changes}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="hover:shadow-md transition-shadow border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        Style Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Detected Tone:</Label>
                        <p className="text-foreground">{analysis.detectedTone}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Writing Style:</Label>
                        <p className="text-foreground">{analysis.detectedStyle}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Contextual Risks
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analysis.contextualRisks.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                          <p className="text-sm">No contextual risks identified</p>
                        </div>
                      ) : (
                        <ul className="space-y-2">
                          {analysis.contextualRisks.map((risk, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-orange-500 mt-1">⚠</span>
                              <span className="text-foreground text-sm">{risk}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {!analysis && !isAnalyzing && text.trim() && (
          <Card className="border-dashed border-border">
            <CardContent className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">Ready to analyze your text</p>
              <p className="text-sm text-muted-foreground">Click "Analyze Before Posting" or press Ctrl/Cmd + Enter</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
