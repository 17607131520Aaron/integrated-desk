import React, {useMemo, useState} from 'react';

import {Button, Card, Col, Form, InputNumber, message, Row, Select, Space, Typography} from 'antd';
// eslint-disable-next-line import/order
import {QRCodeCanvas} from 'qrcode.react';
import Barcode from 'react-barcode';

import './index.scss';

const {Title, Text} = Typography;

type CodeType = 'QRCODE' | 'CODE128' | 'EAN13' | 'EAN8' | 'UPC' | 'CODE39';

interface GeneratedCode {
  id: string;
  value: string;
  type: CodeType;
}

const CODE_TYPES: Array<{label: string; value: CodeType}> = [
  {label: '二维码（QR Code）', value: 'QRCODE'},
  {label: '条形码 - CODE128（通用，支持字母+数字）', value: 'CODE128'},
  {label: '条形码 - EAN-13（13位数字）', value: 'EAN13'},
  {label: '条形码 - EAN-8（8位数字）', value: 'EAN8'},
  {label: '条形码 - UPC-A（12位数字）', value: 'UPC'},
  {label: '条形码 - Code39（字母+数字，常见一维码）', value: 'CODE39'},
];

const getRandomAlphaNum = (length: number) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const getRandomDigits = (length: number) => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
};

const generateUpcA = () => {
  // 11 位随机数字 + 1 位校验位
  const base = getRandomDigits(11);
  const digits = base.split('').map((d) => Number(d));

  // 位置从 1 开始：奇数位 * 3，偶数位 * 1
  let sumOdd = 0;
  let sumEven = 0;
  digits.forEach((d, index) => {
    const pos = index + 1;
    if (pos % 2 === 1) {
      sumOdd += d;
    } else {
      sumEven += d;
    }
  });

  const total = sumOdd * 3 + sumEven;
  const checkDigit = (10 - (total % 10)) % 10;

  return `${base}${checkDigit}`;
};

const generateEan13 = () => {
  // 12 位随机数字 + 1 位校验位
  const base = getRandomDigits(12);
  const digits = base.split('').map((d) => Number(d));

  let sumOdd = 0;
  let sumEven = 0;
  digits.forEach((d, index) => {
    const pos = index + 1;
    if (pos % 2 === 0) {
      // 偶数位 * 3
      sumEven += d;
    } else {
      sumOdd += d;
    }
  });

  const total = sumOdd + sumEven * 3;
  const checkDigit = (10 - (total % 10)) % 10;

  return `${base}${checkDigit}`;
};

const generateEan8 = () => {
  // 7 位随机数字 + 1 位校验位
  const base = getRandomDigits(7);
  const digits = base.split('').map((d) => Number(d));

  let sumOdd = 0;
  let sumEven = 0;
  digits.forEach((d, index) => {
    const pos = index + 1;
    if (pos % 2 === 1) {
      // 奇数位 * 3
      sumOdd += d;
    } else {
      sumEven += d;
    }
  });

  const total = sumOdd * 3 + sumEven;
  const checkDigit = (10 - (total % 10)) % 10;

  return `${base}${checkDigit}`;
};

const generateRandomValueByType = (type: CodeType): string => {
  switch (type) {
    case 'EAN13':
      return generateEan13();
    case 'EAN8':
      return generateEan8();
    case 'UPC':
      return generateUpcA();
    case 'CODE39':
      return getRandomAlphaNum(10);
    case 'CODE128':
    default:
      return getRandomAlphaNum(12);
  }
};

