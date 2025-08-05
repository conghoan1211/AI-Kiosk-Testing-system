import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, User, Clock } from "lucide-react"
import { IListUserActivityLog } from "@/services/modules/useractivitylog/interfaces/useractivitylog.interface"
import { IListExamActivityLog } from "@/services/modules/examactivitylog/interfaces/examactivitylog.interface"
import { ActivityDetailModal } from "../pages/activity-detail-modal"
import { useEffect, useState } from "react"
import useGetDetailUserActivityLog from "@/services/modules/useractivitylog/hooks/useGetDetailUserActivityLog"

interface ActivityListProps {
    activities: IListUserActivityLog[] | IListExamActivityLog[]
    categoryFilter: string
}

export function ActivityList({ activities, categoryFilter }: ActivityListProps) {
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [activityDetail, setActivityDetail] = useState<any>(null)
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined)

    // console.log(activities);

    const { data: userActivityData } = useGetDetailUserActivityLog(selectedId, { isTrigger: !!selectedId })
    useEffect(() => {
        if (selectedId) {
            if (categoryFilter === "user" && userActivityData) {
                setActivityDetail(userActivityData)
                setIsDetailModalOpen(true)
            }
        }
    }, [selectedId, categoryFilter, userActivityData])

    const handleViewDetail = (logId: string) => {
        setSelectedId(logId)
    }
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Nhật ký hoạt động ({activities.length})</CardTitle>
                    <p className="text-sm text-gray-600">Hiển thị theo thứ tự gần nhất</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {activities.map((activity) => {
                            // Xác định key dựa trên loại activity
                            const key = "logId" in activity ? activity.logId : activity.examLogId

                            return (
                                <div key={key} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-gray-400 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className="font-mono text-sm font-medium text-gray-900">{activity?.actionType}</span>
                                            </div>

                                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                                <div className="flex items-center space-x-1">
                                                    <User className="w-4 h-4" />
                                                    <span className="font-medium">{activity?.fullName}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{activity?.createdAt ? new Date(activity.createdAt).toLocaleString() : ""}</span>
                                                </div>
                                            </div>

                                            <p className="text-gray-700 mb-3">{activity?.description}</p>


                                        </div>

                                        <div className="ml-4">
                                            <button onClick={() => handleViewDetail(key)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
            {activityDetail && (
                <ActivityDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    activity={activityDetail}
                    categoryFilter={categoryFilter}
                />
            )}
        </>
    )
}
