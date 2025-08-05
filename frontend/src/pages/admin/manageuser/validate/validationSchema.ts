import * as Yup from 'yup';
import { mockDataRoles } from '../pages/AddNewUser';

export interface FormDataUser {
  userId?: string;
  userCode: string;
  fullName: string;
  email: string;
  roleId: number[] | number | string | string[];
  dob: Date | undefined | null;
  sex: number;
  phone: string;
  address: string;
  campusId: string;
  departmentId: string;
  positionId: string;
  specializationId: string;
  majorId: string;
  status: number;
}

export const validationSchema = Yup.object({
  userCode: Yup.string()
    .required('Mã người dùng là bắt buộc')
    .min(3, 'Mã người dùng phải có ít nhất 3 ký tự'),

  fullName: Yup.string()
    .required('Họ và tên là bắt buộc')
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự'),

  email: Yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),

  dob: Yup.date()
    .nullable()
    .test('age', 'Người dùng phải từ 16 tuổi trở lên', (value) => {
      if (!value) return true;
      const today = new Date();
      const dob = new Date(value);
      const age = today.getFullYear() - dob.getFullYear();
      return age >= 16;
    })
    .required('Ngày sinh là bắt buộc'),

  sex: Yup.string().required('Giới tính là bắt buộc'),

  phone: Yup.string()
    .matches(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 chữ số')
    .required('Số điện thoại là bắt buộc'),

  address: Yup.string().required('Địa chỉ là bắt buộc'),

  roleId: Yup.mixed()
    .test('is-valid-role', 'Vai trò không hợp lệ', (value) => {
      const validRoleValues = mockDataRoles.map((role) => role.value.toString());
      if (typeof value === 'string' || typeof value === 'number') {
        return validRoleValues.includes(value.toString());
      }
      if (Array.isArray(value)) {
        return value.every((v) => validRoleValues.includes(v.toString()));
      }
      return false;
    })
    .required('Vai trò là bắt buộc'),

  campusId: Yup.string().required('CampusId là bắt buộc'),

  departmentId: Yup.string().when('roleId', {
    is: (roleId: string | string[] | number | number[]) => {
      const roles = Array.isArray(roleId) ? roleId : [roleId];
      return roles.some((r) => ['2', '3', '4'].includes(r.toString()));
    },
    then: (schema) => schema.required('Khoa/Phòng ban là bắt buộc'),
    otherwise: (schema) => schema.notRequired(),
  }),

  positionId: Yup.string().when('roleId', {
    is: (roleId: string | string[] | number | number[]) => {
      const roles = Array.isArray(roleId) ? roleId : [roleId];
      return roles.some((r) => ['2', '3', '4'].includes(r.toString()));
    },
    then: (schema) => schema.required('Chức vụ là bắt buộc'),
    otherwise: (schema) => schema.notRequired(),
  }),

  specializationId: Yup.string().when('roleId', {
    is: (roleId: string | string[] | number | number[]) => {
      const roles = Array.isArray(roleId) ? roleId : [roleId];
      return roles.includes('2') || roles.includes(2);
    },
    then: (schema) => schema.required('Chuyên ngành là bắt buộc'),
    otherwise: (schema) => schema.notRequired(),
  }),

  majorId: Yup.string().when('roleId', {
    is: (roleId: string | string[] | number | number[]) => {
      const roles = Array.isArray(roleId) ? roleId : [roleId];
      return roles.includes('1') || roles.includes(1);
    },
    then: (schema) => schema.required('Chuyên ngành cho sinh viên là bắt buộc'),
    otherwise: (schema) => schema.notRequired(),
  }),

  status: Yup.number().oneOf([0, 1], 'Trạng thái không hợp lệ').required('Trạng thái là bắt buộc'),
});

export default validationSchema;
