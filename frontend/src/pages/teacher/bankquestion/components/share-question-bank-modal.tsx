import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AccessMode } from "@/consts/common";
import { BankQuestionList, IShareBankQuestionForm } from "@/services/modules/bankquestion/interfaces/bankquestion.interface";
import { Field, FieldProps, Form, Formik } from "formik";
import { useState } from "react";

interface ShareQuestionBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IShareBankQuestionForm) => void;
  questionBank: BankQuestionList | undefined;
}


export default function ShareQuestionBankModal({
  isOpen,
  onClose,
  onSubmit,
  questionBank,
}: ShareQuestionBankModalProps) {
  const initialValues = {
    questionBankId: questionBank?.questionBankId ?? "",
    targetUserEmail: "",
    accessMode: AccessMode.View.toString()
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: IShareBankQuestionForm) => {
    setIsSubmitting(true);
    try {
      onSubmit(values);
      onClose();
    } catch (error) {
      console.error("Error sharing question bank:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg font-semibold">
            Chia sẻ ngân hàng câu hỏi
          </DialogTitle>
          {questionBank?.title && (
            <p className="text-sm text-muted-foreground">
              "{questionBank?.title}"
            </p>
          )}
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ setFieldValue }) => {
            return (
              <Form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teacherEmail">Email giáo viên</Label>
                  <Field
                    name="targetUserEmail"
                    as={Input}
                    id="targetUserEmail"
                    type="email"
                    placeholder="teacher@school.edu.vn"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessLevel">Quyền truy cập</Label>
                  <Field name="accessMode">
                    {({ field }: FieldProps) => (
                      <Select
                        value={field.value} // Sử dụng value từ Formik
                        onValueChange={(value) => setFieldValue("accessMode", value)} // Cập nhật qua Formik
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn quyền truy cập" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={AccessMode.View.toString()}>Chỉ xem</SelectItem>
                          <SelectItem value={AccessMode.Edit.toString()}>Chỉnh sửa</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </Field>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Đang chia sẻ..." : "Chia sẻ"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Hủy
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
