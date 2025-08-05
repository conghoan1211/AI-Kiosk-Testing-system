import PageWrapper from '@/components/PageWrapper/PageWrapper';
import TablePaging from '@/components/tableCommon/v2/tablePaging';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BaseUrl from '@/consts/baseUrl';
import cachedKeys from '@/consts/cachedKeys';
import { showError, showSuccess } from '@/helpers/toast';
import useFiltersHandler from '@/hooks/useFiltersHandler';
import useToggleDialog from '@/hooks/useToggleDialog';
import ExamHeader from '@/pages/teacher/examsupervision/components/ExamHeader';
import useGetListUser from '@/services/modules/user/hooks/useGetListUser';
import { InitialFilterUser, UserList } from '@/services/modules/user/interfaces/user.interface';
import userService from '@/services/modules/user/user.Service';
import { useGet, useSave } from '@/stores/useStores';
import { Activity, BookOpen, GraduationCap, Lock, Shield, User, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericFilters, IValueFormPageHeader } from './components/generic-filters';
import PermissionTab from './components/permmision-tab';
import RoleTab from './components/role-tab';
import { UserStats } from './components/user-stats';
import { createUserColumns } from './components/user-table-columns';
import DialogPreCheckImportUser from './dialogs/DialogPreCheckImportUser';

