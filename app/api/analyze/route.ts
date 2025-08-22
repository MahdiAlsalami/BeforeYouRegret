import { type NextRequest, NextResponse } from "next/server"
import { groq } from "@ai-sdk/groq"
import { generateObject } from "ai"
import { z } from "zod"

const analysisSchema = z.object({
  misinterpretations: z.array(
    z.object({
      interpretation: z.string(),
      likelihood: z.enum(["low", "medium", "high"]),
      reason: z.string(),
    }),
  ),
  futureRegretRisk: z.object({
    score: z.number().min(0).max(100),
    reasons: z.array(z.string()),
    timeframe: z.string(),
  }),
  saferRewrites: z.array(
    z.object({
      version: z.string(),
      tone: z.string(),
      changes: z.string(),
    }),
  ),
  detectedTone: z.string(),
  detectedStyle: z.string(),
  contextualRisks: z.array(z.string()),
})

export async function POST(request: NextRequest) {
  try {
    const { text, context = "general", preserveTone = true } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const prompt = `Analyze this text for potential regret and misinterpretation risks:

"${text}"

Context: ${context}
Preserve original tone: ${preserveTone}

Provide:
1. Potential misinterpretations (3-5 realistic scenarios with likelihood)
2. Future regret risk assessment (0-100 score with specific reasons)
3. 2-3 safer rewrites that ${preserveTone ? "maintain the original tone but" : ""} reduce risk
4. Detected tone and writing style
5. Contextual risks specific to the platform/situation

Be practical and helpful, not overly cautious. Focus on genuine communication risks.`

    const result = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      schema: analysisSchema,
    })

    return NextResponse.json(result.object)
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze text" }, { status: 500 })
  }
}
