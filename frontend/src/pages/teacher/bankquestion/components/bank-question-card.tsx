import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, MenuSquare, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { BankQuestionList, IQuestionBankForm, IShareBankQuestionForm } from "@/services/modules/bankquestion/interfaces/bankquestion.interface";
import { useNavigate } from "react-router-dom";
import BaseUrl from "@/consts/baseUrl";
import AddQuestionBankModal from "./add-question-bank-modal";
import { SubjectList } from "@/services/modules/subject/interfaces/subject.interface";
import httpService from "@/services/httpService";
import { QUESTION_BANK_URL } from "@/consts/apiUrl";
import { showError, showSuccess } from "@/helpers/toast";
import ShareQuestionBankModal from "./share-question-bank-modal";
import bankquestionService from "@/services/modules/bankquestion/bankquestion.Service";
import { AxiosError } from "axios";

interface BankQuestionCardProps {
  refetch: () => void;
  bankquestion: BankQuestionList[];
  dataSubjects: SubjectList[];
}

export default function BankQuestionCard({ refetch, bankquestion, dataSubjects }: BankQuestionCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [selectedBankQuestion, setSelectedBankQuestion] = useState<BankQuestionList | undefined>(undefined)
  const { t } = useTranslation("shared");
  const navigate = useNavigate();
  const token = httpService.getTokenStorage()
  const roleId = httpService.getUserStorage()?.roleId.at(0)

  const handleEditQuestionBank = (data: IQuestionBankForm, questionBankId?: string) => {
    try {
      httpService.attachTokenToHeader(token);
      httpService.put(`${QUESTION_BANK_URL}/edit/${questionBankId}`, data);
      // console.log(requestAPI);
      showSuccess("Chỉnh sửa ngân hàng câu hỏi thành công!");
    } catch (error) {
      showError("Chỉnh sửa ngân hàng câu hỏi thất bại!");
      console.error("Error submitting form:", error);
    }
    refetch();
  };

  const handleShareSubmit = async (formData: IShareBankQuestionForm) => {
    try {
      httpService.attachTokenToHeader(token)
      const response = await bankquestionService.getShareBankQuestion(formData)
      console.log(response);

      showSuccess("Chia sẻ ngân hàng câu hỏi thành công!");
    } catch (error) {
      let errorMessage = "Đã xảy ra lỗi khi chia sẻ ngân hàng câu hỏi.";
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      showError(errorMessage);
      // console.error("Error sharing:", error);
    }
  }


  return (
    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {bankquestion && bankquestion.length > 0 ? (
        bankquestion?.map(bankquestion => (
          <Card key={bankquestion?.questionBankId}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-medium">
                  {bankquestion?.title}
                </CardTitle>
                <CardDescription>
                  {`Môn học: ${bankquestion?.subjectName}`}
                </CardDescription>
              </div>
              <p className="text-sm text-muted-foreground">
                {bankquestion?.totalQuestions} {t("BankQuestion.Question")}
              </p>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">
                    {t("BankQuestion.MultipleChoice")}:
                  </div>
                  <div className="text-lg">{bankquestion?.multipleChoiceCount}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">
                    {t("BankQuestion.Essay")}:
                  </div>
                  <div className="text-lg">{bankquestion?.essayCount}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex flex-1 items-center justify-center gap-2"
                  onClick={() => {
                    roleId === 2 ?
                      navigate(`${BaseUrl.BankQuestion}/${bankquestion.questionBankId}`)
                      : navigate(`${BaseUrl.AdminBankQuestion}/${bankquestion.questionBankId}`)
                  }}
                >
                  <Eye size={16} />
                  {t("View")}
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-1 items-center justify-center gap-2"
                  onClick={() => {
                    setIsModalOpen(true)
                    setSelectedBankQuestion(bankquestion)
                  }}
                >
                  <MenuSquare size={16} />
                  {t("Edit")}
                </Button>
                <Button variant="outline" size="icon"
                  onClick={() => {
                    setIsShareModalOpen(true)
                    setSelectedBankQuestion(bankquestion)
                  }}>
                  <Share2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="col-span-full text-center text-gray-500 py-8">
          Không có dữ liệu
        </div>
      )}
      <ShareQuestionBankModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onSubmit={handleShareSubmit}
        questionBank={selectedBankQuestion}
      />

      {/* modal edit bank question */}
      <AddQuestionBankModal
        id={selectedBankQuestion?.questionBankId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleEditQuestionBank}
        dataSubjects={dataSubjects}
      />
    </div>
  );
}