const AdminManageUser = () => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || 'users');
  const navigate = useNavigate();
  const forceRefetch = useGet('forceRefetchUser');
  const defaultData = useGet('dataUser');
  const totalUserCount = useGet('totalUserCount');
  const cachedFilterUser = useGet('cachesFilterUser');
  const totalPageUser = useGet('totalPageUserCount');
  const [isTrigger, setTrigger] = useState(Boolean(!defaultData) || forceRefetch);
  const save = useSave();
  const [openPrecheckImportUser, togglePrecheckImportUser, shouldRenderPrecheckImportUser] =
    useToggleDialog();

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const { filters, setFilters } = useFiltersHandler({
    pageSize: cachedFilterUser?.pageSize || 50,
    currentPage: cachedFilterUser?.currentPage || 1,
    textSearch: cachedFilterUser?.textSearch || '',
    roleId: cachedFilterUser?.roleId || null,
    status: cachedFilterUser?.status || null,
    campusId: cachedFilterUser?.campusId || null,
    sortType: cachedFilterUser?.sortType || null,
  });

  const stableFilters = useMemo(() => filters as InitialFilterUser, [filters]);

  const {
    data: dataUser,
    loading,
    refetch,
  } = useGetListUser(stableFilters, {
    isTrigger: isTrigger,
    refetchKey: cachedKeys.refetchUser,
    saveData: true,
  });

  useEffect(() => {
    if (forceRefetch) {
      setTrigger(true);
      refetch();
      save(cachedKeys.forceRefetchUser, false);
    }
  }, [forceRefetch, refetch, save]);

  useEffect(() => {
    if (dataUser && isTrigger) {
      save(cachedKeys.dataUser, dataUser);
    }
  }, [dataUser, isTrigger, save]);

  const dataMain = useMemo(
    () => (isTrigger ? dataUser : defaultData) || [],
    [isTrigger, defaultData, dataUser],
  );

  const statItems = useMemo(() => {
    const totalUsers = dataMain?.length || 0;
    const adminCount =
      dataMain?.filter(
        (user: UserList) =>
          Array.isArray(user.roleId) && (user.roleId.includes(3) || user.roleId.includes(4)),
      ).length || 0;
    const teacherCount =
      dataMain?.filter((user: UserList) => Array.isArray(user.roleId) && user.roleId.includes(2))
        .length || 0;
    const studentCount =
      dataMain?.filter((user: UserList) => Array.isArray(user.roleId) && user.roleId.includes(1))
        .length || 0;

    return [
      {
        title: 'Tổng người dùng',
        value: totalUsers,
        icon: <Users className="h-6 w-6 text-blue-500" />,
        bgColor: 'bg-blue-50',
      },
      {
        title: 'Quản trị',
        value: adminCount,
        icon: <Activity className="h-6 w-6 text-green-500" />,
        bgColor: 'bg-green-50',
      },
      {
        title: 'Giáo viên',
        value: teacherCount,
        icon: <GraduationCap className="h-6 w-6 text-yellow-500" />,
        bgColor: 'bg-yellow-50',
      },
      {
        title: 'Học sinh',
        value: studentCount,
        icon: <BookOpen className="h-6 w-6 text-purple-500" />,
        bgColor: 'bg-purple-50',
      },
    ];
  }, [dataMain]);

  const columns = createUserColumns({
    navigate,
    BaseUrl,
    onDeactivateUser: async (userId: string) => {
      try {
        await userService.toggleActiveUser(userId);
        showSuccess('Người dùng đã được cập nhật trạng thái thành công!');
        refetch();
      } catch (error) {
        showError(error);
      }
    },
  });

  const handleChangePageSize = useCallback(
    (size: number) => {
      setTrigger(true);
      setFilters((prev: any) => {
        const newParams = {
          ...prev,
          pageSize: size,
          currentPage: 1,
        };
        save(cachedKeys.cachesFilterUser, newParams);
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
            currentPage: page,
          };
          save(cachedKeys.cachesFilterUser, newParams);
          return newParams;
        });
      }, 0);
    },
    [setFilters, save],
  );

  const handleImportUser = useCallback(
    async (file?: File) => {
      try {
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          await userService.importUser(formData);
          refetch();
        } else {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.csv, .xlsx';
          input.onchange = async (event: any) => {
            const selectedFile = event.target.files[0];
            if (!selectedFile) return;

            if (!selectedFile.name.match(/\.(csv|xlsx)$/)) {
              showError('Vui lòng chọn file CSV hoặc XLSX.');
              return;
            }

            const formData = new FormData();
            formData.append('file', selectedFile);
            await userService.importUser(formData);
            refetch();
          };
          input.click();
        }
      } catch (error) {
        showError(error);
      }
    },
    [refetch],
  );

  const handleExportUser = useCallback(async () => {
    try {
      await userService.exportUser();
      showSuccess('Xuất người dùng thành công!');
    } catch (error) {
      showError(error);
    }
  }, []);

  // Debounced handleSearch
  const handleSearch = useCallback(
    (value: IValueFormPageHeader) => {
      setTrigger(true);
      setFilters((prev: any) => {
        const newParams = {
          ...prev,
          textSearch: value.textSearch || '',
          currentPage: 1,
        };
        save(cachedKeys.cachesFilterUser, newParams);
        return newParams;
      });
    },
    [setFilters, save],
  );

  return (
    <PageWrapper name="Quản lý người dùng" className="bg-white dark:bg-gray-900">
      <ExamHeader
        title="Quản lý người dùng"
        subtitle="Quản lý người dùng, vai trò và quyền hạn trong hệ thống"
        icon={<User className="h-8 w-8 text-white" />}
        className="border-b border-white/20 bg-gradient-to-r from-blue-600 to-green-700 px-6 py-6 shadow-lg"
      />
      <div className="space-y-6 p-4">
        <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
          <TabsList variant="default" fullWidth className="w-full">
            <TabsTrigger variant="gradient" value="users" icon={<User size={16} />}>
              Người dùng
            </TabsTrigger>
            <TabsTrigger variant="gradient" value="roles" icon={<Shield size={16} />}>
              Vai trò
            </TabsTrigger>
            <TabsTrigger variant="gradient" value="permissions" icon={<Lock size={16} />}>
              Quyền hạn
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <UserStats
              statItems={statItems}
              className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
            />
            <GenericFilters
              className="md:grid-cols-9"
              searchPlaceholder="Tìm kiếm người dùng..."
              onSearch={handleSearch}
              initialSearchQuery={filters?.textSearch || ''}
              filters={[
                {
                  key: 'roleId',
                  placeholder: 'Chọn vai trò',
                  options: [
                    { value: null, label: 'Tất cả vai trò' },
                    { value: 1, label: 'Học sinh' },
                    { value: 2, label: 'Giáo viên' },
                    { value: 3, label: 'Quản trị viên' },
                    { value: 4, label: 'Quản trị hệ thống' },
                  ],
                },
                {
                  key: 'status',
                  placeholder: 'Chọn trạng thái',
                  options: [
                    { value: null, label: 'Tất cả trạng thái' },
                    { value: '1', label: 'Đang hoạt động' },
                    { value: '0', label: 'Đã vô hiệu hóa' },
                  ],
                },
                {
                  key: 'campusId',
                  placeholder: 'Chọn cơ sở',
                  options: [
                    { value: null, label: 'Tất cả cơ sở' },
                    { value: '11111111-aaaa-bbbb-cccc-111111111111', label: 'Cơ sở Hà Nội' },
                    { value: '22222222-aaaa-bbbb-cccc-222222222222', label: 'Cơ sở TP.HCM' },
                  ],
                },
                {
                  key: 'sortType',
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
                setTrigger(true);
                setFilters((prev) => {
                  const updatedFilters = {
                    ...prev,
                    ...newFilters,
                  };
                  save(cachedKeys.cachesFilterSubject, updatedFilters);
                  return updatedFilters;
                });
              }}
              onAddNew={() => navigate(BaseUrl.AdminAddNewUser)}
              addNewButtonText="Add New User"
              importButtonText="Import User Account"
              onImport={togglePrecheckImportUser}
              onExport={handleExportUser}
              exportButtonText="Export User Account"
            />
            <TablePaging
              id={'tableProduct'}
              columns={columns}
              loading={loading}
              keyRow="userId"
              data={dataMain || []}
              noResultText={'Không có người dùng nào'}
              total={totalUserCount || 0}
              currentPage={filters?.currentPage || 1}
              currentSize={filters?.pageSize || 1}
              totalPage={totalPageUser || 1}
              handleChangeSize={handleChangePageSize}
              handleChangePage={handleChangePage}
            />
          </TabsContent>

          <TabsContent value="roles">
            <RoleTab />
          </TabsContent>

          <TabsContent value="permissions">
            <PermissionTab />
          </TabsContent>
        </Tabs>
      </div>

      {shouldRenderPrecheckImportUser && (
        <DialogPreCheckImportUser
          isOpen={openPrecheckImportUser}
          toggle={togglePrecheckImportUser}
          onSubmit={handleImportUser}
        />
      )}
    </PageWrapper>
  );
};

export default AdminManageUser;
