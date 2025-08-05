import { useMemo } from 'react';
import FormikField from '@/components/customFieldsFormik/FormikField';
import InputField from '@/components/customFieldsFormik/InputField';
import SelectField from '@/components/customFieldsFormik/SelectField';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { showError } from '@/helpers/toast';
import { DialogI } from '@/interfaces/common';
import useGetAllClasses from '@/services/modules/class/hooks/useGetAllClasses';
import useGetDetailRoom from '@/services/modules/room/hooks/useGetRoomDetail';
import { RoomList } from '@/services/modules/room/interfaces/room.interface';
import { Form, Formik } from 'formik';
import { Fragment } from 'react/jsx-runtime';
import * as Yup from 'yup';
import useGetListSubject from '@/services/modules/subject/hooks/useGetAllSubject';

export interface RoomFormValues {
  roomId?: string;
  classId?: string;
  subjectId?: string;
  isActive?: boolean;
  roomDescription?: string;
  capacity?: number;
  roomCode?: string;
}

interface DialogAddNewRoomProps extends DialogI<any> {
  isOpen: boolean;
  toggle: () => void;
  onSubmit: (values: RoomFormValues) => Promise<void>;
  editRoom?: RoomList | null;
}

const validationSchema = Yup.object({
  roomCode: Yup.string()
    .required('Mã phòng là bắt buộc')
    .matches(/^[A-Z0-9]+$/, 'Mã phòng chỉ chứa chữ hoa và số'),
  capacity: Yup.number()
    .required('Số lượng sinh viên tối đa là bắt buộc')
    .min(1, 'Số lượng sinh viên tối thiểu là 1'),
  roomDescription: Yup.string().required('Mô tả phòng học là bắt buộc'),
  isActive: Yup.boolean().required('Trạng thái là bắt buộc'),
});

const DialogAddNewRoom = (props: DialogAddNewRoomProps) => {
  const { isOpen, toggle, onSubmit, editRoom } = props;
  const { data: roomDetail } = useGetDetailRoom(editRoom?.roomId, {
    isTrigger: !!editRoom,
  });

  const { data: dataClasses, loading: loadingClasses } = useGetAllClasses(
    useMemo(() => ({ PageSize: 50, CurrentPage: 1, TextSearch: '' }), []),
  );

  const { data: dataSubject, loading: loadingSubject } = useGetListSubject(
    useMemo(() => ({ pageSize: 50, currentPage: 1, textSearch: '', status: true }), []),
  );

  const initialValues = useMemo(
    () => ({
      isActive: editRoom?.isRoomActive ?? true,
      roomDescription: editRoom?.roomDescription || roomDetail?.roomDescription || '',
      roomCode: editRoom?.roomCode || roomDetail?.roomCode || '',
      capacity: editRoom?.capacity || roomDetail?.capacity || 0,
      classId: editRoom?.classId || roomDetail?.classId || '',
      subjectId: editRoom?.subjectId || roomDetail?.subjectId || '',
    }),
    [editRoom, roomDetail],
  );

  const classOptions = useMemo(
    () =>
      dataClasses?.map((item: any) => ({
        label: item.classCode,
        value: item.classId,
      })) || [],
    [dataClasses],
  );

  const subjectOptions = useMemo(
    () =>
      dataSubject?.map((item: any) => ({
        label: item.subjectName,
        value: item.subjectId,
      })) || [],
    [dataSubject],
  );

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogOverlay className="fixed inset-0 bg-black/10 backdrop-blur-sm" />
      <DialogPortal>
        <DialogContent className="max-w-xl">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                await onSubmit(values);
              } catch (error) {
                showError(error);
              }
              setSubmitting(false);
            }}
          >
            {({ isSubmitting, values }) => (
              <Fragment>
                <Form className="space-y-4">
                  <div>
                    <DialogTitle className="text-xl font-medium">
                      {editRoom ? 'Chỉnh sửa phòng học' : 'Tạo phòng học mới'}
                    </DialogTitle>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <FormikField
                        id="roomCode"
                        component={InputField}
                        name="roomCode"
                        placeholder="Nhập mã phòng (VD: CS101)"
                        value={values.roomCode}
                        label="Mã phòng"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <FormikField
                        component={SelectField}
                        name="classId"
                        placeholder="Chọn lớp học"
                        options={classOptions}
                        label="Lớp học"
                        required
                        shouldHideSearch
                        loading={loadingClasses}
                      />
                    </div>

                    <div className="space-y-2">
                      <FormikField
                        component={SelectField}
                        name="subjectId"
                        placeholder="Chọn môn học"
                        options={subjectOptions}
                        label="Môn học"
                        required
                        shouldHideSearch
                        loading={loadingSubject}
                      />
                    </div>

                    <div className="space-y-2">
                      <FormikField
                        component={InputField}
                        id="capacity"
                        name="capacity"
                        placeholder="Nhập số lượng sinh viên tối đa"
                        value={values.capacity}
                        label="Số lượng sinh viên tối đa"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <FormikField
                        component={InputField}
                        id="roomDescription"
                        name="roomDescription"
                        placeholder="Nhập mô tả phòng học"
                        value={values.roomDescription}
                        label="Mô tả phòng học"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <FormikField
                        component={SelectField}
                        name="isActive"
                        placeholder="Chọn trạng thái"
                        label="Trạng thái"
                        options={[
                          { label: 'Kích hoạt', value: true },
                          { label: 'Không kích hoạt', value: false },
                        ]}
                        required
                        shouldHideSearch
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <DialogClose asChild>
                      <Button variant="outline" type="button">
                        Hủy
                      </Button>
                    </DialogClose>
                    <Button type="submit" isLoading={isSubmitting}>
                      {editRoom ? 'Cập nhật phòng học' : 'Tạo phòng học mới'}
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

export default DialogAddNewRoom;
