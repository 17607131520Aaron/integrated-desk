import React from 'react';

import { ClearOutlined, DisconnectOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Input,
  InputNumber,
  Select,
  Space,
  Spin,
  Tooltip,
  Typography,
} from 'antd';

import { DEFAULT_PORT, levelOptions } from './constants';
import './index.scss';

const { Text } = Typography;
const { Search } = Input;

// 连接模式选项
const connectionModeOptions = [
  { label: 'ADB', value: 'adb' },
  { label: 'WebSocket', value: 'websocket' },
];

const RNDebugLogs: React.FC = () => {
  return (
    <div className="rn-debug-logs">
      <Card className="rn-debug-logs-toolbar">
        <Space wrap size="middle" style={{ width: '100%' }}>
          <Space>
            <Text strong>连接状态：</Text>
            {/* <Space>
              <Spin size="small" />
              <Text type="secondary">连接中...</Text>
            </Space> */}
            <Badge status="error" text="未连接" />
          </Space>

          <Space>
            <Text strong>端口：</Text>
            <InputNumber
              value={8081}
              min={1}
              max={9999}
              style={{ width: 120 }}
              placeholder="请输入端口"
            />
          </Space>

          <Space>
            <Text strong>连接模式：</Text>
            <Select value="websocket" style={{ width: 120 }} options={connectionModeOptions} />
          </Space>

          <Space>
            <Tooltip title="连接">
              <Button icon={<ReloadOutlined />} type="primary">
                连接
              </Button>
            </Tooltip>

            <Tooltip title="清除日志">
              <Button icon={<ClearOutlined />}>清除</Button>
            </Tooltip>
          </Space>

          <Space style={{ marginLeft: 'auto' }}>
            <Select
              placeholder="日志级别"
              value="全部"
              style={{ width: '100px' }}
              options={levelOptions || []}
            />
            <Search placeholder="搜索日志..." allowClear style={{ width: 400 }} value="" />
          </Space>
        </Space>
      </Card>

      <Card className="rn-debug-logs-content">
        <div className="rn-debug-logs-container">
          <div className="rn-debug-logs-empty">
            <DisconnectOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
            <Text type="secondary">未连接，请点击连接按钮连接到Metro bundler</Text>
            <Text type="secondary" style={{ fontSize: '12px', marginTop: 8 }}>
              默认端口: {DEFAULT_PORT}
            </Text>
            {/* <CheckCircleOutlined style={{fontSize: 48, color: '#52c41a', marginBottom: 16}} />
              <Text type="secondary">已连接，等待日志输出...</Text>
              <Text type="secondary">没有匹配的日志</Text> */}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RNDebugLogs;
