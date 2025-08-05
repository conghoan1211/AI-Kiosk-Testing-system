import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Eye, Plus } from "lucide-react"
import useGetListQuestion from "@/services/modules/question/hooks/useGetAllQuestion"
import useFiltersHandler from "@/hooks/useFiltersHandler"


interface SavedQuestionsListProps {
    onCreateNew: () => void
}

export function SavedQuestionsList({ onCreateNew }: SavedQuestionsListProps) {
    // const [questions, setQuestions] = useState<QuestionList[]>([])

    const getTypeLabel = (type: number) => {
        switch (type) {
            case 1:
                return "Trắc nghiệm"
            case 0:
                return "Tự luận"
            default:
                return type
        }
    }

    const getDifficultyLabel = (difficulty: number) => {
        switch (difficulty) {
            case 1:
                return "Dễ"
            case 2:
                return "Trung bình"
            case 3:
                return "Khó"
            case 4:
                return "Cực khó"
            default:
                return difficulty
        }
    }

    const getDifficultyColor = (difficulty: number) => {
        switch (difficulty) {
            case 1:
                return "bg-green-100 text-green-800"
            case 2:
                return "bg-yellow-100 text-yellow-800"
            case 3:
                return "bg-red-100 text-orange-800"
            case 4:
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const { filters } = useFiltersHandler({
        pageSize: 5,
        currentPage: 1,
        textSearch: '',
        IsMyQuestion: true,
    });

    const { data: questions } = useGetListQuestion(filters)
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-semibold">Câu hỏi đã lưu ({questions.length})</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">Danh sách các câu hỏi đã tạo gần đây nhất</p>
                    </div>
                    <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Tạo câu hỏi mới
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {questions.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Copy className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có câu hỏi nào được lưu</h3>
                        <p className="text-gray-500 mb-4">Bắt đầu tạo câu hỏi đầu tiên của bạn</p>
                        <Button onClick={onCreateNew}>
                            <Plus className="w-4 h-4 mr-2" />
                            Tạo câu hỏi đầu tiên
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {questions.map((question) => (
                            <div
                                key={question?.questionId}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Badge className={getDifficultyColor(question?.difficultLevel)}>
                                                {getDifficultyLabel(question?.difficultLevel)}
                                            </Badge>
                                            <Badge variant="outline">{getTypeLabel(question?.type)}</Badge>
                                            <Badge variant="outline">{question?.point} điểm</Badge>
                                        </div>
                                        <h3 className="font-medium text-gray-900 mb-2 text-lg">{question?.content || "Nội dung câu hỏi"}</h3>
                                        <div className="text-sm text-gray-500 space-y-1">
                                            <p>Ngân hàng: {question?.questionBankName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-4">
                                        <Button variant="ghost" size="sm">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
