
import { useMemo, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { BookOpen } from "lucide-react"
import useFiltersHandler from "@/hooks/useFiltersHandler"
import { ISubjectRequest } from "@/services/modules/subject/interfaces/subject.interface"
import { useGet } from "@/stores/useStores"
import useGetAllSubjectV2 from "@/services/modules/subject/hooks/useGetAllSubjectV2"

interface AdditionalInfoProps {
  difficulty: number
  onDifficultyChange: (difficulty: number) => void
  subject: string
  onSubjectChange: (subject: string) => void
  points: number
  onPointsChange: (points: number) => void
  explanation: string
  onExplanationChange: (explanation: string) => void
  tag: string
  onTagChange: (tag: string) => void
  isPublic: boolean
  onPublicChange: (isPublic: boolean) => void
}

export function AdditionalInfoSection({
  difficulty,
  onDifficultyChange,
  subject,
  onSubjectChange,
  points,
  onPointsChange,
  explanation,
  onExplanationChange,
  tag,
  onTagChange
}: AdditionalInfoProps) {
  // const [newTag, setNewTag] = useState("")
  const defaultData = useGet("dataSubject");
  const cachedFiltersSubject = useGet("cachesListSubject");
  const [isTrigger] = useState(Boolean(!defaultData));
  const { filters } = useFiltersHandler({
    pageSize: cachedFiltersSubject?.pageSize || 50,
    currentPage: cachedFiltersSubject?.currentPage || 1,
    textSearch: cachedFiltersSubject?.textSearch || "",
  });
  const stableFilters = useMemo(() => filters as ISubjectRequest, [filters]);
  const { data: dataSubjects } = useGetAllSubjectV2(stableFilters, {
    isTrigger: isTrigger
  });
  // console.log(dataSubjects);

  // const addTag = () => {
  //   if (newTag.trim() && !tags.includes(newTag.trim())) {
  //     onTagsChange([...tags, newTag.trim()])
  //     setNewTag("")
  //   }
  // }

  // const removeTag = (tagToRemove: string) => {
  //   onTagsChange(tags.filter((tag) => tag !== tagToRemove))
  // }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Thông tin bổ sung</CardTitle>
        <p className="text-sm text-gray-500">Các thông tin thêm cho câu hỏi</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Difficulty, Subject, Points, Time Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Độ khó</label>
            <Select
              value={difficulty.toString()}
              onValueChange={(val) => onDifficultyChange(Number(val))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Dễ</span>
                  </div>
                </SelectItem>
                <SelectItem value="2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Trung bình</span>
                  </div>
                </SelectItem>
                <SelectItem value="3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Khó</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Môn học</label>
            <Select value={subject} onValueChange={onSubjectChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dataSubjects?.map(subject => (
                  <SelectItem value={subject?.subjectId} key={subject.subjectId}>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4" />
                      <span>{subject?.subjectName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Điểm số *</label>
            <Input
              type="number"
              value={points}
              onChange={(e) => onPointsChange(Number(e.target.value))}
              min="1"
              max="100"
            />
          </div>
        </div>

        {/* Category */}
        {/* <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Danh mục</label>
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Bài tập về dạng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Cơ bản</SelectItem>
              <SelectItem value="advanced">Nâng cao</SelectItem>
              <SelectItem value="practice">Luyện tập</SelectItem>
            </SelectContent>
          </Select>
        </div> */}


        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Tags (từ khóa)</label>
          <div className="flex space-x-2">
            <Input
              placeholder="Nhập tag"
              value={tag}
              onChange={(e) => onTagChange(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Giải thích đáp án (tùy chọn)</label>
          <textarea
            placeholder="Nhập giải thích chi tiết cho đáp án..."
            value={explanation}
            onChange={(e) => onExplanationChange(e.target.value)}
            className="min-h-[100px] w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  )
}
