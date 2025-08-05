import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, FileSpreadsheet, Info } from 'lucide-react';
import React from 'react';

const InstructionsCard: React.FC = () => (
  <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
    <CardContent className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
          <Info className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Hướng dẫn import dữ liệu</h3>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            Định dạng file được hỗ trợ
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span className="text-gray-700">Excel (.xlsx, .xls)</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span className="text-gray-700">CSV (.csv)</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-amber-500"></div>
              <span className="text-gray-700">
                Kích thước tối đa: <strong>10MB</strong>
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-amber-500"></div>
              <span className="text-gray-700">
                Tối đa: <strong>1000 bản ghi</strong>
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Yêu cầu dữ liệu
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
              <span className="text-gray-700">
                Các trường bắt buộc: FullName, UserCode, Email, CampusId, RoleId
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
              <span className="text-gray-700">Email phải duy nhất</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span className="text-gray-700">
                Định dạng ngày:{' '}
                <code className="rounded bg-gray-100 px-2 py-1">YYYY-MM-DD or DD/MM/YYYY</code>
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-purple-500"></div>
              <span className="text-gray-700">
                Vai trò: Student (1), Teacher (2), Supervisor (3), Administrator (4)
              </span>
            </div>
          </div>
        </div>
      </div>
      <Alert className="mt-6 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong className="text-amber-900">Lưu ý quan trọng:</strong>
          <br />
          Vui lòng tải template mẫu và điền dữ liệu theo đúng định dạng để tránh lỗi khi import.
        </AlertDescription>
      </Alert>
    </CardContent>
  </Card>
);

export default React.memo(InstructionsCard);
