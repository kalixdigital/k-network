// components/contact/ContactForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, CheckCircle, AlertCircle } from "lucide-react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to send message");

      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-white mb-2">Send us a Message</h2>
      <p className="text-sm text-slate-400 mb-6">
        Fill in the form below and we'll get back to you as soon as possible.
      </p>

      {success && (
        <div className="mb-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span>Message sent successfully! We'll respond within 24 hours.</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-slate-300">Full Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-slate-300">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>

        <div>
          <Label htmlFor="subject" className="text-slate-300">Subject</Label>
          <Input
            id="subject"
            name="subject"
            type="text"
            placeholder="What is this about?"
            value={formData.subject}
            onChange={handleChange}
            required
            className="mt-1 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>

        <div>
          <Label htmlFor="message" className="text-slate-300">Message</Label>
          <Textarea
            id="message"
            name="message"
            placeholder="Tell us how we can help..."
            value={formData.message}
            onChange={handleChange}
            required
            rows={5}
            className="mt-1 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 resize-none"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {loading ? (
            "Sending..."
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}