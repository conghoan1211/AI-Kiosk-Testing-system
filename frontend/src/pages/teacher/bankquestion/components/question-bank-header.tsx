import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import AddQuestionBankModal from "./add-question-bank-modal";
import httpService from "@/services/httpService";
import { QUESTION_BANK_URL } from "@/consts/apiUrl";
import { IQuestionBankForm } from "@/services/modules/bankquestion/interfaces/bankquestion.interface";
import { showError, showSuccess } from "@/helpers/toast";
import { SubjectList } from "@/services/modules/subject/interfaces/subject.interface";

interface QuestionBankHeaderInterface {
  refetch: () => void;
  dataSubjects: SubjectList[];
}

export default function QuestionBankHeader({ refetch, dataSubjects }: QuestionBankHeaderInterface) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation("shared");
  const token = httpService.getTokenStorage();

  const handleAddQuestionBank = async (values: IQuestionBankForm) => {
    try {
      httpService.attachTokenToHeader(token);
      httpService.post(`${QUESTION_BANK_URL}/add`, values);
      showSuccess("Thêm mới ngân hàng câu hỏi thành công!");
    } catch (error) {
      showError("Thêm mới ngân hàng câu hỏi thất bại!");
      console.error("Error submitting form:", error);
    }
    refetch();
  };

  return (
    <div className="mb-6 flex flex-col items-start justify-between md:flex-row md:items-center">
      <div>
        <h1 className="text-2xl font-bold">{t("BankQuestion.BankQuestion")}</h1>
        <p className="text-muted-foreground">{t("BankQuestion.ManageBankQuestion")}</p>
      </div>
      <div className="mt-4 flex gap-2 md:mt-0">
        <Button className="flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          {t("BankQuestion.AddBankQuestion")}
        </Button>
      </div>
      <AddQuestionBankModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddQuestionBank}
        dataSubjects={dataSubjects}
      />
    </div>
  );
}