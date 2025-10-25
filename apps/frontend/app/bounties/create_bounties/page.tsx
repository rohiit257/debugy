"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, FormEvent } from "react"
import { ArrowLeft, Bug, DollarSign, Calendar, FileText, Tag } from "lucide-react"
import Link from "next/link"

export default function CreateBountyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    reward: "",
    deadline: "",
  })

  // Redirect if not organizer
  if (status === "authenticated" && session?.user?.role !== "ORG") {
    router.push("/")
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validate form
      if (!formData.title || !formData.description || !formData.category || !formData.reward || !formData.deadline) {
        setError("Please fill in all required fields")
        setLoading(false)
        return
      }

      // Call bounties service API
      const response = await fetch("http://localhost:8001/bounties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          reward: parseFloat(formData.reward),
          deadline: new Date(formData.deadline).toISOString(),
          orgId: session?.user?.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.details || "Failed to create bounty")
      }

      const result = await response.json()
      console.log("Bounty created:", result)

      // Redirect to bounties page on success
      router.push("/bounties")
    } catch (err: any) {
      setError(err.message || "Failed to create bounty")
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#A7EF9E] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/bounties"
            className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Bounties
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-white">Create New Bounty</h1>
          <p className="mt-2 text-sm text-white/60">Set up a new bug bounty program for security researchers</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
              <Bug className="h-4 w-4 text-[#A7EF9E]" />
              Bounty Title
              <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Critical XSS Vulnerability in Payment Gateway"
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#A7EF9E]/30 focus:outline-none focus:ring-2 focus:ring-[#A7EF9E]/20"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
              <FileText className="h-4 w-4 text-[#A7EF9E]" />
              Description
              <span className="text-red-400">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed information about the bounty, scope, requirements, and any specific guidelines..."
              required
              rows={6}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#A7EF9E]/30 focus:outline-none focus:ring-2 focus:ring-[#A7EF9E]/20"
            />
            <p className="mt-1 text-xs text-white/40">Be as detailed as possible to attract quality submissions</p>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
              <Tag className="h-4 w-4 text-[#A7EF9E]" />
              Category
              <span className="text-red-400">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-[#A7EF9E]/30 focus:outline-none focus:ring-2 focus:ring-[#A7EF9E]/20"
            >
              <option value="" className="bg-black">Select a category</option>
              <option value="XSS" className="bg-black">Cross-Site Scripting (XSS)</option>
              <option value="SQL Injection" className="bg-black">SQL Injection</option>
              <option value="CSRF" className="bg-black">Cross-Site Request Forgery (CSRF)</option>
              <option value="Authentication" className="bg-black">Authentication & Authorization</option>
              <option value="API Security" className="bg-black">API Security</option>
              <option value="Cryptography" className="bg-black">Cryptography</option>
              <option value="Business Logic" className="bg-black">Business Logic</option>
              <option value="IDOR" className="bg-black">Insecure Direct Object Reference (IDOR)</option>
              <option value="File Upload" className="bg-black">File Upload Vulnerabilities</option>
              <option value="SSRF" className="bg-black">Server-Side Request Forgery (SSRF)</option>
              <option value="XXE" className="bg-black">XML External Entity (XXE)</option>
              <option value="RCE" className="bg-black">Remote Code Execution (RCE)</option>
              <option value="Other" className="bg-black">Other</option>
            </select>
          </div>

          {/* Reward */}
          <div>
            <label htmlFor="reward" className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
              <DollarSign className="h-4 w-4 text-[#A7EF9E]" />
              Reward (USD)
              <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">$</span>
              <input
                type="number"
                id="reward"
                name="reward"
                value={formData.reward}
                onChange={handleChange}
                placeholder="5000"
                required
                min="0"
                step="0.01"
                className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-8 pr-4 text-white placeholder:text-white/40 focus:border-[#A7EF9E]/30 focus:outline-none focus:ring-2 focus:ring-[#A7EF9E]/20"
              />
            </div>
            <p className="mt-1 text-xs text-white/40">Set a competitive reward to attract skilled researchers</p>
          </div>

          {/* Deadline */}
          <div>
            <label htmlFor="deadline" className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
              <Calendar className="h-4 w-4 text-[#A7EF9E]" />
              Deadline
              <span className="text-red-400">*</span>
            </label>
            <input
              type="datetime-local"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              required
              min={new Date().toISOString().slice(0, 16)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-[#A7EF9E]/30 focus:outline-none focus:ring-2 focus:ring-[#A7EF9E]/20"
            />
            <p className="mt-1 text-xs text-white/40">When should submissions close?</p>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg border border-[#A7EF9E]/20 bg-[#A7EF9E]/10 px-6 py-3 font-medium text-[#A7EF9E] transition-all hover:bg-[#A7EF9E]/20 hover:border-[#A7EF9E]/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#A7EF9E] border-t-transparent" />
                  Creating...
                </span>
              ) : (
                "Create Bounty"
              )}
            </button>
            <Link
              href="/bounties"
              className="rounded-lg border border-white/10 bg-white/5 px-6 py-3 font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
