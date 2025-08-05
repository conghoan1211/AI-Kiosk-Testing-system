import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Info } from 'lucide-react';
import { useState } from 'react';
import AddNewRoleTab, { FormDataRoles } from '../components/add-new-role-tab';
import PreviewTab from '../components/preview-tab';
import PageWrapper from '@/components/PageWrapper/PageWrapper';

const AddNewRole = () => {
  //!State
  const [activeTab, setActiveTab] = useState('generalInfo');
  const [formData, setFormData] = useState<FormDataRoles | null>(null);

  //!Functions
  const handleSubmit = (values: FormDataRoles) => {
    setFormData(values);
    setActiveTab('preview');
  };

  //!Render
  return (
    <PageWrapper name='Thêm vai trò mới' className="bg-white dark:bg-gray-900">
      <div className="space-y-6 p-4">
        <Tabs defaultValue="generalInfo" value={activeTab} onValueChange={setActiveTab}>
          <TabsList variant="default" fullWidth className="w-full">
            <TabsTrigger variant="gradient" value="generalInfo" icon={<Info size={16} />}>
              Thông tin cơ bản
            </TabsTrigger>
            <TabsTrigger
              variant="gradient"
              value="preview"
              icon={<Eye size={16} />}
              disabled={!formData}
            >
              Xem trước
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generalInfo" className="pt-6">
            <AddNewRoleTab onNext={handleSubmit} />
          </TabsContent>

          <TabsContent value="preview">
            <PreviewTab formDataRoles={formData} />
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
};

export default AddNewRole;
