import DialogConfirm from '@/components/dialogs/DialogConfirm';
import PageWrapper from '@/components/PageWrapper/PageWrapper';
import MemoizedTablePaging from '@/components/tableCommon/v2/tablePaging';
import cachedKeys from '@/consts/cachedKeys';
import { showError, showSuccess } from '@/helpers/toast';
import useFiltersHandler from '@/hooks/useFiltersHandler';
import useToggleDialog from '@/hooks/useToggleDialog';
import httpService from '@/services/httpService';
import useGetListPermission from '@/services/modules/authorize/hooks/useGetAllPermission';
import {
  IPermissionsRequest,
  PermissionsList,
} from '@/services/modules/authorize/interfaces/permission.interface';
import authorizeService from '@/services/modules/authorize/role.Service';
import { useGet, useSave } from '@/stores/useStores';
import { CloudLightning, Key, Lock, Shield } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import DialogAddNewPermision, { PermissionFormValues } from '../dialogs/DialogAddNewPermision';
import { GenericFilters, IValueFormPageHeader } from './generic-filters';
import { PermissionCellContent } from './permission-cell-content';
import { UserStats } from './user-stats';

const PermissionTab = () => {
  //! State
  const [openAskNewPermmision, toggleAskNewPermmision, shouldRenderAskNewPermmision] =
    useToggleDialog();
  const [openAskDeletePermmision, toggleAskDeletePermmision, shouldRenderAskDeletePermmision] =
    useToggleDialog();
  const save = useSave();
  const defaultData = useGet('dataPermissions');
  const totalPermissionsCount = useGet('totalPermissionsCount');
  const totalPagePermissionsCount = useGet('totalPagePermissionsCount');
  const cachesFilterPermissions = useGet('cachesFilterPermissions');
  const [isTrigger, setIsTrigger] = useState(Boolean(!defaultData));
  const [editingPermissionId, setEditingPermissionId] = useState<string | null>(null);
  const token = httpService.getTokenStorage();

  const { filters, setFilters } = useFiltersHandler({
    PageSize: cachesFilterPermissions?.PageSize || 50,
    CurrentPage: cachesFilterPermissions?.CurrentPage || 1,
    TextSearch: cachesFilterPermissions?.TextSearch || '',
    SortType: cachesFilterPermissions?.SortType || null,
  });

  const stableFilters = useMemo(() => filters as IPermissionsRequest, [filters]);

  const {
    data: permissionsData,
    loading: loadingPermissions,
    refetch,
    error,
  } = useGetListPermission(stableFilters, {
    isTrigger: true,
    refetchKey: cachedKeys.refetchPermissions,
    saveData: true,
  });

  useEffect(() => {
    if (isTrigger) {
      save(cachedKeys.dataPermissions, error ? [] : permissionsData || []);
    }
  }, [permissionsData, isTrigger, save, error]);

  const dataMain = useMemo(
    () => (isTrigger ? (error ? [] : permissionsData) : defaultData),
    [permissionsData, defaultData, isTrigger, error],
  );

  const flattenedPermissions = useMemo(() => {
    if (!dataMain) return [];
    return dataMain.flatMap((category: PermissionsList) =>
      category.permissions.map((permission) => ({
        id: permission.id,
        name: permission.name,
        description: category.description,
        action: permission.action,
        resource: permission.resource,
        isActive: permission.isActive,
      })),
    );
  }, [dataMain]);

  const permissionItems = useMemo(() => {
    const totalPermission = flattenedPermissions.length;
    const activePermissions = flattenedPermissions.filter((p: any) => p.isActive).length;
    const systemPermissions = flattenedPermissions.filter((p: any) =>
      p.resource.toLowerCase().includes('system'),
    ).length;
    const customPermissions = totalPermission - systemPermissions;

    return [
      {
        title: 'Tổng quyền hạn',
        value: totalPermission,
        icon: <Key className="h-6 w-6 text-gray-500" />,
        bgColor: 'bg-gray-50',
      },
      {
        title: 'Đang hoạt động',
        value: activePermissions,
        icon: <Shield className="h-6 w-6 text-red-500" />,
        bgColor: 'bg-red-50',
      },
      {
        title: 'Quyền hệ thống',
        value: systemPermissions,
        icon: <Lock className="h-6 w-6 text-blue-500" />,
        bgColor: 'bg-blue-50',
      },
      {
        title: 'Quyền tuỳ chỉnh',
        value: customPermissions,
        icon: <CloudLightning className="h-6 w-6 text-green-500" />,
        bgColor: 'bg-green-50',
      },
    ];
  }, [flattenedPermissions]);

  const columns = [
    {
      label: 'Tên quyền hạn',
      accessor: 'description',
      sortable: false,
      Cell: (row: PermissionsList) => <div>{row?.description}</div>,
    },
    {
      label: 'Quyền hạn',
      accessor: 'permissions',
      sortable: false,
      Cell: (row: PermissionsList) => (
        <div className="flex flex-wrap gap-2">
          {row?.permissions?.map((permission) => (
            <PermissionCellContent
              key={permission.id}
              permission={permission}
              onEdit={(id) => {
                setEditingPermissionId(id);
                toggleAskNewPermmision();
              }}
              onDelete={(id) => {
                setEditingPermissionId(id);
                toggleAskDeletePermmision();
              }}
            />
          ))}
        </div>
      ),
    },
  ];

  //! Functions
  const handleToggleAskNewPermmision = useCallback(() => {
    toggleAskNewPermmision();
    if (openAskNewPermmision) {
      setEditingPermissionId(null);
    }
  }, [toggleAskNewPermmision, openAskNewPermmision]);

  const handleToggleAskDeletePermmision = useCallback(() => {
    toggleAskDeletePermmision();
    if (openAskDeletePermmision) {
      setEditingPermissionId(null);
    }
  }, [toggleAskDeletePermmision, openAskDeletePermmision]);

  const handleChangePageSize = useCallback(
    (size: number) => {
      setIsTrigger(true);
      setFilters((prev: any) => {
        const newParams = {
          ...prev,
          PageSize: size,
          CurrentPage: 1,
        };
        save(cachedKeys.cachesFilterPermissions, newParams);
        save(cachedKeys.dataPermissions, []);
        return newParams;
      });
    },
    [setFilters, save],
  );

  const handleChangePage = useCallback(
    (page: number) => {
      setTimeout(() => {
        setFilters((prev: any) => {
          const newParams = {
            ...prev,
            CurrentPage: page,
          };
          save(cachedKeys.cachesFilterPermissions, newParams);
          return newParams;
        });
      }, 0);
    },
    [setFilters, save],
  );

  const handleSubmit = async (values: PermissionFormValues) => {
    try {
      httpService.attachTokenToHeader(token);
      if (editingPermissionId) {
        const payload = {
          ...values,
          id: editingPermissionId,
        };
        await authorizeService.createUpdateNewPermission(payload);
        showSuccess('Permission successfully updated');
      } else {
        await authorizeService.createUpdateNewPermission(values);
        showSuccess('Permission successfully created');
      }
      toggleAskNewPermmision();
      setEditingPermissionId(null);
      save('activeTab', 'permissions');
      setIsTrigger(true);
      refetch();
    } catch (error) {
      showError(error);
    }
  };

  const handleSearch = useCallback(
    (value: IValueFormPageHeader) => {
      setIsTrigger(true);
      setFilters((prev: any) => {
        const newParams = {
          ...prev,
          TextSearch: value.textSearch || '',
        };
        save(cachedKeys.cachesFilterPermissions, newParams);
        save(cachedKeys.dataPermissions, []);
        return newParams;
      });
    },
    [setFilters, save],
  );

  //! Render
  return (
    <PageWrapper name="Quản lý quyền hạn">
      <div className="space-y-6">
        <UserStats statItems={permissionItems} className="lg:grid-cols-4" />

        <GenericFilters
          className="mt-3 md:grid-cols-2 lg:grid-cols-4"
          searchPlaceholder="Tìm kiếm quyền hạn..."
          onSearch={handleSearch}
          initialSearchQuery={filters?.TextSearch || ''}
          filters={[
            {
              key: 'SortType',
              placeholder: 'Sắp xếp theo',
              options: [
                { value: null, label: 'Mặc định' },
                { value: '0', label: 'Tên A-Z' },
                { value: '1', label: 'Tên Z-A' },
              ],
            },
          ]}
          onFilterChange={(
            newFilters: Record<string, string | number | boolean | null | undefined>,
          ) => {
            setIsTrigger(true);
            setFilters((prev) => {
              const updatedFilters = {
                ...prev,
                ...newFilters,
              };
              save(cachedKeys.cachesFilterPermissions, updatedFilters);
              save(cachedKeys.dataPermissions, []);
              return updatedFilters;
            });
          }}
          onAddNew={toggleAskNewPermmision}
          addNewButtonText="Create Permission"
        />

        <MemoizedTablePaging
          id="permissions-table"
          columns={columns}
          data={dataMain || []}
          currentPage={filters?.CurrentPage || 1}
          currentSize={filters?.PageSize || 50}
          totalPage={totalPagePermissionsCount || 1}
          total={totalPermissionsCount || 0}
          loading={loadingPermissions}
          handleChangePage={handleChangePage}
          handleChangeSize={handleChangePageSize}
          noResultText="No permissions found."
        />

        {shouldRenderAskNewPermmision && (
          <DialogAddNewPermision
            dataMain={dataMain}
            isOpen={openAskNewPermmision}
            toggle={handleToggleAskNewPermmision}
            onSubmit={handleSubmit}
            editId={editingPermissionId || ''}
          />
        )}

        {shouldRenderAskDeletePermmision && (
          <DialogConfirm
            isOpen={openAskDeletePermmision}
            toggle={handleToggleAskDeletePermmision}
            title="Xoá quyền hạn"
            content="Bạn có chắc chắn muốn xoá quyền hạn này? Hành động này không thể hoàn tác."
            onSubmit={async () => {
              try {
                if (editingPermissionId) {
                  await authorizeService.deletePermission(editingPermissionId);
                  showSuccess('Xoá quyền hạn thành công!');
                  setEditingPermissionId(null);
                  handleToggleAskDeletePermmision();
                  refetch();
                }
              } catch (error) {
                showError(error);
              }
            }}
            variantYes="destructive"
          />
        )}
      </div>
    </PageWrapper>
  );
};

export default PermissionTab;
