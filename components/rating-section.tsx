"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Star, ThumbsUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function RatingSection() {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Please select a rating",
        description: "We'd love to know what you think!",
        variant: "destructive",
      })
      return
    }

    // Here you would typically send to your analytics/database
    console.log("[v0] Rating submitted:", { rating, feedback })

    setSubmitted(true)
    toast({
      title: "Thank you for your feedback!",
      description: "Your rating helps us improve the experience.",
    })
  }

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto border-secondary/20 bg-secondary/5">
        <CardContent className="pt-6">
          <div className="text-center">
            <ThumbsUp className="h-12 w-12 text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Thank You!</h3>
            <p className="text-muted-foreground">
              Your feedback helps us make "Before You Regret It" better for everyone.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto border-secondary/20 hover:border-secondary/40 transition-colors">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Rate Your Experience</CardTitle>
        <CardDescription>Help us improve by sharing your thoughts about "Before You Regret It"</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">How would you rate this website?</p>
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="transition-colors hover:scale-110 transform duration-200"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating) ? "fill-secondary text-secondary" : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {rating === 1 && "We'd love to improve!"}
              {rating === 2 && "Thanks for the feedback!"}
              {rating === 3 && "Good to know!"}
              {rating === 4 && "Great to hear!"}
              {rating === 5 && "Awesome! Thank you!"}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="feedback" className="text-sm font-medium text-foreground">
            Additional feedback (optional)
          </label>
          <Textarea
            id="feedback"
            placeholder="Tell us what you think about the website, features you'd like to see, or any suggestions..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>

        <Button onClick={handleSubmit} className="w-full bg-secondary hover:bg-secondary/90" size="lg">
          Submit Rating
        </Button>
      </CardContent>
    </Card>
  )
}
