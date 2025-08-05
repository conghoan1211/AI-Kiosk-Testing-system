import PageWrapper from '@/components/PageWrapper/PageWrapper';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Loading from '@/components/ui/loading';
import cachedKeys from '@/consts/cachedKeys';
import { normalizeRoleId } from '@/helpers/common';
import { showError, showSuccess } from '@/helpers/toast';
import ExamHeader from '@/pages/teacher/examsupervision/components/ExamHeader';
import httpService from '@/services/httpService';
import positionService from '@/services/modules/position/position.service';
import useGetDetailUser from '@/services/modules/user/hooks/useGetDetailUser';
import userService from '@/services/modules/user/user.Service';
import { useSave } from '@/stores/useStores';
import { Form, Formik } from 'formik';
import { Edit3Icon, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BasicInfoSection from '../components/BasicInfoSection';
import PersonalInfoSection from '../components/PersonalInfoSection';
import WorkStudyInfoSection from '../components/WorkStudyInfoSection';
import FormSubmitButton from '../form/FormSubmitButton';
import validationSchema, { FormDataUser } from '../validate/validationSchema';

export const mockDataRoles = [
  { label: 'Sinh viên', value: 1 },
  { label: 'Giảng viên', value: 2 },
  { label: 'Người giám sát', value: 3 },
  { label: 'Quản trị viên', value: 4 },
];

export const statusOptions = [
  { label: 'Active', value: 1 },
  { label: 'Inactive', value: 0 },
];

const AddNewUser = () => {
  const { userId } = useParams();
  const { data: userDetail, isLoading: loadingUserDetail } = useGetDetailUser(userId as string, {
    isTrigger: !!userId,
  });
  const save = useSave();
  const navigate = useNavigate();
  const [mockDataPositionIds, setMockDataPositionIds] = useState<any[]>([]);
  const [loadingPosition, setLoadingPosition] = useState(false);
  const token = httpService.getTokenStorage();

  const initialValues: FormDataUser = {
    userCode: userDetail?.userCode || '',
    fullName: userDetail?.fullName || '',
    email: userDetail?.email || '',
    roleId: userDetail?.roleId
      ? Array.isArray(userDetail.roleId)
        ? userDetail.roleId.map((id) => id.toString())
        : []
      : [],
    sex: userDetail?.sex ?? 0,
    phone: userDetail?.phone || '',
    address: userDetail?.address || '',
    campusId: userDetail?.campus || '',
    departmentId: userDetail?.department || '',
    positionId: userDetail?.position || '',
    specializationId: userDetail?.specialization || '',
    majorId: userDetail?.major || '',
    status: userDetail?.status || 1,
    dob: userDetail?.dob ? new Date(userDetail.dob) : null,
  };

  const fetchPositions = async (departmentId: string) => {
    try {
      setLoadingPosition(true);
      setMockDataPositionIds([]);
      const response = await positionService.getListPosition(departmentId);
      setMockDataPositionIds(response.data);
    } catch (error) {
      console.error('Failed to fetch positions:', error);
      setMockDataPositionIds([]);
    } finally {
      setLoadingPosition(false);
    }
  };

  const handleSubmit = async (values: FormDataUser, { setSubmitting }: any) => {
    try {
      httpService.attachTokenToHeader(token);
      const submissionValues = {
        ...values,
        roleId: normalizeRoleId(values.roleId),
      };

      if (userId) {
        await userService.updateUser({
          ...submissionValues,
          userId,
        });
        setSubmitting(false);
        save(cachedKeys.dataUser, null);
        save(cachedKeys.forceRefetchUser, true);
        navigate(-1);
        showSuccess('Cập nhật người dùng thành công!');
      } else {
        await userService.createUser({
          ...submissionValues,
          userId: undefined,
        });
        setSubmitting(false);
        save(cachedKeys.dataUser, null);
        save(cachedKeys.forceRefetchUser, true);
        navigate(-1);
        showSuccess('Thêm người dùng mới thành công!');
      }
    } catch (error) {
      showError(error);
    }
  };

  if (loadingUserDetail) {
    return <Loading />;
  }

  return (
    <PageWrapper name="Thêm người dùng mới" className="bg-white dark:bg-gray-900">
      <ExamHeader
        title="Quản lý người dùng"
        subtitle="Thêm người dùng mới hoặc cập nhật thông tin người dùng hiện tại"
        icon={
          userId ? (
            <Edit3Icon className="text-wh-600 h-6 w-6" />
          ) : (
            <UserPlus className="h-6 w-6 text-green-600" />
          )
        }
        className="border-b border-white/20 bg-gradient-to-r from-blue-600 to-green-700 px-6 py-6 shadow-lg"
      />
      <div className="mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="space-y-2"></CardHeader>
          <CardContent className="space-y-8">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, handleChange, handleBlur, isSubmitting }) => {
                const roleIds = Array.isArray(values.roleId) ? values.roleId : [values.roleId];
                const isStudent = roleIds.includes('1') || roleIds.includes(1);
                const isLecturer = roleIds.includes('2') || roleIds.includes(2);
                const isAdminOrSupervisor = roleIds.some((role) =>
                  ['3', '4', 3, 4].includes(typeof role === 'string' ? role : role.toString()),
                );

                return (
                  <Form className="space-y-8">
                    <BasicInfoSection
                      values={values}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                      mockDataRoles={mockDataRoles}
                      userId={userId}
                    />
                    <PersonalInfoSection
                      values={values}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                    <WorkStudyInfoSection
                      userId={userId}
                      values={values}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                      fetchPositions={fetchPositions}
                      mockDataPositionIds={mockDataPositionIds}
                      loadingPosition={loadingPosition}
                      isStudent={isStudent}
                      isLecturer={isLecturer}
                      isAdminOrSupervisor={isAdminOrSupervisor}
                    />
                    <FormSubmitButton isSubmitting={isSubmitting} userId={userId} />
                  </Form>
                );
              }}
            </Formik>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default AddNewUser;
