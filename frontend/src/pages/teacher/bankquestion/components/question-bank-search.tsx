import { Input } from "@/components/ui/input";
import { IBankQuestionRequest } from "@/services/modules/bankquestion/interfaces/bankquestion.interface";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Search } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

interface QuestionBankSearchProps {
  filter: IBankQuestionRequest,
  setFilter: Dispatch<SetStateAction<IBankQuestionRequest>>
}

export default function QuestionBankSearch({ filter, setFilter }: QuestionBankSearchProps) {
  const { t } = useTranslation("shared");

  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm ngân hàng câu hỏi..."
          className="pl-10"
          value={filter.textSearch}
          onChange={(e) => setFilter((prev: IBankQuestionRequest) => ({ ...prev, textSearch: e.target.value }))} />
      </div>
      <div className="flex gap-2">
        <Select defaultValue="all-subjects">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tất cả môn học" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-subjects">
              {t("BankQuestion.AllSubjects")}
            </SelectItem>
            <SelectItem value="math">Toán học</SelectItem>
            <SelectItem value="physics">Vật lý</SelectItem>
            <SelectItem value="english">Tiếng Anh</SelectItem>
            <SelectItem value="chemistry">Hóa học</SelectItem>
          </SelectContent>
        </Select>

      </div>

    </div>
  );
}
