import { AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DateTimeFormat } from "@/consts/dates";
import { convertUTCToVietnamTime } from "@/helpers/common";
import { Feedback } from "@/services/modules/feedback/interfaces/feedback.interface";
import { Avatar } from "@radix-ui/react-avatar";
import { Calendar, Eye, MessageSquare, User } from "lucide-react";
import { useState } from "react";
import useToggleDialog from "@/hooks/useToggleDialog";
import DialogFeedbackDetail from "../dialogs/DialogFeedbackDetail";


interface FeedbackCardProps {
    feedbacks: Feedback[];
}

export default function FeedbackCard({ feedbacks }: FeedbackCardProps) {
    const [selectedFeedbackId, setSelectedFeedbackId] = useState('')
    const [open, toggle, shouldRender,] = useToggleDialog();

    const getInitials = (name: string) => {
        if (!name || typeof name !== "string") return "??"
        return name
            .split(" ")
            .filter((n) => n.length > 0)
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }
    const truncateContent = (content: string, maxLength = 100) => {
        if (!content || typeof content !== "string") return ""
        if (content.length <= maxLength) return content
        return content.substring(0, maxLength) + "..."
    }
    const handleToggleShowDetail = () => {
        toggle();
    };
    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="space-y-4">
                {feedbacks.map((feedback) => (
                    <Card key={feedback.feedbackId} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4 flex-1">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-blue-100 text-blue-600">
                                            {getInitials(feedback.studentName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-medium text-gray-900 truncate">{feedback.title}</h3>
                                            <Badge variant="secondary" className="text-xs">
                                                {feedback.studentCode}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{truncateContent(feedback.content)}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                {feedback.studentName}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {convertUTCToVietnamTime(feedback?.createdAt, DateTimeFormat.DateTimeWithTimezone)?.toString() || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedFeedbackId(feedback.feedbackId)
                                        toggle()
                                    }}
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                                >
                                    <Eye className="h-4 w-4" />
                                    Xem
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>


            {feedbacks.length === 0 && (
                <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có feedback nào</h3>
                    <p className="text-gray-500">Danh sách feedback sẽ hiển thị ở đây khi có dữ liệu</p>
                </div>
            )}

            {shouldRender && (
                <DialogFeedbackDetail
                    isOpen={open}
                    toggle={handleToggleShowDetail}
                    feedbackId={selectedFeedbackId}
                />
            )}
        </div>
    )
}