import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Space, Typography } from 'antd';
import { menuItems ,userMenuItems} from './constants';
import { AppstoreOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from '@ant-design/icons';
import './app.scss';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  // 获取当前选中的菜单项
  const selectedKeys = useMemo(() => {
    const path = location.pathname || '/';
    const keys: string[] = [];

    // 遍历菜单项找到匹配的路径
    menuItems?.forEach((item) => {
      if (!item || typeof item === 'string') return;
      
      // 精确匹配首页
      if (item.key === '/' && (path === '/' || path === '')) {
        keys.push('/');
      } else if (item.key === path) {
        keys.push(path);
      } else if ('children' in item && item.children) {
        item.children.forEach((child) => {
          if (child && typeof child !== 'string' && child.key === path) {
            keys.push(path);
          }
        });
      }
    });

    // 如果没有匹配到，默认选中首页
    return keys.length > 0 ? keys : ['/'];
  }, [location.pathname]);

  // 首次进入时默认导航到首页
  useEffect(() => {
    const path = location.pathname || '/';
    // 如果路径为空或者是根路径，确保导航到首页
    if (path === '/' || path === '') {
      // 如果已经在首页，不需要重复导航
      if (path === '/') {
        return;
      }
    }
  }, []);

  // 自动展开当前页面的父菜单
  useEffect(() => {
    const path = location.pathname || '/';
    const newOpenKeys: string[] = [...openKeys];

    menuItems?.forEach((item) => {
      if (!item || typeof item === 'string') return;
      
      if ('children' in item && item.children) {
        const hasMatch = item.children.some(
          (child) => child && typeof child !== 'string' && child.key === path
        );
        if (hasMatch && item.key && !newOpenKeys.includes(item.key as string)) {
          newOpenKeys.push(item.key as string);
        }
      }
    });

    if (newOpenKeys.length !== openKeys.length) {
      setOpenKeys(newOpenKeys);
    }
  }, [location.pathname]);

  // 菜单点击处理
  const handleMenuClick = ({ key }: { key: string }) => {
    // 只处理叶子节点（有实际路径的菜单项）
    if (key.startsWith('/')) {
      navigate(key);
    }
  };

  // 菜单展开/收起处理
  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  // 用户菜单点击处理
  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      // 处理退出登录逻辑
      navigate('/login');
    } else if (key === 'profile') {
      // 处理个人中心跳转
      console.log('跳转到个人中心');
    } else if (key === 'settings') {
      // 处理账户设置跳转
      console.log('跳转到账户设置');
    }
  };

  return (
    <Layout className="asp-comprehension-home" style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="asp-comprehension-home-menu"
        width={240}
      >
        <div className="asp-comprehension-home-menu-header">
          <div className="asp-comprehension-home-menu-logo">
            <div className="asp-comprehension-home-menu-logo-icon">
              <AppstoreOutlined />
            </div>
            {!collapsed && (
              <span className="asp-comprehension-home-menu-logo-title">个人桌面端工具箱</span>
            )}
          </div>
        </div>

        <div className="asp-comprehension-home-menu-divider"></div>

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          items={menuItems}
          onClick={handleMenuClick}
          onOpenChange={handleOpenChange}
          className="asp-comprehension-home-menu-content"
        />
      </Sider>

      <Layout style={{ height: '100%', overflow: 'hidden' }}>
        <Header className="asp-comprehension-home-header">
          <div className="asp-comprehension-home-header-content">
            <div className="asp-comprehension-home-header-left">
              <div
                className="asp-comprehension-home-header-toggle"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </div>
            </div>

            <div className="asp-comprehension-home-header-right">
              <Dropdown
                menu={{
                  items: userMenuItems,
                  onClick: handleUserMenuClick,
                }}
                placement="bottomRight"
              >
                <Space className="asp-comprehension-home-header-content-user" style={{ cursor: 'pointer' }}>
                  <Avatar
                    size={32}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: '#237ffa' }}
                  />
                  <Text style={{ fontSize: 14, color: '#595959' }}>管理员</Text>
                </Space>
              </Dropdown>
            </div>
          </div>
        </Header>

        <Content className="asp-comprehension-home-content">
          <div className="asp-comprehension-home-content-wrapper">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;