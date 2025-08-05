import CheckBoxField from '@/components/customFieldsFormik/CheckBoxField';
import FormikField from '@/components/customFieldsFormik/FormikField';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { DateTimeFormat } from '@/consts/dates';
import { convertUTCToVietnamTime } from '@/helpers/common';
import useDebounce from '@/hooks/useDebounce';
import useFiltersHandler from '@/hooks/useFiltersHandler';
import useGetListExams from '@/services/modules/supervisor/hooks/useGetListExams';
import useGetListSupervisors from '@/services/modules/supervisor/hooks/useGetListSupervisors';
import {
  ListExamSupervisor,
  ListSupervisor,
} from '@/services/modules/supervisor/interfaces/supervisor.interface';
import { FieldArray, Form, Formik } from 'formik';
import { Check, Clock, FileText, Mail, Search, Users } from 'lucide-react';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';

interface DialogI<T> {
  isOpen: boolean;
  toggle: () => void;
  onSubmit?: (values: T) => void;
}
interface DialogProps extends DialogI<any> {}

const validationSchema = Yup.object().shape({
  examId: Yup.array().min(1, 'Vui lòng chọn một kỳ thi').max(1, 'Chỉ được chọn một kỳ thi'),
  supervisorId: Yup.array().min(1, 'Vui lòng chọn ít nhất một giám thị'),
  note: Yup.string().max(500, 'Ghi chú không được vượt quá 500 ký tự').optional(),
});

