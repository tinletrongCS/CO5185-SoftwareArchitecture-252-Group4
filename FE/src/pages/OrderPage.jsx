/* eslint-disable */
import { useEffect, useState } from 'react'
import {
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
  Spin,
  Row,
  Col,
  Empty,
  Badge
} from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  DeleteOutlined,
  MinusOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TableOutlined
} from '@ant-design/icons'
import { orderApi, inventoryApi } from '../services/api'

const { Title, Text } = Typography

const STATUS_CONFIG = {
  PENDING: { color: 'orange', label: 'Đang chờ', icon: <Spin size="small" style={{ marginRight: 8 }} /> },
  COMPLETED: { color: 'green', label: 'Hoàn tất', icon: <CheckCircleOutlined style={{ marginRight: 8 }} /> },
  CANCELLED: { color: 'red', label: 'Đã hủy', icon: <CloseCircleOutlined style={{ marginRight: 8 }} /> },
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

  const handleViewDetails = async (order) => {
    setSelectedOrder(order);
    setDetailsModalOpen(true);
    setDetailsLoading(true);
    try {
      const res = await orderApi.getById(order.id);
      setOrderDetails(res.data);
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

  const filteredMenu = selectedCategory === 'all'
    ? menu
    : menu.filter(item => item.category === selectedCategory);

  // --- RENDER ORDER CARD (KANBAN ITEM) ---
  const renderOrderCard = (order) => {
    const totalItems = (order.items || []).reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = (order.items || []).reduce((sum, item) => sum + (item.quantity * (item.unitPrice || 0)), 0);

    return (
      <Card
        key={order.id}
        size="small"
        style={{ marginBottom: 12, borderRadius: 2, borderLeft: `4px solid ${STATUS_CONFIG[order.status]?.color || '#d9d9d9'}` }}
        bodyStyle={{ padding: 12 }}
        hoverable
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text strong style={{ fontSize: 16 }}><TableOutlined /> {order.tableId}</Text>
          <Text type="secondary" small>#{order.id}</Text>
        </div>
        
        <div style={{ marginBottom: 12 }}>
          <Space wrap size={[0, 4]}>
            {(order.items || []).map((item, idx) => (
              <Tag key={idx} style={{ fontSize: 11, borderRadius: 2 }}>
                {item.itemName} x{item.quantity}
              </Tag>
            ))}
          </Space>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong type="danger">{totalPrice.toLocaleString('vi-VN')} đ</Text>
          <Space>
            <Button 
                size="small" 
                type="text" 
                icon={<EyeOutlined />} 
                onClick={() => handleViewDetails(order)}
            />
            {order.status === 'PENDING' && (
              <>
                <Popconfirm title="Xác nhận hoàn tất?" onConfirm={() => handleUpdateStatus(order.id, 'COMPLETED')}>
                  <Button size="small" type="primary" icon={<CheckOutlined />} style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} />
                </Popconfirm>
                <Popconfirm title="Xác nhận hủy đơn?" onConfirm={() => handleUpdateStatus(order.id, 'CANCELLED')}>
                  <Button size="small" danger icon={<CloseOutlined />} />
                </Popconfirm>
              </>
            )}
            {order.status !== 'PENDING' && (
               <Popconfirm title="Xóa đơn hàng?" onConfirm={() => handleDelete(order.id)}>
                 <Button size="small" type="text" danger icon={<DeleteOutlined />} />
               </Popconfirm>
            )}
          </Space>
        </div>
      </Card>
    )
  }

  // --- RENDER KANBAN COLUMN ---
  const renderColumn = (statusKey, title) => {
    const columnOrders = orders.filter(o => o.status === statusKey);
    const config = STATUS_CONFIG[statusKey];

    return (
      <Col xs={24} md={8}>
        <div style={{ background: '#f5f5f5', borderRadius: 2, padding: 12, minHeight: '60vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '0 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {config.icon}
              <Title level={5} style={{ margin: 0 }}>{title}</Title>
            </div>
            <Badge count={columnOrders.length} color={config.color} />
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {columnOrders.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Trống" />
            ) : (
              columnOrders.map(order => renderOrderCard(order))
            )}
          </div>
        </div>
      </Col>
    )
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Danh sách đơn hàng</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchOrders} loading={loading}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Tạo đơn
          </Button>
        </Space>
      </div>

      <Spin spinning={loading}>
        <Row gutter={16}>
          {renderColumn('PENDING', 'ĐANG CHỜ')}
          {renderColumn('COMPLETED', 'HOÀN TẤT')}
          {renderColumn('CANCELLED', 'ĐÃ HỦY')}
        </Row>
      </Spin>

      {/* --- MODAL XEM CHI TIẾT --- */}
      <Modal
        title={
          <Space>
            <span>Chi tiết đơn hàng #{selectedOrder?.id}</span>
            {selectedOrder && <Tag color={STATUS_CONFIG[selectedOrder.status]?.color}>{selectedOrder.status}</Tag>}
          </Space>
        }
        open={detailsModalOpen}
        onCancel={() => {
          setDetailsModalOpen(false);
          setOrderDetails(null);
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
              <List
                size="small"
                bordered
                dataSource={orderDetails?.items || []}
                renderItem={item => (
                  <List.Item>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <Text>{item.itemName} <Text type="secondary">x{item.quantity}</Text></Text>
                      <Text strong>{(item.quantity * (item.unitPrice || 0)).toLocaleString('vi-VN')} đ</Text>
                    </div>
                  </List.Item>
                )}
              />
            </Spin>
            <Divider dashed />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fffbe6', padding: '12px 16px', borderRadius: 8, border: '1px solid #ffe58f' }}>
              <Title level={4} style={{ margin: 0 }}>Tổng cộng:</Title>
              <Title level={3} type="danger" style={{ margin: 0 }}>
                {calculateFinalPrice().toLocaleString('vi-VN')} đ
              </Title>
            </div>
          </div>
        )}
      </Modal>

      {/* --- MODAL TẠO ĐƠN --- */}
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
              const isOutOfStock = (item.quantity || 0) <= qty;
              return (
                <List.Item
                  style={{
                    border: qty > 0 ? '1px solid #1890ff' : '1px solid transparent',
                    borderRadius: 2,
                    backgroundColor: qty > 0 ? '#e6f7ff' : 'transparent',
                    opacity: (item.quantity <= 0 && qty === 0) ? 0.6 : 1,
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
                        disabled={isOutOfStock}
                        onClick={() => handleAddToCart(item.name)}
                      />
                    </Space>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: 20 }}>
                        <Space>
                          <span>{item.name}</span>
                          {item.quantity <= 5 && item.quantity > 0 && <Tag color="warning">Sắp hết</Tag>}
                          {item.quantity <= 0 && <Tag color="error">Hết hàng</Tag>}
                        </Space>
                        <Text type="success" strong>{item.price.toLocaleString('vi-VN')} đ</Text>
                      </div>
                    }
                    description={
                      <div style={{ marginTop: 4 }}>
                        <div style={{ color: 'rgba(0, 0, 0, 0.45)', marginBottom: 4 }}>{item.description}</div>
                        <Space>
                          <Text type="secondary" size="small">Kho:</Text>
                          <Tag 
                            color={((item.quantity || 0) - qty) <= 5 ? 'volcano' : 'green'} 
                            style={{ borderRadius: 2 }}
                          >
                            Còn {(item.quantity || 0) - qty} món
                          </Tag>
                        </Space>
                      </div>
                    }
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