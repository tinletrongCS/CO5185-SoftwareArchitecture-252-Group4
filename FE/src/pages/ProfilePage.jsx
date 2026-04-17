import { useState, useEffect } from 'react';
import { Card, Avatar, Typography, Descriptions, Button, Spin, Divider, Tag, message, Modal, Form, Input } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { userApi } from '../services/api';

const { Title, Text } = Typography;

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await userApi.getMe();
      setProfile(res.data);
    } catch {
      message.error('Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      setUpdating(true);
      await userApi.update(profile.userID, values);
      message.success('Cập nhật thông tin thành công');
      setEditModalOpen(false);
      fetchProfile();
    } catch {
      message.error('Cập nhật thất bại');
    } finally {
      setUpdating(false);
    }
  };

  const openEditModal = () => {
    form.setFieldsValue({
      userName: profile?.userName,
      fullname: profile?.fullname || '',
      phone: profile?.phone || '',
      email: profile?.email || '',
    });
    setEditModalOpen(true);
  };

  const getPermissionLabel = (perm) => {
    switch (perm) {
      case 'admin': return 'Quản Trị Viên';
      case 'manager': return 'Quản Lý';
      default: return 'Người Dùng';
    }
  };

  const getPermissionColor = (perm) => {
    switch (perm) {
      case 'admin': return 'red';
      case 'manager': return 'orange';
      default: return 'green';
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
          <Title level={2} style={{ marginTop: 16, marginBottom: 4 }}>
            {profile?.fullname || profile?.userName}
          </Title>
          <Tag color={getPermissionColor(profile?.permission)} style={{ fontSize: 14, padding: '4px 12px' }}>
            {getPermissionLabel(profile?.permission)}
          </Tag>
        </div>

        <Divider />

        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label={<><UserOutlined /> Tên đăng nhập</>}>
            {profile?.userName}
          </Descriptions.Item>
          <Descriptions.Item label={<><UserOutlined /> Họ và tên</>}>
            {profile?.fullname || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>
            {profile?.phone || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={<><MailOutlined /> Email</>}>
            {profile?.email || '-'}
          </Descriptions.Item>
          {/* <Descriptions.Item label="Mã người dùng">
            #{profile?.userID}
          </Descriptions.Item> */}
        </Descriptions>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Button type="primary" icon={<EditOutlined />} onClick={openEditModal}>
            Chỉnh sửa thông tin
          </Button>
        </div>
      </Card>

      <Modal
        title="Chỉnh sửa thông tin cá nhân"
        open={editModalOpen}
        onOk={handleUpdate}
        onCancel={() => setEditModalOpen(false)}
        okText="Lưu"
        confirmLoading={updating}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="userName" label="Tên đăng nhập" rules={[{ required: true }]}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="fullname" label="Họ và tên">
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input placeholder="Nhập email" type="email" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfilePage;