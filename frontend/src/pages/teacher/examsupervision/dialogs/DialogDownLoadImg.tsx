import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import type { DialogI } from '@/interfaces/common';
import { Form, Formik } from 'formik';
import { Download } from 'lucide-react';
import { Fragment } from 'react';
import type { PhotoItem } from '../pages/DetailConnectionSupervisor';

interface DialogProps extends DialogI<any> {
  selectedPhoto?: PhotoItem | null;
  examName?: string; // New prop for Exam Name
  studentName?: string; // New prop for Student Name
}

const DialogDownLoadImg = (props: DialogProps) => {
  const { isOpen, toggle, onSubmit, selectedPhoto } = props;

  const getStatusText = (status: string | undefined) => {
    switch (status) {
      case 'normal':
        return 'Bình thường';
      case 'warning':
        return 'Cảnh báo';
      case 'violation':
        return 'Vi phạm';
      default:
        return 'Không xác định';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogPortal>
        <DialogOverlay className="bg-black/30 backdrop-blur-sm" />
        <DialogContent className="h-auto max-w-2xl">
          <Formik initialValues={{}} onSubmit={onSubmit || (() => {})}>
            {({ isSubmitting }) => {
              return (
                <Fragment>
                  <DialogTitle>Tải xuống ảnh</DialogTitle>
                  <DialogDescription>
                    {selectedPhoto ? (
                      <div className="space-y-2">
                        <p>Bạn muốn tải xuống ảnh chụp này?</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {/* <div className="font-medium">Tên kỳ thi:</div>
                          <div>{examName || 'N/A'}</div>
                          <div className="font-medium">Tên học sinh:</div>
                          <div>{studentName || 'N/A'}</div> */}
                          <div className="font-medium">Thời gian chụp:</div>
                          <div>{selectedPhoto.timestamp || 'N/A'}</div>
                          <div className="font-medium">Trạng thái:</div>
                          <div>{getStatusText(selectedPhoto.status)}</div>
                        </div>
                        {selectedPhoto.imageUrl && (
                          <img
                            src={selectedPhoto.imageUrl || '/placeholder.svg'}
                            alt="Preview"
                            className="h-full w-full rounded-md object-cover"
                          />
                        )}
                      </div>
                    ) : (
                      'Không có ảnh được chọn.'
                    )}
                  </DialogDescription>
                  <Form className="mt-[25px] flex justify-end gap-2">
                    <Button type="submit" isLoading={isSubmitting} disabled={!selectedPhoto}>
                      <Download className="mr-2 h-4 w-4" />
                      Tải xuống
                    </Button>
                    <Button variant="ghost" type="button" onClick={toggle}>
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

export default DialogDownLoadImg;
