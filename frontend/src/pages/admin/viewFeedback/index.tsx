import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, RefreshCw } from 'lucide-react';
import useGetListFeedback from '@/services/modules/feedback/hooks/useGetListFeedback';
import { IFeedbackRequest } from '@/services/modules/feedback/interfaces/feedback.interface';
import FeedbackCard from './components/FeedbackCard';

export default function FeedbackList() {
    const [filters, setFilters] = useState<IFeedbackRequest>({
        dateFrom: null,
        dateTo: null,
        pageSize: 3,
        currentPage: 1,
        textSearch: '',
    });
    const [isRefreshDisabled, setIsRefreshDisabled] = useState(false);

    const { data, totalPage, loading, error, refetch } = useGetListFeedback(filters, {});

    // Refresh data
    const refresh = useCallback(async () => {
        try {
            setIsRefreshDisabled(true);
            await refetch();
            // Wait for 2 seconds before enabling the button
            setTimeout(() => {
                setIsRefreshDisabled(false);
            }, 2000);
        } catch (err) {
            console.error('Failed to refresh feedback:', err);
            // Optionally show error toast here
            setIsRefreshDisabled(false); // Ensure button is enabled even on error
        }
    }, [refetch]);

    const handlePageChange = useCallback(
        (page: number) => {
            if (page > 0 && totalPage && page <= totalPage) {
                setFilters((prev) => ({
                    ...prev,
                    currentPage: page,
                }));
            }
        },
        [totalPage]
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-4 py-4">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <MessageSquare className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Danh sách Feedback</h1>
                            <p className="text-sm text-gray-500">Quản lý phản hồi từ học sinh</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refresh}
                        disabled={loading || isRefreshDisabled}
                        className="flex items-center gap-2 bg-transparent"
                        aria-label="Làm mới danh sách feedback"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading || isRefreshDisabled ? 'animate-spin' : ''}`} />
                        Làm mới
                    </Button>
                </div>
            </div>

            {!loading && !error && (!data || data.length === 0) && (
                <div className="max-w-4xl mx-auto mt-4 text-gray-600">
                    Không có feedback nào để hiển thị
                </div>
            )}

            {data && data.length > 0 && <FeedbackCard feedbacks={data} />}

            {totalPage && totalPage > 0 && (
                <div className="mt-4 flex justify-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(filters.currentPage - 1)}
                        disabled={filters.currentPage === 1 || loading}
                        aria-label="Trang trước"
                    >
                        Previous
                    </Button>
                    {Array.from({ length: Math.min(totalPage, 5) }, (_, i) => {
                        const page = filters.currentPage - 2 + i;
                        if (page < 1 || page > totalPage) return null;
                        return (
                            <Button
                                key={page}
                                variant={filters.currentPage === page ? 'default' : 'outline'}
                                onClick={() => handlePageChange(page)}
                                aria-label={`Trang ${page}`}
                            >
                                {page}
                            </Button>
                        );
                    })}
                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(filters.currentPage + 1)}
                        disabled={filters.currentPage === totalPage || loading}
                        aria-label="Trang sau"
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}