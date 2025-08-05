
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Download, X, User, Globe } from "lucide-react"
import { UserActivityLogDetail } from "@/services/modules/useractivitylog/interfaces/useractivitylog.interface"

interface ActivityDetailModalProps {
    isOpen: boolean
    onClose: () => void
    activity: UserActivityLogDetail
    categoryFilter: string
}

export function ActivityDetailModal({ isOpen, onClose, activity }: ActivityDetailModalProps) {
    // console.log(activity);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold">Chi tiết nhật ký hoạt động</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                ID: {(activity as UserActivityLogDetail)?.logId ?? "N/A"}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Làm mới
                            </Button>
                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Xuất
                            </Button>
                            <Button variant="ghost" size="sm" onClick={onClose}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Activity Summary */}
                    <div className="flex items-center space-x-4 mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center space-x-3">
                                <h3 className="font-semibold text-lg">{activity?.actionType}</h3>
                            </div>
                            <p className="text-gray-600 mt-1">{activity?.description}</p>
                            <p className="text-sm text-gray-500 mt-1">{activity?.createdAt ? activity.createdAt.toLocaleString() : ""}</p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="mt-6">
                    <div className="grid grid-cols-2 gap-6">
                        {/* User Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <User className="w-5 h-5" />
                                    <span>Thông tin người dùng</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{activity?.fullName}</p>
                                        <p className="text-sm text-gray-500">{activity?.userCode}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">ID:</span>
                                        <span className="font-mono">{activity?.userId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Email:</span>
                                        <span>
                                            {"email" in activity ? activity.email : "N/A"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Đăng nhập trước:</span>
                                        <span>{"lastLogin" in activity ? activity.lastLogin.toLocaleString() : "N/A"}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Session Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Globe className="w-5 h-5" />
                                    <span>Thông tin phiên</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center space-x-2">
                                        <Globe className="w-4 h-4 text-gray-400" />
                                        <span>{activity?.ipAddress}</span>
                                    </div>
                                    <div >
                                        <div className="text-gray-500">Browser Info:</div>
                                        <br />
                                        <span>{activity?.browserInfo}</span>
                                    </div>
                                    {/* <div className="flex items-center space-x-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span>{activity.session.location}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Monitor className="w-4 h-4 text-gray-400" />
                                        <span>{activity.session.device}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">ID phiên:</span>
                                        <span className="font-mono text-xs">{activity.session.sessionId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Thời gian:</span>
                                        <span>{activity.session.duration}</span>
                                    </div> */}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Activity Details */}
                    {/* <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Chi tiết hoạt động</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-6 text-sm">
                                <div>
                                    <span className="text-gray-500 block mb-1">Phương thức</span>
                                    <Badge variant="outline">{activity.details.method}</Badge>
                                </div>
                                <div>
                                    <span className="text-gray-500 block mb-1">Endpoint</span>
                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{activity.details.endpoint}</code>
                                </div>
                                <div>
                                    <span className="text-gray-500 block mb-1">Lần thử</span>
                                    <span>1 lần</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card> */}


                </div>
            </DialogContent>
        </Dialog >
    )
}
