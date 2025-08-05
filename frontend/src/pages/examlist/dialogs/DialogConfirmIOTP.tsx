import FormikField from '@/components/customFieldsFormik/FormikField';
import InputField from '@/components/customFieldsFormik/InputField';
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
import { StudentExamList } from '@/services/modules/studentexam/interfaces/studentexam.interface';
import { Form, Formik } from 'formik';
import { Lock } from 'lucide-react';
import { Fragment } from 'react/jsx-runtime';
import * as Yup from 'yup';

export interface ConfirmOTPFormValues {
  otpCode: number | string;
  examId?: string;
}

interface DialogConfirmOTPProps extends DialogI<any> {
  isOpen: boolean;
  toggle: () => void;
  onSubmit: (values: ConfirmOTPFormValues) => Promise<void>;
  selectedExam?: StudentExamList;
}

const validationSchema = Yup.object({
  otpCode: Yup.string()
    .required('Mã OTP là bắt buộc')
    .matches(/^\d{6}$/, 'Mã OTP phải là 6 chữ số'),
  examId: Yup.string().required('Mã bài thi là bắt buộc'),
});

const DialogConfirmOTP = (props: DialogConfirmOTPProps) => {
  const { isOpen, toggle, onSubmit, selectedExam } = props;

  const initialValues: ConfirmOTPFormValues = {
    otpCode: '',
    examId: selectedExam?.examId || '',
  };

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300" />
      <DialogPortal>
        <DialogContent className="max-w-md rounded-lg bg-white p-6 shadow-xl sm:max-w-lg lg:max-w-4xl">
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
            {({ isSubmitting }) => (
              <Fragment>
                <Form className="space-y-6">
                  <div className="text-center">
                    <DialogTitle className="flex items-center justify-center gap-2 text-2xl font-semibold text-gray-900">
                      <Lock className="h-6 w-6 text-blue-600" />
                      Xác nhận OTP
                    </DialogTitle>
                    <p className="mt-2 text-sm text-gray-500">
                      Vui lòng nhập mã OTP gồm 6 chữ số để xác nhận bài thi.
                    </p>
                  </div>

                  <hr className="border-t border-gray-200" />

                  <div className="space-y-4">
                    <div className="relative">
                      <FormikField
                        component={InputField}
                        name="examId"
                        label="Mã bài thi"
                        disabled
                        className="pr-10"
                        iconText="#"
                        isIcon
                      />
                    </div>

                    <div className="relative">
                      <FormikField
                        component={InputField}
                        name="otpCode"
                        placeholder="Nhập mã OTP (6 chữ số)"
                        label="Mã OTP bài thi"
                        required
                        isNumberic
                        className="pr-10"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <DialogClose asChild>
                      <Button
                        variant="outline"
                        type="button"
                        className="rounded-md border-gray-300 bg-gray-50 text-gray-700 transition-colors duration-200 hover:bg-gray-100"
                      >
                        Hủy
                      </Button>
                    </DialogClose>
                    <Button
                      type="submit"
                      isLoading={isSubmitting}
                      className="rounded-md bg-blue-600 text-white transition-colors duration-200 hover:bg-blue-700"
                    >
                      Xác nhận
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

export default DialogConfirmOTP;
