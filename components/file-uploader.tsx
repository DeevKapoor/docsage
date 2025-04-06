"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, FileText, Plus, Trash2, FileImage, FileCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface FileUploaderProps {
  file: File | null
  onFileChange: (file: File | null) => void
}

export default function FileUploader({ file, onFileChange }: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>(file ? [file] : [])
  const [isDragging, setIsDragging] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Supported file types
  const supportedFileTypes = [".docx", ".pdf", ".ppt", ".pptx", ".txt", ".md", ".markdown"]

  // File type icons mapping
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    switch (extension) {
      case "pdf":
        return <FileImage className="h-5 w-5 text-red-500" />
      case "ppt":
      case "pptx":
        return <FileImage className="h-5 w-5 text-orange-500" />
      case "txt":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "md":
      case "markdown":
        return <FileCode className="h-5 w-5 text-green-500" />
      default:
        return <FileText className="h-5 w-5 text-primary" />
    }
  }

  // Update parent component when files change
  const updateParent = (newFiles: File[]) => {
    setFiles(newFiles)
    // For backward compatibility, pass the first file to the parent component
    onFileChange(newFiles.length > 0 ? newFiles[0] : null)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const validateFile = (file: File): boolean => {
    const newErrors = { ...errors }
    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`

    // Check if file type is supported
    if (!supportedFileTypes.includes(fileExtension)) {
      newErrors[file.name] = `Unsupported file type. Please upload ${supportedFileTypes.join(", ")} files only`
      setErrors(newErrors)
      return false
    }
    if (file.size > 200 * 1024 * 1024) {
      newErrors[file.name] = "File size should be less than 200MB"
      setErrors(newErrors)
      return false
    }

    // Remove any previous errors for this file
    if (newErrors[file.name]) {
      delete newErrors[file.name]
      setErrors(newErrors)
    }

    return true
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files)
      const validFiles = droppedFiles.filter(validateFile)

      // Simulate upload progress for valid files
      validFiles.forEach((file) => {
        simulateUploadProgress(file.name)
      })

      updateParent([...files, ...validFiles])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
      const validFiles = selectedFiles.filter(validateFile)

      // Simulate upload progress for valid files
      validFiles.forEach((file) => {
        simulateUploadProgress(file.name)
      })

      updateParent([...files, ...validFiles])
    }
  }

  const simulateUploadProgress = (fileName: string) => {
    setUploadProgress((prev) => ({ ...prev, [fileName]: 0 }))

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const currentProgress = prev[fileName] || 0
        const newProgress = Math.min(currentProgress + 10, 100)

        if (newProgress === 100) {
          clearInterval(interval)
        }

        return { ...prev, [fileName]: newProgress }
      })
    }, 200)
  }

  const handleRemoveFile = (fileToRemove: File) => {
    const newFiles = files.filter((f) => f !== fileToRemove)
    updateParent(newFiles)

    // Clear any errors for this file
    if (errors[fileToRemove.name]) {
      const newErrors = { ...errors }
      delete newErrors[fileToRemove.name]
      setErrors(newErrors)
    }

    // Clear upload progress
    if (uploadProgress[fileToRemove.name]) {
      const newProgress = { ...uploadProgress }
      delete newProgress[fileToRemove.name]
      setUploadProgress(newProgress)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveAllFiles = () => {
    updateParent([])
    setErrors({})
    setUploadProgress({})

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-3xl font-serif font-bold text-center mb-8">Upload Your Documents</h2>

      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 transition-all duration-300 ease-in-out",
          isDragging ? "border-primary bg-primary/10 scale-[1.02] shadow-lg" : "border-muted-foreground/20",
          files.length > 0 ? "bg-muted/20 backdrop-blur-sm" : "bg-card/30 backdrop-blur-sm",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <AnimatePresence mode="wait">
          {files.length === 0 ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <motion.div
                className="mb-6 rounded-full bg-primary/10 p-4"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Upload className="h-8 w-8 text-primary" />
              </motion.div>
              <h3 className="mb-3 text-xl font-medium">Drag & drop your files</h3>
              <p className="mb-6 text-sm text-muted-foreground text-center max-w-md">
                Upload your documents (.docx, .pdf, .ppt, .pptx, .txt, .md, .markdown) by dragging them here or clicking
                the button below
              </p>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Select Files
                </Button>
              </motion.div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.pdf,.ppt,.pptx,.txt,.md,.markdown"
                multiple
                onChange={handleFileInput}
                className="hidden"
                title="Select files to upload"
              />
            </motion.div>
          ) : (
            <motion.div
              key="files"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Uploaded Files</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveAllFiles}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove All
                </Button>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {files.map((file, index) => (
                  <motion.div
                    key={`${file.name}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border"
                  >
                    <div className="flex items-center flex-1 mr-4">
                      <div className="rounded-full bg-primary/10 p-2 mr-3 flex-shrink-0">{getFileIcon(file.name)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                        {uploadProgress[file.name] !== undefined && uploadProgress[file.name] < 100 && (
                          <div className="mt-2">
                            <Progress value={uploadProgress[file.name]} className="h-1" />
                          </div>
                        )}

                        {errors[file.name] && <p className="text-xs text-destructive mt-1">{errors[file.name]}</p>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFile(file)}
                      className="rounded-full h-8 w-8 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center mt-4 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="mr-2">
                  <Plus className="mr-2 h-4 w-4" />
                  Add More Files
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {Object.keys(errors).length > 0 && files.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
        >
          <p className="text-sm text-destructive font-medium">Please fix the following errors:</p>
          <ul className="list-disc list-inside text-sm text-destructive mt-1">
            {Object.entries(errors).map(([filename, error]) => (
              <li key={filename}>
                {filename}: {error}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  )
}