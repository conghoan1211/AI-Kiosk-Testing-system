import PageWrapper from '@/components/PageWrapper/PageWrapper';
import TablePaging from '@/components/tableCommon/v2/tablePaging';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import cachedKeys from '@/consts/cachedKeys';
import { showError, showSuccess } from '@/helpers/toast';
import useFiltersHandler from '@/hooks/useFiltersHandler';
import useToggleDialog from '@/hooks/useToggleDialog';
import ExamHeader from '@/pages/teacher/examsupervision/components/ExamHeader';
import httpService from '@/services/httpService';
import classService from '@/services/modules/class/class.service';
import useGetAllClasses from '@/services/modules/class/hooks/useGetAllClasses';
import { ClassList, IClassRequest } from '@/services/modules/class/interfaces/class.interface';
import { useGet, useSave } from '@/stores/useStores';
import { BookOpen, Edit, HomeIcon, MoreHorizontal, Trash2, UserCheck, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { GenericFilters, IValueFormPageHeader } from '../manageuser/components/generic-filters';
import { UserStats } from '../manageuser/components/user-stats';
import DialogAddNewClass from './dialogs/DialogAddNewClass';
import { Switch } from '@/components/ui/switch';

const ManageClass = () => {
  // State
  const token = httpService.getTokenStorage();
  const [openAskAddNewClass, toggleAskAddNewClass, shouldRenderAskNewClass] = useToggleDialog();
  const detaultData = useGet('dataClass');
  const totalClassCount = useGet('totalClassCount');
  const totalPageClassCount = useGet('totalPageClassCount');
  const cachesFilterClass = useGet('cachesFilterClass');
  const [isTrigger, setTrigger] = useState(Boolean(!detaultData));
  const save = useSave();
  const [editClass, setEditClass] = useState<ClassList | null>(null);

  const { filters, setFilters } = useFiltersHandler({
    PageSize: cachesFilterClass?.PageSize || 50,
    CurrentPage: cachesFilterClass?.CurrentPage || 1,
    TextSearch: cachesFilterClass?.TextSearch || '',
    IsActive: cachesFilterClass?.IsActive !== undefined ? cachesFilterClass?.IsActive : null,
    FromDate: cachesFilterClass?.FromDate || null,
    ToDate: cachesFilterClass?.ToDate || null,
  });

  const stableFilters = useMemo(() => filters as IClassRequest, [filters]);

  const {
    data: dataClass,
    loading,
    refetch,
  } = useGetAllClasses(stableFilters, {
    isTrigger: isTrigger,
    refetchKey: cachedKeys.refetchClass,
    saveData: true,
  });

  useEffect(() => {
    if (dataClass && isTrigger) {
      save(cachedKeys.dataClass, dataClass);
    }
  }, [dataClass, isTrigger, save]);

  const dataMain = useMemo(
    () => (isTrigger ? dataClass : detaultData),
    [dataClass, detaultData, isTrigger],
  );

  const columns = [
    {
      label: 'Thông tin lớp học',
      accessor: 'description',
      sortable: false,
      Cell: (row: ClassList) => (
        <div className="flex items-start space-x-3 py-2">
          <div className="flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">#{row.classCode}</p>
            <div className="mt-1 flex items-center space-x-2">
              <p className="font-mono text-xs text-gray-500">{row.description}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'Sức chứa',
      accessor: 'maxStudent',
      width: 140,
      sortable: false,
      Cell: (row: ClassList) => (
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2 rounded-full bg-gray-50 px-3 py-2">
            <UserCheck className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">{row.maxStudent}</span>
            <span className="text-xs text-gray-500">học sinh</span>
          </div>
        </div>
      ),
    },
    {
      label: 'Trạng thái',
      accessor: 'isActive',
      width: 140,
      sortable: false,
      Cell: (row: ClassList) => (
        <div className="flex justify-center">
          <Badge
            variant={row.isActive ? 'default' : 'secondary'}
            className={`rounded-full border-0 px-3 py-1 text-xs font-medium ${row.isActive ? 'bg-emerald-100 text-emerald-800 shadow-sm' : 'bg-gray-100 text-gray-600 shadow-sm'} `}
          >
            <div
              className={`mr-2 h-2 w-2 rounded-full ${row.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}
            />
            {row.isActive ? 'Hoạt động' : 'Tạm dừng'}
          </Badge>
        </div>
      ),
    },
    {
      label: 'Hành động',
      accessor: 'actions',
      width: 100,
      sortable: false,
      Cell: (row: ClassList) => (
        <div className="flex justify-center">
          <Switch
            checked={row.isActive}
            onCheckedChange={async (checked) => {
              try {
                httpService.attachTokenToHeader(token);
                await classService.activeDeactiveClass(row.classId || '');
                refetch();
                showSuccess(checked ? 'Class is activated!' : 'Class is deactivated!');
              } catch (error) {
                showError(error);
              }
            }}
          />
        </div>
      ),
    },
    {
      label: 'Chức năng',
      accessor: 'functions',
      width: 100,
      sortable: false,
      Cell: (row: ClassList) => (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 rounded-full p-0 transition-colors hover:bg-gray-100"
              >
                <MoreHorizontal className="h-4 w-4 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                className="cursor-pointer transition-colors hover:bg-blue-50"
                onClick={() => {
                  setEditClass(row);
                  toggleAskAddNewClass();
                }}
              >
                <Edit className="mr-3 h-4 w-4 text-blue-600" />
                <span className="text-blue-700">Chỉnh sửa</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer transition-colors hover:bg-red-50">
                <Trash2 className="mr-3 h-4 w-4 text-red-600" />
                <span className="text-red-700">Xoá lớp</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const statItems = useMemo(() => {
    const totalClasses = dataMain?.length || 0;
    const activeClasses = dataMain?.filter((cls: any) => cls.isActive).length || 0;
    const inactiveClasses = totalClasses - activeClasses;

    return [
      {
        title: 'Tổng lớp học',
        value: totalClasses,
        icon: <Users className="h-6 w-6 text-blue-500" />,
        bgColor: 'bg-blue-50',
      },
      {
        title: 'Đang hoạt động',
        value: activeClasses,
        icon: <Users className="h-6 w-6 text-green-500" />,
        bgColor: 'bg-green-50',
      },
      {
        title: 'Không hoạt động',
        value: inactiveClasses,
        icon: <Users className="h-6 w-6 text-yellow-500" />,
        bgColor: 'bg-yellow-50',
      },
      {
        title: 'Tỷ lệ hoạt động',
        value: 2,
        icon: <Users className="h-6 w-6 text-purple-500" />,
        bgColor: 'bg-purple-50',
      },
    ];
  }, [dataMain]);

  //! Functions
  const handleChangePageSize = useCallback(
    (size: number) => {
      setTrigger(true);
      setFilters((prev) => {
        const newParams = {
          ...prev,
          PageSize: size,
          CurrentPage: 1,
        };
        save(cachedKeys.cachesFilterClass, newParams);
        return newParams;
      });
    },
    [setFilters, save],
  );

  const handleChangePage = useCallback(
    (page: number) => {
      setFilters((prev) => {
        const newParams = {
          ...prev,
          CurrentPage: page,
        };
        save(cachedKeys.cachesFilterClass, newParams);
        return newParams;
      });
    },
    [setFilters, save],
  );

  const handleSearch = (values: IValueFormPageHeader) => {
    setTrigger(true);
    setFilters((prev) => {
      const newParams = {
        ...prev,
        TextSearch: values.textSearch || '',
        CurrentPage: 1,
      };
      save(cachedKeys.cachesFilterClass, newParams);
      return newParams;
    });
  };

  const handleToggleAskNewClass = useCallback(() => {
    toggleAskAddNewClass();
    if (openAskAddNewClass) {
      setEditClass(null);
    }
  }, [toggleAskAddNewClass, openAskAddNewClass]);

  const handleAddEditClass = async (values: ClassList) => {
    try {
      httpService.attachTokenToHeader(token);
      if (editClass) {
        await classService.updateClass({
          ...values,
          classId: editClass.classId,
        });
      } else {
        await classService.createNewClass({
          ...values,
          classId: '',
        });
      }
      toggleAskAddNewClass();
      setEditClass(null);
      refetch();
      showSuccess(editClass ? 'Class list reflects changes!' : 'Thêm lớp học thành công!');
    } catch (error) {
      showError(error);
    }
  };

  //! Render
  return (
    <PageWrapper name="Quản lý lớp học" className="bg-white dark:bg-gray-900">
      <ExamHeader
        title="Quản lý lớp học"
        subtitle="Quản lý các lớp học, phòng học trong hệ thống"
        icon={<HomeIcon className="h-8 w-8 text-white" />}
        className="border-b border-white/20 bg-gradient-to-r from-blue-600 to-green-700 px-6 py-6 shadow-lg"
      />
      <div className="space-y-6 p-4">
        <UserStats statItems={statItems} className="lg:grid-cols-4" />
        {shouldRenderAskNewClass && (
          <DialogAddNewClass
            isOpen={openAskAddNewClass}
            toggle={handleToggleAskNewClass}
            onSubmit={handleAddEditClass}
            editClass={editClass || null}
          />
        )}
        <GenericFilters
          className="md:grid-cols-4"
          searchPlaceholder="Tìm kiếm lớp học..."
          onSearch={handleSearch}
          initialSearchQuery={filters.TextSearch || ''}
          filters={[
            {
              key: 'IsActive',
              placeholder: 'Trạng thái',
              options: [
                { value: null, label: 'Tất cả' },
                { value: true, label: 'Đang hoạt động' },
                { value: false, label: 'Không hoạt động' },
              ],
            },
          ]}
          onFilterChange={(
            newFilters: Record<string, string | number | boolean | null | undefined>,
          ) => {
            setTrigger(true);
            setFilters((prev) => {
              const updatedFilters = {
                ...prev,
                ...newFilters,
              };
              save(cachedKeys.cachesFilterClass, updatedFilters);
              return updatedFilters;
            });
          }}
          onAddNew={toggleAskAddNewClass}
          addNewButtonText="Tạo lớp mới"
        />
        <TablePaging
          id="manage-subject-table"
          columns={columns}
          keyRow="classId"
          data={dataMain || []}
          currentPage={filters.CurrentPage || 1}
          currentSize={filters.PageSize || 50}
          totalPage={totalPageClassCount || 1}
          total={totalClassCount || 0}
          loading={loading}
          noResultText="Không có lớp học nào"
          handleChangePage={handleChangePage}
          handleChangeSize={handleChangePageSize}
        />
      </div>
    </PageWrapper>
  );
};

export default ManageClass;
