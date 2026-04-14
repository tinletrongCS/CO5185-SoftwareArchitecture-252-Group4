/* eslint-disable */
import { useEffect, useState, useMemo } from 'react'
import {
  Button,
  Modal,
  Form,
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
  Badge,
  Tooltip,
  Steps
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
  TableOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined
} from '@ant-design/icons'
import { orderApi, inventoryApi, tableApi } from '../services/api'

const { Title, Text } = Typography

const STATUS_CONFIG = {
  PENDING: { color: 'orange', label: 'Đang chờ', icon: <ClockCircleOutlined style={{ marginRight: 8, color: '#faad14' }} /> },
  COMPLETED: { color: 'green', label: 'Hoàn tất', icon: <CheckCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} /> },
  CANCELLED: { color: 'red', label: 'Đã hủy', icon: <CloseCircleOutlined style={{ marginRight: 8, color: '#ff4d4f' }} /> },
}

const ZONE_LABELS = {
  Indoor: 'Trong nhà',
  Outdoor: 'Ngoài trời',
  Private: 'Phòng VIP',
  Terrace: 'Ban công',
}

const ZONE_COLORS = {
  Indoor: '#1890ff',
  Outdoor: '#52c41a',
  Private: '#722ed1',
  Terrace: '#fa8c16',
}

