"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Send, Loader2 } from "lucide-react"

interface FormData {
  name: string
  email: string
  subject: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

export function ContactForm() {
  const { toast } = useToast()
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address"
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required"
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required"
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const analyzeSentiment = (text: string): string => {
    const urgentWords = ["urgent", "asap", "immediately", "emergency", "critical"]
    const projectWords = ["project", "build", "develop", "create", "collaborate"]
    const questionWords = ["question", "ask", "inquiry", "wondering", "curious"]

    const lowerText = text.toLowerCase()

    if (urgentWords.some((word) => lowerText.includes(word))) {
      return "Detected urgency - I recommend using WhatsApp for faster response"
    }
    if (projectWords.some((word) => lowerText.includes(word))) {
      return "Great! Project inquiries usually get a response within 24 hours"
    }
    if (questionWords.some((word) => lowerText.includes(word))) {
      return "Happy to help! General questions are answered within 24-48 hours"
    }

    return "Thanks for reaching out! I'll respond within 24-48 hours"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call - replace with actual EmailJS or API implementation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const sentiment = analyzeSentiment(formData.message)

      toast({
        title: "Message Sent Successfully! 🎉",
        description: sentiment,
      })

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again or use email directly.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  return (
    <div className="glass p-8 rounded-2xl border border-border">
      <h3 className="text-2xl font-bold mb-6">Send a Message</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Your Name *
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email Address *
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email}</p>
          )}
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-2">
            Subject *
          </label>
          <Input
            id="subject"
            name="subject"
            type="text"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Project Inquiry"
            className={errors.subject ? "border-destructive" : ""}
          />
          {errors.subject && (
            <p className="text-sm text-destructive mt-1">{errors.subject}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            Message *
          </label>
          <Textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell me about your project or inquiry..."
            rows={6}
            className={errors.message ? "border-destructive" : ""}
          />
          {errors.message && (
            <p className="text-sm text-destructive mt-1">{errors.message}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {formData.message.length} characters
          </p>
        </div>

        {/* AI Sentiment Analysis Preview */}
        {formData.message.length > 20 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 glass rounded-lg border border-emerald/50"
          >
            <p className="text-sm text-emerald">
              💡 {analyzeSentiment(formData.message)}
            </p>
          </motion.div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="emerald"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </>
          )}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground text-center mt-6">
        Your information is secure and will never be shared with third parties
      </p>
    </div>
  )
}
