import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, X, Loader2 } from "lucide-react"; // Thêm Loader2 cho loading
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import useGetAllUserActivityLog from "@/services/modules/useractivitylog/hooks/useGetAllUserActivityLog";
import axios from "axios";
import { ACTIVITY_LOG_URL } from "@/consts/apiUrl";
import httpService from "@/services/httpService";
import { showError, showSuccess } from "@/helpers/toast";

interface ExportReportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ExportReportModal({ isOpen, onClose }: ExportReportModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const token = httpService.getTokenStorage();
    const [dateRange, setDateRange] = useState<{
        from: Date | undefined;
        to: Date | undefined;
    }>({
        from: new Date(new Date().setDate(new Date().getDate() - 30)),
        to: new Date(),
    });

    const filterByDay = useMemo(() => {
        return {
            pageSize: 10000,
            currentPage: 1,
            FromDate: dateRange.from,
            ToDate: dateRange.to,
        };
    }, [dateRange]);

    const { data: listUserLog, fetchData } = useGetAllUserActivityLog(filterByDay);

    useEffect(() => {
        fetchData(); // Gọi lại API khi filterByDay thay đổi
    }, [filterByDay, fetchData]);

    const handleExport = async () => {
        setIsLoading(true);
        const listLogId = listUserLog?.map((log) => log.logId) || [];

        if (listLogId.length === 0) {
            showError("Không có dữ liệu để xuất báo cáo.");
            setIsLoading(false);
            return;
        }
        try {
            const response = await axios.post(
                `${ACTIVITY_LOG_URL}/export-log`,
                listLogId,
                {
                    responseType: "blob",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const url = window.URL.createObjectURL(
                new Blob([response.data], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                })
            );
            const link = document.createElement("a");
            link.href = url;
            const contentDisposition = response.headers["content-disposition"];
            let fileName = "activity_log.xlsx";
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
                if (fileNameMatch && fileNameMatch[1]) {
                    fileName = fileNameMatch[1];
                }
            }
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            setIsLoading(false);
        } catch (error) {
            console.error("Error exporting file:", error);
            showError("Lỗi khi xuất báo cáo. Vui lòng thử lại sau.");
            setIsLoading(false);
        }
        // Show success message or handle export
        showSuccess("Báo cáo đang được tạo. Bạn sẽ nhận được thông báo khi hoàn thành.");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl font-semibold">Xuất báo cáo hoạt động</DialogTitle>
                            <p className="text-sm text-gray-500 mt-1">Tùy chỉnh và xuất báo cáo theo nhu cầu của bạn</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-6 mt-6">
                    {/* Left Column - Configuration */}
                    <div className="space-y-6">
                        {/* Date Range Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Khoảng thời gian</CardTitle>
                                <p className="text-sm text-gray-500">Chọn khoảng thời gian cần xuất báo cáo</p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium">Từ ngày</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal mt-1 bg-transparent"
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {dateRange.from
                                                        ? format(dateRange.from, "dd/MM/yyyy", { locale: vi })
                                                        : "Chọn ngày"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={dateRange.from}
                                                    onSelect={(date) =>
                                                        setDateRange((prev) => ({ ...prev, from: date }))
                                                    }
                                                    disabled={(date) => date > new Date()}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium">Đến ngày</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal mt-1 bg-transparent"
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {dateRange.to
                                                        ? format(dateRange.to, "dd/MM/yyyy", { locale: vi })
                                                        : "Chọn ngày"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={dateRange.to}
                                                    onSelect={(date) =>
                                                        setDateRange((prev) => ({ ...prev, to: date }))
                                                    }
                                                    disabled={(date) =>
                                                        (dateRange.from && date < new Date(dateRange.from.getTime() + 24 * 60 * 60 * 1000)) ||
                                                        date > new Date(Date.now() + 24 * 60 * 60 * 1000)
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                {/* Quick Date Presets */}
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setDateRange({
                                                from: new Date(new Date().setDate(new Date().getDate() - 7)),
                                                to: new Date(),
                                            })
                                        }
                                    >
                                        7 ngày qua
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setDateRange({
                                                from: new Date(new Date().setDate(new Date().getDate() - 30)),
                                                to: new Date(),
                                            })
                                        }
                                    >
                                        30 ngày qua
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setDateRange({
                                                from: new Date(new Date().setDate(new Date().getDate() - 90)),
                                                to: new Date(),
                                            })
                                        }
                                    >
                                        3 tháng qua
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Categories and Options */}
                    <div className="space-y-6">
                        {/* Summary */}
                        <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="p-4">
                                <h4 className="font-medium text-blue-900 mb-2">Tóm tắt báo cáo</h4>
                                <div className="space-y-1 text-sm text-blue-800">
                                    <p>
                                        • Khoảng thời gian:{" "}
                                        {dateRange.from && dateRange.to
                                            ? `${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")}`
                                            : "Chưa chọn"}
                                    </p>
                                    <p>• Loại báo cáo: Chi tiết</p>
                                    <p>• Định dạng: Excel</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Hủy bỏ
                    </Button>
                    <div className="flex space-x-3">
                        <Button
                            onClick={handleExport}
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="mr-2 h-4 w-4" />
                            )}
                            Xuất báo cáo
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}