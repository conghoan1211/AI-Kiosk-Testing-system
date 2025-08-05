import PageWrapper from '@/components/PageWrapper/PageWrapper';
import MemoizedTablePaging from '@/components/tableCommon/v2/tablePaging';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import cachedKeys from '@/consts/cachedKeys';
import { DateTimeFormat } from '@/consts/dates';
import { showError, showSuccess } from '@/helpers/toast';
import useFiltersHandler from '@/hooks/useFiltersHandler';
import useToggleDialog from '@/hooks/useToggleDialog';
import ExamHeader from '@/pages/teacher/examsupervision/components/ExamHeader';
import useGetListKeyboardShortcut from '@/services/modules/keyboardshortcut/hooks/useGetAllKeyboardShortcut';
import {
  IKeyboardShorcutRequest,
  KeyboardShortcutList,
} from '@/services/modules/keyboardshortcut/interfaces/keyboardShortcut.interface';
import keyboardShortcutService from '@/services/modules/keyboardshortcut/keyboardShortcut.service';
import { useGet, useSave } from '@/stores/useStores';
import { Edit, Keyboard, MoreHorizontal, Trash2 } from 'lucide-react';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { GenericFilters, IValueFormPageHeader } from '../manageuser/components/generic-filters';
import { UserStats } from '../manageuser/components/user-stats';
import DialogAddNewKeyboardShortcut, {
  KeyboardShortcutFormValues,
} from './dialogs/DialogAddEditShortCut';

