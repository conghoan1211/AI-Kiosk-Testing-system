import { Button } from "@/components/ui/button";
import { Loader2, UserPlus } from "lucide-react";

interface FormSubmitButtonProps {
  isSubmitting: boolean;
  userId?: string;
}

const FormSubmitButton = ({ isSubmitting, userId }: FormSubmitButtonProps) => (
  <div className="flex justify-end border-t pt-6">
    <Button
      type="submit"
      disabled={isSubmitting}
      className="h-12 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg disabled:opacity-50"
    >
      {isSubmitting ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang xử lý...
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          {userId ? "Cập nhật người dùng" : "Thêm người dùng"}
        </div>
      )}
    </Button>
  </div>
);

export default FormSubmitButton;
