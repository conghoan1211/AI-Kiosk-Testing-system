
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, PenTool } from "lucide-react";

interface QuestionType {
  id: string;
  title: string;
  description: string;
  icon: any;
  selectedColors: string;
  iconColor: string;
  titleColor: string;
  descColor: string;
}

interface QuestionTypeSelectorProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

const questionTypes: QuestionType[] = [
  {
    id: "multiple-choice",
    title: "Trắc nghiệm",
    description: "Câu hỏi có nhiều lựa chọn, chỉ một đáp án đúng",
    icon: CheckCircle,
    selectedColors: "bg-green-50 border-green-200 text-green-700",
    iconColor: "text-green-600",
    titleColor: "text-green-900",
    descColor: "text-green-700",
  },
  {
    id: "Essay",
    title: "Tự luận",
    description: "Câu hỏi yêu cầu trả lời tự do, không có lựa chọn",
    icon: PenTool,
    selectedColors: "bg-yellow-50 border-yellow-200 text-yellow-700",
    iconColor: "text-yellow-600",
    titleColor: "text-yellow-900",
    descColor: "text-yellow-700",
  },
  // {
  //   id: "true-false",
  //   title: "Đúng/Sai",
  //   description: "Câu hỏi chỉ có hai lựa chọn: Đúng hoặc Sai",
  //   icon: CheckCircle,
  //   selectedColors: "bg-blue-50 border-blue-200 text-blue-700",
  //   iconColor: "text-blue-600",
  //   titleColor: "text-blue-900",
  //   descColor: "text-blue-700",
  // },
  // {
  //   id: "fill-blank",
  //   title: "Điền vào chỗ trống",
  //   description: "Câu hỏi yêu cầu điền từ hoặc cụm từ vào chỗ trống",
  //   icon: Type,
  //   selectedColors: "bg-red-50 border-red-200 text-red-700",
  //   iconColor: "text-red-600",
  //   titleColor: "text-red-900",
  //   descColor: "text-red-700",
  // },
];

export function QuestionTypeSelector({
  selectedType,
  onTypeChange,
}: QuestionTypeSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Loại câu hỏi</CardTitle>
        <p className="text-sm text-gray-500">Chọn định dạng cho câu hỏi mới</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {questionTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          return (
            <div
              key={type.id}
              onClick={() => onTypeChange(type.id)}
              className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${isSelected
                ? `${type.selectedColors} shadow-sm`
                : "border-gray-200 bg-white hover:border-gray-300"
                }`}
            >
              <div className="flex items-start space-x-3">
                <Icon
                  className={`mt-0.5 h-5 w-5 ${isSelected ? type.iconColor : "text-gray-400"}`}
                />
                <div className="flex-1">
                  <h3 className={`font-medium ${isSelected ? type.titleColor : "text-gray-900"}`}                 >
                    {type.title}
                  </h3>
                  <p className={`mt-1 text-sm ${isSelected ? type.descColor : "text-gray-500"}`}                 >
                    {type.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export { questionTypes };
