import FormikField from '@/components/customFieldsFormik/FormikField';
import InputField from '@/components/customFieldsFormik/InputField';
import SelectField from '@/components/customFieldsFormik/SelectField';

interface BasicInfoProps {
  values: any;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any>) => void;
  mockDataRoles: { label: string; value: number }[];
  userId?: string;
}

const BasicInfoSection = ({
  values,
  handleChange,
  handleBlur,
  mockDataRoles,
  userId,
}: BasicInfoProps) => (
  <div className="space-y-6">
    <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <FormikField
          component={InputField}
          name="userCode"
          label="Mã người dùng"
          placeholder="VD: user123"
          value={values.userCode}
          onChange={handleChange}
          onBlur={handleBlur}
          required
        />
      </div>
      <div className="space-y-2">
        <FormikField
          component={InputField}
          name="fullName"
          label="Họ và tên"
          placeholder="VD: Nguyễn Văn A"
          value={values.fullName}
          onChange={handleChange}
          onBlur={handleBlur}
          required
        />
      </div>
    </div>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <FormikField
          component={InputField}
          name="email"
          label="Email"
          placeholder="VD: example@gmail.com"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          readOnly={!!userId}
        />
      </div>
      <div className="space-y-2">
        <FormikField
          component={SelectField}
          name="roleId"
          label="Vai trò"
          placeholder="Chọn vai trò"
          options={mockDataRoles}
          required
          shouldHideSearch
        />
      </div>
    </div>
  </div>
);

export default BasicInfoSection;
