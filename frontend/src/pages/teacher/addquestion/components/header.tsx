
import { Button } from "@/components/ui/button";
import { FileText, Settings, User } from "lucide-react";

export function Header() {
  return (
    <div className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Quản lý câu hỏi
              </h1>
              <p className="text-sm text-gray-500">
                Tạo và quản lý câu hỏi cho các bài kiểm tra
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Cài đặt
          </Button>
          <Button variant="outline" size="sm">
            <User className="mr-2 h-4 w-4" />
            Về Dashboard
          </Button>
        </div>
      </div>

     
    </div>
  );
}
