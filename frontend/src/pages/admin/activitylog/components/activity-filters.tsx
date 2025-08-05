import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RoleEnum } from '@/consts/common';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
interface ActivityFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  startDate: Date;
  onStartDateChange: (value: Date) => void;
  endDate: Date | undefined;
  onEndDateChange: (value: Date) => void;
  onUserFilterChange: (value: string) => void;
  userFilter: string;
}

export function ActivityFilters({
  searchTerm,
  onSearchChange,
  userFilter,
  onUserFilterChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}: ActivityFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Bộ lọc</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Tìm theo tên, hành động..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {/* <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Danh mục</label>
                        <Select value={categoryFilter} onValueChange={onCategoryFilterChange} defaultValue="user">
                            <SelectTrigger>
                                <SelectValue placeholder="Tất cả danh mục" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">User Activity</SelectItem>
                                <SelectItem value="exam">Exam Activity</SelectItem>
                            </SelectContent>
                        </Select>
                    </div> */}

          <div>
            <Label className="text-sm font-medium">Ngày bắt đầu</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="mt-1 w-full justify-start bg-transparent text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && onStartDateChange(date)}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label className="text-sm font-medium">Ngày kết thúc</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="mt-1 w-full justify-start bg-transparent text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => date && onEndDateChange(date)}
                  disabled={(date) =>
                    (startDate && date < new Date(startDate.getTime() + 24 * 60 * 60 * 1000)) ||
                    date > new Date(Date.now() + 24 * 60 * 60 * 1000)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Người dùng</label>
            <Select value={userFilter} onValueChange={onUserFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả người dùng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Tất cả người dùng</SelectItem>
                <SelectItem value={RoleEnum.Administrator.toString()}>Admin</SelectItem>
                <SelectItem value={RoleEnum.Lecture.toString()}>Lecture</SelectItem>
                <SelectItem value={RoleEnum.Supervisor.toString()}>Supervisor</SelectItem>
                <SelectItem value={RoleEnum.Student.toString()}>Student</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
