import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface AnswerBadgeProps {
  type: 'correct' | 'incorrect' | 'user-correct' | 'user-incorrect';
  size?: 'sm' | 'md';
}

export default function AnswerBadge({ type, size = 'md' }: AnswerBadgeProps) {
  const sizeClass = size === 'sm' ? 'text-xs' : '';

  switch (type) {
    case 'correct':
      return (
        <Badge variant="secondary" className={`bg-green-100 text-green-800 ${sizeClass}`}>
          <CheckCircle className="mr-1 h-3 w-3" />
          Đáp án đúng
        </Badge>
      );
    case 'user-correct':
      return (
        <Badge variant="secondary" className={`bg-green-100 text-green-800 ${sizeClass}`}>
          <CheckCircle className="mr-1 h-3 w-3" />
          Bạn đã chọn đúng
        </Badge>
      );
    case 'user-incorrect':
      return (
        <Badge variant="destructive" className={sizeClass}>
          <XCircle className="mr-1 h-3 w-3" />
          Bạn đã chọn
        </Badge>
      );
    default:
      return null;
  }
}
