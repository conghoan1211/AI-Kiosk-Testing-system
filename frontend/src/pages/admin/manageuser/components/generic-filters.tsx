import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { debounce } from 'lodash';
import { Filter, Import, Plus, Search, Sheet } from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';

type FilterOption = {
  label: string;
  value: string | number | boolean | null | undefined;
};

type FilterConfig = {
  key: string;
  placeholder: string;
  options: FilterOption[];
};

export interface IValueFormPageHeader {
  textSearch?: string;
}

type GenericFiltersProps = {
  searchPlaceholder?: string;
  onSearch?: (query: IValueFormPageHeader) => void;
  filters?: FilterConfig[];
  onFilterChange?: (filters: Record<string, string | number | boolean | null | undefined>) => void;
  onAddNew?: () => void;
  addNewButtonText?: string;
  className?: string;
  importButtonText?: string;
  onImport?: () => void;
  exportButtonText?: string;
  onExport?: () => void;
  initialSearchQuery?: string;
  initialFilterValues?: Record<string, string | number | boolean | null | undefined>;
};

export function GenericFilters({
  searchPlaceholder = 'Tìm kiếm...',
  onSearch,
  filters = [],
  onFilterChange,
  onAddNew,
  addNewButtonText = 'Thêm mới',
  className = '',
  importButtonText = 'Nhập dữ liệu',
  onImport,
  exportButtonText = 'Xuất dữ liệu',
  onExport,
  initialSearchQuery = '',
  initialFilterValues = {},
}: GenericFiltersProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [filterValues, setFilterValues] = useState<
    Record<string, string | number | boolean | null | undefined>
  >(() =>
    filters.reduce(
      (acc, filter) => {
        acc[filter.key] =
          initialFilterValues[filter.key] !== undefined
            ? initialFilterValues[filter.key]
            : undefined; // Default to undefined
        return acc;
      },
      {} as Record<string, string | number | boolean | null | undefined>,
    ),
  );

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  // Debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        onSearch?.({ textSearch: query.trim() });
      }, 500),
    [onSearch],
  );

  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    // Tìm option tương ứng để lấy giá trị gốc
    const filter = filters.find((f) => f.key === key);
    const selectedOption = filter?.options.find((option) => String(option.value) === value);
    const finalValue = selectedOption ? selectedOption.value : value;

    const updatedFilters = { ...filterValues, [key]: finalValue };
    setFilterValues(updatedFilters);
    onFilterChange?.(updatedFilters);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h3 className="font-medium">Bộ lọc và tìm kiếm</h3>
        </div>

        <div className={`grid grid-cols-1 gap-4 ${className} grid-flow-row`}>
          <div className="relative md:col-span-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              className="pl-9"
              value={searchQuery}
              onChange={handleSearchChange}
              extraLeft={<Search className="h-4 w-4 text-muted-foreground" />}
            />
          </div>

          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={filterValues[filter.key] !== undefined ? String(filterValues[filter.key]) : ''}
              onValueChange={(value) => handleFilterChange(filter.key, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={String(option.value)} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {onAddNew && (
            <Button
              className="inline-flex min-h-[40px] min-w-[120px] items-center justify-center bg-black text-white hover:bg-gray-800"
              onClick={onAddNew}
              type="button"
            >
              <Plus className="mr-2 h-4 w-4" />
              {addNewButtonText || 'Default Text'}
            </Button>
          )}

          {onImport && (
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              type="button"
              onClick={onImport}
            >
              <Import className="mr-2 h-4 w-4" />
              {importButtonText}
            </Button>
          )}

          {onExport && (
            <Button
              className="bg-green-600 text-white hover:bg-green-700"
              type="button"
              onClick={onExport}
            >
              <Sheet className="mr-2 h-4 w-4" />
              {exportButtonText}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
