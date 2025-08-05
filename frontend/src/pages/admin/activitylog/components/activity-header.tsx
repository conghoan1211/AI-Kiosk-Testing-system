import { Button } from "@/components/ui/button"
import { RefreshCw, Download } from "lucide-react"

interface ActivityHeaderProps {
    onExportClick: () => void
}

export function ActivityHeader({ onExportClick }: ActivityHeaderProps) {
    return (
        <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Nhật ký hoạt động</h1>
                    <p className="text-gray-600 mt-1">Theo dõi và phân tích hoạt động của người dùng trong hệ thống</p>
                </div>
                <div className="flex space-x-3">
                    <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                        <RefreshCw className="w-4 h-4" />
                        <span>Làm mới</span>
                    </Button>
                    <Button onClick={onExportClick} className="bg-black text-white flex items-center space-x-2">
                        <Download className="w-4 h-4" />
                        <span>Xuất báo cáo</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}
