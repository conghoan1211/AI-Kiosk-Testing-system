
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertCircle, Lightbulb } from "lucide-react";

interface Tip {
  title: string;
  description: string;
  icon: any;
  color: string;
}

const tips: Tip[] = [
  {
    title: "Câu hỏi rõ ràng",
    description: "Sử dụng ngôn ngữ rõ ràng, dễ hiểu",
    icon: CheckCircle,
    color: "text-green-600",
  },
  {
    title: "Lựa chọn hợp lý",
    description: "Các lựa chọn phải có độ dài tương đương",
    icon: AlertCircle,
    color: "text-blue-600",
  },
  {
    title: "Tránh gợi ý trực tiếp",
    description: "Đáp án đúng không nên có từ khóa gợi ý rõ ràng",
    icon: Lightbulb,
    color: "text-orange-600",
  },
  {
    title: "Tránh phủ định",
    description: "Hạn chế sử dụng từ phủ định trong câu hỏi",
    icon: AlertCircle,
    color: "text-red-600",
  },
];

export function TipsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-medium">
          <Lightbulb className="mr-2 h-5 w-5" />
          Mẹo tạo câu hỏi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tips.map((tip, index) => {
          const Icon = tip.icon;
          return (
            <div key={index} className="flex items-start space-x-3">
              <Icon className={`mt-0.5 h-4 w-4 ${tip.color}`} />
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {tip.title}
                </h4>
                <p className="mt-1 text-xs text-gray-500">{tip.description}</p>
              </div>
            </div>
          );
        })}

        <Separator />

        <div className="text-xs text-gray-500">
          <p className="mb-1 font-medium">
            Gợi ý: Bắt đầu với những câu hỏi đơn giản
          </p>
          <p>Tạo câu hỏi từ dễ đến khó để học sinh dễ tiếp cận</p>
        </div>
      </CardContent>
    </Card>
  );
}
