import CheckBoxField from '@/components/customFieldsFormik/CheckBoxField';
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
import { showError } from '@/helpers/toast';
import { DialogI } from '@/interfaces/common';
import useGetDetailProhibited from '@/services/modules/prohibited/hooks/useGetDetailProhibited';
import { ProhbitedList } from '@/services/modules/prohibited/interfaces/prohibited.interface';
import { Form, Formik } from 'formik';
import { Fragment } from 'react/jsx-runtime';
import * as Yup from 'yup';

export interface ProhibitedFormValues {
  AppId?: string;
  AppName: string;
  ProcessName: string;
  Description?: string;
  AppIconUrl?: string;
  IsActive?: boolean;
  RiskLevel?: number;
  Category?: number;
  TypeApp?: string;
}

interface DialogAddNewProhibitedAppProps extends DialogI<any> {
  isOpen: boolean;
  toggle: () => void;
  onSubmit: (values: ProhibitedFormValues) => Promise<void>;
  editProhibited?: ProhbitedList | null;
}

const validationSchema = Yup.object({
  AppName: Yup.string().required('Tên ứng dụng là bắt buộc'),
  ProcessName: Yup.string().required('Tên tiến trình là bắt buộc'),
  Category: Yup.number().required('Danh mục là bắt buộc').nullable(),
  RiskLevel: Yup.number().required('Mức độ rủi ro là bắt buộc').nullable(),
  TypeApp: Yup.string().required('Loại ứng dụng là bắt buộc'),
});

const DialogAddNewProhibitedApp = (props: DialogAddNewProhibitedAppProps) => {
  const { isOpen, toggle, onSubmit, editProhibited } = props;

  const { data: detailProhibited } = useGetDetailProhibited(editProhibited?.appId, {
    isTrigger: !!editProhibited,
  });

  const initialValues: ProhibitedFormValues = {
    AppId: editProhibited?.appId || detailProhibited?.appId || '',
    AppName: editProhibited?.appName || detailProhibited?.appName || '',
    ProcessName: editProhibited?.processName || detailProhibited?.processName || '',
    Description: editProhibited?.description || detailProhibited?.description || '',
    AppIconUrl: editProhibited?.appIconUrl || detailProhibited?.appIconUrl || '',
    IsActive: editProhibited?.isActive ?? detailProhibited?.isActive ?? true,
    RiskLevel: editProhibited?.riskLevel || detailProhibited?.riskLevel || 1,
    Category: editProhibited?.category || detailProhibited?.category || 1,
    TypeApp: String(editProhibited?.typeApp ?? detailProhibited?.typeApp ?? ''),
  };

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogOverlay className="fixed inset-0 bg-black/10 backdrop-blur-sm" />
      <DialogPortal>
        <DialogContent className="max-w-xl">
          <Formik
            enableReinitialize
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
                      {editProhibited ? 'Cập nhật ứng dụng cấm' : 'Tạo ứng dụng cấm mới'}
                    </DialogTitle>
                  </div>

                  <hr className="border-t border-gray-200" />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <FormikField
                        component={InputField}
                        name="AppName"
                        placeholder="Tên ứng dụng"
                        value={values.AppName}
                        label="Tên ứng dụng"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <FormikField
                        component={InputField}
                        name="ProcessName"
                        placeholder="Tên tiến trình"
                        value={values.ProcessName}
                        label="Tên tiến trình"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <FormikField
                        component={SelectField}
                        name="Category"
                        placeholder="Danh mục"
                        label="Danh mục"
                        options={[
                          { label: 'Website', value: 1 },
                          { label: 'Tool', value: 2 },
                        ]}
                        shouldHideSearch
                      />
                    </div>

                    <div className="space-y-2">
                      <FormikField
                        component={SelectField}
                        name="RiskLevel"
                        placeholder="Mức độ rủi ro"
                        label="Mức độ rủi ro"
                        options={[
                          { label: 'Rủi ro thấp', value: 0 },
                          { label: 'Rủi ro trung bình', value: 1 },
                          { label: 'Rủi ro cao', value: 2 },
                        ]}
                        shouldHideSearch
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <FormikField
                      component={InputField}
                      name="AppIconUrl"
                      placeholder="URL icon ứng dụng"
                      label="URL icon ứng dụng"
                      value={values.AppIconUrl}
                    />
                  </div>

                  <div className="space-y-2">
                    <FormikField
                      component={SelectField}
                      name="TypeApp"
                      placeholder="Loại ứng dụng"
                      label="Loại ứng dụng"
                      options={[
                        { label: 'Cấm', value: '0' },
                        { label: 'Cho phép', value: '1' },
                      ]}
                      shouldHideSearch
                    />
                  </div>

                  <div className="space-y-2">
                    <FormikField
                      component={Textarea}
                      name="Description"
                      placeholder="Nhập mô tả ứng dụng"
                      label="Mô tả ứng dụng"
                    />
                  </div>

                  <div className="space-y-2">
                    <FormikField
                      component={CheckBoxField}
                      name="IsActive"
                      label="Kích hoạt ngay"
                      checked={values.IsActive}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <DialogClose asChild>
                      <Button variant="outline" type="button">
                        Hủy
                      </Button>
                    </DialogClose>
                    <Button type="submit" isLoading={isSubmitting}>
                      {editProhibited ? 'Cập nhật' : 'Tạo mới'}
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

export default DialogAddNewProhibitedApp;
