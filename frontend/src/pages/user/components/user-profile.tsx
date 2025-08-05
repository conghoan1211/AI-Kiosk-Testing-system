import { User, Mail, Phone, MapPin, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserDetail } from "@/services/modules/user/interfaces/userDetail.interface"

interface UserProfileProps {
    userProfile: UserDetail

}

export default function UserProfileComponent({ userProfile }: UserProfileProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    // const formatDateTime = (dateString: string) => {
    //     return new Date(dateString).toLocaleString("vi-VN", {
    //         year: "numeric",
    //         month: "2-digit",
    //         day: "2-digit",
    //         hour: "2-digit",
    //         minute: "2-digit",
    //     })
    // }

    const getGenderText = (sex: number) => {
        return sex === 0 ? "Nam" : "Nữ"
    }

    const getStatusBadge = (status: number) => {
        return status === 1 ? (
            <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
        ) : (
            <Badge className="bg-red-100 text-red-800">Không hoạt động</Badge>
        )
    }

    // const getRoleText = (roleIds: number[]) => {
    //     const roleMap: { [key: number]: string } = {
    //         1: "Admin",
    //         2: "Giảng viên",
    //         3: "Sinh viên",
    //         4: "Quản lý",
    //     }
    //     return roleIds.map((id) => roleMap[id] || "Không xác định").join(", ")
    // }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div className="max-w-5xl mx-auto p-8 space-y-8">
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mt-5">
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Thông tin cá nhân
                        </CardTitle>
                    </div>
                </CardHeader>
                <br />
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex flex-col items-center space-y-4 mr-20 pt-4 pb-4">
                            <Avatar className="h-32 w-32">
                                <AvatarImage src={userProfile.avatarUrl || "/placeholder.svg"} alt={userProfile.fullName} />
                                <AvatarFallback className="text-2xl">{getInitials(userProfile.fullName)}</AvatarFallback>
                            </Avatar>
                            <div className="text-center">
                                <h2 className="text-xl font-semibold">{userProfile.fullName}</h2>
                                <p className="text-gray-600">{userProfile.userCode}</p>
                                {getStatusBadge(userProfile.status)}
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 mb-9">
                                    <Label className="text-sm font-medium text-gray-600">Họ và tên</Label>
                                    <p className="font-medium">{userProfile.fullName}</p>
                                </div>

                                <div className="space-y-2 mb-9">
                                    <Label className="text-sm font-medium text-gray-600">Mã người dùng</Label>
                                    <p className="font-medium">{userProfile.userCode}</p>
                                </div>

                                <div className="space-y-2 mb-9">
                                    <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                        <Mail className="h-4 w-4" />
                                        Email
                                    </Label>
                                    <p className="font-medium">{userProfile.email}</p>
                                </div>

                                <div className="space-y-2 mb-9">
                                    <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                        <Phone className="h-4 w-4" />
                                        Số điện thoại
                                    </Label>
                                    <p className="font-medium">{userProfile.phone}</p>
                                </div>

                                <div className="space-y-2 mb-9">
                                    <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        Ngày sinh
                                    </Label>
                                    <p className="font-medium">{formatDate(userProfile.dob.toString())}</p>
                                </div>

                                <div className="space-y-2 mb-9">
                                    <Label className="text-sm font-medium text-gray-600">Giới tính</Label>
                                    <p className="font-medium">{getGenderText(userProfile.sex)}</p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-9">
                                <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    Địa chỉ
                                </Label>
                                <p className="font-medium">{userProfile.address}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Thông tin học tập & công việc
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-600">Vai trò</Label>
                                <p className="font-medium">{getRoleText(userProfile.roleId)}</p>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-600">Campus</Label>
                                <p className="font-medium font-mono text-sm">{userProfile.campus}</p>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-600">Khoa</Label>
                                <p className="font-medium font-mono text-sm">{userProfile.department}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-600">Chức vụ</Label>
                                <p className="font-medium font-mono text-sm">{userProfile.position}</p>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-600">Ngành học</Label>
                                <p className="font-medium font-mono text-sm">{userProfile.major}</p>
                            </div>

                            {userProfile.specialization && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Chuyên ngành</Label>
                                    <p className="font-medium font-mono text-sm">{userProfile.specialization}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card> */}
        </div>
    )
}
