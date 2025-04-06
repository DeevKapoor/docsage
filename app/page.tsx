"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Upload, Download, Moon, Sun, Github, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import FileUploader from "@/components/file-uploader"
import SummaryOutput from "@/components/summary-output"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [summary, setSummary] = useState<any[] | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile)
    setSummary(null)
    setPdfUrl(null)
  }

  const handleSubmit = async () => {
    if (!file) return

    setIsProcessing(true)

    try {
      // Create form data to send to the API
      const formData = new FormData()
      formData.append('file', file)
      formData.append('style', 'elegant') // Default style

      // Send to our Next.js API route which forwards to FastAPI
      const response = await fetch('/api/proxy', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to summarize document')
      }

      // Set the summary and PDF URL
      setSummary(data.summary)
      setPdfUrl(data.pdf_url)
      
      toast({
        title: "Document Processed",
        description: "Your document has been successfully summarized!",
        variant: "default",
      })
    } catch (error) {
      console.error('Error processing document:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = async (style: string) => {
    if (!pdfUrl) return
    
    try {
      // Get the filename from the PDF URL
      const filename = pdfUrl.split('/').pop()
      
      // Create a link to download the file
      const link = document.createElement('a')
      link.href = `/api/proxy?filename=${filename}`
      link.download = `summary_${style}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Download Started",
        description: `Your ${style} PDF is being downloaded.`,
        variant: "default",
      })
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast({
        title: "Download Error",
        description: "Failed to download the PDF summary.",
        variant: "destructive",
      })
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1">
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10">
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-10",
              theme === "dark"
                ? "from-indigo-500 via-purple-500 to-pink-500"
                : "from-blue-200 via-purple-200 to-pink-200",
            )}
          ></div>
          <div className="absolute inset-0 bg-grid-small-white/[0.2] -z-10"></div>
        </div>

        {/* Navbar */}
        <nav className="border-b backdrop-blur-md bg-background/70 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <span className="text-xl font-serif font-bold tracking-tight">
                DocSage<span className="font-mono"></span>
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
                About
              </a>
              <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
                Docs
              </a>
              <a
                href="https://github.com/DeevKapoor"
                className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="theme-toggle"
                checked={theme === "dark"}
                onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
              />
              <Label htmlFor="theme-toggle" className="sr-only">
                Toggle theme
              </Label>
              {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight">
                Turn Documents into <span className="text-primary">Wisdom.</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Upload any file and get a beautifully structured, topic-wise AI summary instantly.
              </p>
              <Button
                size="lg"
                className="mt-8 group"
                onClick={() => document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Upload className="mr-2 h-4 w-4 group-hover:translate-y-[-2px] transition-transform" />
                Upload Your Files
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-primary to-secondary opacity-70 blur-2xl"></div>
                <FileText className="absolute h-24 w-24 text-background" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Upload Section */}
        <section id="upload-section" className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <FileUploader file={file} onFileChange={handleFileChange} />
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex justify-center"
              >
                <Button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                >
                  {isProcessing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>Start Summarizing</>
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        </section>

        {/* Summary Output Area */}
        {summary && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-serif font-bold text-center mb-8">Your Document Summary</h2>
              <SummaryOutput summary={summary} />

              {/* Download Section */}
              <div className="mt-12">
                <h3 className="text-xl font-serif font-medium text-center mb-6">Download Your Summary</h3>

                <Tabs defaultValue="minimal" className="max-w-md mx-auto">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="minimal">Minimal</TabsTrigger>
                    <TabsTrigger value="academic">Academic</TabsTrigger>
                    <TabsTrigger value="elegant">Elegant</TabsTrigger>
                  </TabsList>

                  <TabsContent value="minimal" className="flex justify-center">
                    <Button onClick={() => handleDownload("Minimal")} className="w-full md:w-auto">
                      <Download className="mr-2 h-4 w-4" />
                      Download Minimal PDF
                    </Button>
                  </TabsContent>

                  <TabsContent value="academic" className="flex justify-center">
                    <Button onClick={() => handleDownload("Academic")} className="w-full md:w-auto">
                      <Download className="mr-2 h-4 w-4" />
                      Download Academic PDF
                    </Button>
                  </TabsContent>

                  <TabsContent value="elegant" className="flex justify-center">
                    <Button onClick={() => handleDownload("Elegant")} className="w-full md:w-auto">
                      <Download className="mr-2 h-4 w-4" />
                      Download Elegant PDF
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </motion.section>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t backdrop-blur-md bg-background/70">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">Built with ♥ by Deevanshu Kapoor</p>
          <div className="flex justify-center space-x-4 mt-2">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <span className="sr-only">Twitter</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-twitter"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </a>
            <a
              href="https://github.com/DeevKapoor"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <span className="sr-only">GitHub</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-github"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/deevanshu-kapoor-a71098289"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <span className="sr-only">LinkedIn</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-linkedin"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}