import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { DateTimeFormat } from '@/consts/dates';
import { convertUTCToVietnamTime } from '@/helpers/common';
import type { DialogI } from '@/interfaces/common';
import useGetAlertDetail from '@/services/modules/alert/hooks/useGetDetailAlert';
import { Form, Formik } from 'formik';
import { CheckCircle, Clock, User } from 'lucide-react';
import { Fragment } from 'react';

interface DialogProps extends DialogI<any> {
  alertId: string;
}

export interface AlertDetail {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  studentName: string;
  studentAvatar: string;
  studentUserCode: string;
  createdName: string;
  createdAvatar: string;
  createdUserCode: string;
  createdAt: Date;
}

const DialogDetailNotify = (props: DialogProps) => {
  const { isOpen, toggle, onSubmit, alertId } = props;
  const { data: dataAlertDetail, isLoading } = useGetAlertDetail(alertId, {
    isTrigger: isOpen,
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} giờ trước`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} ngày trước`;
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={toggle}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <div className="flex items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <Formik initialValues={{}} onSubmit={onSubmit || (() => {})}>
            {() => {
              return (
                <Fragment>
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <DialogTitle className="text-lg font-semibold">
                          Chi tiết thông báo
                        </DialogTitle>
                        <span className="text-sm text-gray-500">
                          {dataAlertDetail?.isRead ? 'Đã đọc' : 'Chưa đọc'}
                        </span>
                      </div>

                      <DialogDescription className="text-base font-medium text-gray-900">
                        {dataAlertDetail?.message || 'Báo cáo vi phạm thành công'}
                      </DialogDescription>

                      <p className="text-sm text-gray-600">
                        Thông tin vi phạm của học sinh {dataAlertDetail?.studentName} đã được ghi
                        nhận và chuyển đến ban giám hiệu để xử lý.
                      </p>
                    </div>

                    {/* Time and Creator Info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          {dataAlertDetail?.createdAt && formatTimeAgo(dataAlertDetail.createdAt)}{' '}
                          lúc{' '}
                          {(dataAlertDetail?.createdAt &&
                            convertUTCToVietnamTime(
                              dataAlertDetail.createdAt,
                              DateTimeFormat.DateTimeWithTimezone,
                            )?.toString()) ||
                            'N/A'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-gray-500" />
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={dataAlertDetail?.createdAvatar || '/placeholder.svg'}
                            />
                            <AvatarFallback className="text-xs">
                              {dataAlertDetail?.createdName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            Người: {dataAlertDetail?.createdName || 'Giáo viên chủ nhiệm'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Related Data Section */}
                    <div className="space-y-3">
                      <h3 className="flex items-center gap-2 font-medium text-gray-900">
                        <span className="h-4 w-4">📄</span>
                        Dữ liệu liên quan
                      </h3>
                      <div className="rounded-lg bg-gray-50 p-4">
                        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700">
                          {`{
  "studentId": "${dataAlertDetail?.id || 'HS001'}",
  "studentName": "${dataAlertDetail?.studentName || 'Nguyễn Văn A'}",
  "reporterId": "${dataAlertDetail?.createdUserCode || 'GV001'}",
  "reporterName": "${dataAlertDetail?.createdName || 'Cô Trần Thị B'}",
}`}
                        </pre>
                      </div>
                    </div>

                    {/* Student Info Card */}
                    <div className="space-y-2 rounded-lg bg-blue-50 p-4">
                      <h4 className="font-medium text-blue-900">Thông tin học sinh</h4>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={dataAlertDetail?.studentAvatar || '/placeholder.svg'} />
                          <AvatarFallback>
                            {dataAlertDetail?.studentName?.charAt(0) || 'N'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-blue-900">
                            {dataAlertDetail?.studentName || 'Nguyễn Văn A'}
                          </p>
                          <p className="text-sm text-blue-700">
                            Mã HS: {dataAlertDetail?.studentUserCode || 'HS001'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <Form className="mt-8 flex flex-wrap justify-between gap-2">
                    <div className="flex gap-2">
                      {!dataAlertDetail?.isRead && (
                        <Button variant="outline" size="sm" type="submit">
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Đánh dấu đã đọc
                        </Button>
                      )}
                    </div>
                    <Button variant="default" type="button" onClick={toggle}>
                      Đóng
                    </Button>
                  </Form>
                </Fragment>
              );
            }}
          </Formik>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default DialogDetailNotify;
