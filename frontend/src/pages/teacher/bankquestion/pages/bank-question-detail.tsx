import { useEffect, useState } from "react"
import { QuestionBankDetailHeader } from "../components/componentDetail/question-bank-detail-header"
import { QuestionBankDetailInfo } from "../components/componentDetail/question-bank-detail-info"
import { QuestionBankDetailStats } from "../components/componentDetail/question-bank-detail-stats"
import { QuestionsList } from "../components/componentDetail/questions-list"
import { useParams } from "react-router-dom"
import useGetQuestionBankDetail from "@/services/modules/bankquestion/hooks/useGetQuestionBankDetail"
import { QuestionBankDetail } from "@/services/modules/bankquestion/interfaces/bankquestion.interface"

export default function QuestionBankDetailPage() {
    const [questionBank, setQuestionBank] = useState<QuestionBankDetail | null>(null)
    const { questionBankId } = useParams<{ questionBankId: string }>()

    const { data: dataQuestionBankDetail, isLoading: isLoadingQuestions, refetch } = useGetQuestionBankDetail(
        questionBankId ?? null,
        {
            isTrigger: !!questionBankId,
        },
    );
    useEffect(() => {
        if (dataQuestionBankDetail && !isLoadingQuestions) {
            setQuestionBank(dataQuestionBankDetail);
        }
    }, [dataQuestionBankDetail, isLoadingQuestions]);

    if (isLoadingQuestions) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải thông tin ngân hàng câu hỏi...</p>
                </div>
            </div>
        )
    }

    if (!questionBank) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Không tìm thấy ngân hàng câu hỏi</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {dataQuestionBankDetail && <QuestionBankDetailHeader questionBank={questionBank} refetch={refetch} />}

            <div className="p-6 space-y-6">
                <div className="grid grid-cols-3 gap-6 items-stretch">
                    <div className="col-span-2">
                        {dataQuestionBankDetail && <QuestionBankDetailInfo questionBank={questionBank} />}
                    </div>
                    <div>
                        {dataQuestionBankDetail && <QuestionBankDetailStats questionBank={questionBank} />}
                    </div>
                </div>

                <QuestionsList questions={questionBank?.questions ?? []} />
            </div>


        </div>
    )
}
