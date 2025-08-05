import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, FileText } from 'lucide-react';
import { DateTimeFormat } from '@/consts/dates';
import { convertUTCToVietnamTime } from '@/helpers/common';
import { formatDuration } from '@/utils/exam.utils';

interface ExamInfoCardProps {
  examTitle?: string;
  durationSpent?: number;
  totalQuestions?: number;
  startTime?: string;
  submitTime?: string;
}

export default function ExamInfoCard({
  examTitle,
  durationSpent,
  totalQuestions,
  startTime,
  submitTime,
}: ExamInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Thông tin bài thi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <div>
            <p className="text-gray-500">Tên bài thi</p>
            <p className="font-semibold">{examTitle || 'Không có tiêu đề'}</p>
          </div>
          <div>
            <p className="text-gray-500">Thời gian làm bài: {formatDuration(durationSpent || 0)}</p>
            <p className="font-semibold">Tổng số câu: {totalQuestions || 0}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>
            Ngày thi:{' '}
            {startTime
              ? convertUTCToVietnamTime(startTime, DateTimeFormat.DateTimeWithTimezone)?.toString()
              : 'Không có thông tin'}
          </span>
        </div>

        {submitTime && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>
              Thời gian nộp bài:{' '}
              {convertUTCToVietnamTime(submitTime, DateTimeFormat.DateTimeWithTimezone)?.toString()}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