const KeyboardShortcutPage = () => {
  //!State
  const defaultShortcuts = useGet('dataKeyboardShortcut');
  const totalKeyboardShortcutCount = useGet('totalKeyboardShortcutCount');
  const totalPageKeyboardShortcutCount = useGet('totalPageKeyboardShortcutCount');
  const cachesFilterKeyboardShortcut = useGet('cachesFilterKeyboardShortcut');
  const [isTrigger, setTrigger] = useState(Boolean(!defaultShortcuts));
  const save = useSave();
  const [editKeyboardShortcut, setEditKeyboardShortcut] = useState<KeyboardShortcutList | null>(
    null,
  );
  const [
    openAskAddNewKeyboardShortcut,
    toggleAskAddNewKeyboardShortcut,
    shouldRenderAskAddNewKeyboardShortcut,
  ] = useToggleDialog();

  const handAddEditKeyboardShortcut = useCallback(() => {
    toggleAskAddNewKeyboardShortcut();
    if (openAskAddNewKeyboardShortcut) {
      setEditKeyboardShortcut(null);
    }
  }, [openAskAddNewKeyboardShortcut, toggleAskAddNewKeyboardShortcut]);

  const { filters, setFilters } = useFiltersHandler({
    PageSize: cachesFilterKeyboardShortcut?.PageSize || 50,
    CurrentPage: cachesFilterKeyboardShortcut?.CurrentPage || 1,
    TextSearch: cachesFilterKeyboardShortcut?.TextSearch || '',
    IsActive:
      cachesFilterKeyboardShortcut?.IsActive !== undefined
        ? cachesFilterKeyboardShortcut.IsActive
        : undefined,
    RiskLevel:
      cachesFilterKeyboardShortcut?.RiskLevel !== undefined
        ? cachesFilterKeyboardShortcut.RiskLevel
        : undefined,
  });

  const stableFilters = useMemo(() => filters as IKeyboardShorcutRequest, [filters]);

  const {
    data: dataKeyboardShortcut,
    loading,
    refetch,
  } = useGetListKeyboardShortcut(stableFilters, {
    isTrigger: isTrigger,
    refetchKey: cachesFilterKeyboardShortcut?.refetchKey,
    saveData: true,
  });

  useEffect(() => {
    if (dataKeyboardShortcut && isTrigger) {
      save(cachedKeys.dataKeyboardShortcut, dataKeyboardShortcut);
    }
  }, [dataKeyboardShortcut, isTrigger, save]);

  const dataMain = useMemo(
    () => (isTrigger ? dataKeyboardShortcut : defaultShortcuts),
    [dataKeyboardShortcut, isTrigger, defaultShortcuts],
  );

  const columns = [
    {
      label: 'Phím tắt',
      accessor: 'keyCode',
      sortable: false,
      Cell: (row: KeyboardShortcutList) => (
        <span className="font-medium">{row.keyCode || 'N/A'}</span>
      ),
    },
    {
      label: 'Tổ hợp phím',
      accessor: 'keyCombination',
      sortable: false,
      Cell: (row: KeyboardShortcutList) => (
        <span className="text-sm text-gray-600">{row.keyCombination || 'N/A'}</span>
      ),
    },
    {
      label: 'Mô tả',
      accessor: 'description',
      sortable: false,
      Cell: (row: KeyboardShortcutList) => (
        <span className="text-sm text-gray-600">{row.description || 'Không có mô tả'}</span>
      ),
    },
    {
      label: 'Mức độ rủi ro',
      accessor: 'riskLevel',
      sortable: false,
      Cell: (row: KeyboardShortcutList) => (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            row.riskLevel === 0
              ? 'bg-green-100 text-green-800'
              : row.riskLevel === 1
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}
        >
          {row.riskLevel === 0
            ? 'Rủi ro thấp'
            : row.riskLevel === 1
              ? 'Rủi ro trung bình'
              : 'Rủi ro cao'}
        </span>
      ),
    },
    {
      label: 'Trạng thái',
      accessor: 'isActive',
      sortable: false,
      Cell: (row: KeyboardShortcutList) => (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            row.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {row.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
        </span>
      ),
    },
    {
      label: 'Cập nhật lần cuối',
      accessor: 'updatedAt',
      sortable: false,
      Cell: (row: KeyboardShortcutList) => (
        <span className="text-sm text-gray-600">
          {moment(row.updatedAt).format(DateTimeFormat.DayMonthYear) || 'Không có mô tả'}
        </span>
      ),
    },
    {
      label: 'Thay đổi trạng thái',
      accessor: 'changeStatus',
      sortable: false,
      Cell: (row: KeyboardShortcutList) => (
        <Switch
          checked={row.isActive}
          onCheckedChange={async () => {
            try {
              await keyboardShortcutService.changeStatusKeyboardShortcut([row.keyId]);
              showSuccess(`Trạng thái ứng dụng ${row.keyCode} đã được cập nhật!`);
              save(cachedKeys.dataKeyboardShortcut, null);
              setTrigger(true);
              refetch();
            } catch (error) {
              showError(error);
            }
          }}
        />
      ),
    },
    {
      label: 'Hành động',
      accessor: 'actions',
      width: 120,
      sortable: false,
      Cell: (row: KeyboardShortcutList) => (
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setEditKeyboardShortcut(row);
                  toggleAskAddNewKeyboardShortcut();
                }}
              >
                <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    await keyboardShortcutService.deleteKeyboardShortcut([row.keyId]);
                    showSuccess('Xoá phím tắt thành công!');
                    refetch();
                  } catch (error) {
                    showError(error);
                  }
                }}
                className="cursor-pointer text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Xoá
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const statItems = useMemo(() => {
    const totalKeyboardShortcut = dataMain.length || 0;
    const totalActive = dataMain?.filter((item: any) => item.isActive).length || 0;
    const highRiskCount = dataMain?.filter((item: any) => item.riskLevel === 2).length || 0;

    return [
      {
        title: 'Tổng số ứng dụng',
        value: totalKeyboardShortcut,
        icon: <Keyboard className="h-6 w-6 text-blue-500" />,
        bgColor: 'bg-blue-100',
      },
      {
        title: 'Ứng dụng đang hoạt động',
        value: totalActive,
        icon: <Keyboard className="h-6 w-6 text-green-500" />,
        bgColor: 'bg-green-100',
      },
      {
        title: 'Ứng dụng rủi ro cao',
        value: highRiskCount,
        icon: <Keyboard className="h-6 w-6 text-red-500" />,
        bgColor: 'bg-red-100',
      },
    ];
  }, [dataMain]);

  //!Functions
  const handleChangePage = useCallback(
    (page: number) => {
      setFilters((prev: any) => {
        const newParams = {
          ...prev,
          CurrentPage: page,
        };
        save(cachedKeys.cachesFilterKeyboardShortcut, newParams);
        return newParams;
      });
    },
    [setFilters, save],
  );

  const handleChangePageSize = useCallback(
    (size: number) => {
      setTrigger(true);
      setFilters((prev: any) => {
        const newParams = {
          ...prev,
          PageSize: size,
          CurrentPage: 1,
        };
        save(cachedKeys.cachesFilterKeyboardShortcut, newParams);
        return newParams;
      });
    },
    [setFilters, save],
  );

  const handleSearch = useCallback(
    (searchText: IValueFormPageHeader) => {
      setTrigger(true);
      setFilters((prev: any) => {
        const newParams = {
          ...prev,
          TextSearch: searchText?.textSearch,
          CurrentPage: 1,
        };
        save(cachedKeys.cachesFilterKeyboardShortcut, newParams);
        return newParams;
      });
    },
    [setFilters, save],
  );

  const handleAddEditKeyboardShortcut = async (values: KeyboardShortcutFormValues) => {
    try {
      if (editKeyboardShortcut) {
        await keyboardShortcutService.createUpdateKeyboardShortcut(values);
        setEditKeyboardShortcut(null);
      } else {
        await keyboardShortcutService.createUpdateKeyboardShortcut({
          ...values,
          keyId: undefined,
        });
      }
      toggleAskAddNewKeyboardShortcut();
      showSuccess(
        editKeyboardShortcut ? 'Cập nhật phím tắt thành công!' : 'Thêm phím tắt mới thành công!',
      );
      refetch();
    } catch (error) {
      showError(error);
    }
  };

  //!Render
  return (
    <PageWrapper name="Quản lý phím tắt" className="bg-white dark:bg-gray-900">
      <ExamHeader
        title="Quản lý phím tắt"
        subtitle="Quản lý các phím tắt trong hệ thống"
        icon={<Keyboard className="h-8 w-8 text-white" />}
        className="border-b border-white/20 bg-gradient-to-r from-blue-600 to-pink-700 px-6 py-6 shadow-lg"
      />
      <div className="space-y-6 p-4">
        <UserStats statItems={statItems} className="lg:grid-cols-3" />
        {shouldRenderAskAddNewKeyboardShortcut && (
          <DialogAddNewKeyboardShortcut
            isOpen={openAskAddNewKeyboardShortcut}
            toggle={handAddEditKeyboardShortcut}
            onSubmit={handleAddEditKeyboardShortcut}
            editKeyboardShortcut={editKeyboardShortcut}
          />
        )}
        <GenericFilters
          className="md:grid-cols-3 lg:grid-cols-5"
          searchPlaceholder="Tìm kiếm ứng dụng..."
          onSearch={handleSearch}
          initialFilterValues={cachesFilterKeyboardShortcut || {}}
          initialSearchQuery={filters?.TextSearch || ''}
          filters={[
            {
              key: 'IsActive',
              placeholder: 'Tất cả trạng thái',
              options: [
                { value: undefined, label: 'Tất cả trạng thái' },
                { value: true, label: 'Đang hoạt động' },
                { value: false, label: 'Không hoạt động' },
              ],
            },
            {
              key: 'RiskLevel',
              placeholder: 'Mức độ rủi ro',
              options: [
                { value: undefined, label: 'Tất cả mức độ' },
                { value: 0, label: 'Rủi ro thấp' },
                { value: 1, label: 'Rủi ro trung bình' },
                { value: 2, label: 'Rủi ro cao' },
              ],
            },
          ]}
          onFilterChange={(
            newFilters: Record<string, string | number | boolean | null | undefined>,
          ) => {
            setTrigger(true);
            setFilters((prev: any) => {
              const newParams = {
                ...prev,
                ...newFilters,
              };
              save(cachedKeys.cachesFilterKeyboardShortcut, newParams);
              return newParams;
            });
          }}
          onAddNew={handAddEditKeyboardShortcut}
          addNewButtonText="Thêm phím tắt mới"
        />
        <MemoizedTablePaging
          id="manage-subject-table"
          keyRow="keyId"
          columns={columns}
          data={dataMain || []}
          currentPage={filters?.CurrentPage || 1}
          currentSize={filters?.PageSize || 50}
          totalPage={totalPageKeyboardShortcutCount || 1}
          total={totalKeyboardShortcutCount || 0}
          loading={loading}
          handleChangePage={handleChangePage}
          handleChangeSize={handleChangePageSize}
        />
      </div>
    </PageWrapper>
  );
};

export default KeyboardShortcutPage;
