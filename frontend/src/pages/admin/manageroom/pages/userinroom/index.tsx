import DialogConfirm from '@/components/dialogs/DialogConfirm';
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
import { DateTimeFormat } from '@/consts/dates';
import { convertUTCToVietnamTime } from '@/helpers/common';
import { showError, showSuccess } from '@/helpers/toast';
import useFiltersHandler from '@/hooks/useFiltersHandler';
import useToggleDialog from '@/hooks/useToggleDialog';
import {
  GenericFilters,
  IValueFormPageHeader,
} from '@/pages/admin/manageuser/components/generic-filters';
import { UserStats } from '@/pages/admin/manageuser/components/user-stats';
import ExamHeader from '@/pages/teacher/examsupervision/components/ExamHeader';
import httpService, { TOKEN_KEY } from '@/services/httpService';
import useGetListUserInRoom from '@/services/modules/userinroom/hooks/useGetAllUserInRoom';
import {
  IUserInRoomRequest,
  UserElement,
} from '@/services/modules/userinroom/interfaces/userinroom.interface';
import userinroomService from '@/services/modules/userinroom/userinroom.service';
import { HomeIcon, MoreHorizontal, Trash2, User2Icon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import DialogAddStudentInRoom, {
  StudentInRoomFormValues,
} from '../../dialogs/DialogAddStudentToRoom';

const StudentList = () => {
  //!State
  const { roomId } = useParams();
  const [
    openAskNewSdtudentToRoom,
    toggleAskAddNewStudentToRoom,
    shouldRenderAskAddNewStudentToRoom,
  ] = useToggleDialog();
  const [openAskConfirmDelete, toggleAskConfirmDelete, shouldRenderAskConfirmDelete] =
    useToggleDialog();
  const [userDeleteId, setUserDeleteId] = useState<string[] | null>(null);
  // Khởi tạo filters với cấu trúc phù hợp với IUserInRoomRequest
  const { filters: rawFilters, setFilters } = useFiltersHandler({
    RoomId: roomId || '',
    PageSize: 50,
    CurrentPage: 1,
    TextSearch: '',
    Role: null,
    Status: null,
  });

  // Chuyển đổi rawFilters sang định dạng IUserInRoomRequest
  const stableFilters = useMemo(
    (): IUserInRoomRequest => ({
      RoomId: rawFilters.RoomId || '',
      PageSize: rawFilters.PageSize || 50,
      CurrentPage: rawFilters.CurrentPage || 1,
      TextSearch: rawFilters.TextSearch || '',
      Role: rawFilters.Role !== undefined ? rawFilters.Role : null,
      Status: rawFilters.Status !== undefined ? rawFilters.Status : null,
    }),
    [rawFilters],
  );

  const {
    data: dataUserList,
    loading,
    refetch,
    totalPage,
    total,
  } = useGetListUserInRoom(stableFilters, {
    isTrigger: !!roomId,
  });

  const statItems = useMemo(
    () => [
      {
        title: 'Tổng số người trong phòng',
        value: total || 0,
        icon: <User2Icon className="h-6 w-6 text-blue-500" />,
        bgColor: 'bg-blue-50',
      },
      {
        title: 'Đang hoạt động',
        value: 1,
        icon: <User2Icon className="h-6 w-6 text-green-500" />,
        bgColor: 'bg-green-50',
      },
      {
        title: 'Không hoạt động',
        value: 1,
        icon: <User2Icon className="h-6 w-6 text-yellow-500" />,
        bgColor: 'bg-yellow-50',
      },
    ],
    [total],
  );

  const columns = [
    {
      label: 'Mã người dùng',
      accessor: 'userCode',
      sortable: false,
      Cell: (row: UserElement) => <span className="font-medium">{row?.user?.userCode}</span>,
    },
    {
      label: 'Tên người dùng',
      accessor: 'fullname',
      sortable: false,
      Cell: (row: UserElement) => (
        <span className="text-sm text-gray-600">{row?.user?.fullname || 'Không có mô tả'}</span>
      ),
    },
    {
      label: 'Vai trò',
      accessor: 'subjectName',
      sortable: false,
      Cell: (row: UserElement) => (
        <span className="font-medium">
          {row?.role === 1
            ? 'Sinh viên'
            : row?.role === 2
              ? 'Giảng viên'
              : row?.role === 3
                ? 'Giám sát viên'
                : 'Admin'}
        </span>
      ),
    },
    {
      label: 'Giờ tham gia',
      accessor: 'joinTime',
      sortable: false,
      Cell: (row: UserElement) => (
        <span className="text-sm text-gray-600">
          {convertUTCToVietnamTime(
            row?.joinTime,
            DateTimeFormat.DateTimeWithTimezone,
          )?.toString() || 'Không có mô tả'}
        </span>
      ),
    },
    {
      label: 'Giới tính',
      accessor: 'sex',
      sortable: false,
      Cell: (row: UserElement) => (
        <span className="text-sm text-gray-600">{row?.user?.sex === 0 ? 'Nam' : 'Nữ'}</span>
      ),
    },
    {
      label: 'Active/Deactive',
      accessor: 'isActive',
      width: 120,
      sortable: false,
      Cell: (row: UserElement) => (
        <Switch
          checked={row?.userStatus === 1 ? true : false}
          onCheckedChange={async () => {
            try {
              httpService.attachTokenToHeader(TOKEN_KEY);
              await userinroomService.changeActiveStudent({
                roomId: row.roomId,
                studentId: [row.userId],
                status: row.userStatus === 1 ? 0 : 1,
              });
              showSuccess(
                `User ${row.userStatus === 1 ? 'deactivated' : 'activated'} successfully!`,
              );
              refetch();
            } catch (error) {
              showError(error);
            }
          }}
          className="h-6 w-11"
          disabled={loading}
        />
      ),
    },
    {
      label: 'Chức năng',
      accessor: 'actions',
      width: 120,
      sortable: false,
      Cell: (row: UserElement) => (
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setUserDeleteId([row.userId]);
                  toggleAskConfirmDelete();
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

  //!Functions
  const handleChangePageSize = useCallback(
    (size: number) => {
      setFilters((prev: any) => ({
        ...prev,
        PageSize: { value: size },
        CurrentPage: { value: 1 },
      }));
    },
    [setFilters],
  );

  const handleChangePage = useCallback(
    (page: number) => {
      setFilters((prev: any) => ({
        ...prev,
        CurrentPage: { value: page },
      }));
    },
    [setFilters],
  );

  const handleAddStudentToRoom = async (values: StudentInRoomFormValues) => {
    try {
      await userinroomService.addUserToRoom(stableFilters.RoomId, values.studentList);
      showSuccess('Thêm học sinh vào phòng thành công');
      toggleAskAddNewStudentToRoom();
      refetch();
    } catch (error) {
      showError(error);
    }
  };

  const handleToggleAskConfirmDelete = useCallback(() => {
    toggleAskConfirmDelete();
    if (openAskConfirmDelete) {
      setUserDeleteId(null);
    }
  }, [toggleAskConfirmDelete, openAskConfirmDelete]);

  const handleImportUserToRoom = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.xlsx, .xls, .csv';
      input.onchange = async (event: any) => {
        const file = event.target.files[0];
        if (!file) {
          showError('Vui lòng chọn tệp để nhập');
          return;
        }

        if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
          showError('Vui lòng chọn tệp Excel hoặc CSV hợp lệ');
          return;
        }

        try {
          const formData = new FormData();
          formData.append('fileData', file);
          await userinroomService.importUserToRoom(stableFilters.RoomId, formData);
          refetch();
          showSuccess('Nhập học sinh vào phòng thành công');
        } catch (error) {
          showError(error);
        }
      };
      input.click();
    } catch (error) {
      showError(error);
    }
  };

  const handleExportUserInRoom = async () => {
    try {
      await userinroomService.exportUserInRoom(stableFilters.RoomId);
      showSuccess('Xuất danh sách học sinh thành công');
    } catch (error) {
      showError(error);
    }
  };

  const handleSearch = useCallback(
    (value: IValueFormPageHeader) => {
      setFilters((prev: any) => {
        const newParams = {
          ...prev,
          TextSearch: value.textSearch || '',
          CurrentPage: 1,
        };
        return newParams;
      });
    },
    [setFilters],
  );

  //!Render
  return (
    <PageWrapper name="Danh sách học sinh trong phòng" className="bg-white dark:bg-gray-900">
      <ExamHeader
        title="Quản lý chi tiết phòng thi"
        subtitle="Danh sách học sinh trong phòng"
        icon={<HomeIcon className="h-8 w-8 text-white" />}
        className="border-b border-white/20 bg-gradient-to-r from-blue-600 to-green-700 px-6 py-6 shadow-lg"
      />
      <div className="space-y-6 p-4">
        <UserStats statItems={statItems} className="lg:grid-cols-3" />
        {shouldRenderAskAddNewStudentToRoom && (
          <DialogAddStudentInRoom
            isOpen={openAskNewSdtudentToRoom}
            toggle={toggleAskAddNewStudentToRoom}
            onSubmit={handleAddStudentToRoom}
          />
        )}
        {shouldRenderAskConfirmDelete && (
          <DialogConfirm
            isOpen={openAskConfirmDelete}
            toggle={handleToggleAskConfirmDelete}
            title="Xoá học sinh khỏi phòng"
            content={`Bạn có chắc chắn muốn xoá học sinh này khỏi phòng này không?`}
            onSubmit={async () => {
              try {
                await userinroomService.removeUserFromRoom(roomId || '', userDeleteId ?? []);
                showSuccess('Xoá học sinh khỏi phòng thành công');
                handleToggleAskConfirmDelete();
                refetch();
              } catch (error) {
                showError(error);
              }
            }}
          />
        )}
        <GenericFilters
          className="md:grid-cols-7"
          searchPlaceholder="Tìm kiếm lớp học..."
          onSearch={handleSearch}
          initialSearchQuery={stableFilters.TextSearch || ''}
          filters={[
            {
              key: 'Status',
              placeholder: 'Trạng thái',
              options: [
                { value: null, label: 'Tất cả' },
                { value: 0, label: 'Inactive' },
                { value: 1, label: 'Active' },
              ],
            },
            {
              key: 'Role',
              placeholder: 'Vai trò',
              options: [
                { value: null, label: 'Tất cả' },
                { value: 1, label: 'Student' },
                { value: 2, label: 'Lecturer' },
                { value: 3, label: 'Supervisor' },
                { value: 4, label: 'Admin' },
              ],
            },
          ]}
          onFilterChange={(
            newFilters: Record<string, string | number | boolean | null | undefined>,
          ) => {
            setFilters((prev: any) => {
              const newParams = {
                ...prev,
                ...newFilters,
              };
              return newParams;
            });
          }}
          onAddNew={toggleAskAddNewStudentToRoom}
          addNewButtonText="Thêm học sinh vào phòng"
          importButtonText="Nhập học sinh vào phòng"
          onImport={handleImportUserToRoom}
          exportButtonText="Xuất danh sách học sinh"
          onExport={handleExportUserInRoom}
        />
        <MemoizedTablePaging
          id="student-list-table"
          columns={columns}
          data={dataUserList || []}
          keyRow="roomUserId"
          loading={loading}
          currentPage={stableFilters.CurrentPage || 1}
          currentSize={stableFilters.PageSize || 50}
          totalPage={totalPage || 1}
          total={total || 0}
          handleChangePage={handleChangePage}
          handleChangeSize={handleChangePageSize}
        />
      </div>
    </PageWrapper>
  );
};

export default StudentList;
