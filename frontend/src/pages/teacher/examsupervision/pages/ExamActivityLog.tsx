
import { useState, useEffect, useMemo } from "react"
import { ExamHeader } from "../components/logComponent/exam-header"
import { ExamActivity } from "../components/logComponent/exam-activity"
import { useParams } from "react-router-dom"
import useGetListExamActivityLog from "@/services/modules/examactivitylog/hooks/useGetAllExamActivityLog"
import { SystemInfo } from "../components/logComponent/system-info"


export default function ExamActivityLog() {
    const [timeRemaining, setTimeRemaining] = useState(0) // 45 minutes in seconds
    const [isMonitoring] = useState(true)
    const { studentExamId } = useParams()

    const filterExamLog = useMemo(() => ({
        studentExamId: studentExamId,
        pageSize: 300,
        currentPage: 1,
        textSearch: "",
    }), [studentExamId]);

    const { data: listExamLogActivity } = useGetListExamActivityLog(filterExamLog, {})
    // console.log(listExamLogActivity);

    // Countdown timer
    useEffect(() => {
        if (timeRemaining > 0 && isMonitoring) {
            const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [timeRemaining, isMonitoring])

    const studentInfo = {
        name: listExamLogActivity[0]?.fullName || "",
        studentId: listExamLogActivity[0]?.userCode || "",
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <ExamHeader studentInfo={studentInfo} />

            <div className="p-6">
                <div className="grid grid-cols-3 gap-6 mt-6">
                    <div className="col-span-2 space-y-6">
                        <ExamActivity activities={listExamLogActivity} />
                    </div>
                    <div>
                        <SystemInfo examLogId={listExamLogActivity[0]?.examLogId} />
                    </div>
                </div>
            </div>
        </div>
    )
}
