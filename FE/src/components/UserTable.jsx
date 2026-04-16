/* eslint-disable */
import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, message, Spin, Form, Input, Select } from 'antd';
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { userApi } from '../services/api';

const { confirm } = Modal;
const { Option } = Select;

const UserTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  // Watch form values to detect changes
  const formValues = Form.useWatch([], form);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!editingUser) {
      setHasChanges(true); // Always allow for new users
      return;
    }
    const isChanged = 
      formValues?.userName !== editingUser.userName ||
      formValues?.password !== editingUser.password ||
      formValues?.permission !== editingUser.permission;
    
    setHasChanges(isChanged);
  }, [formValues, editingUser]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userApi.getAll();
      setData(response.data.users || response.data || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách người dùng:', error);
      const mockData = [
        { userID: 1, userName: 'admin', password: 'hashed_password_1', permission: 'admin' },
        { userID: 2, userName: 'manager', password: 'hashed_password_2', permission: 'manager' },
        { userID: 3, userName: 'user', password: 'hashed_password_3', permission: 'user' },
      ];
      setData(mockData);
      message.info('Sử dụng dữ liệu mẫu do không kết nối được API.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = (id) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa người dùng này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        try {
          await userApi.delete(id);
          message.success('Xóa người dùng thành công');
          fetchUsers();
        } catch (error) {
          console.error('Lỗi khi xóa người dùng:', error);
          message.error('Xóa người dùng thất bại');
        }
      },
    });
  };

  const showModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      form.setFieldsValue({
        userName: user.userName,
        password: user.password, // Mật khẩu có thể không nên hiển thị, nhưng tùy theo yêu cầu
        permission: user.permission,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await userApi.update(editingUser.userID, values);
        message.success('Cập nhật người dùng thành công');
      } else {
        await userApi.create(values);
        message.success('Thêm người dùng thành công');
      }
      setIsModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Lỗi khi lưu người dùng:', error);
      message.error('Lưu người dùng thất bại');
    }
  };

  const columns = [
    {
      title: 'Mã Người Dùng',
      dataIndex: 'userID',
      key: 'userID',
    },
    {
      title: 'Tên Đăng Nhập',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: 'Mật Khẩu',
      dataIndex: 'password',
      key: 'password',
    },
    {
      title: 'Quyền Hạn',
      dataIndex: 'permission',
      key: 'permission',
      render: (text) => (
        <span style={{ 
          color: text === 'admin' ? 'red' : text === 'manager' ? 'orange' : 'green',
          fontWeight: 'bold',
          textTransform: 'capitalize'
        }}>
          {text === 'admin' ? 'Quản Trị Viên' : text === 'manager' ? 'Quản Lý' : 'Người Dùng'}
        </span>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" size="small" onClick={() => showModal(record)}>Sửa</Button>
          <Button type="primary" danger size="small" onClick={() => handleDelete(record.userID)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  if (loading && data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Quản Lý Người Dùng</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Thêm Người Dùng
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="userID" 
        loading={loading}
        bordered
      />

      <Modal
        title={editingUser ? "Sửa Người Dùng" : "Thêm Người Dùng Mới"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Lưu"
        okButtonProps={{ disabled: editingUser && !hasChanges }}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" name="userForm">
          <Form.Item
            name="userName"
            label="Tên Đăng Nhập"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật Khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="permission"
            label="Quyền Hạn"
            rules={[{ required: true, message: 'Vui lòng chọn quyền hạn!' }]}
          >
            <Select placeholder="Chọn quyền hạn">
              <Option value="admin">Quản Trị Viên</Option>
              <Option value="manager">Quản Lý</Option>
              <Option value="user">Người Dùng</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserTable;
