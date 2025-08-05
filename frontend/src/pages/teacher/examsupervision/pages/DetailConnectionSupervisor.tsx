import PageWrapper from '@/components/PageWrapper/PageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DateTimeFormat } from '@/consts/dates';
import { convertUTCToVietnamTime } from '@/helpers/common';
import { showError, showSuccess } from '@/helpers/toast';
import useFiltersHandler from '@/hooks/useFiltersHandler';
import useToggleDialog from '@/hooks/useToggleDialog';
import { GenericFilters } from '@/pages/admin/manageuser/components/generic-filters';
import { UserStats } from '@/pages/admin/manageuser/components/user-stats';
import facecaptureService from '@/services/modules/facecapture/facecapture.srvice';
import useGetListFaceCapture from '@/services/modules/facecapture/hooks/useGetListFaceCapture';
import type {
  Capture,
  IFaceCaptureRequest,
} from '@/services/modules/facecapture/interfaces/facecapture.interface';
import { Activity, Camera, Clock, Download, ZoomIn } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import ExamHeader from '../components/ExamHeader';
import DialogDownLoadImg from '../dialogs/DialogDownLoadImg';

export interface PhotoItem {
  id: string;
  timestamp: string;
  status: 'normal' | 'warning' | 'violation' | 'no-face';
  mode: 'Auto' | 'Manual';
  imageUrl?: string;
  emotions: Record<string, number>;
  isDetected?: boolean;
  logType?: number;
  dominantEmotion?: string | null;
  avgArousal?: number;
  avgValence?: number;
  inferredState?: string | null;
  errorMessage?: string | null;
}

const ProgressBar = ({ value, label, color }: { value: number; label: string; color: string }) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm text-gray-700">
        <span>{label}</span>
        <span>{value.toFixed(2)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

const emotionColors: Record<string, string> = {
  angry: '#ef4444', // Red
  disgust: '#a3e635', // Lime
  fear: '#8b5cf6', // Violet
  happy: '#22c55e', // Green
  neutral: '#3b82f6', // Blue
  sad: '#6b7280', // Gray
  surprise: '#f59e0b', // Amber
};

const DetailConnectionSupervisor = () => {
  const { examId, studentExamId } = useParams<{ examId?: string; studentExamId?: string }>();
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [openDialogDownLoadImg, toggleDialogDownLoadImg, shouldRenderDialogDownLoadImg] =
    useToggleDialog();

  // State for image zoom dialog
  const [showZoomDialog, setShowZoomDialog] = useState(false);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  const { filters, setFilters } = useFiltersHandler({
    PageSize: 50,
    CurrentPage: 1,
    TextSearch: '',
    StudentExamId: studentExamId || '',
    ExamId: examId || '',
    LogType: '',
  });

  const stableFilters = useMemo(() => filters as IFaceCaptureRequest, [filters]);
  const { data: dataFaceCapture } = useGetListFaceCapture(stableFilters, {
    isTrigger: true,
    saveData: false,
  });

  const dataMain = useMemo(() => {
    if (!Array.isArray(dataFaceCapture)) {
      return [];
    }
    return dataFaceCapture.map((item: Capture) => {
      let emotionsObj: Record<string, number> = {};
      try {
        emotionsObj = JSON.parse(item.emotions || '{}');
      } catch (e) {
        console.warn(`Failed to parse emotions for capture ${item.captureId}:`, e);
      }

      let status: PhotoItem['status'];
      if (item.isDetected === false) {
        status = 'no-face';
      } else if (item.logType === 0) {
        status = 'normal';
      } else if (item.logType === 1) {
        status = 'warning';
      } else if (item.logType === 2) {
        status = 'violation';
      } else {
        status = 'normal';
      }

      return {
        id: item.captureId,
        timestamp: convertUTCToVietnamTime(item.createdAt, DateTimeFormat.DayMonthYear),
        status: status,
        mode: 'Auto',
        imageUrl: item.imageUrl || '',
        emotions: emotionsObj,
        dominantEmotion: item.dominantEmotion,
        avgArousal: item.avgArousal,
        avgValence: item.avgValence,
        inferredState: item.inferredState,
        isDetected: item.isDetected,
        errorMessage: item.errorMessage || null,
      };
    }) as PhotoItem[];
  }, [dataFaceCapture]);

  const statItems = useMemo(() => {
    const total = dataMain.length;
    const normal = dataMain.filter((item) => item.status === 'normal').length;
    const warning = dataMain.filter((item) => item.isDetected === false).length;
    return [
      {
        title: 'Tổng ảnh đã chụp',
        value: total,
        icon: <Camera className="h-6 w-6 text-emerald-600" />,
        bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
      },
      {
        title: 'Bình thường',
        value: normal,
        icon: <Camera className="h-6 w-6 text-blue-600" />,
        bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      },
      {
        title: 'Cảnh báo',
        value: warning,
        icon: <Camera className="h-6 w-6 text-purple-600" />,
        bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      },
    ];
  }, [dataMain]);

  const getStatusColor = (status: PhotoItem['status']) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'violation':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'no-face':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: PhotoItem['status']) => {
    switch (status) {
      case 'normal':
        return 'Bình thường';
      case 'warning':
        return 'Cảnh báo';
      case 'violation':
        return 'Vi phạm';
      case 'no-face':
        return 'Không phát hiện khuôn mặt';
      default:
        return 'Không xác định';
    }
  };

  //!Functions
  const handlePhotoClick = (photo: PhotoItem) => {
    setSelectedPhoto(photo);
  };

  const handleZoomIconClick = (photo: PhotoItem) => {
    setSelectedPhoto(photo);
    if (photo.imageUrl) {
      setZoomImageUrl(photo.imageUrl);
      setShowZoomDialog(true);
    }
  };

  const handleDownloadClick = () => {
    toggleDialogDownLoadImg();
  };

  const handleDownloadImg = async () => {
    try {
      const response = await facecaptureService.downloadFaceCapture(studentExamId || '');
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `captures_${studentExamId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSuccess('Tải xuống thành công');
      toggleDialogDownLoadImg();
    } catch (error) {
      showError(`Tải xuống thất bại: ${error}`);
    }
  };

  const content = (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <ExamHeader
        title="Thư viện giám sát"
        subtitle="Theo dõi và quản lý các ảnh chụp trong quá trình giám sát thi"
        className="rounded-lg border-b border-white/20 bg-gradient-to-r from-pink-600 to-blue-700 px-6 py-6 shadow-lg"
        icon={<Camera className="h-8 w-8 text-white" />}
      />
      <UserStats statItems={statItems} className="mt-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
      <GenericFilters
        className="md:grid-cols-3"
        searchPlaceholder="Tìm kiếm vi phạm..."
        onSearch={() => {}}
        filters={[
          {
            key: 'logType',
            placeholder: 'Chọn loại vi phạm',
            options: [
              { value: null, label: 'Tất cả' },
              { value: '0', label: 'Thông thường' },
              { value: '1', label: 'Cảnh báo' },
              { value: '2', label: 'Vi phạm' },
              { value: '3', label: 'Quan trọng' },
            ],
          },
        ]}
        onFilterChange={(
          newFilters: Record<string, string | number | boolean | null | undefined>,
        ) => {
          setFilters((prev: any) => {
            const updatedFilters = {
              ...prev,
              LogType: newFilters.logType || '',
            };
            return updatedFilters;
          });
        }}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="rounded-lg shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                <Camera className="h-6 w-6 text-blue-600" />
                Thư viện ảnh chụp ({dataMain.length})
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full bg-white/90 p-1 text-gray-600 shadow-sm transition-colors hover:bg-gray-100 hover:text-blue-600"
                onClick={handleDownloadClick}
                disabled={!studentExamId}
              >
                <Download className="h-5 w-5" />
                <span className="ml-2 text-sm font-medium">Tải xuống tất cả</span>
              </Button>
            </CardHeader>
            {dataMain.length > 0 ? (
              <CardContent className="p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {dataMain.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative cursor-pointer overflow-hidden rounded-lg shadow-sm transition-all duration-200 hover:shadow-lg"
                      onClick={() => handlePhotoClick(photo)}
                    >
                      <div className="aspect-video overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-100 transition-colors group-hover:border-blue-400">
                        {photo.imageUrl ? (
                          <img
                            src={
                              photo.imageUrl ||
                              '/placeholder.svg?height=200&width=300&text=No Image'
                            }
                            alt="Capture"
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                            <Camera className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute left-2 top-2">
                          <Badge
                            className={`${getStatusColor(photo.status)} border px-3 py-1 text-xs font-medium`}
                          >
                            {getStatusText(photo.status)}
                          </Badge>
                        </div>
                        <div className="absolute right-2 top-2 flex gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-white/90 px-3 py-1 text-xs font-medium"
                          >
                            {photo.mode}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full bg-white/90 p-1 text-gray-600 shadow-sm transition-colors hover:bg-gray-100 hover:text-blue-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleZoomIconClick(photo);
                            }}
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white">
                          <div className="flex items-center justify-center text-sm font-medium">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {photo.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            ) : (
              <CardContent className="py-8 text-center text-gray-500">
                Không có ảnh nào được chụp.
              </CardContent>
            )}
          </Card>
        </div>
        <div className="sticky top-16 space-y-6 self-start lg:col-span-1">
          <Card className="rounded-lg shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                <Activity className="h-6 w-6 text-purple-600" />
                Phân tích chi tiết
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">Thời gian</label>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedPhoto?.timestamp || 'N/A'}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">Loại chụp</label>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedPhoto?.mode || 'N/A'}
                </p>
              </div>
              {selectedPhoto?.dominantEmotion && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Cảm xúc chủ đạo
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedPhoto.dominantEmotion}
                  </p>
                </div>
              )}
              {selectedPhoto?.avgArousal !== undefined && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Mức độ kích thích trung bình
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedPhoto.avgArousal.toFixed(2)}
                  </p>
                </div>
              )}
              {selectedPhoto?.avgValence !== undefined && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Mức độ tích cực trung bình
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedPhoto.avgValence.toFixed(2)}
                  </p>
                </div>
              )}
              {selectedPhoto?.inferredState && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Trạng thái suy luận
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedPhoto.inferredState}
                  </p>
                </div>
              )}
              {selectedPhoto?.isDetected !== undefined && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Phát hiện khuôn mặt
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedPhoto.isDetected ? 'Có' : 'Không'}
                  </p>
                </div>
              )}
              {selectedPhoto?.errorMessage && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Thông báo lỗi
                  </label>
                  <p className="text-lg font-semibold text-red-600">{selectedPhoto.errorMessage}</p>
                </div>
              )}
              {selectedPhoto && Object.keys(selectedPhoto.emotions).length > 0 && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-600">Cảm xúc</label>
                  <div className="space-y-3">
                    {Object.entries(selectedPhoto.emotions).map(([emotion, value]) => (
                      <ProgressBar
                        key={emotion}
                        label={emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                        value={value}
                        color={emotionColors[emotion] || '#6b7280'}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {shouldRenderDialogDownLoadImg && (
        <DialogDownLoadImg
          isOpen={openDialogDownLoadImg}
          toggle={toggleDialogDownLoadImg}
          onSubmit={handleDownloadImg}
          selectedPhoto={selectedPhoto}
        />
      )}

      {/* Image Zoom Dialog */}
      <Dialog open={showZoomDialog} onOpenChange={setShowZoomDialog}>
        <DialogContent className="max-h-[90vh] max-w-[90vw] overflow-hidden p-0">
          {zoomImageUrl && (
            <img
              src={zoomImageUrl || '/placeholder.svg'}
              alt="Zoomed Capture"
              className="h-full w-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
  //!Render
  return <PageWrapper name="Chi tiết kết nối giám thị">{content}</PageWrapper>;
};

export default React.memo(DetailConnectionSupervisor);