const BarcodeManage: React.FC = () => {
  const [form] = Form.useForm();
  const [codes, setCodes] = useState<GeneratedCode[]>([]);

  const lastType = Form.useWatch<CodeType>('type', form) || 'QRCODE';

  const hasData = useMemo(() => codes.length > 0, [codes]);

  const handleGenerate = () => {
    form
      .validateFields()
      .then((values) => {
        const {type} = values;
        const {count} = values;

        if (count <= 0) {
          message.warning('生成数量必须大于 0');
          return;
        }

        if (count > 100) {
          message.warning('一次最多生成 100 个条码，请适当减少数量');
          return;
        }

        const list: GeneratedCode[] = Array.from({length: count}).map((_, index) => ({
          id: `${Date.now()}-${index}`,
          type,
          value: generateRandomValueByType(type),
        }));

        setCodes(list);
        message.success(`已生成 ${count} 个条码`);
      })
      .catch(() => {
        // ignore
      });
  };

  const handleClear = () => {
    setCodes([]);
  };

  const handleCopyAll = async () => {
    if (!hasData) {
      message.info('当前没有需要导出的条码数据');
      return;
    }

    const text = codes.map((item) => `${item.type}: ${item.value}`).join('\n');

    try {
      await navigator.clipboard.writeText(text);
      message.success('已将条码内容复制到剪贴板');
    } catch {
      message.error('复制失败，请手动选择并复制内容');
    }
  };

  return (
    <div className="barcode-manage-page">
      <Title level={3}>条码管理</Title>
      <Text type="secondary">
        通过选择条码类型与数量，一键随机生成多个条码，可用于测试或打印前预览。
      </Text>

      <Card
        size="small"
        style={{marginBottom: 24, borderRadius: 8}}
        styles={{body: {paddingBottom: 12, paddingTop: 16}}}
      >
        <Form
          form={form}
          layout="inline"
          initialValues={{
            type: 'QRCODE' as CodeType,
            count: 10,
          }}
        >
          <Form.Item
            label="条码类型"
            name="type"
            rules={[{required: true, message: '请选择条码类型'}]}
          >
            <Select style={{minWidth: 260}} options={CODE_TYPES} placeholder="请选择条码类型" />
          </Form.Item>

          <Form.Item
            label="生成数量"
            name="count"
            rules={[{required: true, message: '请输入生成数量'}]}
          >
            <InputNumber min={1} max={100} style={{width: 140}} placeholder="数量" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" onClick={handleGenerate}>
                随机生成
              </Button>
              <Button onClick={handleClear} disabled={!hasData}>
                清空结果
              </Button>
              <Button onClick={handleCopyAll} disabled={!hasData}>
                导出文本（复制全部）
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        size="small"
        className="barcode-manage-result-card-container"
        title={
          <Space size={12}>
            <span>生成结果</span>
            <Text type="secondary">
              当前类型：{CODE_TYPES.find((i) => i.value === lastType)?.label ?? lastType}
            </Text>
          </Space>
        }
        styles={{
          body: {
            paddingTop: 16,
            display: 'flex',
            flexDirection: 'column',
            // 关键：让内容区本身参与 flex 布局并启用内部滚动
            flex: 1,
            overflowY: 'auto',
          },
        }}
        style={{borderRadius: 8, flex: 1, display: 'flex', flexDirection: 'column'}}
      >
        {hasData ? (
          <>
            <Row gutter={[16, 16]}>
              {codes.map((item) => (
                <Col key={item.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                  <Card
                    size="small"
                    variant="outlined"
                    styles={{body: {padding: '12px 8px 8px'}}}
                    style={{borderRadius: 8}}
                  >
                    {item.type === 'QRCODE' ? (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          paddingTop: 4,
                          paddingBottom: 4,
                        }}
                      >
                        <QRCodeCanvas value={item.value} size={96} />
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Barcode
                          value={item.value}
                          format={item.type}
                          height={60}
                          width={1.8}
                          displayValue
                          fontSize={12}
                          margin={6}
                        />
                      </div>
                    )}
                    <div
                      style={{
                        marginTop: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                      }}
                    >
                      <Text type="secondary" style={{fontSize: 12}}>
                        类型：{item.type}
                      </Text>
                      <Text style={{fontSize: 12}} ellipsis>
                        内容：{item.value}
                      </Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
            <Text type="secondary" style={{marginTop: 16, display: 'block', fontSize: 12}}>
              提示：条码内容为随机生成，仅供测试或演示使用，如需正式使用请根据业务规则生成。
            </Text>
          </>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 0',
              color: '#9ca3af',
            }}
          >
            <Text>暂无条码，请先在上方选择类型并点击「随机生成」。</Text>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BarcodeManage;
