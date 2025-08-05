import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { DialogI } from "@/interfaces/common";
import useGetViolationDetail from "@/services/modules/violation/hooks/useGetViolationDetail";
import { Form, Formik } from "formik";
import { AlertTriangle, Calendar, Camera, Code, FileText, Mail, RefreshCw, User } from "lucide-react";
import { Fragment } from "react";

interface DialogProps extends DialogI<any> {
    violationId: string
}

const DialogViolationDetail = (props: DialogProps) => {
    const { isOpen, toggle, onSubmit } = props;
    const { data: selectedViolation, loading } = useGetViolationDetail(props.violationId, {
        isTrigger: isOpen,
    });
    console.log(selectedViolation);

    return (
        <Dialog open={isOpen} onOpenChange={toggle}>
            <DialogPortal>
                <DialogOverlay />
                <DialogContent className="max-w-7xl overflow-y-auto max-h-[80vh]">
                    <Formik initialValues={{}} onSubmit={onSubmit || (() => { })}>
                        {() => {
                            return (
                                <Fragment>
                                    <DialogTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                                        Chi tiết vi phạm
                                    </DialogTitle>
                                    {loading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                                            <span className="ml-2 text-gray-600">Đang tải chi tiết...</span>
                                        </div>
                                    ) : selectedViolation && (
                                        <div className="space-y-6">
                                            {/* Student Information */}
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                                    <User className="h-5 w-5 text-blue-600" />
                                                    Thông tin học sinh
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Tên học sinh:</label>
                                                        <p className="font-medium">{selectedViolation.studentName}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Mã học sinh:</label>
                                                        <p className="font-medium flex items-center gap-1">
                                                            <Code className="h-4 w-4" />
                                                            {selectedViolation.studentCode}
                                                        </p>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="text-sm font-medium text-gray-600">Email:</label>
                                                        <p className="font-medium flex items-center gap-1">
                                                            <Mail className="h-4 w-4" />
                                                            {selectedViolation.studentEmail}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-red-50 p-4 rounded-lg">
                                                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                                    Thông tin vi phạm
                                                </h3>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Loại vi phạm:</label>
                                                        <p className="font-medium text-red-700">{selectedViolation.violationName}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Mô tả chi tiết:</label>
                                                        <p className="bg-white p-3 rounded border">{selectedViolation.message}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Thời gian vi phạm:</label>
                                                        <p className="font-medium flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            {new Date(selectedViolation.createdAt).toLocaleString("vi-VN")}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-green-50 p-4 rounded-lg">
                                                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                                    <User className="h-5 w-5 text-green-600" />
                                                    Người báo cáo
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Tên:</label>
                                                        <p className="font-medium">{selectedViolation.creatorName}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Mã:</label>
                                                        <p className="font-medium flex items-center gap-1">
                                                            <Code className="h-4 w-4" />
                                                            {selectedViolation.creatorCode}
                                                        </p>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="text-sm font-medium text-gray-600">Email:</label>
                                                        <p className="font-medium flex items-center gap-1">
                                                            <Mail className="h-4 w-4" />
                                                            {selectedViolation.creatorEmail}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {selectedViolation.screenshotPath && (
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                                        <Camera className="h-5 w-5 text-gray-600" />
                                                        Bằng chứng hình ảnh
                                                    </h3>
                                                    <div className="border rounded-lg overflow-hidden">
                                                        <img
                                                            src={selectedViolation.screenshotPath}
                                                            alt="Screenshot bằng chứng vi phạm"
                                                            className="w-full h-auto max-h-96 object-contain bg-white"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement
                                                                target.src = "/placeholder.svg?height=200&width=400&text=Không thể tải hình ảnh"
                                                            }}
                                                        />
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-2">Ảnh chụp màn hình tại thời điểm vi phạm</p>
                                                </div>
                                            )}

                                            <div className="bg-yellow-50 p-4 rounded-lg">
                                                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                                    <FileText className="h-5 w-5 text-yellow-600" />
                                                    Thông tin bổ sung
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">ID Vi phạm:</label>
                                                        <p className="font-mono text-sm bg-white p-2 rounded border">
                                                            {selectedViolation.violationId}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">ID Bài thi:</label>
                                                        <p className="font-mono text-sm bg-white p-2 rounded border">
                                                            {selectedViolation.studentExamId}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <Form className="mt-[25px] flex justify-end gap-2">
                                        <Button variant="ghost" type="button" onClick={toggle}>
                                            Đóng
                                        </Button>
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

export default DialogViolationDetail;
