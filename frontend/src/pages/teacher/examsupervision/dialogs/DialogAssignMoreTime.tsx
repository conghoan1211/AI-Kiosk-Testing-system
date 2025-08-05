import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateTimeFormat } from '@/consts/dates';
import { Student } from '@/services/modules/monitor/interfaces/monitorDetail.interface';
import { Form, Formik } from 'formik';
import { CheckCircle, Clock, X } from 'lucide-react';
import moment from 'moment';
import { Fragment, useCallback, useEffect, useState } from 'react';
import * as Yup from 'yup';

interface DialogI<T> {
  isOpen: boolean;
  toggle: () => void;
  data?: T;
}

export interface AssignMoreTimeValues {
  studentExamId: string;
  extraMinutes: string | number;
}

interface DialogProps extends DialogI<any> {
  onSubmit?: (values: AssignMoreTimeValues) => void;
  row?: Student | null;
}

const DialogAssignMoreTime = ({ isOpen, toggle, onSubmit, row }: DialogProps) => {
  const [selectedMinutes, setSelectedMinutes] = useState(0);
  const [remainingTimeStr, setRemainingTimeStr] = useState<string>('');

  // Validation schema
  const validationSchema = Yup.object({
    studentExamId: Yup.string().required('Student Exam ID is required'),
    extraMinutes: Yup.number()
      .min(1, 'Must add at least 1 minute')
      .required('Extra minutes is required'),
  });

  // Hàm tính toán thời gian còn lại từ submitTime
  const calculateRemainingTime = useCallback(() => {
    if (!row?.submitTime) return 'Không có thời gian nộp bài';

    const submitDate = new Date(row.submitTime);
    const currentDate = new Date();
    const diffMs = submitDate.getTime() - currentDate.getTime();

    if (diffMs <= 0) {
      return 'Hết thời gian';
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return `${hours > 0 ? `${hours} giờ ` : ''}${minutes > 0 ? `${minutes} phút ` : ''}${seconds} giây`;
  }, [row?.submitTime]);

  // Cập nhật thời gian còn lại mỗi giây
  useEffect(() => {
    if (!isOpen || !row?.submitTime) return;

    setRemainingTimeStr(calculateRemainingTime()); // Cập nhật ngay lập tức khi dialog mở
    const interval = setInterval(() => {
      setRemainingTimeStr(calculateRemainingTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, row?.submitTime, calculateRemainingTime]);

  // Handle time calculation for new time
  const calculateNewTime = (extraMinutes: number) =>
    moment().startOf('day').add(extraMinutes, 'minutes').format(DateTimeFormat.MinuteFormat);

  const quickTimeOptions = [5, 10, 15, 20, 30, 45];

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogContent className="p-0 sm:max-w-[500px]">
        <Formik
          initialValues={{ studentExamId: row?.studentExamId || '', extraMinutes: '' }}
          validationSchema={validationSchema}
          onSubmit={onSubmit || (() => {})}
        >
          {({ isSubmitting, values, setFieldValue, errors }) => {
            const totalMinutes =
              selectedMinutes || Number.parseInt(values.extraMinutes as string) || 0;
            const newTime = calculateNewTime(totalMinutes);

            return (
              <Fragment>
                <div className="flex items-center justify-between p-6 pb-4">
                  <div>
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                      Cấp thêm thời gian
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-gray-600">
                      Cấp thêm thời gian làm bài cho học sinh: {row?.studentExamId || 'N/A'}.
                      <span>
                        {' '}
                        Thời gian còn lại: <strong>{remainingTimeStr}</strong>
                      </span>
                    </DialogDescription>
                    {errors.studentExamId && (
                      <p className="text-sm text-red-600">{errors.studentExamId}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggle}
                    className="h-6 w-6 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="px-6 pb-6">
                  <div className="mb-6 flex items-center justify-between rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Thời gian còn lại:</span>
                      <span className="font-semibold">{remainingTimeStr}</span>
                    </div>
                  </div>

                  <Form className="space-y-6">
                    <div>
                      <Label className="mb-3 block text-sm font-medium text-gray-700">
                        Thời gian cấp thêm (phút)
                      </Label>
                      <div className="mb-3 flex gap-2">
                        <Select
                          value={values.extraMinutes as string}
                          onValueChange={(value) => {
                            setFieldValue('extraMinutes', value);
                            setSelectedMinutes(0);
                          }}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Nhập số phút" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 10, 15, 20, 30, 45, 60].map((min) => (
                              <SelectItem key={min} value={min.toString()}>
                                {min} phút
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2">
                        {quickTimeOptions.map((minutes) => (
                          <Button
                            key={minutes}
                            type="button"
                            variant={selectedMinutes === minutes ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              setSelectedMinutes(minutes);
                              setFieldValue('extraMinutes', minutes.toString());
                            }}
                            className="px-4 py-2"
                          >
                            {minutes}p
                          </Button>
                        ))}
                      </div>
                      {errors.extraMinutes && (
                        <p className="text-sm text-red-600">{errors.extraMinutes}</p>
                      )}
                    </div>

                    {totalMinutes > 0 && (
                      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            Thời gian sau khi cấp thêm
                          </p>
                          <p className="text-lg font-bold text-green-900">{newTime}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={toggle}
                        className="bg-transparent px-6"
                      >
                        Hủy
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting || totalMinutes === 0}
                        className="bg-green-600 px-6 hover:bg-green-700"
                      >
                        {isSubmitting ? 'Đang xử lý...' : `Cấp thêm ${totalMinutes} phút`}
                      </Button>
                    </div>
                  </Form>
                </div>
              </Fragment>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default DialogAssignMoreTime;
