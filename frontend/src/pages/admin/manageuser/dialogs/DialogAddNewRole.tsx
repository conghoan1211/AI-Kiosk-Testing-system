import FormikField from '@/components/customFieldsFormik/FormikField';
import InputField from '@/components/customFieldsFormik/InputField';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { showError } from '@/helpers/toast';
import { DialogI } from '@/interfaces/common';
import { PermissionList } from '@/services/modules/authorize/interfaces/role.interface';
import { Form, Formik } from 'formik';
import React from 'react';
import { Fragment } from 'react/jsx-runtime';
import * as Yup from 'yup';

export interface RoleFormValues {
  id?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

interface DialogAddNewRoleProps extends DialogI<any> {
  isOpen: boolean;
  toggle: () => void;
  onSubmit: (values: RoleFormValues) => Promise<void>;
  editRole?: PermissionList | null;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Tên quyền hạn là bắt buộc'),
  description: Yup.string().required('Mô tả quyền hạn là bắt buộc'),
});

const DialogAddNewRole = (props: DialogAddNewRoleProps) => {
  //!State
  const { isOpen, toggle, onSubmit, editRole } = props;
  console.log('editRole', editRole);

  const initialValues: RoleFormValues = {
    id: editRole ? String(editRole.roleId) : undefined,
    name: editRole ? editRole?.roleName : '',
    description: editRole ? editRole?.description : '',
    // isActive: editRole ? editRole?.isActive : false,
  };

  //!Functions

  //!Render
  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogOverlay className="fixed inset-0 bg-black/10 backdrop-blur-sm" />
      <DialogPortal>
        <DialogContent className="max-w-2xl">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                setSubmitting(true);
                await onSubmit(values);
              } catch (error) {
                showError('Đã có lỗi xảy ra khi xử lý yêu cầu.');
              } finally {
                setSubmitting(false);
              }
            }}
            enableReinitialize
          >
            {({ isSubmitting, values }) => {
              return (
                <Fragment>
                  <Form className="space-y-4">
                    <div>
                      <DialogTitle className="text-xl font-medium">
                        {editRole ? 'Cập nhật quyền hạn' : 'Thêm quyền hạn mới'}
                      </DialogTitle>
                      <DialogDescription className="mt-1 text-sm text-gray-500">
                        Nhập thông tin quyền hạn mới để quản lý người dùng trong hệ thống. Bạn có
                        thể thêm tên quyền hạn và mô tả hành động liên quan.
                      </DialogDescription>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <FormikField
                          id="name"
                          component={InputField}
                          name="name"
                          placeholder="VD: user.create"
                          value={values.name}
                          label="Role Name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <FormikField
                          component={Textarea}
                          name="description"
                          placeholder="VD: Tạo người dùng"
                          label="Role description"
                          required
                        />
                      </div>

                      {/* <div className="space-y-2">
                        <FormikField
                          component={SwitchBoxField}
                          name="isActive"
                          label="Trạng thái"
                        />
                      </div> */}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <DialogClose asChild>
                        <Button variant="outline" type="button">
                          Hủy
                        </Button>
                      </DialogClose>
                      <Button type="submit" isLoading={isSubmitting}>
                        {editRole ? 'Cập nhật' : 'Thêm mới'}
                      </Button>
                    </div>
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

export default React.memo(DialogAddNewRole);
