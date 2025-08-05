import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDateToDMY } from '@/helpers/common';
import { showError, showSuccess } from '@/helpers/toast';
import type { DialogI } from '@/interfaces/common';
import httpService from '@/services/httpService';
import { saveAs } from 'file-saver';
import { Formik } from 'formik';
import { Upload, View } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import DataPreview from './components/DataPreview';
import DialogFooter from './components/DialogFooter';
import DialogHeader from './components/DialogHeader';
import FileUpload from './components/FileUpload';
import InstructionsCard from './components/InstructionsCard';
import TemplateDownload from './components/TemplateDownload';
import validateUserData from './components/validateUserData';

interface DialogProps extends DialogI<any> {
  isOpen: boolean;
  toggle: () => void;
  onSubmit: (file: File) => Promise<void>;
}

export interface UserData {
  FullName: string;
  UserCode: string;
  Phone: string;
  Email: string;
  Sex: string;
  CreateAt: string;
  UpdateAt: string;
  Status: string;
  Dob: string;
  Address: string;
  CampusId: string;
  DepartmentId: string;
  PositionId: string;
  MajorId: string;
  SpecializationId: string;
  RoleId: string;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export const REQUIRED_FIELDS = [
  'FullName',
  'UserCode',
  'Email',
  'CampusId',
  'RoleId',
] as (keyof UserData)[];

export const VALID_ROLES = ['1', '2', '3', '4'];

const DialogPreCheckImportUser: React.FC<DialogProps> = ({ isOpen, toggle, onSubmit }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [userData, setUserData] = useState<UserData[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importReport, setImportReport] = useState<{
    successCount: number;
    failedCount: number;
    errors: ValidationError[];
  } | null>(null);

  const currentUser = httpService.getUserStorage();

  useEffect(() => {
    if (isOpen && (!currentUser || !currentUser.roleId.includes(4))) {
      showError('You do not have permission to perform this action.');
      toggle();
    }
  }, [isOpen, currentUser, toggle]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      setError('Vui lòng chọn file Excel hoặc CSV.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setValidationErrors([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, dateNF: 'yyyy-mm-dd' });

      const headers = jsonData[0] as string[];
      const missingHeaders = REQUIRED_FIELDS.filter((field) => !headers.includes(field as string));
      if (missingHeaders.length > 0) {
        setError(`File missing required headers: ${missingHeaders.join(', ')}`);
        return;
      }

      const dataRows = jsonData
        .slice(1)
        .filter((row) => row.some((cell) => cell !== '' && cell !== null && cell !== undefined));

      if (dataRows.length > 1000) {
        setError('File exceeds maximum of 1000 records.');
        return;
      }

      const formattedData = dataRows.map((row) => {
        let dobValue = '';
        if (row[8] instanceof Date) {
          dobValue = formatDateToDMY(row[8]);
        } else if (!isNaN(Number(row[8]))) {
          const serial = Number(row[8]);
          if (serial > 0) {
            const excelEpoch = new Date(1900, 0, 0);
            const date = new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);
            if (!isNaN(date.getTime())) {
              dobValue = formatDateToDMY(date);
            }
          }
        } else {
          dobValue = String(row[8] || '');
        }

        return {
          FullName: String(row[0] || ''),
          UserCode: String(row[1] || ''),
          Phone: String(row[2] || ''),
          Email: String(row[3] || ''),
          Sex: String(row[4] || ''),
          CreateAt: String(row[5] || ''),
          UpdateAt: String(row[6] || ''),
          Status: String(row[7] || ''),
          Dob: dobValue,
          Address: String(row[9] || ''),
          CampusId: String(row[10] || ''),
          DepartmentId: String(row[11] || ''),
          PositionId: String(row[12] || ''),
          MajorId: String(row[13] || ''),
          SpecializationId: String(row[14] || ''),
          RoleId: String(row[15] || ''),
        };
      });

      const errors = validateUserData(formattedData);
      setValidationErrors(errors);
      setUserData(formattedData);
      setActiveTab('preview');
    } catch (err) {
      setError('Lỗi khi đọc file. Vui lòng kiểm tra định dạng file.');
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || validationErrors.length > 0) return;

    try {
      await onSubmit(selectedFile);
      setImportReport({
        successCount: userData.length,
        failedCount: 0,
        errors: [],
      });
      showSuccess(`Import completed: ${userData.length} users successfully created.`);
      toggle();
    } catch (err) {
      setError('An error occurred while saving the user.');
    }
  };

  const downloadErrorReport = () => {
    if (!validationErrors.length) return;

    const errorReport = XLSX.utils.json_to_sheet(
      validationErrors.map((err) => ({
        Row: err.row,
        Field: err.field,
        Error: err.message,
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, errorReport, 'Error Report');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'import_error_report.xlsx');
  };

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogContent className="max-h-[95vh] w-full max-w-[90vw] overflow-hidden bg-gradient-to-br from-slate-50 to-white p-0">
        <DialogHeader selectedFile={selectedFile} toggle={toggle} />
        <div className="mt-6">
          <Formik initialValues={{}} onSubmit={handleSubmit}>
            {({ isSubmitting }) => (
              <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 rounded-xl bg-gray-100 p-1">
                  <TabsTrigger
                    value="upload"
                    className="flex items-center gap-2 rounded-lg transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Upload className="h-4 w-4" />
                    Tải lên file
                  </TabsTrigger>
                  <TabsTrigger
                    value="preview"
                    className="flex items-center gap-2 rounded-lg transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <View className="h-4 w-4" />
                    Xem trước dữ liệu
                    {userData.length > 0 && (
                      <Badge variant="secondary" className="ml-1 bg-blue-100 text-xs text-blue-700">
                        {userData.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="mt-0">
                  <div className="max-h-[calc(95vh-200px)] overflow-y-auto">
                    <div className="space-y-8 px-8 py-6">
                      <InstructionsCard />
                      <TemplateDownload />
                      <FileUpload
                        selectedFile={selectedFile}
                        error={error}
                        handleFileSelect={handleFileSelect}
                      />
                    </div>
                    <DialogFooter
                      selectedFile={selectedFile}
                      userData={userData}
                      validationErrors={validationErrors}
                      isSubmitting={isSubmitting}
                      toggle={toggle}
                      handleSubmit={handleSubmit}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="preview" className="mt-0">
                  <div className="flex h-[calc(95vh-160px)] flex-col">
                    <div className="flex-1 overflow-y-auto">
                      <DataPreview
                        userData={userData}
                        validationErrors={validationErrors}
                        importReport={importReport}
                        downloadErrorReport={downloadErrorReport}
                      />
                    </div>
                    <DialogFooter
                      selectedFile={selectedFile}
                      userData={userData}
                      validationErrors={validationErrors}
                      isSubmitting={isSubmitting}
                      toggle={toggle}
                      handleSubmit={handleSubmit}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </Formik>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogPreCheckImportUser;
