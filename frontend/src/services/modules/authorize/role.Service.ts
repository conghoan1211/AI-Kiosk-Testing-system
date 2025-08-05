import { AUTHORIZE_URL } from '@/consts/apiUrl';
import httpService from '@/services/httpService';
import { IPermissionRequest } from './interfaces/role.interface';
import { IPermissionsRequest, ResponseGetListPermissions } from './interfaces/permission.interface';
import { AxiosRequestConfig } from 'axios';
import { PermissionFormValues } from '@/pages/admin/manageuser/dialogs/DialogAddNewPermision';
import {
  FormDataPermissions,
  FormDataRoles,
} from '@/pages/admin/manageuser/components/add-new-role-tab';

interface IRemovePermissionFromRole {
  roleId: number;
  permissions: string[];
}

class authorizeService {
  getListRoles() {
    return httpService.get(`${AUTHORIZE_URL}/get-all-roles`);
  }

  getAllRolePermissions(filter: IPermissionRequest) {
    return httpService.get(
      `${AUTHORIZE_URL}/get-all-roles-permissions?pageSize=${filter.pageSize}&currentPage=${filter.currentPage}&textSearch=${filter.textSearch}`,
    );
  }

  getAllPermissions(
    filter: IPermissionsRequest,
    config?: AxiosRequestConfig,
  ): Promise<ResponseGetListPermissions> {
    return httpService.get(
      `${AUTHORIZE_URL}/get-all-permission?PageSize=${filter.PageSize}&CurrentPage=${filter.CurrentPage}&TextSearch=${filter.TextSearch}&SortType=${filter.SortType || ''}`,
      config,
    );
  }

  createUpdateNewPermission(body: PermissionFormValues) {
    return httpService.post(`${AUTHORIZE_URL}/create-update-permission`, body);
  }

  getDetailPermission(id: string) {
    return httpService.get(`${AUTHORIZE_URL}/get-one-permission/${id}`);
  }

  deletePermission(id: string) {
    return httpService.delete(`${AUTHORIZE_URL}/delete-permission/${id}`);
  }

  crateUpdateRole(body: FormDataRoles) {
    return httpService.post(`${AUTHORIZE_URL}/create-update-role`, body);
  }

  addPermissionToRole(body: FormDataPermissions) {
    return httpService.post(`${AUTHORIZE_URL}/add-permissions-to-role`, body);
  }

  deleteRole(roleId: number) {
    return httpService.delete(`${AUTHORIZE_URL}/delete-role/${roleId}`);
  }

  toggleActiveDeactivePermission(permissionId: string) {
    return httpService.post(`${AUTHORIZE_URL}/toggle-active-permission/${permissionId}`, {});
  }

  toggleActiveDeactiveRole(roleId: string) {
    return httpService.post(`${AUTHORIZE_URL}/toggle-active-role/${roleId}`, {});
  }

  removePermissionFromRole(data: IRemovePermissionFromRole) {
    return httpService.delete(`${AUTHORIZE_URL}/remove-permissions-from-role`, {
      data,
    });
  }
}

export default new authorizeService();
