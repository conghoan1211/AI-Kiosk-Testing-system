
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText } from "lucide-react";
import { questionTypes } from "./question-type-selector";

interface QuickPreviewProps {
  selectedType: string;
  content: string;
}

export function QuickPreview({ selectedType, content }: QuickPreviewProps) {
  const currentType = questionTypes.find((t) => t.id === selectedType);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-medium">
          <FileText className="mr-2 h-5 w-5" />
          Xem nhanh
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Trạng thái</span>
            <Badge
              variant="outline"
              className="border-orange-200 text-orange-600"
            >
              Đang soạn
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Loại câu hỏi</span>
            <span className="font-medium">
              {currentType?.title || "Chưa chọn"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Độ dài</span>
            <span className="font-medium">{content.length} ký tự</span>
          </div>

          <Separator />

          <div className="text-sm">
            <span className="mb-2 block text-gray-500">
              Nội dung xem trước:
            </span>
            <div className="min-h-[60px] rounded border bg-gray-50 p-3">
              {content ? (
                <p className="text-gray-700">{content}</p>
              ) : (
                <p className="italic text-gray-400">
                  Nhập nội dung để xem trước...
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
