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
import { Textarea } from '@/components/ui/textarea';
import { DialogI } from '@/interfaces/common';
import useGetDetailClass from '@/services/modules/class/hooks/useGetDetailClass';
import { ClassList } from '@/services/modules/class/interfaces/class.interface';
import { Form, Formik } from 'formik';
import { Fragment } from 'react/jsx-runtime';
import * as Yup from 'yup';

interface DialogAddNewClassProps extends DialogI<any> {
  isOpen: boolean;
  toggle: () => void;
  onSubmit: (values: ClassList) => Promise<void>;
  editClass?: ClassList | null;
}

const validationSchema = Yup.object({
  classCode: Yup.string()
    .required('Mã lớp là bắt buộc')
    .matches(/^[A-Z0-9]+$/, 'Mã lớp chỉ chứa chữ hoa và số'),
  // description: Yup.string().required("Mô tả là bắt buộc"),
  // isActive: Yup.string().required("Trạng thái là bắt buộc"),
});

const DialogAddNewClass = (props: DialogAddNewClassProps) => {
  //!State
  const { isOpen, toggle, onSubmit, editClass } = props;
  const { data: classDetail } = useGetDetailClass(editClass?.classId, {
    isTrigger: !!editClass,
  });

  const initialValues: ClassList = {
    classCode: editClass?.classCode || classDetail?.classCode || '',
    description: editClass?.description || classDetail?.description || '',
    isActive: editClass?.isActive !== undefined ? editClass.isActive : true,
  };

  //!Functions

  //!Render
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
                console.error('Error submitting form:', error);
              }
              setSubmitting(false);
            }}
          >
            {({ isSubmitting, values }) => {
              return (
                <Fragment>
                  <Form className="space-y-4">
                    <div>
                      <DialogTitle className="text-xl font-medium">
                        {editClass ? 'Chỉnh sửa lớp học' : 'Tạo lớp học mới'}
                      </DialogTitle>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <FormikField
                          id="classCode"
                          component={InputField}
                          name="classCode"
                          placeholder="Nhập mã lớp(VD: CS101)"
                          value={values.classCode}
                          label="Mã lớp"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <FormikField
                          component={Textarea}
                          name="description"
                          placeholder="Nhập mô tả lớp học"
                          label="Mô tả"
                        />
                      </div>

                      <div className="space-y-2">
                        <FormikField
                          component={SelectField}
                          name="isActive"
                          placeholder="Chọn trạng thái"
                          label="Trạng thái"
                          options={[
                            { label: 'Active', value: true },
                            { label: 'InActive', value: false },
                          ]}
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
                        {editClass ? 'Cập nhật lớp học' : 'Tạo lớp học mới'}
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

export default DialogAddNewClass;
