import { Button } from "@/components/ui/button"
import { TEACHER_EXAM_URL } from "@/consts/apiUrl"
import httpService from "@/services/httpService"
import axios from "axios"
import { Filter, Download } from "lucide-react"
import { BookOpen, Calendar, Clock, FileText, Target, User } from "lucide-react"

interface ExamData {
  title: string
  subtitle: string
  subject: string
  date: string
  duration: number
  totalQuestions: number
  maxScore: number
  teacher: string
}

interface ExamHeaderProps {
  examData: ExamData,
  examId: string
}


export function ExamHeader({ examData, examId }: ExamHeaderProps) {
  const token = httpService.getTokenStorage()

  const getExportFile = async () => {
    try {
      const response = await axios.get(
        `${TEACHER_EXAM_URL}/exams/${examId}/export-results`,
        {
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const link = document.createElement('a');
      link.href = url;
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'exam_results.xlsx';
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1];
        }
      }

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting file:", error);

    }
  }
  return (
    <div className="bg-white border-b border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{examData.title}</h1>
          <p className="text-gray-600 mt-1">{examData.subtitle}</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
            <Filter className="w-4 h-4" />
            <span>Bộ lọc nâng cao</span>
          </Button>
          <Button onClick={getExportFile} className="bg-black text-white flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Xuất báo cáo</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-6">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-5 h-5 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Môn học</p>
            <p className="font-medium">{examData.subject}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Ngày thi</p>
            <p className="font-medium">{examData.date}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Thời gian</p>
            <p className="font-medium">{examData.duration}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <FileText className="w-5 h-5 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Số câu hỏi</p>
            <p className="font-medium">{examData.totalQuestions}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Target className="w-5 h-5 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Tổng điểm</p>
            <p className="font-medium">{examData.maxScore}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <User className="w-5 h-5 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Giáo viên</p>
            <p className="font-medium">{examData.teacher}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
