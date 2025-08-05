import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"

interface StudentInfo {
    name: string
    studentId: string
}

interface ExamHeaderProps {
    studentInfo: StudentInfo
}

export function ExamHeader({ studentInfo }: ExamHeaderProps) {
    return (
        <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">{studentInfo.name}</h1>
                        <p className="text-sm text-gray-500">{studentInfo.studentId}</p>
                    </div>
                    {/* <Badge className="bg-green-100 text-green-800 border-green-200">{studentInfo.status}</Badge> */}
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Xuất báo cáo
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Làm mới
                    </Button>
                </div>
            </div>
        </div>
    )
}
