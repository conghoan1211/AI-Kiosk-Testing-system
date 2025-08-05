import PageWrapper from '@/components/PageWrapper/PageWrapper';
import CKEditorField from '@/components/customFieldsFormik/CKEditorField';
import DateTimePickerField from '@/components/customFieldsFormik/DateTimePickerField';
import FormikField from '@/components/customFieldsFormik/FormikField';
import InputField from '@/components/customFieldsFormik/InputField';
import SelectField from '@/components/customFieldsFormik/SelectField';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import cachedKeys from '@/consts/cachedKeys';
import { ExamStatus, ExamType } from '@/consts/common';
import { showError, showSuccess } from '@/helpers/toast';
import useFiltersHandler from '@/hooks/useFiltersHandler';
import useToggleDialog from '@/hooks/useToggleDialog';
import useGetExamDetail from '@/services/modules/manageexam/hooks/useGetExamDetail';
import type { IManageExamFormValue } from '@/services/modules/manageexam/interfaces/manageExam.interface';
import manageExamService from '@/services/modules/manageexam/manageExam.service';
import useGetListAllRooms from '@/services/modules/room/hooks/useGetAllRooms';
import { useSave } from '@/stores/useStores';
import { Form, Formik } from 'formik';
import {
  BookOpen,
  CheckCircle,
  Clock,
  FileText,
  GraduationCap,
  Plus,
  Settings,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Fragment } from 'react/jsx-runtime';
import * as Yup from 'yup';
import SelectedQuestionsDisplay from '../components/selected-questions-display';
import DialogAddQuestionBankTeacher from '../dialogs/DialogBankQuestion';

const validationSchema = Yup.object({
  title: Yup.string().required('Tiêu đề bài thi là bắt buộc'),
  examType: Yup.number().required('Loại bài thi là bắt buộc'),
  duration: Yup.number()
    .required('Thời gian làm bài là bắt buộc')
    .min(1, 'Thời gian làm bài phải lớn hơn 0'),
  startTime: Yup.date().required('Thời gian bắt đầu là bắt buộc'),
  endTime: Yup.date()
    .required('Thời gian kết thúc là bắt buộc')
    .min(Yup.ref('startTime'), 'Thời gian kết thúc phải sau thời gian bắt đầu')
    .test(
      'is-future',
      'Thời gian kết thúc phải trong tương lai',
      (value) => value && value > new Date(),
    ),
  isShowCorrectAnswer: Yup.boolean().required('Trạng thái hiển thị đáp án đúng là bắt buộc'),
  status: Yup.number().required('Trạng thái bài thi là bắt buộc'),
  isShowResult: Yup.boolean().required('Trạng thái hiển thị kết quả là bắt buộc'),
  roomId: Yup.string().required('Phòng học là bắt buộc'),
  guideLines: Yup.string()
    .optional()
    .test('is-not-empty', 'Hướng dẫn không được để trống', (value) => {
      const strippedValue = value?.replace(/<[^>]+>/g, '') ?? '';
      return strippedValue.trim().length > 0;
    }),
});

