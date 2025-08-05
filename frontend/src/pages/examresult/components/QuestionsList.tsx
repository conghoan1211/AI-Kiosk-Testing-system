import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Answer } from '@/services/modules/examresultdetail/interfaces/examresultdetail.interface';
import { FileText } from 'lucide-react';
import QuestionItem from './QuestionItem';

interface QuestionsListProps {
  answers: Answer[];
}

export default function QuestionsList({ answers }: QuestionsListProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Chi tiết câu hỏi ({answers.length} câu)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {answers.length > 0 ? (
          answers.map((answer, index) => (
            <QuestionItem key={answer.questionId} answer={answer} questionIndex={index} />
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">
            <FileText className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2">Không có câu hỏi nào để hiển thị</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
