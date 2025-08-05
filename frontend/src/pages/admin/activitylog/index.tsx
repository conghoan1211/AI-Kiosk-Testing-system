import { useEffect, useMemo, useState } from "react"
import { ActivityHeader } from "./components/activity-header"
import { ActivityStats } from "./components/activity-stats"
import { ActivityFilters } from "./components/activity-filters"
import { ActivityList } from "./components/activity-list"
import useGetAllUserActivityLog from "@/services/modules/useractivitylog/hooks/useGetAllUserActivityLog"
import { IListUserActivityLog, IUserActivityLogRequest } from "@/services/modules/useractivitylog/interfaces/useractivitylog.interface"
import { IListExamActivityLog } from "@/services/modules/examactivitylog/interfaces/examactivitylog.interface"
import { ExportReportModal } from "./pages/export-report-modal"

export default function ActivityLogDashboard() {
    const [searchTerm, setSearchTerm] = useState("")
    const [userFilter, setUserFilter] = useState("0")
    const [categoryFilter, setCategoryFilter] = useState("user")
    const [totalActivities, setTotalActivities] = useState(0);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState<Date | undefined>(undefined)
    const [currentPage, setCurrentPage] = useState(1)
    const [activities, setActivities] = useState<IListUserActivityLog[] | IListExamActivityLog[]>([])
    const [isExportModalOpen, setIsExportModalOpen] = useState(false)

    const filter30days = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return {
            pageSize: 1000,
            currentPage: 1,
            FromDate: thirtyDaysAgo,
            ToDate: new Date(),
        };
    }, []);

    const filtersUserActivityLog = useMemo<IUserActivityLogRequest>(
        () => ({
            FromDate: startDate,
            ToDate: endDate,
            RoleEnum: Number(userFilter) === 0 ? null : Number(userFilter),
            pageSize: 5,
            currentPage,
            textSearch: searchTerm,
        }),
        [startDate, endDate, userFilter, searchTerm, currentPage]
    )
    const { data: userActivityData } = useGetAllUserActivityLog(filtersUserActivityLog);
    useEffect(() => {
        if (categoryFilter === "user" && userActivityData) {
            setActivities(userActivityData)
        } else {
            setActivities([]) // Clear activities if no data
        }
    }, [userActivityData, categoryFilter])

    const { data: statsData } = useGetAllUserActivityLog(filter30days);

    useEffect(() => {
        if (statsData) {
            setTotalActivities(statsData.length);
        }
    }, [statsData]);

    const activeUsers = statsData
        ? [...new Set(statsData.map((activity) => activity.userCode))].length : 0;

    const stats = {
        totalActivities: totalActivities,
        activeUsers: activeUsers,
    }

    const handleFilterChange = (setter: (value: any) => void, value: any) => {
        setter(value)
        setCurrentPage(1)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <ActivityHeader onExportClick={() => setIsExportModalOpen(true)} />

            <div className="p-6 space-y-6">
                <ActivityStats stats={stats} />

                <ActivityFilters
                    searchTerm={searchTerm}
                    onSearchChange={(value) => handleFilterChange(setSearchTerm, value)}
                    categoryFilter={categoryFilter}
                    onCategoryFilterChange={(value) => handleFilterChange(setCategoryFilter, value)}
                    startDate={startDate}
                    onStartDateChange={(value) => handleFilterChange(setStartDate, value)}
                    endDate={endDate}
                    onEndDateChange={(value) => handleFilterChange(setEndDate, value)}
                    userFilter={userFilter}
                    onUserFilterChange={(value) => handleFilterChange(setUserFilter, value)}
                />

                <ActivityList activities={activities} categoryFilter={categoryFilter} />
            </div>
            <ExportReportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />
        </div>
    )
}
