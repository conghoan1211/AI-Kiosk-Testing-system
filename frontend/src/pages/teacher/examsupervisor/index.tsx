import PageWrapper from '@/components/PageWrapper/PageWrapper';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DateTimeFormat } from '@/consts/dates';
import { convertUTCToVietnamTime } from '@/helpers/common';
import { showError, showSuccess } from '@/helpers/toast';
import useToggleDialog from '@/hooks/useToggleDialog';
import { GenericFilters } from '@/pages/admin/manageuser/components/generic-filters';
import { UserStats } from '@/pages/admin/manageuser/components/user-stats';
import useGetExamSupervisorDetail from '@/services/modules/supervisor/hooks/useGetDetailSupervisor';
import { ISupervisorAssign } from '@/services/modules/supervisor/interfaces/supervisor.interface';
import supervisorService from '@/services/modules/supervisor/supervisor.service';
import { BookIcon, MoreHorizontal, Trash, UsersIcon } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import ExamHeader from '../examsupervision/components/ExamHeader';
import DialogAssignSuppervisor from './dialogs/DialogAssignSuppervisor';

const ExamSupervisior = () => {
  //! State
  const { examId } = useParams();
  const {
    data: dataExamSupervisor,
    isLoading,
    refetch,
  } = useGetExamSupervisorDetail(examId || '', {
    isTrigger: !!examId,
  });
  const [openAssignSupervisor, toggleAssignSupervisor, shouldRenderAssignSupervisor] =
    useToggleDialog();

  //! Functions
  const getInitials = useCallback((name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }, []);

  const statItems = useMemo(() => {
    const totalSupervisors = dataExamSupervisor?.supervisorVMs.length || 0;

    return [
      {
        title: 'Tổng giám thị',
        value: totalSupervisors,
        icon: <UsersIcon className="h-6 w-6 text-blue-500" />,
        bgColor: 'bg-blue-50',
      },
    ];
  }, [dataExamSupervisor]);

  const handleAssignSuppervisor = useCallback(
    async (values: ISupervisorAssign) => {
      try {
        const payload: ISupervisorAssign = {
          examId: examId || '',
          supervisorId: Array.isArray(values.supervisorId)
            ? values.supervisorId
            : [values.supervisorId],
          note: values.note || '',
        };

        await supervisorService.assignSupervisor(payload);
        showSuccess('Phân công giám thị thành công!');
        toggleAssignSupervisor();
        refetch();
      } catch (error) {
        showError(error);
      }
    },
    [toggleAssignSupervisor, refetch, examId],
  );

  const handleRemoveSupervisor = useCallback(
    async (values: ISupervisorAssign) => {
      try {
        await supervisorService.deleteSupervisor(values);
        showSuccess('Xoá giám thị thành công!');
        refetch();
      } catch (error) {
        showError(error);
      }
    },
    [refetch],
  );

  //! Render
  return (
    <PageWrapper
      name="Chi tiết giám thị"
      isLoading={isLoading}
      className="bg-white dark:bg-gray-900"
    >
      <div className="space-y-6">
        <ExamHeader
          title="Chi tiết giám thị"
          subtitle="Thông tin chi tiết về giám thị của kỳ thi"
          icon={<BookIcon className="h-8 w-8 text-white" />}
          className="border-b border-white/20 bg-gradient-to-r from-blue-600 to-green-700 px-6 py-6 shadow-lg"
        />
        <UserStats statItems={statItems} className="lg:grid-cols-1" />
        <GenericFilters
          className="md:grid-cols-3"
          searchPlaceholder="Tìm kiếm người dùng..."
          onSearch={() => {}}
          initialSearchQuery={''}
          filters={[]}
          onFilterChange={() => {}}
          onAddNew={() => toggleAssignSupervisor()}
          addNewButtonText="Phân công giám thị"
        />
        <Card className="p-6 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <UsersIcon className="h-6 w-6 text-blue-600" />
              {'Danh sách giám thị'} ({dataExamSupervisor?.supervisorVMs.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">{'Giám thị'}</TableHead>
                  <TableHead>{'Bộ môn'}</TableHead>
                  <TableHead>{'Liên hệ'}</TableHead>
                  <TableHead className="min-w-[150px]">{'Phân công lúc'}</TableHead>
                  <TableHead>{'Thao tác'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataExamSupervisor?.supervisorVMs.map((supervisor) => (
                  <TableRow key={supervisor.userId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{getInitials(supervisor.fullName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{supervisor.fullName}</div>
                          <div className="text-sm text-muted-foreground">{supervisor.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{supervisor.department || 'N/A'}</TableCell>
                    <TableCell>{supervisor.phone || 'N/A'}</TableCell>
                    <TableCell>
                      {supervisor.assignAt
                        ? convertUTCToVietnamTime(
                            supervisor.assignAt,
                            DateTimeFormat.DateTime,
                          )?.toString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-7 w-7 rounded p-0 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <MoreHorizontal className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                              <span className="sr-only">Mở menu thao tác</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              className="cursor-pointer text-xs hover:bg-gray-50 dark:hover:bg-gray-800"
                              onClick={() =>
                                handleRemoveSupervisor({
                                  examId: examId || '',
                                  supervisorId: [supervisor.userId],
                                })
                              }
                            >
                              <Trash className="mr-2 h-3.5 w-3.5 text-red-500" />
                              <span>Xoá giám thị</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      {shouldRenderAssignSupervisor && (
        <DialogAssignSuppervisor
          isOpen={openAssignSupervisor}
          toggle={toggleAssignSupervisor}
          onSubmit={handleAssignSuppervisor}
        />
      )}
    </PageWrapper>
  );
};

export default ExamSupervisior;
