
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useGetListBankQuestion from "@/services/modules/bankquestion/hooks/useGetAllBankQuestion";
import { IBankQuestionRequest } from "@/services/modules/bankquestion/interfaces/bankquestion.interface";
import { useState } from "react";

interface QuestionBankSelectorProps {
  selectedBank: string;
  onBankChange: (bank: string) => void;
}

export function QuestionBankSelector({
  selectedBank,
  onBankChange,
}: QuestionBankSelectorProps) {
  const [filtersBankquestion] = useState<IBankQuestionRequest>({
    pageSize: 100,
    currentPage: 1,
    status: 1,
    IsMyQuestion: true,
  });
  const { data } = useGetListBankQuestion(filtersBankquestion);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Chọn ngân hàng câu hỏi
        </CardTitle>
        <p className="text-sm text-gray-500">
          Chọn ngân hàng để lưu câu hỏi mới
        </p>
      </CardHeader>
      <CardContent>
        <Select value={selectedBank} onValueChange={onBankChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn ngân hàng câu hỏi..." />
          </SelectTrigger>
          <SelectContent>
            {data?.map((bank) => (
              <SelectItem key={bank?.questionBankId} value={bank?.questionBankId}>
                {bank?.title} ({bank?.totalQuestions} câu hỏi)
              </SelectItem>
            ))}
            {/* <SelectItem value="math-basic">Toán học cơ bản</SelectItem>
            <SelectItem value="physics">Vật lý</SelectItem>
            <SelectItem value="chemistry">Hóa học</SelectItem>
            <SelectItem value="literature">Ngữ văn</SelectItem> */}
          </SelectContent>
        </Select>
        {!selectedBank && (
          <p className="mt-2 text-sm text-red-500">
            Vui lòng chọn ngân hàng câu hỏi
          </p>
        )}
      </CardContent>
    </Card>
  );
}
