import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Trash2, GripVertical } from "lucide-react"

interface Option {
  id: string
  text: string
  isCorrect: boolean
}

interface MultipleChoiceEditorProps {
  options: Option[]
  onOptionsChange: (options: Option[]) => void
}

export function MultipleChoiceEditor({ options, onOptionsChange }: MultipleChoiceEditorProps) {
  const addOption = () => {
    const newOption: Option = {
      id: `option-${Date.now()}`,
      text: "",
      isCorrect: false,
    }
    onOptionsChange([...options, newOption])
  }

  const removeOption = (id: string) => {
    if (options.length <= 2) return
    onOptionsChange(options.filter((option) => option.id !== id))
  }

  const updateOptionText = (id: string, text: string) => {
    onOptionsChange(options.map((option) => (option.id === id ? { ...option, text } : option)))
  }

  const setCorrectOption = (id: string) => {
    onOptionsChange(
      options.map((option) => ({
        ...option,
        isCorrect: option.id === id,
      })),
    )
  }

  const getOptionLabel = (index: number) => {
    return String.fromCharCode(65 + index) // A, B, C, D...
  }
  // console.log(options);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Câu hình câu hỏi</CardTitle>
        <p className="text-sm text-gray-500">Thiết lập các lựa chọn cho câu hỏi trắc nghiệm</p>
      </CardHeader>
      <CardContent>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">Các lựa chọn</label>
          <p className="text-xs text-gray-500 mb-4">Thêm các lựa chọn và đánh dấu đáp án đúng</p>

          <RadioGroup
            value={options.find((o) => o.isCorrect)?.id}
            onValueChange={setCorrectOption}
            className="space-y-3"
          >
            {options.map((option, index) => (
              <div key={option.id} className="flex items-center space-x-3 border rounded-lg p-3 bg-white">
                <RadioGroupItem value={option.id} id={option.id} />
                <div className="flex items-center space-x-2 flex-1">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">{getOptionLabel(index)}</span>
                  </div>
                  <Input
                    placeholder={`Nhập lựa chọn ${getOptionLabel(index)}`}
                    value={option.text}
                    onChange={(e) => updateOptionText(option.id, e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="icon" className="cursor-move">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-blue-600">
                    <span className="text-sm">T</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-600">
                    <span className="text-sm">!</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(option.id)}
                    disabled={options.length <= 2}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {option.text.trim().length === 0 && (
                  <p className="text-xs text-red-500 absolute -bottom-5 left-12">Lựa chọn không được để trống</p>
                )}
              </div>
            ))}
          </RadioGroup>

          <Button variant="outline" onClick={addOption} className="w-full mt-4 flex items-center justify-center">
            <Plus className="h-4 w-4 mr-2" />
            Thêm lựa chọn
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
