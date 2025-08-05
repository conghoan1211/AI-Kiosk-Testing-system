import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Navigation, AlertTriangle, Settings, Clock } from "lucide-react"
import { IListExamActivityLog } from "@/services/modules/examactivitylog/interfaces/examactivitylog.interface"
import { LogType } from "@/consts/common"
import { useNavigate, useParams } from "react-router-dom"
import BaseUrl from "@/consts/baseUrl"
import httpService from "@/services/httpService"
interface ExamActivityProps {
    activities: IListExamActivityLog[]
}

export function ExamActivity({ activities }: ExamActivityProps) {
    const navigate = useNavigate()
    const roleId = Number(httpService.getUserStorage()?.roleId) || 0;
    const { examId, studentExamId } = useParams()
    const getActivityIcon = (type: string) => {
        switch (type) {
            case "question":
                return <FileText className="w-4 h-4 text-blue-600" />
            case "navigation":
                return <Navigation className="w-4 h-4 text-green-600" />
            case "warning":
                return <AlertTriangle className="w-4 h-4 text-red-600" />
            case "system":
                return <Settings className="w-4 h-4 text-gray-600" />
            default:
                return <Clock className="w-4 h-4 text-gray-600" />
        }
    }

    const getStatusBadge = (status: number) => {
        switch (status) {
            case LogType.Warning:
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Cảnh báo</Badge>
            case LogType.Info:
                return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Thông tin</Badge>
            case LogType.Violation:
                return <Badge className="bg-red-100 text-red-800 border-red-200">Vi phạm</Badge>
            case LogType.Critical:
                return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Quan trọng</Badge>
            default:
                return null
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Hoạt động</CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>Vi phạm</span>
                        <span>Hệ thống</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {activities.map((activity) => (
                        <div
                            key={activity?.examLogId}
                            className={`flex items-start space-x-3 p-3 rounded-lg border ${activity?.logType === LogType.Warning
                                ? "bg-yellow-50 border-yellow-200"
                                : activity?.logType === LogType.Violation
                                    ? "bg-red-100 border-red-100"
                                    : "bg-white border-gray-200"
                                }`}
                            onClick={() => navigate(`${roleId === 4 ? BaseUrl.AdminSupervision : BaseUrl.ExamSupervision
                                }/${examId}/log/${studentExamId}/${activity.examLogId}`)}
                        >
                            <div className="mt-0.5">{getActivityIcon(activity?.actionType)}</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900">{activity?.description}</p>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-gray-500">{activity?.createdAt ? new Date(activity.createdAt).toLocaleString() : ""}</span>
                                    {getStatusBadge(activity?.logType)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
