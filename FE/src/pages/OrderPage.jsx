/* eslint-disable */
import { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  Popconfirm,
  message,
  Typography,
  Card,
  List,
  Divider,
  Radio,
  Spin
} from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  DeleteOutlined,
  MinusOutlined,
  EyeOutlined, // <-- IMPORT THÊM ICON CON MẮT
} from '@ant-design/icons'
import { orderApi, inventoryApi } from '../services/api'

const { Title, Text } = Typography

const STATUS_COLORS = {
  PENDING: 'orange',
  PREPARING: 'blue',
  READY: 'default',
  COMPLETED: 'green',
  CANCELLED: 'red',
}

function OrderPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  // States cho Modal Tạo Đơn
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [menu, setMenu] = useState([])
  const [menuLoading, setMenuLoading] = useState(false)
  const [cart, setCart] = useState({})
  const [selectedCategory, setSelectedCategory] = useState('all')

  // States cho Modal Xem Chi Tiết
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderDetails, setOrderDetails] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await orderApi.getAll()
      setOrders(res.data)
    } catch (err) {
      message.error('Không thể tải danh sách đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  const fetchMenu = async () => {
    setMenuLoading(true)
    try {
      const res = await inventoryApi.getMenu()
      setMenu(res.data)
    } catch (err) {
      message.error('Không thể tải Menu')
    } finally {
      setMenuLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    if (modalOpen) {
      fetchMenu()
      setSelectedCategory('all')
    } else {
      setCart({})
    }
  }, [modalOpen])

  const handleAddToCart = (itemName) => {
    setCart((prev) => ({
      ...prev,
      [itemName]: (prev[itemName] || 0) + 1,
    }))
  }

  const handleRemoveFromCart = (itemName) => {
    setCart((prev) => {
      const newCart = { ...prev }
      if (newCart[itemName] > 1) {
        newCart[itemName] -= 1
      } else {
        delete newCart[itemName]
      }
      return newCart
    })
  }

  // --- HÀM TÍNH TỔNG TIỀN (TẠM TÍNH) ---
  const calculateTotal = () => {
    let total = 0;
    Object.keys(cart).forEach(itemName => {
      const menuItem = menu.find(item => item.name === itemName);
      if (menuItem) {
        total += menuItem.price * cart[itemName];
      }
    });
    return total;
  }

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()

      const parsedItems = Object.keys(cart).map((itemName) => {
        const menuItem = menu.find(item => item.name === itemName);
        return {
          inventoryItemId: menuItem ? menuItem.id : null,
          itemName: itemName,
          quantity: cart[itemName],
          unitPrice: menuItem ? menuItem.price : 0
        }
      })

      if (parsedItems.length === 0) {
        message.warning('Vui lòng chọn ít nhất 1 món ăn!')
        return
      }

      const payload = {
        tableId: values.tableId,
        items: parsedItems,
      }

      await orderApi.create(payload)
      message.success('Tạo đơn hàng thành công')
      setModalOpen(false)
      form.resetFields()
      fetchOrders()
    } catch (err) {
      message.error('Tạo đơn hàng thất bại')
    }
  }

  const handleUpdateStatus = async (id, status) => {
    try {
      await orderApi.update(id, { status })
      message.success('Cập nhật trạng thái thành công')
      fetchOrders()
    } catch {
      message.error('Cập nhật thất bại')
    }
  }

  const handleDelete = async (id) => {
    try {
      await orderApi.delete(id)
      message.success('Xóa đơn hàng thành công')
      fetchOrders()
    } catch {
      message.error('Xóa thất bại')
    }
  }

  const handleViewDetails = async (record) => {
    setSelectedOrder(record);
    setDetailsModalOpen(true);
    setDetailsLoading(true);
    try {
      const res = await orderApi.getById(record.id);
      setOrderDetails(res.data); // Lưu dữ liệu API trả về vào State
    } catch (err) {
      message.error('Không thể tải chi tiết đơn hàng');
    } finally {
      setDetailsLoading(false);
    }
  }

  const calculateFinalPrice = () => {
    if (!orderDetails || !orderDetails.items) return 0;
    return orderDetails.items.reduce((total, item) => {
      return total + (item.quantity * (item.unitPrice || 0));
    }, 0);
  }

  const detailColumns = [
    { title: 'Tên món', dataIndex: 'itemName', key: 'itemName' },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', align: 'center' },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right',
      render: (price) => `${(price || 0).toLocaleString('vi-VN')} đ`
    },
    {
      title: 'Thành tiền',
      key: 'total',
      align: 'right',
      render: (_, record) => {
        const subtotal = (record.quantity || 0) * (record.unitPrice || 0);
        return <Text strong>{subtotal.toLocaleString('vi-VN')} đ</Text>;
      }
    }
  ]

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Bàn', dataIndex: 'tableId', width: 80 },
    {
      title: 'Món ăn',
      dataIndex: 'items',
      render: (items) => {
        if (!Array.isArray(items)) return String(items)
        return (
          <Space wrap size={[0, 4]}>
            {items.map((item, idx) => (
              <Tag key={idx} color="blue">
                {item.itemName} x {item.quantity}
              </Tag>
            ))}
          </Space>
        )
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 140,
      render: (status) => (
        <Tag color={STATUS_COLORS[status] || 'default'}>{status}</Tag>
      ),
    },
    {
      title: 'Thao tác',
      width: 320,
      render: (_, record) => (
        <Space size="small">
          {/* NÚT XEM CHI TIẾT */}
          <Button
            size="small"
            type="dashed"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Chi tiết
          </Button>

          <Select
            size="small"
            value={record.status}
            style={{ width: 120 }}
            onChange={(val) => handleUpdateStatus(record.id, val)}
            options={[
              { value: 'PENDING', label: 'PENDING' },
              { value: 'PREPARING', label: 'PREPARING' },
              { value: 'READY', label: 'READY' },
              { value: 'COMPLETED', label: 'COMPLETED' },
              { value: 'CANCELLED', label: 'CANCELLED' },
            ]}
          />
          <Popconfirm
            title="Xóa đơn hàng?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const filteredMenu = selectedCategory === 'all'
    ? menu
    : menu.filter(item => item.category === selectedCategory);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>Quản lý Đơn hàng</Title>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchOrders} loading={loading}>
              Làm mới
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
              Tạo đơn
            </Button>
          </Space>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={orders}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* --- MODAL XEM CHI TIẾT ĐƠN HÀNG --- */}
      <Modal
        title={
          <Space>
            <span>Chi tiết đơn hàng #{selectedOrder?.id}</span>
            {selectedOrder && <Tag color={STATUS_COLORS[selectedOrder.status]}>{selectedOrder.status}</Tag>}
          </Space>
        }
        open={detailsModalOpen}
        onCancel={() => {
          setDetailsModalOpen(false);
          setOrderDetails(null); // Reset data khi đóng Modal
        }}
        footer={[
          <Button key="close" type="primary" onClick={() => {
            setDetailsModalOpen(false);
            setOrderDetails(null);
          }}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {selectedOrder && (
          <div style={{ padding: '10px 0' }}>
            <p><strong>Bàn phục vụ:</strong> <Tag color="geekblue" style={{ fontSize: 14 }}>{selectedOrder.tableId}</Tag></p>

            <Divider orientation="left">Danh sách món ăn</Divider>

            <Spin spinning={detailsLoading}>
              {/* Bảng liệt kê chi tiết từng món */}
              <Table
                dataSource={orderDetails?.items || []}
                columns={detailColumns}
                rowKey="itemName"
                pagination={false}
                size="small"
                bordered
              />
            </Spin>

            <Divider dashed />

            {/* Hiển thị Giá Chốt */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fffbe6', padding: '12px 16px', borderRadius: 8, border: '1px solid #ffe58f' }}>
              <Title level={4} style={{ margin: 0 }}>Tổng giá chốt:</Title>
              <Title level={3} type="danger" style={{ margin: 0 }}>
                {calculateFinalPrice().toLocaleString('vi-VN')} đ
              </Title>
            </div>

          </div>
        )}
      </Modal>

      <Modal
        title="Tạo đơn hàng mới"
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => {
          setModalOpen(false)
          form.resetFields()
        }}
        okText="Xác nhận đặt món"
        cancelText="Hủy"
        width={750}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="tableId"
            label="Số bàn"
            rules={[{ required: true, message: 'Vui lòng nhập số bàn' }]}
          >
            <Input placeholder="VD: Bàn 01" />
          </Form.Item>
        </Form>

        <Divider orientation="left">Chọn món</Divider>

        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
          <Radio.Group
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="all">Tất cả</Radio.Button>
            <Radio.Button value="mon_kho">Món khô</Radio.Button>
            <Radio.Button value="do_nuoc">Món nước</Radio.Button>
            <Radio.Button value="do_uong">Đồ uống</Radio.Button>
            <Radio.Button value="trang_mieng">Tráng miệng</Radio.Button>
          </Radio.Group>
        </div>

        <div style={{ height: 320, overflowY: 'auto', border: '1px solid #f0f0f0', borderRadius: 8, padding: 8 }}>
          <List
            itemLayout="horizontal"
            dataSource={filteredMenu}
            loading={menuLoading}
            renderItem={(item) => {
              const qty = cart[item.name] || 0;
              return (
                <List.Item
                  style={{
                    border: qty > 0 ? '1px solid #1890ff' : '1px solid transparent',
                    borderRadius: 8,
                    backgroundColor: qty > 0 ? '#e6f7ff' : 'transparent',
                    transition: 'all 0.2s ease'
                  }}
                  actions={[
                    <Space key="actions">
                      <Button
                        size="small"
                        shape="circle"
                        icon={<MinusOutlined />}
                        disabled={qty === 0}
                        onClick={() => handleRemoveFromCart(item.name)}
                      />
                      <Text strong style={{ width: 24, textAlign: 'center', display: 'inline-block' }}>{qty}</Text>
                      <Button
                        size="small"
                        type="primary"
                        shape="circle"
                        icon={<PlusOutlined />}
                        onClick={() => handleAddToCart(item.name)}
                      />
                    </Space>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: 20 }}>
                        <span>{item.name}</span>
                        <Text type="success" strong>{item.price.toLocaleString('vi-VN')} đ</Text>
                      </div>
                    }
                    description={item.description}
                  />
                </List.Item>
              )
            }}
          />
        </div>

        <Divider orientation="left">Các món bạn đã chọn</Divider>
        <Card size="small" style={{ backgroundColor: '#fafafa' }}>
          {Object.keys(cart).length === 0 ? (
            <Text type="secondary">Chưa có món nào được chọn...</Text>
          ) : (
            <>
              <Space wrap style={{ marginBottom: 16 }}>
                {Object.keys(cart).map((itemName) => (
                  <Tag key={itemName} color="cyan" style={{ padding: '4px 8px', fontSize: 14 }}>
                    {itemName} <Text strong type="danger">x{cart[itemName]}</Text>
                  </Tag>
                ))}
              </Space>

              <Divider style={{ margin: '8px 0' }} dashed />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>Tạm tính:</Text>
                <Title level={4} type="danger" style={{ margin: 0 }}>
                  {calculateTotal().toLocaleString('vi-VN')} đ
                </Title>
              </div>
            </>
          )}
        </Card>
      </Modal>
    </div>
  )
}

export default OrderPage