const DialogAssignSuppervisor = (props: DialogProps) => {
  const { isOpen, toggle, onSubmit } = props;

  const { filters: examFilters, setFilters: updateExamFilters } = useFiltersHandler({
    PageSize: 10,
    CurrentPage: 1,
    TextSearch: '',
  });
  const { filters: supervisorFilters, setFilters: updateSupervisorFilters } = useFiltersHandler({
    PageSize: 10,
    CurrentPage: 1,
    TextSearch: '',
  });

  // State for search inputs
  const [examSearch, setExamSearch] = useState('');
  const [supervisorSearch, setSupervisorSearch] = useState('');

  // Debounced search values
  const debouncedExamSearch = useDebounce(examSearch, 1000);
  const debouncedSupervisorSearch = useDebounce(supervisorSearch, 1000);

  // Memoized filter objects to prevent unnecessary re-renders
  const memoizedExamFilters = useMemo(
    () => ({
      PageSize: examFilters.PageSize,
      CurrentPage: examFilters.CurrentPage,
      TextSearch: debouncedExamSearch,
    }),
    [examFilters.PageSize, examFilters.CurrentPage, debouncedExamSearch],
  );

  const memoizedSupervisorFilters = useMemo(
    () => ({
      PageSize: supervisorFilters.PageSize,
      CurrentPage: supervisorFilters.CurrentPage,
      TextSearch: debouncedSupervisorSearch,
    }),
    [supervisorFilters.PageSize, supervisorFilters.CurrentPage, debouncedSupervisorSearch],
  );

  const { data: supervisorsData, loading: isLoadingSupervisors } = useGetListSupervisors(
    memoizedSupervisorFilters,
    { isTrigger: isOpen },
  );

  const { data: examsData, loading: isLoadingExams } = useGetListExams(memoizedExamFilters, {
    isTrigger: isOpen,
  });

  // Deduplicate exams and supervisors data
  const uniqueExamsData = useMemo(() => {
    const seen = new Set();
    return examsData.filter((exam) => {
      if (seen.has(exam.examId)) return false;
      seen.add(exam.examId);
      return true;
    });
  }, [examsData]);

  const uniqueSupervisorsData = useMemo(() => {
    const seen = new Set();
    return supervisorsData.filter((supervisor) => {
      if (seen.has(supervisor.userId)) return false;
      seen.add(supervisor.userId);
      return true;
    });
  }, [supervisorsData]);

  // Update filters when debounced search values change
  const handleExamSearchUpdate = useCallback(() => {
    updateExamFilters((prev) => ({
      ...prev,
      TextSearch: debouncedExamSearch,
      CurrentPage: 1,
    }));
  }, [debouncedExamSearch, updateExamFilters]);

  const handleSupervisorSearchUpdate = useCallback(() => {
    updateSupervisorFilters((prev) => ({
      ...prev,
      TextSearch: debouncedSupervisorSearch,
      CurrentPage: 1,
    }));
  }, [debouncedSupervisorSearch, updateSupervisorFilters]);

  useEffect(() => {
    if (isOpen) {
      handleExamSearchUpdate();
    }
  }, [debouncedExamSearch, handleExamSearchUpdate, isOpen]);

  useEffect(() => {
    if (isOpen) {
      handleSupervisorSearchUpdate();
    }
  }, [debouncedSupervisorSearch, handleSupervisorSearchUpdate, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="max-w-[900px] overflow-hidden p-6 sm:p-8 md:p-10">
          <Formik
            enableReinitialize
            initialValues={{
              examId: [] as string[],
              supervisorId: [] as string[],
              note: '',
            }}
            validationSchema={validationSchema}
            onSubmit={onSubmit || (() => {})}
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <Fragment>
                <DialogTitle className="mb-4 text-2xl font-bold">
                  Phân công giám sát thi
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Form to assign supervisors to exams.
                </DialogDescription>
                <Form className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Left Column: Exams */}
                    <div className="flex flex-col gap-4">
                      <h3 className="text-lg font-semibold">Chọn kỳ thi cần phân công</h3>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Tìm kiếm kỳ thi..."
                          className="pl-9"
                          value={examSearch}
                          onChange={(e) => setExamSearch(e.target.value)}
                        />
                      </div>
                      <ScrollArea className="h-[300px] rounded-md border p-4">
                        <FieldArray name="examId">
                          {() => (
                            <div className="grid gap-4">
                              {uniqueExamsData.map((exam: ListExamSupervisor) => (
                                <div
                                  key={exam.examId}
                                  className="flex items-start gap-3 rounded-md border p-3 pr-2"
                                >
                                  <FormikField
                                    component={CheckBoxField}
                                    name="examId"
                                    value={exam.examId}
                                    checked={values.examId.includes(exam.examId)}
                                    afterOnChange={(checked: boolean) => {
                                      const currentExamIds = values.examId;
                                      if (checked) {
                                        setFieldValue('examId', [exam.examId]); // Enforce single selection
                                      } else {
                                        setFieldValue(
                                          'examId',
                                          currentExamIds.filter((id) => id !== exam.examId),
                                        );
                                      }
                                    }}
                                    className="mt-1"
                                  />
                                  <div className="grid flex-1 gap-1">
                                    <div className="text-sm font-medium leading-none">
                                      {exam.subjectName}
                                    </div>
                                    <div className="grid gap-1 text-xs text-muted-foreground">
                                      <div className="flex items-center gap-2">
                                        <FileText className="h-3 w-3" />
                                        <span>{exam.classCode}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-3 w-3" />
                                        <span>{`${convertUTCToVietnamTime(
                                          exam.startTime,
                                          DateTimeFormat.Time,
                                        )} - ${convertUTCToVietnamTime(
                                          exam.endTime,
                                          DateTimeFormat.Time,
                                        )}`}</span>
                                        <Users className="ml-2 h-3 w-3" />
                                      </div>
                                      <span>
                                        {convertUTCToVietnamTime(
                                          exam.createdAt,
                                          DateTimeFormat.Date,
                                        )?.toString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {isLoadingExams && <div className="text-center">Đang tải...</div>}
                            </div>
                          )}
                        </FieldArray>
                      </ScrollArea>
                    </div>

                    {/* Right Column: Supervisors */}
                    <div className="flex flex-col gap-4">
                      <h3 className="text-lg font-semibold">Chọn giám thị</h3>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Tìm kiếm giám thị..."
                          className="pl-9"
                          value={supervisorSearch}
                          onChange={(e) => setSupervisorSearch(e.target.value)}
                        />
                      </div>
                      <ScrollArea className="h-[300px] rounded-md border p-4">
                        <FieldArray name="supervisorId">
                          {() => (
                            <div className="grid gap-4">
                              {uniqueSupervisorsData.map((supervisor: ListSupervisor) => (
                                <div
                                  key={supervisor.userId}
                                  className="flex items-start gap-3 rounded-md border p-3 pr-2"
                                >
                                  <FormikField
                                    component={CheckBoxField}
                                    name="supervisorId"
                                    value={supervisor.userId}
                                    checked={values.supervisorId.includes(supervisor.userId)}
                                    afterOnChange={(checked: boolean) => {
                                      const currentSupervisorIds = values.supervisorId;
                                      if (checked) {
                                        setFieldValue('supervisorId', [
                                          ...currentSupervisorIds,
                                          supervisor.userId,
                                        ]);
                                      } else {
                                        setFieldValue(
                                          'supervisorId',
                                          currentSupervisorIds.filter(
                                            (id) => id !== supervisor.userId,
                                          ),
                                        );
                                      }
                                    }}
                                    className="mt-1"
                                  />
                                  <div className="grid flex-1 gap-1">
                                    <div className="text-sm font-medium leading-none">
                                      {supervisor.fullName}
                                    </div>
                                    <div className="grid gap-1 text-xs text-muted-foreground">
                                      <div className="flex items-center gap-2">
                                        <Mail className="h-3 w-3" />
                                        <span>{supervisor.email}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {isLoadingSupervisors && (
                                <div className="text-center">Đang tải...</div>
                              )}
                            </div>
                          )}
                        </FieldArray>
                      </ScrollArea>
                    </div>
                  </div>

                  {/* Bottom Section: Notes */}
                  <div className="space-y-4">
                    <div>
                      <FormikField component={Textarea} name="note" label="Ghi chú (tùy chọn)" />
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="flex justify-end gap-2 border-t pt-4">
                    <Button variant="ghost" type="button" onClick={toggle}>
                      Hủy bỏ
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      <Check className="mr-2 h-4 w-4" />
                      Phân công
                    </Button>
                  </div>
                </Form>
              </Fragment>
            )}
          </Formik>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default DialogAssignSuppervisor;
