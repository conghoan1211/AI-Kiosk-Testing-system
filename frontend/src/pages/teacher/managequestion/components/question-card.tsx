import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Star,
  FileText,
  User,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { QuestionList } from '@/services/modules/question/interfaces/question.interface';

interface QuestionCardProps {
  question: QuestionList;
  onEdit?: (questionId: string) => void;
  onDelete?: (questionId: string) => void;
  onView?: (questionId: string) => void;
}

const QuestionCard = ({ question, onEdit, onDelete, onView }: QuestionCardProps) => {
  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-green-100 text-green-800 border-green-200';
      case 2:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 3:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyText = (level: number) => {
    switch (level) {
      case 1:
        return 'Dễ';
      case 2:
        return 'Trung bình';
      case 3:
        return 'Khó';
      default:
        return 'Không xác định';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return 'bg-green-100 text-green-800 border-green-200';
      case 0:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return 'Hoạt động';
      case 0:
        return 'Không hoạt động';
      default:
        return 'Bản nháp';
    }
  };

  const getQuestionTypeText = (type: number) => {
    switch (type) {
      case 1:
        return 'Trắc nghiệm';
      case 2:
        return 'Tự luận';
      case 3:
        return 'Đúng/Sai';
      default:
        return 'Khác';
    }
  };

  return (
    <Card className="w-full transition-shadow duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="mb-2 line-clamp-2 text-lg font-semibold">
              {question.content}
            </CardTitle>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="outline" className={getDifficultyColor(question.difficultLevel)}>
                <Star className="mr-1 h-3 w-3" />
                {getDifficultyText(question.difficultLevel)}
              </Badge>
              <Badge variant="outline" className={getStatusColor(question.status)}>
                <CheckCircle className="mr-1 h-3 w-3" />
                {getStatusText(question.status)}
              </Badge>
              <Badge variant="outline" className="border-blue-200 bg-blue-100 text-blue-800">
                {getQuestionTypeText(question.type)}
              </Badge>
            </div>
          </div>
          <div className="ml-2 flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView?.(question.questionId)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(question.questionId)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete?.(question.questionId)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Subject and Question Bank Info */}
          <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Môn học:</span>
              <span className="text-gray-600">{question.subjectName}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-500" />
              <span className="font-medium">Ngân hàng:</span>
              <span className="text-gray-600">{question.questionBankName}</span>
            </div>
          </div>

          {/* Points */}
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <span className="font-medium">Điểm:</span>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                {question.point} điểm
              </Badge>
            </div>
          </div>

          {/* Options */}
          {question.options && question.options.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium">Các lựa chọn:</span>
              <div className="space-y-1">
                {question.options.map((option, index) => (
                  <div
                    key={index}
                    className={`rounded-md border p-2 text-sm ${
                      option === question.correctAnswer
                        ? 'border-green-200 bg-green-50 text-green-800'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <span className="mr-2 font-medium">{String.fromCharCode(65 + index)}.</span>
                    {option}
                    {option === question.correctAnswer && (
                      <CheckCircle className="ml-2 inline h-4 w-4 text-green-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explanation */}
          {question.explanation && (
            <div className="space-y-2">
              <span className="text-sm font-medium">Giải thích:</span>
              <p className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-gray-600">
                {question.explanation}
              </p>
            </div>
          )}

          {/* Footer Info */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <User className="h-3 w-3" />
              <span>ID: {question.creatorId}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>ID câu hỏi: {question.questionId.slice(0, 8)}...</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
