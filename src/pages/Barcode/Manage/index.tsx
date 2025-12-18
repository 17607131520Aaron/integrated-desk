import React, {useMemo, useState} from 'react';

import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Space,
  Typography,
} from 'antd';
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

const validateValueByType = (type: CodeType, rawValue: string): string | null => {
  const value = rawValue.trim();

  if (!value) {
    return '内容不能为空';
  }

  switch (type) {
    case 'EAN13':
      if (!/^\d{13}$/.test(value)) {
        return 'EAN-13 条码必须是 13 位数字';
      }
      return null;
    case 'EAN8':
      if (!/^\d{8}$/.test(value)) {
        return 'EAN-8 条码必须是 8 位数字';
      }
      return null;
    case 'UPC':
      if (!/^\d{12}$/.test(value)) {
        return 'UPC-A 条码必须是 12 位数字';
      }
      return null;
    case 'CODE39':
      if (!/^[0-9A-Z.$/+% -]+$/.test(value)) {
        return 'Code39 仅支持大写字母、数字及 - . 空格 $ / + % 等字符';
      }
      return null;
    case 'CODE128':
    case 'QRCODE':
    default:
      if (value.length > 256) {
        return '内容过长，请控制在 256 个字符以内';
      }
      return null;
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

  const handleGenerateFromValue = () => {
    form
      .validateFields(['type', 'customValue', 'count'])
      .then((values) => {
        const {type, customValue, count} = values as {
          type: CodeType;
          customValue: string;
          count: number;
        };

        const lines: string[] = (customValue || '')
          .split(/\r?\n/)
          .map((v) => v.trim())
          .filter((v): v is string => !!v);

        if (lines.length === 0) {
          message.warning('请输入需要生成条码的内容');
          return;
        }

        // 多行：每行一个内容，忽略数量，直接按行数生成
        if (lines.length > 1) {
          if (lines.length > 100) {
            message.warning('一次最多根据 100 行内容生成条码，请适当减少行数');
            return;
          }

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i] as string;
            const err = validateValueByType(type, line);
            if (err) {
              message.error(`第 ${i + 1} 行：${err}`);
              return;
            }
          }

          const list: GeneratedCode[] = lines.map((v, index) => ({
            id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
            type,
            value: v,
          }));

          setCodes((prev) => [...list, ...prev]);
          message.success(`已根据多行内容生成 ${lines.length} 个条码`);
          return;
        }

        // 单行：沿用数量逻辑，可按同一内容生成多个
        if (count <= 0) {
          message.warning('生成数量必须大于 0');
          return;
        }

        if (count > 100) {
          message.warning('一次最多生成 100 个条码，请适当减少数量');
          return;
        }

        const singleValue = lines[0] as string;
        const error = validateValueByType(type, singleValue);
        if (error) {
          message.error(error);
          return;
        }

        const list: GeneratedCode[] = Array.from({length: count}).map((_, index) => ({
          id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
          type,
          value: singleValue,
        }));

        setCodes((prev) => [...list, ...prev]);
        message.success(`已根据内容生成 ${count} 个条码`);
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

      <div
        style={{
          marginTop: 16,
          display: 'flex',
          gap: 16,
          flex: 1,
          alignItems: 'stretch',
        }}
      >
        <div style={{width: 420, flexShrink: 0}}>
          <Card
            size="small"
            style={{height: '100%', borderRadius: 8}}
            styles={{body: {paddingBottom: 12, paddingTop: 16}}}
            title="条码生成"
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                type: 'QRCODE' as CodeType,
                count: 10,
                customValue: '',
              }}
            >
              <Form.Item
                label="条码类型"
                name="type"
                rules={[{required: true, message: '请选择条码类型'}]}
              >
                <Select style={{width: '100%'}} options={CODE_TYPES} placeholder="请选择条码类型" />
              </Form.Item>

              <Form.Item
                label="生成数量"
                name="count"
                rules={[{required: true, message: '请输入生成数量'}]}
              >
                <InputNumber min={1} max={100} style={{width: '100%'}} placeholder="数量" />
              </Form.Item>

              <Form.Item>
                <Space wrap>
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

              <Form.Item
                label="指定内容"
                name="customValue"
                rules={[{required: true, message: '请输入需要生成条码的内容'}]}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <Input.TextArea
                    allowClear
                    placeholder="在此输入字符串；支持多行输入，每行一个内容，换行可批量生成条码"
                    autoSize={{minRows: 3, maxRows: 6}}
                  />
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text type="secondary" style={{fontSize: 12}}>
                      单行+数量：可按同一内容生成多个；多行：每行一个内容，忽略数量。
                    </Text>
                    <Button type="primary" onClick={handleGenerateFromValue}>
                      根据内容生成
                    </Button>
                  </div>
                </div>
              </Form.Item>
            </Form>
          </Card>
        </div>

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
          style={{borderRadius: 8, flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column'}}
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
              <Text>暂无条码，请先在左侧配置并点击「随机生成」或「根据内容生成」。</Text>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BarcodeManage;
