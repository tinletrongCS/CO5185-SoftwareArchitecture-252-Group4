/* eslint-disable */
import { useEffect, useState } from 'react'
import {
  List,
  Typography,
  Card,
  Tag,
  Space,
  Radio,
  Spin,
  message,
  Divider,
  Empty
} from 'antd'
import { inventoryApi } from '../services/api'

const { Title, Text } = Typography

const CATEGORY_LABELS = {
  mon_kho: 'Món khô',
  do_nuoc: 'Món nước',
  do_uong: 'Đồ uống',
  trang_mieng: 'Tráng miệng',
}

function MenuView() {
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const fetchMenu = async () => {
    setLoading(true)
    try {
      const res = await inventoryApi.getMenu()
      setMenu(res.data)
    } catch (err) {
      message.error('Không thể tải menu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenu()
  }, [])

  const filteredMenu = selectedCategory === 'all'
    ? menu
    : menu.filter(item => item.category === selectedCategory)

  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={2}>Thực Đơn Nhà Hàng</Title>
        <Text type="secondary">Chào mừng bạn đến với IRMS. Chúc bạn có một bữa ăn ngon miệng!</Text>
      </div>

      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
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

      <Spin spinning={loading}>
        {filteredMenu.length === 0 && !loading ? (
          <Empty description="Hiện tại không có món ăn nào trong danh mục này" />
        ) : (
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 2,
              md: 3,
              lg: 3,
              xl: 4,
              xxl: 4,
            }}
            dataSource={filteredMenu}
            renderItem={(item) => {
              const isUnavailable = !item.available || item.quantity <= 0;
              return (
                <List.Item>
                  <Card
                    hoverable={!isUnavailable}
                    cover={
                      <div style={{ 
                        height: 180, 
                        background: item.imageUrl ? `url(${item.imageUrl}) center/cover` : '#f0f2f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 0,
                        filter: isUnavailable ? 'grayscale(100%)' : 'none',
                        position: 'relative'
                      }}>
                        {!item.imageUrl && <Text type="secondary">Chưa có ảnh</Text>}
                        {isUnavailable && (
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(255, 255, 255, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Tag color="default" style={{ fontSize: 14, padding: '4px 12px', fontWeight: 'bold', borderRadius: 2 }}>
                              {!item.available ? 'NGƯNG PHỤC VỤ' : 'TẠM HẾT MÓN'}
                            </Tag>
                          </div>
                        )}
                      </div>
                    }
                    style={{ 
                      borderRadius: 2, 
                      overflow: 'hidden', 
                      opacity: isUnavailable ? 0.6 : 1,
                      cursor: isUnavailable ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Card.Meta
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 16, color: isUnavailable ? 'rgba(0,0,0,0.45)' : 'inherit' }}>
                            {item.name}
                          </span>
                        </div>
                      }
                      description={
                        <div style={{ marginTop: 8 }}>
                          <div style={{ height: 40, marginBottom: 8, color: 'rgba(0, 0, 0, 0.45)' }} className="line-clamp-2">
                            {item.description}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong type={isUnavailable ? 'secondary' : 'success'} style={{ fontSize: 18 }}>
                              {item.price.toLocaleString('vi-VN')} đ
                            </Text>
                            <Tag color={isUnavailable ? 'default' : 'blue'}>
                              {CATEGORY_LABELS[item.category] || item.category}
                            </Tag>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </List.Item>
              );
            }}
          />
        )}
      </Spin>
    </div>
  )
}

export default MenuView
