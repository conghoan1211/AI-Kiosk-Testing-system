import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Download, Share } from "lucide-react"
import { IQuestionBankForm, QuestionBankDetail } from "@/services/modules/bankquestion/interfaces/bankquestion.interface"
import { useMemo, useState } from "react"
import AddQuestionBankModal from "../add-question-bank-modal"
import httpService from "@/services/httpService"
import { QUESTION_BANK_URL } from "@/consts/apiUrl"
import { showError, showSuccess } from "@/helpers/toast"
import { useParams } from "react-router-dom"
import useGetAllSubjectV2 from "@/services/modules/subject/hooks/useGetAllSubjectV2"
import useFiltersHandler from "@/hooks/useFiltersHandler"
import { ISubjectRequest } from "@/services/modules/subject/interfaces/subject.interface"
import axios from "axios"

interface QuestionBankHeaderProps {
    questionBank: QuestionBankDetail | null
    refetch: () => void
}

export function QuestionBankDetailHeader({ questionBank, refetch }: QuestionBankHeaderProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const token = httpService.getTokenStorage()
    const { questionBankId } = useParams<{ questionBankId: string }>()
    const { filters } = useFiltersHandler({
        pageSize: 10000,
        currentPage: 1,
        textSearch: "",
    });

    const stableFilters = useMemo(() => filters as ISubjectRequest, [filters]);
    const { data: subjects } = useGetAllSubjectV2(stableFilters, {});
    const getStatusBadge = (status: number) => {
        switch (status) {
            case 1:
                return <Badge className="bg-green-100 text-green-800 border-green-200">Hoạt động</Badge>
            case 0:
                return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Không hoạt động</Badge>
            default:
                return <Badge variant="outline">Không xác định</Badge>
        }
    }

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
        setTimeout(() =>
            refetch(), 1000
        )
    };

    const getExportFile = async () => {
        try {
            const response = await axios.get(
                `${QUESTION_BANK_URL}/export/${questionBankId}`,
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
            let fileName = 'bank_question_detail.xlsx';
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
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{questionBank?.questionBankName}</h1>
                        <p className="text-gray-600 mt-1">Ngân hàng câu hỏi • {questionBank?.subjectName}</p>
                    </div>
                    {getStatusBadge(questionBank?.status ?? -1)}
                </div>
                <div className="flex items-center space-x-3">
                    <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Chỉnh sửa
                    </Button>
                    <Button variant="outline" onClick={() => getExportFile()}>
                        <Download className="w-4 h-4 mr-2" />
                        Xuất file
                    </Button>
                    <Button variant="outline">
                        <Share className="w-4 h-4 mr-2" />
                        Chia sẻ
                    </Button>

                </div>
            </div>
            <AddQuestionBankModal
                id={questionBankId}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleEditQuestionBank}
                dataSubjects={subjects}
            />
        </div>
    )
}
