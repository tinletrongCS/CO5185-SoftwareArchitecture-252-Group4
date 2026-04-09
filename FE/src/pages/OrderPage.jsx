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
} from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { orderApi } from '../services/api'

const { Title } = Typography

const STATUS_COLORS = {
  PENDING: 'orange',
  PREPARING: 'blue',
  READY: 'green',
  COMPLETED: 'default',
  CANCELLED: 'red',
}

function OrderPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

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

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      
      let parsedItems = []
      if (typeof values.items === 'string') {
        parsedItems = values.items.split(',').map(str => {
          const parts = str.trim().split(/ x| X/)
          const itemName = parts[0]
          const quantity = parts.length > 1 ? parseInt(parts[1], 10) : 1
          return { itemName, quantity: isNaN(quantity) ? 1 : quantity }
        }).filter(item => item.itemName)
      } else {
        parsedItems = values.items
      }

      await orderApi.create({ ...values, items: parsedItems })
      message.success('Tạo đơn hàng thành công')
      setModalOpen(false)
      form.resetFields()
      fetchOrders()
    } catch {
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

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
    },
    {
      title: 'Bàn',
      dataIndex: 'tableId',
      width: 80,
    },
    {
      title: 'Món ăn',
      dataIndex: 'items',
      render: (items) => {
        if (!Array.isArray(items)) return String(items);
        return (
          <Space wrap size={[0, 4]}>
            {items.map((item, idx) => (
              <Tag key={idx} color="blue">{item.itemName} x{item.quantity}</Tag>
            ))}
          </Space>
        );
      }
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
      width: 280,
      render: (_, record) => (
        <Space size="small">
          <Select
            size="small"
            value={record.status}
            style={{ width: 130 }}
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

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Title level={3} style={{ margin: 0 }}>
            Quản lý Đơn hàng
          </Title>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchOrders}
              loading={loading}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalOpen(true)}
            >
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

      <Modal
        title="Tạo đơn hàng mới"
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => {
          setModalOpen(false)
          form.resetFields()
        }}
        okText="Tạo"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="tableId"
            label="Số bàn"
            rules={[{ required: true, message: 'Nhập số bàn' }]}
          >
            <Input placeholder="VD: A1, B2" />
          </Form.Item>
          <Form.Item
            name="items"
            label="Món ăn"
            rules={[{ required: true, message: 'Nhập món ăn' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="VD: Phở bò x2, Cà phê sữa x1"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default OrderPage
