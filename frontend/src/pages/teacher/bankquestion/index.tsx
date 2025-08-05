import { useMemo, useState } from "react";
import QuestionBankHeader from "./components/question-bank-header";
import QuestionBankSearch from "./components/question-bank-search";
import QuestionBankStats from "./components/question-bank-stats";
import { IBankQuestionRequest } from "@/services/modules/bankquestion/interfaces/bankquestion.interface";
import useGetListBankQuestion from "@/services/modules/bankquestion/hooks/useGetAllBankQuestion";
import { ISubjectRequest } from "@/services/modules/subject/interfaces/subject.interface";
import useFiltersHandler from "@/hooks/useFiltersHandler";
import useGetAllSubjectV2 from "@/services/modules/subject/hooks/useGetAllSubjectV2";
import BankQuestionCard from "./components/bank-question-card";
import { Button } from "@/components/ui/button";
import httpService from "@/services/httpService";

const BankQuestion = () => {
  const user = httpService.getUserStorage()

  //! State
  const [filtersBankquestion, setFiltersBankquestion] = useState<IBankQuestionRequest>({
    pageSize: 6,
    currentPage: 1,
    status: 1,
    textSearch: '',
    IsMyQuestion: user?.roleId.at(0) === 4 ? false : true,
    filterSubject: ''
  });

  // const [filterQuestion] = useState<IQuestionRequest>({
  //   pageSize: 300,
  //   currentPage: 1,
  //   textSearch: "",
  //   IsMyQuestion: true,
  // });

  const { filters } = useFiltersHandler({
    pageSize: 10000,
    currentPage: 1,
    textSearch: "",
  });

  const stableFilters = useMemo(() => filters as ISubjectRequest, [filters]);
  const { data: subjects } = useGetAllSubjectV2(stableFilters, {});
  // const { data: dataQuestion } = useGetListQuestion(filterQuestion);
  const { data, refetch, totalPage, totalQuestionBanks, totalQuestionsQB } = useGetListBankQuestion(filtersBankquestion);

  // Stats data
  const stats = {
    questionBanks: totalQuestionBanks,
    totalQuestions: totalQuestionsQB,
    subjects: subjects ? subjects.length : 0,
  };

  // Phân trang
  const currentPage = filtersBankquestion.currentPage;

  // Xử lý chuyển trang
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPage) {
      setFiltersBankquestion((prev) => ({
        ...prev,
        currentPage: page,
      }));
    }
  };

  //! Render
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {subjects && <QuestionBankHeader refetch={refetch} dataSubjects={subjects} />}
        <QuestionBankStats stats={stats} />
        <QuestionBankSearch filter={filtersBankquestion} setFilter={setFiltersBankquestion} />
        <BankQuestionCard refetch={refetch} bankquestion={data} dataSubjects={subjects} />
        {/* Phân trang */}
        {totalPage >= 1 && (
          <div className="mt-4 flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: totalPage }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPage}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankQuestion;