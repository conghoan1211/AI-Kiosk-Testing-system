import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Eye, Edit, Trash2, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Question } from '@/services/modules/bankquestion/interfaces/bankquestion.interface';
import { useNavigate } from 'react-router-dom';
import BaseUrl from '@/consts/baseUrl';
import { useState } from 'react';
import httpService from '@/services/httpService';

interface QuestionsListProps {
  questions: Question[] | [];
}

export function QuestionsList({ questions }: QuestionsListProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const itemsPerPage = 5; // Số phần tử mỗi trang
  const roleId = httpService.getUserStorage()?.roleId.at(0)

  const getDifficultyBadge = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return <Badge className="bg-green-100 text-green-800">Dễ</Badge>;
      case 2:
        return <Badge className="bg-yellow-100 text-yellow-800">Trung bình</Badge>;
      case 3:
        return <Badge className="bg-red-100 text-red-800">Khó</Badge>;
      case 4:
        return <Badge className="bg-red-100 text-red-800">Rất Khó</Badge>;
      default:
        return <Badge variant="outline">{difficulty}</Badge>;
    }
  };

  const getTypeBadge = (type: number) => {
    switch (type) {
      case 1:
        return <Badge variant="outline">Trắc nghiệm</Badge>;
      case 2:
        return <Badge variant="outline">Tự luận</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Tính toán danh sách hiển thị
  const totalPages = Math.ceil((questions?.length || 0) / itemsPerPage);
  const paginatedQuestions =
    questions?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [];

  // Xử lý chuyển trang
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Danh sách câu hỏi ({questions?.length})</CardTitle>
          <Button onClick={() => {
            roleId === 4 ? navigate(`${BaseUrl.AdminAddQuestion}`)
              : navigate(`${BaseUrl.AddQuestion}`)
          }
          }>
            <Plus className="mr-2 h-4 w-4" />
            Thêm câu hỏi
          </Button>
        </div>
        <div className="mt-4 flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input placeholder="Tìm kiếm câu hỏi..." className="pl-10" />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Bộ lọc
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {questions.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">Chưa có câu hỏi nào</h3>
            <p className="mb-4 text-gray-500">Bắt đầu tạo câu hỏi đầu tiên cho ngân hàng này</p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm câu hỏi đầu tiên
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedQuestions.map((question) => (
                <div
                  key={question?.questionId}
                  className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center space-x-3">
                        {getTypeBadge(question?.type)}
                        {getDifficultyBadge(question?.difficultLevel)}
                        <Badge variant="outline">{question?.point} điểm</Badge>
                      </div>
                      <p className="mb-2 line-clamp-2 text-gray-900">{question.content}</p>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
