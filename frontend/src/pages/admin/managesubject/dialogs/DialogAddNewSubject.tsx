import FormikField from "@/components/customFieldsFormik/FormikField";
import InputField from "@/components/customFieldsFormik/InputField";
import SelectField from "@/components/customFieldsFormik/SelectField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import Loading from "@/components/ui/loading";
import { Textarea } from "@/components/ui/textarea";
import { showError } from "@/helpers/toast";
import { DialogI } from "@/interfaces/common";
import useGetDetailSubject from "@/services/modules/subject/hooks/useGetDetailSubject";
import { ISubjectForm } from "@/services/modules/subject/interfaces/subject.interface";
import { Form, Formik } from "formik";
import { Fragment } from "react/jsx-runtime";
import * as Yup from "yup";

interface DialogAddNewSubjectProps extends DialogI<any> {
  isOpen: boolean;
  toggle: () => void;
  onSubmit: (values: ISubjectForm) => Promise<void>;
  editSubject?: ISubjectForm | null;
}

const validationSchema = Yup.object({
  subjectName: Yup.string()
    .required("Tên môn học là bắt buộc")
    .min(2, "Tên môn học phải có ít nhất 2 ký tự")
    .max(100, "Tên môn học không được vượt quá 100 ký tự"),
  subjectCode: Yup.string()
    .required("Mã môn học là bắt buộc")
    .matches(/^[A-Z]{2,5}\d{3}$/, "Mã môn học phải theo định dạng (VD: CS101)"),
  subjectDescription: Yup.string().max(
    500,
    "Mô tả không được vượt quá 500 ký tự",
  ),
  subjectContent: Yup.string().max(
    1000,
    "Nội dung không được vượt quá 1000 ký tự",
  ),
  status: Yup.boolean().required("Trạng thái là bắt buộc"),
});

const DialogAddNewSubject = (props: DialogAddNewSubjectProps) => {
  //!State
  const { isOpen, toggle, onSubmit, editSubject } = props;
  const { isLoading: isLoadingDetail, data: detailSubject } =
    useGetDetailSubject(editSubject?.subjectId, {
      isTrigger: !!editSubject,
    });

  const initialValues: ISubjectForm = {
    subjectName: editSubject ? editSubject.subjectName : "",
    subjectCode: editSubject ? editSubject.subjectCode : "",
    subjectDescription: editSubject ? editSubject.subjectDescription : "",
    status: editSubject ? editSubject.status : true,
    subjectContent: editSubject ? editSubject.subjectContent : "",
  };

  //!Functions

  if (isLoadingDetail) {
    return (
      <Dialog open={isOpen} onOpenChange={toggle}>
        <DialogOverlay className="fixed inset-0 bg-black/10 backdrop-blur-sm" />
        <DialogPortal>
          <DialogContent className="max-w-xl">
            <div className="flex h-full items-center justify-center">
              <Loading />
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    );
  }

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
                showError(error);
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
                        {editSubject
                          ? `Chỉnh sửa môn học: ${detailSubject?.subjectName}`
                          : "Thêm môn học mới"}
                      </DialogTitle>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <FormikField
                          id="subjectName"
                          component={InputField}
                          name="subjectName"
                          placeholder="Nhập tên môn học"
                          value={values.subjectName}
                          label="Tên môn học"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <FormikField
                          component={InputField}
                          id="subjectCode"
                          name="subjectCode"
                          placeholder="Nhập mã môn học(VD: CS101)"
                          value={values.subjectCode}
                          label="Mã môn học"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <FormikField
                          component={SelectField}
                          name="status"
                          placeholder="Chọn trạng thái"
                          label="Trạng thái"
                          options={[
                            { label: "Kích hoạt", value: true },
                            { label: "Không kích hoạt", value: false },
                          ]}
                          shouldHideSearch
                        />
                      </div>

                      <div className="space-y-2">
                        <FormikField
                          component={Textarea}
                          name="subjectDescription"
                          placeholder="Nhập mô tả môn học (tùy chọn)"
                          label="Mô tả"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <FormikField
                          component={Textarea}
                          name="subjectContent"
                          placeholder="Nhập nội dung môn học (tùy chọn)"
                          label="Nội dung môn học"
                          required
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
                        {editSubject ? "Cập nhật môn học" : "Thêm môn học"}
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

export default DialogAddNewSubject;
