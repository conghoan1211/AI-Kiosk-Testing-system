import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, User } from "lucide-react"
import { QuestionBankDetail } from "@/services/modules/bankquestion/interfaces/bankquestion.interface"

interface QuestionBankInfoProps {
    questionBank: QuestionBankDetail | null
}

export function QuestionBankDetailInfo({ questionBank }: QuestionBankInfoProps) {
    const getDifficultyBadge = (difficulty: number) => {
        if (difficulty === 0) return <Badge variant="outline">Chưa có dữ liệu</Badge>
        if (difficulty <= 1.5) return <Badge className="bg-green-100 text-green-800">Dễ</Badge>
        if (difficulty <= 2.5) return <Badge className="bg-yellow-100 text-yellow-800">Trung bình</Badge>
        return <Badge className="bg-red-100 text-red-800">Khó</Badge>
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5" />
                    <span>Thông tin ngân hàng câu hỏi</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 flex-1 flex flex-col">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-medium text-gray-500 block mb-1">Tên ngân hàng</label>
                        <p className="text-lg font-semibold text-gray-900">{questionBank?.questionBankName}</p>
                    </div>
                </div>
                <div className="pt-4  mt-auto">
                    <div className="grid grid-cols-2 gap-6 text-sm">
                        <div>
                            <span className="text-gray-500 block mb-1">Môn học</span>
                            <Badge variant="outline" className="text-sm">
                                {questionBank?.subjectName}
                            </Badge>
                        </div>
                        <div>
                            <span className="text-gray-500 block mb-1">Người tạo</span>
                            <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-900">{questionBank?.createBy}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">Mô tả</label>
                    <p className="text-gray-900">{questionBank?.description || "Chưa có mô tả"}</p>
                </div>

                <div className="grid grid-cols-2 border-t border-gray-200 gap-6">
                    <div>
                        <label className="text-sm font-medium text-gray-500 block mb-1">Độ khó trung bình</label>
                        {getDifficultyBadge(questionBank?.averageDifficulty ?? 0)}
                    </div>
                </div>

            </CardContent>
        </Card>
    )
}
