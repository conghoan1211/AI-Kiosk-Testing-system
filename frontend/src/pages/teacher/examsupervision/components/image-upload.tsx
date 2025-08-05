import type React from "react"

import { useState } from "react"
import { Upload, Clipboard, X } from "lucide-react"
import { Label } from "@/components/ui/label"

interface ImageUploadProps {
    uploadedFile: File | null
    onFileUpload: (file: File | null) => void
}

export default function ImageUpload({ uploadedFile, onFileUpload }: ImageUploadProps) {
    const [dragActive, setDragActive] = useState(false)

    const handleFileUpload = (files: FileList | null) => {
        if (!files || files.length === 0) return

        const file = files[0] // Only take the first file
        const isImage = file.type.startsWith("image/")
        const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit

        if (isImage && isValidSize) {
            onFileUpload(file)
        }
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        handleFileUpload(e.dataTransfer.files)
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                const file = items[i].getAsFile()
                if (file) {
                    onFileUpload(file)
                    break // Only take the first image
                }
            }
        }
    }

    const removeFile = () => {
        onFileUpload(null)
    }

    const getFilePreview = (file: File): string => {
        return URL.createObjectURL(file)
    }

    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium">Bằng chứng (ảnh chụp màn hình)</Label>

            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onPaste={handlePaste}
                tabIndex={0}
            >
                <div className="space-y-4">
                    <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-gray-400" />
                        <div className="text-sm text-gray-600">
                            <p>Kéo thả ảnh vào đây hoặc</p>
                            <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                                chọn file
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e.target.files)}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clipboard className="h-4 w-4" />
                        <span>Hoặc nhấn Ctrl+V để dán ảnh từ clipboard</span>
                    </div>

                    <p className="text-xs text-gray-400">Hỗ trợ: PNG, JPG, GIF (tối đa 10MB)</p>
                </div>
            </div>

            {/* File Preview */}
            {uploadedFile && (
                <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">Ảnh đã tải lên</p>
                    <div className="relative group w-48">
                        <div className="aspect-square rounded-lg overflow-hidden border bg-gray-50">
                            <img
                                src={getFilePreview(uploadedFile) || "/placeholder.svg"}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={removeFile}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="h-3 w-3" />
                        </button>
                        <p className="text-xs text-gray-500 mt-1 truncate">{uploadedFile.name}</p>
                    </div>
                </div>
            )}
        </div>
    )
}
