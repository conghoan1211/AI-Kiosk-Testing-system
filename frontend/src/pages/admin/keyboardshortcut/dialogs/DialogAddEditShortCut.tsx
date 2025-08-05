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
import { OPTION_RISK_LEVEL } from '@/consts/common';
import { showError } from '@/helpers/toast';
import { DialogI } from '@/interfaces/common';
import useGetDetailKeyboardShortcut from '@/services/modules/keyboardshortcut/hooks/useGetDetailKeyboardShortcut';
import { Form, Formik } from 'formik';
import { Fragment } from 'react/jsx-runtime';
import * as Yup from 'yup';

export interface KeyboardShortcutFormValues {
  keyId?: string;
  keyCode?: string;
  keyCombination?: string;
  description?: string;
  riskLevel?: number;
  isActive?: boolean;
}

interface DialogAddNewKeyboardShortcutProps extends DialogI<any> {
  isOpen: boolean;
  toggle: () => void;
  onSubmit: (values: KeyboardShortcutFormValues) => Promise<void>;
  editKeyboardShortcut?: KeyboardShortcutFormValues | null;
}

const validationSchema = Yup.object({
  keyCode: Yup.string()
    .required('Tên tổ hợp phím là bắt buộc')
    .max(100, 'Tên tổ hợp phím không được vượt quá 100 ký tự')
    .matches(/^[a-zA-Z0-9]+$/, 'KeyCode phải là ký tự chữ và số.'),
  keyCombination: Yup.string()
    .required('Tổ hợp phím là bắt buộc')
    .max(100, 'Tổ hợp phím không được vượt quá 100 ký tự'),
  description: Yup.string().max(500, 'Mô tả không được vượt quá 500 ký tự'),
  riskLevel: Yup.number().required('Mức độ rủi ro là bắt buộc'),
  isActive: Yup.boolean(),
});

const DialogAddNewKeyboardShortcut = (props: DialogAddNewKeyboardShortcutProps) => {
  const { isOpen, toggle, onSubmit, editKeyboardShortcut } = props;

  const { data: detailKeyboardShortcut } = useGetDetailKeyboardShortcut(
    editKeyboardShortcut?.keyId,
    {
      isTrigger: !!editKeyboardShortcut,
    },
  );

  const initialValues: KeyboardShortcutFormValues = {
    keyId: editKeyboardShortcut?.keyId || detailKeyboardShortcut?.keyId || '',
    keyCode: editKeyboardShortcut?.keyCode || detailKeyboardShortcut?.keyCode || '',
    keyCombination:
      editKeyboardShortcut?.keyCombination || detailKeyboardShortcut?.keyCombination || '',
    description: editKeyboardShortcut?.description || detailKeyboardShortcut?.description || '',
    riskLevel: editKeyboardShortcut?.riskLevel || detailKeyboardShortcut?.riskLevel || 0,
    isActive: editKeyboardShortcut?.isActive ?? detailKeyboardShortcut?.isActive ?? false,
  };

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
                      {editKeyboardShortcut ? 'Chỉnh sửa' : 'Thêm mới'} tổ hợp phím
                    </DialogTitle>
                  </div>

                  <hr className="border-t border-gray-200" />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <FormikField
                        component={InputField}
                        name="keyCode"
                        placeholder="Tên tổ hợp phím"
                        value={values.keyCode}
                        label="Tên tổ hợp phím"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <FormikField
                        component={InputField}
                        name="keyCombination"
                        placeholder="Tổ hợp phím"
                        value={values.keyCombination}
                        label="Tổ hợp phím"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <FormikField
                      component={SelectField}
                      name="riskLevel"
                      placeholder="Mức độ rủi ro"
                      label="Mức độ rủi ro"
                      options={OPTION_RISK_LEVEL}
                      shouldHideSearch
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <FormikField
                      component={Textarea}
                      name="description"
                      placeholder="Nhập mô tả ứng dụng"
                      label="Mô tả ứng dụng"
                    />
                  </div>

                  <div className="space-y-2">
                    <FormikField
                      component={CheckBoxField}
                      name="isActive"
                      label="Kích hoạt ngay"
                      checked={values.isActive}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <DialogClose asChild>
                      <Button variant="outline" type="button">
                        Hủy
                      </Button>
                    </DialogClose>
                    <Button type="submit" isLoading={isSubmitting}>
                      {editKeyboardShortcut ? 'Cập nhật' : 'Tạo mới'}
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

export default DialogAddNewKeyboardShortcut;
