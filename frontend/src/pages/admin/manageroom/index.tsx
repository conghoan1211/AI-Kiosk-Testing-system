import PageWrapper from '@/components/PageWrapper/PageWrapper';
import TablePaging from '@/components/tableCommon/v2/tablePaging';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import BaseUrl from '@/consts/baseUrl';
import cachedKeys from '@/consts/cachedKeys';
import { showError, showSuccess } from '@/helpers/toast';
import useFiltersHandler from '@/hooks/useFiltersHandler';
import useToggleDialog from '@/hooks/useToggleDialog';
import ExamHeader from '@/pages/teacher/examsupervision/components/ExamHeader';
import httpService from '@/services/httpService';
import useGetListAllRooms from '@/services/modules/room/hooks/useGetAllRooms';
import { IRoomRequest, RoomList } from '@/services/modules/room/interfaces/room.interface';
import roomService from '@/services/modules/room/room.service';
import { useGet, useSave } from '@/stores/useStores';
import { Edit, Eye, Home, HomeIcon, MoreHorizontal, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericFilters, IValueFormPageHeader } from '../manageuser/components/generic-filters';
import { UserStats } from '../manageuser/components/user-stats';
import DialogAddNewRoom, { RoomFormValues } from './dialogs/DialogAddNewRoom';
import { Switch } from '@/components/ui/switch';

