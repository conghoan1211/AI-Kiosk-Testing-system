import FormikField from '@/components/customFieldsFormik/FormikField';
import InputField from '@/components/customFieldsFormik/InputField';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MonitorList } from '@/services/modules/monitor/interfaces/monitor.interface';
import { Form, Formik } from 'formik';
import { debounce } from 'lodash'; // Import debounce from lodash
import { Monitor } from 'lucide-react';
import { useMemo } from 'react';
import * as Yup from 'yup';
import ExamCard from './ExamCard';
import SelectFilterSubject from './SelectFilterSubject';

interface ExamListProps {
  dataMain: MonitorList[];
  getStatusBadge: (status: number) => JSX.Element;
  getRemainingTime: (endTime: Date) => string;
  getCompletionPercentage: (exam: MonitorList) => number;
  onSelectExam: (exam: MonitorList) => void;
  refetch?: () => void;
  currentPage: number;
  totalPage: number;
  onPageChange: (newPage: number) => void;
  setFilters: (filters: any) => void;
}

const ExamList = ({
  dataMain,
  getStatusBadge,
  getRemainingTime,
  getCompletionPercentage,
  onSelectExam,
  refetch,
  currentPage,
  totalPage,
  onPageChange,
  setFilters,
}: ExamListProps) => {
  //!State
  const uniqueDataMain = useMemo(() => {
    const seen = new Set();
    return dataMain.filter((exam) => {
      if (seen.has(exam.examId)) {
        return false;
      }
      seen.add(exam.examId);
      return true;
    });
  }, [dataMain]);

  const initialValues = {
    subject: '',
    search: '',
  };

  const validationSchema = Yup.object({
    subject: Yup.string(),
    search: Yup.string(),
  });

  //!Functions
  const debouncedSubmit = debounce((values: { subject: string; search: string }) => {
    setFilters((prev: any) => ({
      ...prev,
      SubjectId: values.subject,
      TextSearch: values.search,
      CurrentPage: 1,
    }));
  }, 500);

  const handleSubmit = (values: { subject: string; search: string }) => {
    debouncedSubmit(values);
  };

  // Pagination controls
  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPage, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? 'default' : 'outline'}
          onClick={() => onPageChange(i)}
          className="mx-1"
        >
          {i}
        </Button>,
      );
    }

    return (
      <div className="mt-4 flex items-center justify-center space-x-2">
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        {startPage > 1 && <span className="mx-1">...</span>}
        {pages}
        {endPage < totalPage && <span className="mx-1">...</span>}
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPage}
        >
          Next
        </Button>
      </div>
    );
  };

  //!Render
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-gray-800">Danh sách kỳ thi</CardTitle>
            <p className="mt-1 text-sm text-gray-600">Các kỳ thi được phân công giám sát</p>
          </div>
          <div className="min-w-96">
            <Formik<{ subject: string; search: string }>
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ submitForm }) => {
                return (
                  <Form>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <FormikField
                          component={InputField}
                          name="search"
                          placeholder="Tìm kiếm kỳ thi..."
                          onChange={() => submitForm()}
                        />
                      </div>
                      <div className="flex-1">
                        <SelectFilterSubject
                          name="subject"
                          defaultValue=""
                          defaultSubject={{ label: 'Tất cả môn học', value: '' }}
                          onChange={() => submitForm()}
                        />
                      </div>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="ongoing" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger value="ongoing" className="data-[state=active]:bg-white">
              Đang diễn ra ({uniqueDataMain.filter((exam) => exam.status === 1).length})
            </TabsTrigger>
            <TabsTrigger value="not_start" className="data-[state=active]:bg-white">
              Chưa bắt đầu ({uniqueDataMain.filter((exam) => exam.status === 0).length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-white">
              Đã kết thúc ({uniqueDataMain.filter((exam) => exam.status === 2).length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ongoing" className="mt-6 space-y-4">
            {uniqueDataMain
              .filter((exam) => exam.status === 1)
              .map((exam) => (
                <div
                  key={exam.examId}
                  onClick={() => onSelectExam(exam)}
                  className="cursor-pointer"
                >
                  <ExamCard
                    refetch={refetch}
                    exam={exam}
                    getStatusBadge={getStatusBadge}
                    getRemainingTime={getRemainingTime}
                    getCompletionPercentage={getCompletionPercentage}
                  />
                </div>
              ))}
            {uniqueDataMain.filter((exam) => exam.status === 1).length === 0 && (
              <div className="py-12 text-center">
                <Monitor className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-500">Không có kỳ thi nào đang diễn ra</p>
              </div>
            )}
            {totalPage >= 1 && renderPagination()}
          </TabsContent>
          <TabsContent value="not_start" className="mt-6 space-y-4">
            {uniqueDataMain
              .filter((exam) => exam.status === 0)
              .map((exam) => (
                <div
                  key={exam.examId}
                  onClick={() => onSelectExam(exam)}
                  className="cursor-pointer"
                >
                  <ExamCard
                    refetch={refetch}
                    exam={exam}
                    getStatusBadge={getStatusBadge}
                    getRemainingTime={getRemainingTime}
                    getCompletionPercentage={getCompletionPercentage}
                  />
                </div>
              ))}
            {uniqueDataMain.filter((exam) => exam.status === 0).length === 0 && (
              <div className="py-12 text-center">
                <Monitor className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-500">Không có kỳ thi nào chưa bắt đầu</p>
              </div>
            )}
            {totalPage >= 1 && renderPagination()}
          </TabsContent>
          <TabsContent value="completed" className="mt-6 space-y-4">
            {uniqueDataMain
              .filter((exam) => exam.status === 2)
              .map((exam) => (
                <div
                  key={exam.examId}
                  onClick={() => onSelectExam(exam)}
                  className="cursor-pointer"
                >
                  <ExamCard
                    refetch={refetch}
                    exam={exam}
                    getStatusBadge={getStatusBadge}
                    getRemainingTime={getRemainingTime}
                    getCompletionPercentage={getCompletionPercentage}
                  />
                </div>
              ))}
            {uniqueDataMain.filter((exam) => exam.status === 2).length === 0 && (
              <div className="py-12 text-center">
                <Monitor className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-500">Không có kỳ thi nào đã kết thúc</p>
              </div>
            )}
            {totalPage >= 1 && renderPagination()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ExamList;