const CATEGORY_LABELS = {
  Couple: 'Đôi (2 người)',
  Standard: 'Tiêu chuẩn',
  Family: 'Gia đình',
  VIP: 'VIP',
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

  // States cho danh sách bàn (tất cả bàn - dùng cho floor plan)
  const [allTables, setAllTables] = useState([])
  const [allTablesLoading, setAllTablesLoading] = useState(false)

  // States cho bộ lọc bàn trong modal tạo đơn
  const [filterZone, setFilterZone] = useState('all')
  const [filterTableCategory, setFilterTableCategory] = useState('all')
  const [filterCapacity, setFilterCapacity] = useState('all')
  const [selectedTableId, setSelectedTableId] = useState(null)

  // States cho Modal Xem Chi Tiết
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderDetails, setOrderDetails] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  const [currentStep, setCurrentStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

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

  const fetchAllTables = async () => {
    setAllTablesLoading(true)
    try {
      const res = await tableApi.getAll()
      setAllTables(res.data)
    } catch (err) {
      message.error('Không thể tải danh sách bàn')
    } finally {
      setAllTablesLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    fetchAllTables()
  }, [])

  useEffect(() => {
    if (modalOpen) {
      fetchMenu()
      fetchAllTables()
      setSelectedCategory('all')
      setFilterZone('all')
      setFilterTableCategory('all')
      setFilterCapacity('all')
      setSelectedTableId(null)
      setCurrentStep(0)
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
    if (submitting) return;
    setSubmitting(true)
    try {
      await form.validateFields()

      if (!selectedTableId) {
        message.warning('Vui lòng chọn bàn!')
        setSubmitting(false)
        return
      }

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
        setSubmitting(false)
        return
      }

      const selectedTable = allTables.find(t => t.id === selectedTableId)

      const payload = {
        tableId: selectedTable ? selectedTable.tableName : String(selectedTableId),
        items: parsedItems,
      }

      await orderApi.create(payload)
      await tableApi.updateStatus(selectedTableId, false)

      message.success('Tạo đơn hàng thành công')
      setModalOpen(false)
      form.resetFields()
      setSelectedTableId(null)
      fetchOrders()
      fetchAllTables()
    } catch (err) {
      console.error(err)
      message.error('Tạo đơn hàng thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateStatus = async (id, status) => {
    try {
      await orderApi.update(id, { status })

      if (status === 'COMPLETED' || status === 'CANCELLED') {
        const order = orders.find(o => o.id === id)
        if (order && order.tableId) {
          try {
            const matchedTable = allTables.find(t => t.tableName === order.tableId)
            if (matchedTable) {
              await tableApi.updateStatus(matchedTable.id, true)
            }
          } catch (e) {
            console.warn('Không thể trả bàn:', e)
          }
        }
      }

      message.success('Cập nhật trạng thái thành công')
      fetchOrders()
      fetchAllTables()
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

  // --- Bộ lọc bàn trong modal ---
  const filteredTablesForModal = useMemo(() => {
    return allTables.filter(t => {
      if (filterZone !== 'all' && t.zone !== filterZone) return false
      if (filterTableCategory !== 'all' && t.category !== filterTableCategory) return false
      if (filterCapacity !== 'all' && t.capacity < Number(filterCapacity)) return false
      return true
    })
  }, [allTables, filterZone, filterTableCategory, filterCapacity])

  // --- Danh sách zone, category, capacity duy nhất ---
  const uniqueZones = useMemo(() => [...new Set(allTables.map(t => t.zone))], [allTables])
  const uniqueCategories = useMemo(() => [...new Set(allTables.map(t => t.category))], [allTables])
  const uniqueCapacities = useMemo(() => [...new Set(allTables.map(t => t.capacity))].sort((a, b) => a - b), [allTables])

  // --- Nhóm bàn theo zone cho floor plan ---
  const tablesByZone = useMemo(() => {
    const grouped = {}
    allTables.forEach(t => {
      if (!grouped[t.zone]) grouped[t.zone] = []
      grouped[t.zone].push(t)
    })
    return grouped
  }, [allTables])

  // --- RENDER TABLE CELL (dùng chung cho floor plan và modal mini map) ---
  const renderTableCell = (table, isClickable = false, isSelected = false) => {
    const isAvailable = table.available
    const bgColor = isSelected ? '#1890ff'
      : isAvailable ? (ZONE_COLORS[table.zone] || '#1890ff')
        : '#d9d9d9'

    return (
      <Tooltip
        key={table.id}
        title={
          <div>
            <div><strong>{table.tableName}</strong></div>
            <div>{table.capacity} chỗ — {CATEGORY_LABELS[table.category] || table.category}</div>
            <div>{table.description}</div>
            <div>{isAvailable ? '✅ Còn trống' : '🔴 Đang sử dụng'}</div>
          </div>
        }
      >
        <div
          onClick={() => {
            if (isClickable && isAvailable) {
              setSelectedTableId(table.id)
              form.setFieldsValue({ tableId: table.id })
            }
          }}
          style={{
            width: 64,
            height: 52,
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 4,
            border: isSelected ? '2px solid #1890ff' : '1px solid #e8e8e8',
            borderRadius: 2,
            backgroundColor: isAvailable ? (isSelected ? '#e6f7ff' : '#fff') : '#f5f5f5',
            opacity: isAvailable ? 1 : 0.4,
            cursor: isClickable && isAvailable ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            boxShadow: isSelected ? '0 0 0 2px rgba(24,144,255,0.2)' : 'none',
          }}
        >
          <TableOutlined style={{ fontSize: 16, color: isAvailable ? bgColor : '#bfbfbf', marginBottom: 2 }} />
          <Text style={{ fontSize: 10, color: isAvailable ? '#333' : '#bfbfbf', lineHeight: 1 }}>{table.tableName}</Text>
          <Text style={{ fontSize: 9, color: isAvailable ? '#888' : '#bfbfbf', lineHeight: 1 }}>{table.capacity}p</Text>
        </div>
      </Tooltip>
    )
  }

  // --- RENDER FLOOR PLAN (phía trên Kanban board) ---
  const renderFloorPlan = () => {
    if (allTablesLoading) return <Spin />
    if (allTables.length === 0) return null

    return (
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <EnvironmentOutlined style={{ fontSize: 20, marginRight: 8, color: '#1890ff' }} />
            <Title level={4} style={{ margin: 0, marginRight: 16 }}>Sơ đồ nhà hàng</Title>
            <Space>
              <Tag color="green" style={{ borderRadius: 2 }}>{allTables.filter(t => t.available).length} trống</Tag>
              <Tag color="red" style={{ borderRadius: 2 }}>{allTables.filter(t => !t.available).length} đang dùng</Tag>
            </Space>
          </div>
          <Button size="small" icon={<ReloadOutlined />} onClick={fetchAllTables}>Cập nhật</Button>
        </div>
        <Card
          size="small"
          style={{ borderRadius: 2 }}
        >
          <Row gutter={[16, 16]}>
            {Object.entries(tablesByZone).map(([zone, zoneTables]) => (
              <Col key={zone} xs={24} sm={12} md={6}>
                <div style={{
                  border: `1px solid ${ZONE_COLORS[zone] || '#d9d9d9'}`,
                  borderRadius: 2,
                  padding: 8,
                  minHeight: 120,
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 8,
                    padding: '4px 8px',
                    background: `${ZONE_COLORS[zone]}10`,
                    borderRadius: 2,
                  }}>
                    <EnvironmentOutlined style={{ color: ZONE_COLORS[zone], marginRight: 6 }} />
                    <Text strong style={{ color: ZONE_COLORS[zone], fontSize: 13 }}>
                      {ZONE_LABELS[zone] || zone}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {zoneTables.map(table => renderTableCell(table, false, false))}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      </div>
    )
  }

  // --- RENDER ORDER CARD (KANBAN ITEM) ---
  const renderOrderCard = (order) => {
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
          <Text type="secondary">#{order.id}</Text>
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
        <div style={{ background: '#f5f5f5', borderRadius: 2, padding: 12, minHeight: '40vh', display: 'flex', flexDirection: 'column' }}>
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

  // --- RENDER MINI MAP TRONG MODAL ---
  const renderMiniMapInModal = () => {
    const grouped = {}
    filteredTablesForModal.forEach(t => {
      if (!grouped[t.zone]) grouped[t.zone] = []
      grouped[t.zone].push(t)
    })

    if (filteredTablesForModal.length === 0) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không tìm thấy bàn phù hợp" />
    }

    return (
      <div style={{ border: '1px solid #f0f0f0', borderRadius: 2, padding: 12, background: '#fafafa' }}>
        {Object.entries(grouped).map(([zone, zoneTables]) => (
          <div key={zone} style={{ marginBottom: 12 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 6,
              padding: '2px 8px',
              background: `${ZONE_COLORS[zone]}10`,
              borderRadius: 2,
            }}>
              <EnvironmentOutlined style={{ color: ZONE_COLORS[zone], marginRight: 6, fontSize: 12 }} />
              <Text strong style={{ color: ZONE_COLORS[zone], fontSize: 12 }}>
                {ZONE_LABELS[zone] || zone}
              </Text>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {zoneTables.map(table => renderTableCell(table, true, selectedTableId === table.id))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 24 }}>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => { fetchOrders(); fetchAllTables(); }} loading={loading}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Tạo đơn
          </Button>
        </Space>
      </div>

      {/* --- SƠ ĐỒ NHÀ HÀNG --- */}
      {renderFloorPlan()}

      {/* --- KANBAN BOARD --- */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
        <TableOutlined style={{ fontSize: 20, marginRight: 8, color: '#1890ff' }} />
        <Title level={4} style={{ margin: 0 }}>Quản lý đơn hàng</Title>
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
                      <Text>{item.itemName} <Text type="secondary">x {item.quantity}</Text></Text>
                      <Text strong>{(item.quantity * (item.unitPrice || 0)).toLocaleString('vi-VN')} đ</Text>
                    </div>
                  </List.Item>
                )}
              />
            </Spin>
            <Divider dashed />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fffbe6', padding: '12px 16px', borderRadius: 2, border: '1px solid #ffe58f' }}>
              <Title level={4} style={{ margin: 0 }}>Tổng cộng:</Title>
              <Title level={3} type="danger" style={{ margin: 0 }}>
                {calculateFinalPrice().toLocaleString('vi-VN')} đ
              </Title>
            </div>
          </div>
        )}
      </Modal>

      {/* --- MODAL TẠO ĐƠN (WIZARD) --- */}
      <Modal
        title={
          <div style={{ marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0, marginBottom: 16 }}>Tạo đơn hàng mới</Title>
            <Steps
              current={currentStep}
              size="small"
              items={[
                { title: 'Chọn bàn', icon: <TableOutlined /> },
                { title: 'Chọn món', icon: <PlusOutlined /> },
                { title: 'Chốt đơn', icon: <CheckCircleOutlined /> },
              ]}
            />
          </div>
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          form.resetFields()
          setSelectedTableId(null)
          setCurrentStep(0)
        }}
        width={800}
        footer={[
          currentStep > 0 && (
            <Button key="back" onClick={() => setCurrentStep(currentStep - 1)}>
              Quay lại
            </Button>
          ),
          currentStep < 2 ? (
            <Button
              key="next"
              type="primary"
              onClick={() => {
                if (currentStep === 0 && !selectedTableId) {
                  message.warning('Vui lòng chọn bàn!')
                  return
                }
                if (currentStep === 1 && Object.keys(cart).length === 0) {
                  message.warning('Vui lòng chọn ít nhất 1 món!')
                  return
                }
                setCurrentStep(currentStep + 1)
              }}
            >
              Tiếp tục
            </Button>
          ) : (
            <Button
              key="submit"
              type="primary"
              onClick={handleCreate}
              loading={submitting}
              disabled={submitting}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Xác nhận & Đặt món
            </Button>
          ),
        ]}
      >
        <div style={{ minHeight: 400, marginTop: 24 }}>
          {/* STEP 1: CHỌN BÀN */}
          {currentStep === 0 && (
            <Form form={form} layout="vertical">
              <Divider orientation="left" style={{ marginTop: 0 }}>
                <Space><EnvironmentOutlined /> Khu vực & Loại bàn</Space>
              </Divider>

              <Row gutter={12} style={{ marginBottom: 12 }}>
                <Col span={8}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Khu vực</Text>
                  <Select
                    value={filterZone}
                    onChange={(v) => { setFilterZone(v); setSelectedTableId(null); }}
                    style={{ width: '100%' }}
                    options={[
                      { value: 'all', label: 'Tất cả khu vực' },
                      ...uniqueZones.map(z => ({ value: z, label: ZONE_LABELS[z] || z }))
                    ]}
                  />
                </Col>
                <Col span={8}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Loại bàn</Text>
                  <Select
                    value={filterTableCategory}
                    onChange={(v) => { setFilterTableCategory(v); setSelectedTableId(null); }}
                    style={{ width: '100%' }}
                    options={[
                      { value: 'all', label: 'Tất cả loại' },
                      ...uniqueCategories.map(c => ({ value: c, label: CATEGORY_LABELS[c] || c }))
                    ]}
                  />
                </Col>
                <Col span={8}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Số chỗ tối thiểu</Text>
                  <Select
                    value={filterCapacity}
                    onChange={(v) => { setFilterCapacity(v); setSelectedTableId(null); }}
                    style={{ width: '100%' }}
                    options={[
                      { value: 'all', label: 'Tất cả' },
                      ...uniqueCapacities.map(c => ({ value: String(c), label: `${c}+ chỗ` }))
                    ]}
                  />
                </Col>
              </Row>

              <div style={{ marginBottom: 16 }}>
                <Text strong>Sơ đồ chọn bàn (Click vào bàn trống):</Text>
                <div style={{ marginTop: 12, maxHeight: 250, overflowY: 'auto' }}>
                  {renderMiniMapInModal()}
                </div>
              </div>

              {selectedTableId && (() => {
                const t = allTables.find(x => x.id === selectedTableId)
                return t ? (
                  <div style={{ padding: '12px 16px', background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space size="large">
                      <Space><TableOutlined style={{ color: '#1890ff' }} /><Text strong>{t.tableName}</Text></Space>
                      <Tag color="blue">{ZONE_LABELS[t.zone] || t.zone}</Tag>
                      <Tag><TeamOutlined /> {t.capacity} chỗ</Tag>
                    </Space>
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                  </div>
                ) : null
              })()}

              <Form.Item name="tableId" hidden rules={[{ required: true, message: 'Vui lòng chọn bàn!' }]}>
                <input />
              </Form.Item>
            </Form>
          )}

          {/* STEP 2: CHỌN MÓN */}
          {currentStep === 1 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
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

              <div style={{ height: 350, overflowY: 'auto', border: '1px solid #f0f0f0', borderRadius: 2, padding: 8 }}>
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
                          transition: 'all 0.2s ease',
                          padding: '8px 12px'
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
                              <span>{item.name}</span>
                              <Text type="success" strong>{item.price.toLocaleString('vi-VN')} đ</Text>
                            </div>
                          }
                          description={
                            <Space split={<Divider type="vertical" />}>
                              <Text type="secondary" style={{ fontSize: 12 }}>{item.description}</Text>
                              <Tag color={((item.quantity || 0) - qty) <= 5 ? 'volcano' : 'green'} style={{ fontSize: 11 }}>
                                Còn {(item.quantity || 0) - qty}
                              </Tag>
                            </Space>
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
                          {itemName} <Text strong type="danger">x {cart[itemName]}</Text>
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
            </div>
          )}

          {/* STEP 3: XÁC NHẬN */}
          {currentStep === 2 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                <Title level={4} style={{ marginTop: 16 }}>Kiểm tra lại thông tin</Title>
              </div>

              <Row gutter={24}>
                <Col span={10}>
                  <Card title="Thông tin bàn" size="small" style={{ borderRadius: 2 }}>
                    {(() => {
                      const t = allTables.find(x => x.id === selectedTableId)
                      return t ? (
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text type="secondary">Tên bàn:</Text>
                            <Text strong>{t.tableName}</Text>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text type="secondary">Khu vực:</Text>
                            <Tag color="blue">{ZONE_LABELS[t.zone] || t.zone}</Tag>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text type="secondary">Sức chứa:</Text>
                            <Text>{t.capacity} khách</Text>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text type="secondary">Loại:</Text>
                            <Text>{CATEGORY_LABELS[t.category] || t.category}</Text>
                          </div>
                        </Space>
                      ) : null
                    })()}
                  </Card>
                </Col>
                <Col span={14}>
                  <Card title="Danh sách món ăn" size="small" style={{ borderRadius: 2 }}>
                    <List
                      size="small"
                      dataSource={Object.keys(cart)}
                      renderItem={itemName => {
                        const item = menu.find(m => m.name === itemName)
                        return (
                          <List.Item style={{ padding: '8px 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                              <Text>{itemName} <Text type="secondary">x {cart[itemName]}</Text></Text>
                              <Text strong>{(cart[itemName] * (item?.price || 0)).toLocaleString('vi-VN')} đ</Text>
                            </div>
                          </List.Item>
                        )
                      }}
                    />
                    <Divider style={{ margin: '12px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong style={{ fontSize: 16 }}>Tổng cộng:</Text>
                      <Text strong type="danger" style={{ fontSize: 20 }}>
                        {calculateTotal().toLocaleString('vi-VN')} đ
                      </Text>
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default OrderPage




