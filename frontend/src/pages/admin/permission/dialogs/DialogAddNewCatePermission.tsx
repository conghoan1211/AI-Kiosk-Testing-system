import FormikField from '@/components/customFieldsFormik/FormikField';
import InputField from '@/components/customFieldsFormik/InputField';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { DialogI } from '@/interfaces/common';
import useGetDetailCategoryPermission from '@/services/modules/permission/hooks/useGetDetailPermission';
import { Form, Formik } from 'formik';
import { Fragment } from 'react';
import * as Yup from 'yup';

interface DialogProps extends DialogI<any> {
  onSubmit?: (values: any) => void;
  permissionId?: string | null;
}

const DialogAddNewCategoryPermission = (props: DialogProps) => {
  const { isOpen, toggle, onSubmit, permissionId } = props;
  const { data: permissionDetail } = useGetDetailCategoryPermission(permissionId || '', {
    isTrigger: !!permissionId,
  });

  const initialValues = {
    categoryID: permissionId ? permissionDetail?.categoryId : '',
    description: permissionId ? permissionDetail?.description : '',
  };

  const validationSchema = Yup.object().shape({
    description: Yup.string().required('Description is required'),
  });

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/10 backdrop-blur-sm" />
        <DialogContent>
          <Formik
            initialValues={initialValues}
            onSubmit={onSubmit || (() => {})}
            validationSchema={validationSchema}
            enableReinitialize
          >
            {({ isSubmitting }) => {
              return (
                <Fragment>
                  <DialogTitle>
                    {permissionId ? 'Chỉnh sửa quyền hạn' : 'Thêm quyền hạn mới'}
                  </DialogTitle>
                  <DialogDescription>
                    {permissionId
                      ? 'Chỉnh sửa thông tin quyền hạn hiện tại'
                      : 'Thêm quyền hạn mới cho danh mục'}
                  </DialogDescription>

                  <hr className="border-t border-gray-200" />

                  <div className="space-y-2">
                    <FormikField
                      component={InputField}
                      name="description"
                      placeholder="Nhập tên quyền hạn"
                      label="Tên quyền hạn"
                      required
                    />
                  </div>

                  <Form className="mt-[25px] flex justify-end gap-2">
                    <Button type="submit" isLoading={isSubmitting}>
                      {permissionId ? 'Cập nhật quyền hạn' : 'Thêm quyền hạn mới'}
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

export default DialogAddNewCategoryPermission;
