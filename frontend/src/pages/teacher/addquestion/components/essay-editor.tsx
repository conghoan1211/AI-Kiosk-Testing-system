import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface EssayEditorProps {
  guidance: string
  onGuidanceChange: (guidance: string) => void
}

export function EssayEditor({ guidance, onGuidanceChange }: EssayEditorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Câu hình câu hỏi</CardTitle>
        <p className="text-sm text-gray-500">Thiết lập câu hỏi tự luận</p>
      </CardHeader>
      <CardContent>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Hướng dẫn chấm điểm</label>
          <textarea
            placeholder="Nhập hướng dẫn chấm điểm, đáp án mẫu hoặc tiêu chí đánh giá..."
            value={guidance}
            onChange={(e) => onGuidanceChange(e.target.value)}
            className="min-h-[120px] w-full border rounded-md p-2"
          />
          <p className="text-xs text-gray-500 mt-2">
            Cung cấp hướng dẫn cho giáo viên về cách chấm điểm một cách nhất quán
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
