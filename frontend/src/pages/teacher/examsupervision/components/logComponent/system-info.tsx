import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Monitor, Wifi } from "lucide-react"
import useGetDetailExamActivityLog from "@/services/modules/examactivitylog/hooks/useGetDetailExamActivityLog"

interface SystemexamLogDetailProps {
    examLogId: string
}

export function SystemInfo({ examLogId }: SystemexamLogDetailProps) {
    const { data: examLogDetail } = useGetDetailExamActivityLog(examLogId)

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Monitor className="w-5 h-5" />
                        <span>Thông tin thiết bị</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Tên thiết bị</span>
                        <span className="font-medium">{examLogDetail?.deviceUsername}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">ID thiết bị</span>
                        <span className="font-medium">{examLogDetail?.deviceId}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Trình duyệt</span>
                        <span className="font-medium">{examLogDetail?.browserInfo}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Wifi className="w-5 h-5" />
                        <span>Thông tin mạng</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Địa chỉ IP</span>
                        <span className="font-medium">{examLogDetail?.ipAddress}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
