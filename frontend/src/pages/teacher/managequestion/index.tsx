import PageWrapper from '@/components/PageWrapper/PageWrapper';
import cachedKeys from '@/consts/cachedKeys';
import useFiltersHandler from '@/hooks/useFiltersHandler';
import {
  GenericFilters,
  IValueFormPageHeader,
} from '@/pages/admin/manageuser/components/generic-filters';
import { UserStats } from '@/pages/admin/manageuser/components/user-stats';
import useGetListQuestion from '@/services/modules/question/hooks/useGetAllQuestion';
import {
  IQuestionRequest,
  QuestionList,
} from '@/services/modules/question/interfaces/question.interface';
import { useGet, useSave } from '@/stores/useStores';
import { AlbumIcon, Edit, Filter } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ExamHeader from '../examsupervision/components/ExamHeader';
import QuestionCard from './components/question-card';

const ManageQuestion = () => {
  // State
  const save = useSave();
  const defaultData = useGet('dataQuestions');
  const cachedFiltersQuestions = useGet('cachesFilterQuestions');
  const [isTrigger, setTrigger] = useState(Boolean(!defaultData));
  const { filters, setFilters } = useFiltersHandler({
    pageSize: cachedFiltersQuestions?.pageSize || 5,
    currentPage: cachedFiltersQuestions?.currentPage || 1,
    textSearch: cachedFiltersQuestions?.textSearch || '',
    IsMyQuestion: cachedFiltersQuestions?.IsMyQuestion || undefined,
    Status: cachedFiltersQuestions?.Status || undefined,
    DifficultyLevel: cachedFiltersQuestions?.DifficultyLevel || undefined,
  });

  const stableFilters = useMemo(() => filters as IQuestionRequest, [filters]);

  const {
    data: dataQuestion,
    totalPage,
    total,
  } = useGetListQuestion(stableFilters, {
    isTrigger: isTrigger,
    refetchKey: cachedKeys.refetchQuestions,
    saveData: true,
  });

  const dataMain = useMemo(
    () => (isTrigger ? dataQuestion : defaultData) || [],
    [isTrigger, defaultData, dataQuestion],
  );

  useEffect(() => {
    if (dataQuestion && isTrigger) {
      save(cachedKeys.dataQuestions, dataQuestion);
    }
  }, [dataQuestion, isTrigger, save]);

  const statItems = useMemo(() => {
    return [
      {
        title: 'Tổng câu hỏi',
        value: total || 0,
        icon: <AlbumIcon className="h-6 w-6 text-blue-500" />,
        bgColor: 'bg-blue-50',
      },
      {
        title: 'Đang hoạt động',
        value: dataQuestion?.filter((q) => q.status === 1).length || 0,
        icon: <AlbumIcon className="h-6 w-6 text-green-500" />,
        bgColor: 'bg-green-50',
      },
      {
        title: 'Độ khó dễ',
        value: dataQuestion?.filter((q) => q.difficultLevel === 1).length || 0,
        icon: <AlbumIcon className="h-6 w-6 text-yellow-500" />,
        bgColor: 'bg-yellow-50',
      },
      {
        title: 'Độ khó trung bình',
        value: dataQuestion?.filter((q) => q.difficultLevel === 2).length || 0,
        icon: <AlbumIcon className="h-6 w-6 text-orange-500" />,
        bgColor: 'bg-orange-50',
      },
      {
        title: 'Độ khó khó',
        value: dataQuestion?.filter((q) => q.difficultLevel === 3).length || 0,
        icon: <AlbumIcon className="h-6 w-6 text-red-500" />,
        bgColor: 'bg-red-50',
      },
      {
        title: 'Không hoạt động',
        value: dataQuestion?.filter((q) => q.status === 0).length || 0,
        icon: <AlbumIcon className="h-6 w-6 text-gray-500" />,
        bgColor: 'bg-gray-50',
      },
    ];
  }, [dataQuestion, total]);

  const handleEditQuestion = (questionId: string) => {
    console.log('Edit question:', questionId);
    // Implement edit logic here
  };

  const handleDeleteQuestion = (questionId: string) => {
    console.log('Delete question:', questionId);
    // Implement delete logic here
  };

  const handleViewQuestion = (questionId: string) => {
    console.log('View question:', questionId);
    // Implement view logic here
  };

  const handleSearch = useCallback(
    (value: IValueFormPageHeader) => {
      setTrigger(true);
      setFilters((prev: any) => {
        const newParams = {
          ...prev,
          textSearch: value.textSearch || '',
          currentPage: 1,
        };
        save(cachedKeys.cachesFilterQuestions, newParams);
        return newParams;
      });
    },
    [setFilters, save],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setTrigger(true);
      setFilters((prev: any) => {
        const newParams = {
          ...prev,
          currentPage: page,
        };
        save(cachedKeys.cachesFilterQuestions, newParams);
        return newParams;
      });
    },
    [setFilters, save],
  );

  const Pagination = ({ currentPage, totalPages }: { currentPage: number; totalPages: number }) => {
    const pages = [];

    if (currentPage > 1) {
      pages.push(1);
    }

    if (currentPage - 2 > 1) {
      pages.push(currentPage - 2);
    }

    if (currentPage - 1 >= 1) {
      pages.push('...');
    }

    pages.push(currentPage);

    if (currentPage + 1 <= totalPages) {
      pages.push('...');
    }

    if (currentPage + 2 < totalPages) {
      pages.push(currentPage + 2);
    }

    if (currentPage < totalPages) {
      pages.push(totalPages);
    }

    return (
      <div className="mt-6 flex items-center justify-center space-x-2">
        {/* First Page Button */}
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="rounded bg-gray-200 px-3 py-1 text-gray-700 disabled:opacity-50"
        >
          First
        </button>

        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded bg-gray-200 px-3 py-1 text-gray-700 disabled:opacity-50"
        >
          Previous
        </button>

        {/* Page Numbers and Ellipses */}
        {pages.map((page, index) =>
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-3 py-1">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageChange(page as number)}
              className={`rounded px-3 py-1 ${
                page === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {page}
            </button>
          ),
        )}

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded bg-gray-200 px-3 py-1 text-gray-700 disabled:opacity-50"
        >
          Next
        </button>

        {/* Last Page Button */}
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="rounded bg-gray-200 px-3 py-1 text-gray-700 disabled:opacity-50"
        >
          Last
        </button>
      </div>
    );
  };

  return (
    <PageWrapper name="Quản lý câu hỏi" className="bg-white dark:bg-gray-900">
      <div className="space-y-6">
        <ExamHeader
          title="Quản lý câu hỏi"
          subtitle="Tạo, chỉnh sửa và quản lý các câu hỏi của bạn"
          icon={<Edit className="h-8 w-8 text-white" />}
          className="border-b border-white/20 bg-gradient-to-r from-blue-600 to-green-700 px-6 py-6 shadow-lg"
        />

        <UserStats statItems={statItems} className="lg:grid-cols-6" />

        <div className="space-y-6">
          {/* Filters and Search */}
          <GenericFilters
            className="md:grid-cols-3 lg:grid-cols-5"
            searchPlaceholder="Tìm kiếm câu hỏi..."
            onSearch={handleSearch}
            initialSearchQuery={filters.textSearch}
            filters={[
              {
                key: 'Status',
                placeholder: 'Trạng thái',
                options: [
                  { label: 'Tất cả', value: undefined },
                  { label: 'Không hoạt động', value: 0 },
                  { label: 'Đang hoạt động', value: 1 },
                  { label: 'Chưa phân loại', value: 2 },
                ],
              },
              {
                key: 'DifficultyLevel',
                placeholder: 'Độ khó',
                options: [
                  { label: 'Tất cả', value: undefined },
                  { label: 'Dễ', value: 1 },
                  { label: 'Trung bình', value: 2 },
                  { label: 'Khó', value: 3 },
                  { label: 'Rất khó', value: 4 },
                ],
              },
              {
                key: 'IsMyQuestion',
                placeholder: 'Câu hỏi của tôi',
                options: [
                  { label: 'Tất cả', value: undefined },
                  { label: 'Câu hỏi của tôi', value: true },
                  { label: 'Không phải câu hỏi của tôi', value: false },
                ],
              },
            ]}
            onFilterChange={(
              newFilters: Record<string, string | number | boolean | null | undefined>,
            ) => {
              setTrigger(true);
              setFilters((prev) => {
                const updatedFilters = {
                  ...prev,
                  ...newFilters,
                  currentPage: 1, // Reset to page 1 on filter change
                };
                save(cachedKeys.cachesFilterQuestions, updatedFilters);
                return updatedFilters;
              });
            }}
            addNewButtonText="Thêm đề thi mới"
          />

          {/* Questions Grid */}
          {dataMain.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {dataMain.map((question: QuestionList) => (
                  <QuestionCard
                    key={question.questionId}
                    question={question}
                    onEdit={() => handleEditQuestion(question.questionId)}
                    onDelete={() => handleDeleteQuestion(question.questionId)}
                    onView={() => handleViewQuestion(question.questionId)}
                  />
                ))}
              </div>
              {totalPage > 1 && (
                <Pagination currentPage={filters.currentPage} totalPages={totalPage} />
              )}
            </>
          ) : (
            <div className="py-12 text-center">
              <div className="mb-4 text-gray-400">
                <Filter className="mx-auto h-12 w-12" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">Không tìm thấy câu hỏi nào</h3>
              <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default ManageQuestion;
