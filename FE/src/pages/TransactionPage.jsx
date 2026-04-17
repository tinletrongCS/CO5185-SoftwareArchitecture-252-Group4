import React, { useState, useEffect } from 'react';
import { Table, Typography, Tag, Spin } from 'antd';
import { paymentApi } from '../services/api';

const { Title, Text } = Typography;

const TransactionPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await paymentApi.getTransactions();
            // Sort by receivedAt descending
            const sortedData = res.data.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));
            setTransactions(sortedData);
        } catch (error) {
            console.error("Lỗi khi lấy giao dịch", error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Mã GD SePAY',
            dataIndex: 'sepayTransactionId',
            key: 'sepayTransactionId',
            render: (text) => <strong>{text}</strong>
        },
        {
            title: 'Đơn Hàng',
            dataIndex: 'orderId',
            key: 'orderId',
            render: (text) => text ? <Tag color="blue">DH{text}</Tag> : <Text type="secondary">N/A</Text>
        },
        {
            title: 'Ngân hàng',
            dataIndex: 'gateway',
            key: 'gateway',
        },
        {
            title: 'Tài khoản',
            dataIndex: 'accountNumber',
            key: 'accountNumber',
        },
        {
            title: 'Số tiền VÀO',
            dataIndex: 'amountIn',
            key: 'amountIn',
            render: (val) => val > 0 ? <span style={{color: 'green', fontWeight: 'bold'}}>+{val.toLocaleString()}</span> : '-'
        },
        {
            title: 'Nội dung CK',
            dataIndex: 'content',
            key: 'content',
        },
        {
            title: 'Thời gian NH',
            dataIndex: 'transactionDate',
            key: 'transactionDate',
        },
        {
            title: 'Thời gian nhận (Hệ thống)',
            dataIndex: 'receivedAt',
            key: 'receivedAt',
            render: (val) => new Date(val).toLocaleString()
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <Title level={2}>Lịch sử giao dịch (SePAY)</Title>
            <Table 
                columns={columns} 
                dataSource={transactions} 
                rowKey="id" 
                loading={loading}
                bordered
            />
        </div>
    );
};

export default TransactionPage;
