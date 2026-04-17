import React, { useState, useEffect } from 'react';
import { Modal, Button, Typography, Table, Spin, message } from 'antd';
import { QrcodeOutlined } from '@ant-design/icons';
import { paymentApi } from '../services/api';


const { Title, Text } = Typography;

const InvoiceModal = ({ open, orderId, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);

    useEffect(() => {
        if (open && orderId) {
            fetchInvoice();
        } else {
            setInvoiceData(null);
        }
    }, [open, orderId]);

    const fetchInvoice = async () => {
        setLoading(true);
        try {
            const res = await paymentApi.createInvoice(orderId);
            setInvoiceData(res.data);
        } catch (error) {
            console.error("Lỗi xuất hóa đơn:", error);
            message.error("Có lỗi xảy ra khi tạo hóa đơn vui lòng thử lại!");
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Tên Món',
            dataIndex: 'itemName',
            key: 'itemName',
        },
        {
            title: 'SL',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',
            width: 60,
        },
        {
            title: 'Đơn giá',
            dataIndex: 'unitPrice',
            key: 'unitPrice',
            align: 'right',
            render: (val) => `${val.toLocaleString()} đ`
        },
        {
            title: 'Thành tiền',
            key: 'total',
            align: 'right',
            render: (_, record) => `${(record.quantity * record.unitPrice).toLocaleString()} đ`
        }
    ];

    return (
        <Modal
            title={<Title level={3} style={{ textAlign: 'center', margin: 0 }}>HÓA ĐƠN THANH TOÁN</Title>}
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="close" type="primary" onClick={onClose} style={{ width: '100%' }}>
                    Đóng ({loading ? 'Đang tạo...' : 'Đang chờ xác nhận'})
                </Button>
            ]}
            centered
            width={450}
        >
            {loading || !invoiceData ? (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: 10 }}>Đang tạo hóa đơn và mã QR...</p>
                </div>
            ) : (
                <div style={{ marginTop: 20 }}>
                    <div style={{ marginBottom: 15 }}>
                        <Text strong>Mã đơn hàng:</Text> DH{invoiceData.orderId} <br/>
                        <Text strong>Bàn:</Text> {invoiceData.tableId} <br/>
                        <Text strong>Nhân viên/Khách:</Text> {invoiceData.userName} <br/>
                    </div>
                    
                    <Table 
                        dataSource={invoiceData.items} 
                        columns={columns} 
                        pagination={false}
                        size="small"
                        rowKey="id"
                    />

                    <div style={{ marginTop: 20, textAlign: 'right' }}>
                        <div><Text>Tổng cộng:</Text> {invoiceData.totalPrice.toLocaleString()} đ</div>
                        <div><Text>Thuế VAT ({invoiceData.taxRate}%):</Text> {invoiceData.taxAmount.toLocaleString()} đ</div>
                        <div style={{ marginTop: 10 }}>
                            <Title level={4} type="danger" style={{ margin: 0 }}>
                                THÀNH TIỀN: {invoiceData.finalPrice.toLocaleString()} đ
                            </Title>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 30, padding: 15, border: '1px dashed #ccc', borderRadius: 8 }}>
                        <Title level={5}><QrcodeOutlined /> Quét mã để thanh toán</Title>
                        <img 
                            src={invoiceData.qrUrl} 
                            alt="Mã QR Thanh Toán" 
                            style={{ width: '200px', height: '200px', objectFit: 'contain' }}
                        />
                        <div style={{ marginTop: 10 }}>
                            <Text type="secondary">Nội dung chuyển khoản tự động:</Text><br/>
                            <Text strong>Thanh toan DH{invoiceData.orderId}</Text>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default InvoiceModal;