const ManageRoom = () => {
  //!State
  const [openAskAddNewRoom, toggleAskAddNewRoom, shouldRenderAskNewRoom] = useToggleDialog();
  const defaultRoom = useGet('dataRoom');
  const totalRoomCount = useGet('totalRoomCount');
  const totalPageRoomCount = useGet('totalPageRoomCount');
  const cachesFilterRoom = useGet('cachesFilterRoom');
  const [isTrigger, setTrigger] = useState(Boolean(!defaultRoom));
  const save = useSave();
  const [editRoom, setEditRoom] = useState<RoomList | null>(null);
  const token = httpService.getTokenStorage();
  const navigate = useNavigate();

  const { filters, setFilters } = useFiltersHandler({
    PageSize: cachesFilterRoom?.PageSize || 50,
    CurrentPage: cachesFilterRoom?.CurrentPage || 1,
    TextSearch: cachesFilterRoom?.TextSearch || '',
    IsActive: cachesFilterRoom?.IsActive !== undefined ? cachesFilterRoom?.IsActive : null,
  });

  const stableFilters = useMemo(() => filters as IRoomRequest, [filters]);

  const {
    data: dataRooms,
    loading,
    refetch,
  } = useGetListAllRooms(stableFilters, {
    isTrigger: isTrigger,
    refetchKey: cachesFilterRoom?.refetchKey,
    saveData: true,
  });

  useEffect(() => {
    if (dataRooms && isTrigger) {
      save(cachedKeys.dataRoom, dataRooms);
    }
  }, [dataRooms, isTrigger, save]);

  const dataMain = useMemo(
    () => (isTrigger ? dataRooms : defaultRoom),
    [dataRooms, defaultRoom, isTrigger],
  );

  const columns = [
    {
      label: 'Mã Phòng',
      accessor: 'roomCode',
      sortable: false,
      Cell: (row: RoomList) => <span className="font-medium">{row.roomCode}</span>,
    },
    {
      label: 'Mã Lớp',
      accessor: 'classCode',
      sortable: false,
      Cell: (row: RoomList) => <span className="font-medium">{row.classCode}</span>,
    },
    {
      label: 'Mô tả phòng',
      accessor: 'roomDescription',
      sortable: false,
      Cell: (row: RoomList) => (
        <span className="text-sm text-gray-600">{row.roomDescription || 'Không có mô tả'}</span>
      ),
    },
    {
      label: 'Số lượng học sinh',
      accessor: 'roomMaxStudent',
      sortable: false,
      Cell: (row: RoomList) => (
        <span className="text-sm text-gray-600">{row.capacity || 'Không giới hạn'}</span>
      ),
    },
    {
      label: 'Môn học',
      accessor: 'subjectName',
      sortable: false,
      Cell: (row: RoomList) => <span className="font-medium">{row.subjectName}</span>,
    },
    {
      label: 'Mô tả môn học',
      accessor: 'subjectDescription',
      sortable: false,
      Cell: (row: RoomList) => (
        <span className="text-sm text-gray-600">{row.subjectDescription || 'Không có mô tả'}</span>
      ),
    },
    {
      label: 'Trạng thái',
      accessor: 'status',
      sortable: false,
      Cell: (row: RoomList) => (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            row.isRoomActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {row.isRoomActive ? 'Đang hoạt động' : 'Không hoạt động'}
        </span>
      ),
    },
    {
      label: 'Active/Deactive',
      accessor: 'isRoomActive',
      // width: 120,
      sortable: false,
      Cell: (row: RoomList) => (
        <Switch
          checked={row.isRoomActive}
          onCheckedChange={async () => {
            try {
              httpService.attachTokenToHeader(token);
              await roomService.changeActiveRoom(row.roomId);
              showSuccess(`Room ${row.isRoomActive ? 'deactivated' : 'activated'} successfully!`);
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
      Cell: (row: RoomList) => (
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleOnclickDetail(row.roomId)}
                className="cursor-pointer text-blue-600"
              >
                <Eye className="mr-2 h-4 w-4" />
                <span>Xem chi tiết</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setEditRoom(row);
                  toggleAskAddNewRoom();
                }}
                className="cursor-pointer text-green-600"
              >
                <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {}} className="cursor-pointer text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Xoá
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const handleToggleEditRoom = useCallback(() => {
    toggleAskAddNewRoom();
    if (openAskAddNewRoom) {
      setEditRoom(null);
    }
  }, [toggleAskAddNewRoom, openAskAddNewRoom]);

  const statItems = useMemo(() => {
    const totalRoom = dataMain.length || 0;
    const activeRooms = dataMain.filter((room: RoomList) => room.isRoomActive).length || 0;
    const inactiveRooms = totalRoom - activeRooms;

    return [
      {
        title: 'Tổng phòng học',
        value: totalRoom,
        icon: <Home className="h-6 w-6 text-blue-500" />,
        bgColor: 'bg-blue-50',
      },
      {
        title: 'Đang hoạt động',
        value: activeRooms,
        icon: <Home className="h-6 w-6 text-green-500" />,
        bgColor: 'bg-green-50',
      },
      {
        title: 'Không hoạt động',
        value: inactiveRooms,
        icon: <Home className="h-6 w-6 text-yellow-500" />,
        bgColor: 'bg-yellow-50',
      },
    ];
  }, [dataMain]);

  //!Functions
  const handleChangePageSize = useCallback(
    (size: number) => {
      setTrigger(true);
      setFilters((prev: any) => {
        const newParams = {
          ...prev,
          CurrentPage: 1,
          PageSize: size,
        };
        save(cachedKeys.cachesFilterClass, newParams);
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
          save(cachedKeys.cachesFilterClass, newParams);
          return newParams;
        });
      }, 0);
    },
    [setFilters, save],
  );

  const handleSearch = useCallback(
    (value: IValueFormPageHeader) => {
      setTrigger(true);
      setFilters((prev: any) => {
        const newParams = {
          ...prev,
          TextSearch: value.textSearch || '',
          CurrentPage: 1,
        };
        save(cachedKeys.cachesFilterClass, newParams);
        return newParams;
      });
    },
    [setFilters, save],
  );

  const handleAddEditRoom = async (value: RoomFormValues) => {
    try {
      httpService.attachTokenToHeader(token);
      if (editRoom) {
        await roomService.createRoom({
          ...value,
          roomId: editRoom.roomId,
        });
        setEditRoom(null);
      } else {
        await roomService.createRoom({
          ...value,
          roomId: '',
        });
      }
      toggleAskAddNewRoom();
      showSuccess(editRoom ? 'Room updated successfully!' : 'Room created successfully!');
      refetch();
    } catch (error) {
      showError(error);
    }
  };

  const handleOnclickDetail = (roomId: string) => {
    navigate(`${BaseUrl.TeacherManageRoom}/${roomId}`);
  };

  //!Render
  return (
    <PageWrapper name="Quản lý phòng thi" className="bg-white dark:bg-gray-900">
      <ExamHeader
        title="Quản lý phòng thi"
        subtitle="Quản lý các phòng thi trong hệ thống"
        icon={<HomeIcon className="h-8 w-8 text-white" />}
        className="border-b border-white/20 bg-gradient-to-r from-blue-600 to-green-700 px-6 py-6 shadow-lg"
      />
      <div className="space-y-6 p-4">
        <UserStats statItems={statItems} className="lg:grid-cols-3" />
        {shouldRenderAskNewRoom && (
          <DialogAddNewRoom
            isOpen={openAskAddNewRoom}
            toggle={handleToggleEditRoom}
            onSubmit={handleAddEditRoom}
            editRoom={editRoom}
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
            setFilters((prev: any) => {
              const newParams = {
                ...prev,
                ...newFilters,
              };
              save(cachedKeys.cachesFilterClass, newParams);
              return newParams;
            });
          }}
          onAddNew={toggleAskAddNewRoom}
          addNewButtonText="Tạo lớp mới"
        />
        <TablePaging
          id="manage-subject-table"
          columns={columns}
          data={dataMain || []}
          keyRow="roomId"
          loading={loading}
          currentPage={filters.CurrentPage || 1}
          currentSize={filters.PageSize || 50}
          totalPage={totalPageRoomCount || 1}
          total={totalRoomCount || 0}
          handleChangePage={handleChangePage}
          handleChangeSize={handleChangePageSize}
        />
      </div>
    </PageWrapper>
  );
};

export default ManageRoom;
