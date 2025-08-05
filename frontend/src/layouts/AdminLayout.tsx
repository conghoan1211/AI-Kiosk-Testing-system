import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import BaseUrl from '@/consts/baseUrl';
import useToggleDialog from '@/hooks/useToggleDialog';
import type { UserInfo } from '@/interfaces/user';
import { cn } from '@/lib/utils';
import httpService from '@/services/httpService';
import {
  Album,
  BookOpen,
  ClipboardList,
  FileQuestion,
  FileText,
  HelpCircle,
  Home,
  Keyboard,
  LockIcon,
  Landmark,
  LogOut,
  Menu,
  MessagesSquare,
  Settings,
  Tv,
  User,
  User2Icon,
  Users,
} from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import SideBar from './components/SideBar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = (props: AdminLayoutProps) => {
  // State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useTranslation('shared');
  const [openAskLogout, toggleAskLogout, shouldRenderAskLogout] = useToggleDialog();
  const navigate = useNavigate();
  const location = useLocation();
  // Get current pathname
  const pathname = location.pathname;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const userData = httpService.getUserStorage() || {};
  const user: UserInfo = userData ? (userData as UserInfo) : ({} as UserInfo);

  // Menu items with enhanced structure
  const teacherMenuItems = useMemo(
    () => [
      {
        title: 'Quản lý quyền',
        href: BaseUrl.AdminPermission,
        icon: LockIcon,
      },
      {
        title: 'Quản lý người dùng',
        href: BaseUrl.AdminManageUsers,
        icon: User2Icon,
      },
      {
        title: 'Quản lý môn học',
        href: BaseUrl.AdminManageSubject,
        icon: BookOpen,
      },
      {
        title: 'Ngân hàng câu hỏi',
        href: BaseUrl.AdminBankQuestion,
        icon: FileQuestion,
        subItems: [
          {
            title: 'Tổng quan',
            href: BaseUrl.AdminBankQuestion,
            icon: Landmark,
          },
          {
            title: 'Quản lý câu hỏi',
            href: BaseUrl.AdminManageQuestion,
            icon: FileText,
          },
        ],
      },
      {
        title: 'Quản lý lớp học',
        href: BaseUrl.AdminManageClass,
        icon: Users,
      },
      {
        title: 'Quản lý phòng thi',
        href: BaseUrl.AdminManageRoom,
        icon: Home,
      },
      {
        title: 'Quản lý ứng dụng bị cấm',
        href: BaseUrl.AdminProhibited,
        icon: HelpCircle,
      },
      {
        title: 'Quản lý phím tắt',
        href: BaseUrl.AdminKeyboardShortcut,
        icon: Keyboard,
      },
      {
        title: 'Hoạt động người dùng',
        href: BaseUrl.AdminUserActivityLog,
        icon: ClipboardList,
      },
      {
        title: 'Giám sát thi',
        href: BaseUrl.AdminSupervision,
        icon: Tv,
      },
      {
        title: 'Quản lý đề thi',
        href: BaseUrl.AdminManageExam,
        icon: Album,
      },
      {
        title: 'Ý kiến đóng góp',
        href: BaseUrl.ViewFeedback,
        icon: MessagesSquare,
      },
    ],
    [],
  );

  const navBarItems = [
    {
      label: t('Navigation.Profile'),
      icon: <User className="mr-2 h-4 w-4" />,
      action: () => {
        navigate(`${BaseUrl.AdminProfile}`);
      },
    },
    {
      label: t('Navigation.Settings'),
      icon: <Settings className="mr-2 h-4 w-4" />,
      action: () => {},
    },
    {
      label: t('Logout'),
      icon: <LogOut className="mr-2 h-4 w-4" />,
      action: toggleAskLogout,
      className: 'text-red-600',
    },
  ];

  // Function to check if a menu item is active
  const isMenuItemActive = (href: string) => {
    // Exact match
    if (pathname === href) return true;

    // Check if current path starts with the menu item path (for nested routes)
    if (pathname.startsWith(href) && href !== '/') return true;

    return false;
  };

  // Add active state to menu items
  const enhancedTeacherMenuItems = teacherMenuItems.map((item) => ({
    ...item,
    isActive: isMenuItemActive(item.href),
  }));

  return (
    <main className="component:AdminLayout flex h-screen w-screen">
      {/* Sidebar */}
      <SideBar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        teacherMenuItems={enhancedTeacherMenuItems}
        user={user}
        currentPath={pathname} // Pass current path to sidebar
      />

      {/* Main Content */}
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300',
          sidebarOpen ? 'md:ml-0' : 'md:ml-0',
        )}
      >
        {/* Mobile Menu Button */}
        <div className="border-b border-border bg-background p-4 md:hidden">
          <Button variant="ghost" size="sm" onClick={toggleSidebar} className="h-8 w-8 p-0">
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="main-container bg-bgContainerContent h-full w-full">
          <NavigationBar
            navBarItems={navBarItems}
            openAskLogout={openAskLogout}
            toggleAskLogout={toggleAskLogout}
            user={user}
            shouldRenderAskLogout={shouldRenderAskLogout}
            teacherMenuItems={enhancedTeacherMenuItems}
          />
          <div className={cn('main-container__content min-h-[calc(100vh-121px)] bg-gray-100 p-4')}>
            {props.children}
          </div>
        </ScrollArea>
      </div>
    </main>
  );
};

export default AdminLayout;
