import { useState } from 'react';
import { Layout, Menu, Typography, Button } from 'antd';
import {
  UserOutlined,
  DashboardOutlined,
  LogoutOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import UserTable from '../components/UserTable';
import OrderPage from './OrderPage';
import './DashboardPage.css';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [selectedKey, setSelectedKey] = useState('1');

  // Define menu items based on user role
  const menuItems = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      label: 'Tổng Quan',
    },
    // Only show 'User Management' if user has 'admin' permission
    ...(user?.permission === 'admin' ? [{
      key: '2',
      icon: <UserOutlined />,
      label: 'Quản Lý Người Dùng',
    }] : []),
    {
      key: '3',
      icon: <ShoppingCartOutlined />,
      label: 'Đơn Hàng',
    }
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case '1':
        return (
          <div>
            <Title level={3}>Xin chào, {user?.userName}!</Title>
            <Text type="secondary">Vai trò: {user?.permission}</Text>
            <div style={{ marginTop: '20px' }}>
              <p>Đây là trang tổng quan chính của hệ thống.</p>
              {user?.permission !== 'admin' && (
                <p>Bạn có quyền người dùng tiêu chuẩn. Bạn không thể xem phần Quản Lý Người Dùng.</p>
              )}
            </div>
          </div>
        );
      case '2':
        return <UserTable />;
      case '3':
        return <OrderPage />;
      default:
        return <div>Vui lòng chọn một mục</div>;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div className="logo">
          <h2 style={{ color: 'white', textAlign: 'center', margin: '16px 0' }}>Quản lý nhà hàng</h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={(e) => setSelectedKey(e.key)}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header className="site-layout-sub-header-background" style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <div style={{ marginRight: '16px' }}>
            <Text strong>{user?.userName} ({user?.permission})</Text>
          </div>
          <Button type="primary" danger icon={<LogoutOutlined />} onClick={logout}>
            Đăng Xuất
          </Button>
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360, background: '#fff' }}>
            {renderContent()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardPage;
