import FormikField from '@/components/customFieldsFormik/FormikField';
import InputField from '@/components/customFieldsFormik/InputField';
import SelectField from '@/components/customFieldsFormik/SelectField';
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
import { showError } from '@/helpers/toast';
import { DialogI } from '@/interfaces/common';
import useGetDetailPermission from '@/services/modules/authorize/hooks/useGetDetailPermission';
import { PermissionsList } from '@/services/modules/authorize/interfaces/permission.interface';
import { Form, Formik } from 'formik';
import React from 'react';
import { Fragment } from 'react/jsx-runtime';
import * as Yup from 'yup';

export interface PermissionFormValues {
  id?: string;
  name?: string;
  action?: string;
  resource?: string;
  categoryID?: string;
  isActive?: boolean;
}

interface DialogAddNewPermisionProps extends DialogI<any> {
  isOpen: boolean;
  toggle: () => void;
  onSubmit: (values: PermissionFormValues) => Promise<void>;
  dataMain?: PermissionsList[];
  editId?: string;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Tên quyền hạn là bắt buộc'),
  action: Yup.string().required('Hành động là bắt buộc'),
  resource: Yup.string()
    .required('Tài nguyên là bắt buộc')
    .matches(
      /^[a-zA-Z0-9_\-/{}/?]+$/,
      'Tài nguyên chỉ được chứa chữ, số, _, -, / và cặp dấu ngoặc nhọn {}',
    ),
  categoryID: Yup.string().required('Danh mục quyền hạn là bắt buộc'),
  isActive: Yup.boolean().required('Trạng thái là bắt buộc'),
});

const DialogAddNewPermision = (props: DialogAddNewPermisionProps) => {
  //!State
  const { isOpen, toggle, onSubmit, dataMain, editId } = props;
  const { data: detailPermission } = useGetDetailPermission(editId || '');

  const permission = Array.isArray(detailPermission) ? detailPermission[0] : detailPermission;

  const initialValues: PermissionFormValues = {
    name: permission?.name || '',
    action: permission?.action || '',
    resource: permission?.resource || '',
    categoryID: permission?.categoryID || '',
    isActive: permission?.isActive ?? true,
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
                showError(error);
              } finally {
                setSubmitting(false);
              }
            }}
            enableReinitialize
          >
            {({ isSubmitting, values }) => {
              console;
              return (
                <Fragment>
                  <Form className="space-y-4">
                    <div>
                      <DialogTitle className="text-xl font-medium">
                        {editId ? 'Cập nhật quyền hạn' : 'Thêm quyền hạn mới'}
                      </DialogTitle>
                      <DialogDescription className="mt-1 text-sm text-gray-500">
                        {editId
                          ? 'Cập nhật thông tin quyền hạn hiện tại.'
                          : 'Nhập thông tin để tạo quyền hạn mới.'}
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
                          label="Permission Name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <FormikField
                          component={SelectField}
                          name="action"
                          placeholder="VD: Tạo người dùng"
                          label="Action"
                          options={[
                            { value: 'create', label: 'Create' },
                            { value: 'view', label: 'View' },
                            { value: 'update', label: 'Update' },
                            { value: 'delete', label: 'Delete' },
                          ]}
                          required
                          shouldHideSearch
                        />
                      </div>

                      <div className="space-y-2">
                        <FormikField
                          component={SelectField}
                          name="categoryID"
                          placeholder="Choose a category"
                          options={
                            dataMain?.map((item) => ({
                              value: item.categoryId,
                              label: item.description,
                            })) ?? []
                          }
                          label="Category Permission"
                          required
                          shouldHideSearch
                        />
                      </div>

                      {/* <div className="space-y-2">
                        <FastField
                          component={Textarea}
                          id="description"
                          name="description"
                          placeholder="Mô tả chi tiết về quyền hạn này..."
                          label="Mô tả"
                          value={values.description}
                          required
                        />
                      </div> */}

                      <div className="space-y-2">
                        <FormikField
                          component={InputField}
                          id="resource"
                          name="resource"
                          placeholder="VD: Nhập URL API hoặc tài nguyên liên quan"
                          value={values.resource}
                          label="Domain resource"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <FormikField
                          component={SelectField}
                          name="isActive"
                          placeholder="Choose a status"
                          options={[
                            { value: true, label: 'Active' },
                            { value: false, label: 'Inactive' },
                          ]}
                          label="Status"
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
                        {editId ? 'Cập nhật' : 'Thêm mới'}
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

export default React.memo(DialogAddNewPermision);
