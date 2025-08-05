import DateTimePickerField from '@/components/customFieldsFormik/DateTimePickerField';
import FormikField from '@/components/customFieldsFormik/FormikField';
import InputField from '@/components/customFieldsFormik/InputField';
import RadioField from '@/components/customFieldsFormik/RadioField';

interface PersonalInfoProps {
  values: any;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any>) => void;
}

const PersonalInfoSection = ({ values, handleChange, handleBlur }: PersonalInfoProps) => (
  <div className="space-y-6">
    <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">Thông tin cá nhân</h3>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <FormikField
          component={DateTimePickerField}
          name="dob"
          label="Ngày sinh"
          placeholder="Chọn ngày sinh"
          required
          hideTimePicker
        />
      </div>
      <div className="space-y-3">
        <FormikField
          component={RadioField}
          name="sex"
          label="Giới tính"
          options={[
            { label: 'Nam', value: 0 },
            { label: 'Nữ', value: 1 },
            { label: 'Khác', value: 2 },
          ]}
          className="flex space-x-6"
          required
        />
      </div>
    </div>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <FormikField
          component={InputField}
          name="phone"
          label="Số điện thoại"
          placeholder="VD: 0123456789"
          value={values.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          isNumberic
        />
      </div>
      <div className="space-y-2">
        <FormikField
          component={InputField}
          name="address"
          label="Địa chỉ"
          placeholder="VD: Số 1, Đường ABC, Quận XYZ"
          value={values.address}
          onChange={handleChange}
          onBlur={handleBlur}
          required
        />
      </div>
    </div>
  </div>
);

export default PersonalInfoSection;
