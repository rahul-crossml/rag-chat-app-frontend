"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Send, Upload } from "lucide-react"

export default function ChatbotInterface() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState(null)
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null)
  const fileInputRef = useRef(null)

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files && event.target.files[0]
    if (!selectedFile) return
    setFile(selectedFile)

    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      setUploadedFileUrl(data.fileUrl)
      console.log("Uploaded file URL:", data.fileUrl)
    } catch (error) {
      console.error("Upload error:", error.message)
    }
  }

  const handleInputChange = (e) => setInput(e.target.value)

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!input.trim() && !uploadedFileUrl) return

    const userMessage = { id: Date.now(), role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const queryParams = new URLSearchParams({
        
        input,
        ...(uploadedFileUrl && { uploadedFileUrl }),
      })

      console.log(input)
      const res = await fetch(`http://localhost:5000/chat?query=${encodeURIComponent(input)}`)


      if (!res.ok) {
        throw new Error("Chat API failed")
      }

      const data = await res.json()
      const botMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.message || "No response from AI",
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Chat error:", error.message)
    } finally {
      setInput("")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Upload UI */}
        <div className="sticky top-4 z-10 mb-6">
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Upload PDF Document</span>
              </div>
              <Button onClick={triggerFileUpload} variant="outline" size="sm" className="gap-2">
                <Upload className="h-4 w-4" />
                Choose PDF
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,application/pdf"
                className="hidden"
              />
            </CardContent>
            {file && (
              <div className="p-2 bg-blue-50 text-blue-700 text-sm border-t border-blue-200">
                Selected: {file.name}
              </div>
            )}
          </Card>
        </div>

        {/* Chat UI */}
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="border-b border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h1 className="text-lg font-semibold text-slate-800">AI Assistant</h1>
              <span className="text-sm text-slate-500">Ask questions about your documents</span>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-[60vh] p-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-sm">Upload a PDF or start a conversation</p>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-800 border border-slate-200"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 border border-slate-200 rounded-lg px-4 py-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span>AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="border-t border-slate-200 bg-slate-50">
            <form onSubmit={onSubmit} className="flex w-full gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message or ask about the uploaded PDF..."
                className="flex-1 bg-white"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || (!input.trim() && !uploadedFileUrl)} className="gap-2">
                <Send className="h-4 w-4" />
                Send
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