const AddNewExamLecture = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const save = useSave();

  const { data: dataExamDetail } = useGetExamDetail(examId, {
    isTrigger: !!examId,
  });

  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
  const [selectedQuestionBankId, setSelectedQuestionBankId] = useState<string>('');

  // Sync selectedQuestions and selectedQuestionBankId with dataExamDetail when it changes
  useEffect(() => {
    if (examId && dataExamDetail?.questions) {
      const newSelectedQuestions = dataExamDetail.questions.map((q) => ({
        questionId: q.questionId,
        content: q.content,
        difficulty: q.difficulty?.toString(),
        questionBankName: q.questionBankName,
        subjectName: dataExamDetail?.roomName,
      }));
      setSelectedQuestions(newSelectedQuestions);
      setSelectedQuestionBankId(dataExamDetail.questions[0]?.questionBankId || '');
    } else {
      setSelectedQuestions([]);
      setSelectedQuestionBankId('');
    }
  }, [examId, dataExamDetail]);

  const [
    isOpenDialogAddQuestionBankTeacher,
    toggleDialogAddQuestionBankTeacher,
    shouldRenderDialogAddQuestionBankTeacher,
  ] = useToggleDialog();

  const { filters: filterRoom } = useFiltersHandler({
    PageSize: 50,
    CurrentPage: 1,
    TextSearch: '',
  });

  const { data: dataRoomList } = useGetListAllRooms(filterRoom, {
    isTrigger: true,
  });

  const initialValues: IManageExamFormValue = useMemo(
    () => ({
      examId: examId || '',
      roomId: examId ? dataExamDetail?.roomId || '' : '',
      title: examId ? dataExamDetail?.title || '' : '',
      description: examId ? dataExamDetail?.description || '' : '',
      duration: examId ? dataExamDetail?.duration || 0 : 60,
      startTime: examId ? (dataExamDetail?.startTime ?? null) : new Date(),
      endTime: examId ? (dataExamDetail?.endTime ?? null) : new Date(),
      isShowResult: examId ? dataExamDetail?.isShowResult || false : true,
      isShowCorrectAnswer: examId ? dataExamDetail?.isShowCorrectAnswer || false : true,
      status: examId ? dataExamDetail?.status || 0 : 0,
      examType: examId ? dataExamDetail?.examType || 0 : 0,
      questionBankId: selectedQuestionBankId,
      questionIds: selectedQuestions.map((q) => q.questionId),
      guideLines: examId
        ? typeof dataExamDetail?.guideLines === 'string'
          ? dataExamDetail.guideLines
          : ''
        : '',
    }),
    [examId, dataExamDetail, selectedQuestionBankId, selectedQuestions],
  );

  const handleSubmitAddNewExam = useCallback(
    async (values: IManageExamFormValue) => {
      try {
        if (examId) {
          await manageExamService.updateExam({
            ...values,
            questionIds: selectedQuestions.map((q) => q.questionId),
            questionBankId: selectedQuestionBankId,
          });
          save(cachedKeys.dataExamTeacher, null);
          save(cachedKeys.forceRefetchExamTeacher, true);
          showSuccess('Cập nhật bài thi thành công!');
          navigate(-1);
          return;
        }
        await manageExamService.addNewExam({
          ...values,
          questionIds: selectedQuestions.map((q) => q.questionId),
          questionBankId: selectedQuestionBankId,
        });
        save(cachedKeys.dataExamTeacher, null);
        save(cachedKeys.forceRefetchExamTeacher, true);
        showSuccess('Thêm đề thi thành công!');
        navigate(-1);
      } catch (error) {
        showError(error);
      }
    },
    [selectedQuestions, selectedQuestionBankId, navigate, examId, save],
  );

  const handleQuestionBankSubmit = useCallback(
    (data: { questionBankId: string; selectedQuestions: any[] }) => {
      setSelectedQuestionBankId(data.questionBankId);
      setSelectedQuestions(data.selectedQuestions);
    },
    [],
  );

  const handleRemoveQuestion = useCallback((questionId: string) => {
    setSelectedQuestions((prev) => prev.filter((q) => q.questionId !== questionId));
  }, []);

  const handleMoveQuestion = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= selectedQuestions.length) return;
      setSelectedQuestions((prev) => {
        const newQuestions = [...prev];
        const [movedQuestion] = newQuestions.splice(fromIndex, 1);
        newQuestions.splice(toIndex, 0, movedQuestion);
        return newQuestions;
      });
    },
    [selectedQuestions.length],
  );

  return (
    <PageWrapper name="Quản lý đề thi" className="bg-white dark:bg-gray-900">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="h-full w-full">
          {shouldRenderDialogAddQuestionBankTeacher && (
            <DialogAddQuestionBankTeacher
              isOpen={isOpenDialogAddQuestionBankTeacher}
              toggle={toggleDialogAddQuestionBankTeacher}
              onSubmit={handleQuestionBankSubmit}
              initialSelectedQuestions={selectedQuestions}
            />
          )}

          <div className="mb-4">
            <div className="mb-1 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {examId ? 'Cập nhật bài thi' : 'Tạo bài thi mới'}
                </h1>
                <p className="mt-0.5 text-sm text-gray-600">
                  Quản lý và tạo bài thi cho học sinh một cách dễ dàng
                </p>
              </div>
            </div>
          </div>

          <Card className="min-h-[calc(100vh-6rem)] w-full border-0 bg-white/80 shadow-md backdrop-blur-sm">
            <CardContent className="h-full p-6">
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmitAddNewExam}
                enableReinitialize
              >
                {({ isSubmitting, values, errors }) => {
                  return (
                    <Fragment>
                      <Form className="space-y-6">
                        {/* Question Bank Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-600">
                              <BookOpen className="h-3.5 w-3.5" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">
                              Ngân hàng câu hỏi
                            </h2>
                            {selectedQuestions.length > 0 && (
                              <Badge
                                variant="secondary"
                                className="bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700"
                              >
                                {selectedQuestions.length} câu hỏi
                              </Badge>
                            )}
                          </div>

                          <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                            <div className="space-y-3">
                              <div>
                                <label className="mb-2 block text-xs font-medium text-gray-700">
                                  Chọn ngân hàng câu hỏi <span className="text-red-500">*</span>
                                </label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={toggleDialogAddQuestionBankTeacher}
                                  className="h-10 w-full justify-start border-2 border-dashed border-gray-300 bg-white transition-all duration-200 hover:border-blue-400 hover:bg-blue-50"
                                >
                                  <Plus className="mr-2 h-3.5 w-3.5" />
                                  {selectedQuestions.length > 0
                                    ? `Đã chọn ${selectedQuestions.length} câu hỏi`
                                    : 'Chọn câu hỏi từ ngân hàng...'}
                                </Button>
                              </div>

                              <SelectedQuestionsDisplay
                                questions={selectedQuestions}
                                onRemoveQuestion={handleRemoveQuestion}
                                onMoveQuestion={handleMoveQuestion}
                              />

                              {errors.questionIds && (
                                <div className="text-xs text-red-500">{errors.questionIds}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Basic Information Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 text-blue-600">
                              <FileText className="h-3.5 w-3.5" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">
                              Thông tin cơ bản
                            </h2>
                          </div>

                          <div className="grid gap-6 lg:grid-cols-2">
                            <div className="space-y-1.5">
                              <FormikField
                                component={SelectField}
                                name="roomId"
                                placeholder="Chọn phòng học"
                                label="Phòng học"
                                required
                                options={
                                  dataRoomList?.map((item) => ({
                                    value: item.roomId,
                                    label: item.classCode,
                                  })) || []
                                }
                                shouldHideSearch
                              />
                            </div>

                            <div className="space-y-1.5">
                              <FormikField
                                component={SelectField}
                                name="examType"
                                placeholder="Chọn loại bài thi"
                                label="Loại bài thi"
                                required
                                options={ExamType.map((item) => ({
                                  value: item.value,
                                  label: item.label,
                                }))}
                                shouldHideSearch
                              />
                            </div>

                            <div className="space-y-1.5">
                              <FormikField
                                component={InputField}
                                name="title"
                                placeholder="Nhập tiêu đề bài thi"
                                label="Tiêu đề bài thi"
                                required
                              />
                            </div>

                            <div className="space-y-1.5">
                              <FormikField
                                component={InputField}
                                name="description"
                                placeholder="Nhập mô tả bài thi"
                                label="Mô tả bài thi"
                              />
                            </div>
                          </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Time Settings Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-100 text-orange-600">
                              <Clock className="h-3.5 w-3.5" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">
                              Cài đặt thời gian
                            </h2>
                          </div>

                          <div className="grid gap-6 lg:grid-cols-3">
                            <div className="space-y-1.5">
                              <FormikField
                                component={InputField}
                                name="duration"
                                placeholder="Nhập thời gian làm bài (phút)"
                                label="Thời gian làm bài (phút)"
                                required
                                isNumberic
                              />
                            </div>

                            <div className="space-y-1.5">
                              <FormikField
                                component={DateTimePickerField}
                                name="startTime"
                                placeholder="Chọn thời gian bắt đầu"
                                label="Thời gian bắt đầu"
                                required
                                disableCallback={(date: any) => {
                                  return date <= new Date();
                                }}
                              />
                            </div>

                            <div className="space-y-1.5">
                              <FormikField
                                component={DateTimePickerField}
                                name="endTime"
                                placeholder="Chọn thời gian kết thúc"
                                label="Thời gian kết thúc"
                                required
                                disableCallback={(date: any) => {
                                  if (values.startTime) {
                                    return date <= new Date(values.startTime);
                                  }
                                  return false;
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Display Settings Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-100 text-purple-600">
                              <Settings className="h-3.5 w-3.5" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">
                              Cài đặt hiển thị
                            </h2>
                          </div>

                          <div className="grid gap-6 lg:grid-cols-3">
                            <div className="space-y-1.5">
                              <FormikField
                                component={SelectField}
                                name="isShowResult"
                                placeholder="Hiển thị kết quả"
                                label="Hiển thị kết quả"
                                required
                                options={[
                                  { value: true, label: 'Hiển thị kết quả' },
                                  { value: false, label: 'Không hiển thị kết quả' },
                                ]}
                                shouldHideSearch
                              />
                            </div>

                            <div className="space-y-1.5">
                              <FormikField
                                component={SelectField}
                                name="isShowCorrectAnswer"
                                placeholder="Hiển thị đáp án đúng"
                                label="Hiển thị đáp án đúng"
                                required
                                options={[
                                  { value: true, label: 'Hiển thị đáp án đúng' },
                                  { value: false, label: 'Không hiển thị đáp án đúng' },
                                ]}
                                shouldHideSearch
                              />
                            </div>

                            <div className="space-y-1.5">
                              <FormikField
                                component={SelectField}
                                name="status"
                                placeholder="Trạng thái bài thi"
                                label="Trạng thái bài thi"
                                required
                                options={ExamStatus.map((item) => ({
                                  value: item.value,
                                  label: item.label,
                                }))}
                                shouldHideSearch
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <CKEditorField label="Hướng dẫn làm bài" name="guideLines" />
                            {errors.guideLines && (
                              <div className="text-xs text-red-500">{errors.guideLines}</div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col-reverse gap-2 pt-6 sm:flex-row sm:justify-end">
                          <Button
                            variant="outline"
                            type="button"
                            className="h-10 bg-transparent px-6 font-medium"
                          >
                            Hủy
                          </Button>
                          <Button
                            type="submit"
                            isLoading={isSubmitting}
                            className="h-10 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 font-medium shadow-md hover:from-blue-700 hover:to-indigo-700"
                          >
                            <CheckCircle className="mr-2 h-3.5 w-3.5" />
                            {examId ? 'Cập nhật bài thi' : 'Tạo bài thi mới'}
                          </Button>
                        </div>
                      </Form>
                    </Fragment>
                  );
                }}
              </Formik>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
};

export default AddNewExamLecture;
