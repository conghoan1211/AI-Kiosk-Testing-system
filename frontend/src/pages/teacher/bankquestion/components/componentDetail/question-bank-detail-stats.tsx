
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QuestionBankDetail } from "@/services/modules/bankquestion/interfaces/bankquestion.interface"
import { FileText, CheckCircle, PenTool, BarChart3 } from "lucide-react"

interface QuestionBankStatsProps {
    questionBank: QuestionBankDetail | null;
}

export function QuestionBankDetailStats({ questionBank }: QuestionBankStatsProps) {

    const stats = [
        {
            title: "Tổng câu hỏi",
            value: questionBank?.totalQuestions,
            icon: FileText,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Trắc nghiệm",
            value: questionBank?.multipleChoiceCount,
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Tự luận",
            value: questionBank?.essayCount,
            icon: PenTool,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
        {
            title: "Độ khó TB",
            value: questionBank?.averageDifficulty || 0,
            icon: BarChart3,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            isDecimal: true,
        },
    ]

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Thống kê</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col">
                <div className="space-y-4 flex-1">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon
                        return (
                            <div key={index} className={`p-4 rounded-lg ${stat.bgColor}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">{stat.title}</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {stat.isDecimal ? stat.value.toFixed(1) : stat.value}
                                        </p>
                                    </div>
                                    <Icon className={`w-8 h-8 ${stat.color}`} />
                                </div>
                            </div>
                        )
                    })}
                </div>


            </CardContent>
        </Card>
    )
}
