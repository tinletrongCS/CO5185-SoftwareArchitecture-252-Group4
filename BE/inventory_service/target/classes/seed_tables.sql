-- =============================================
-- SEED DATA: reserve_table
-- Chạy script này trên Supabase SQL Editor
-- =============================================

-- Xóa dữ liệu cũ (nếu có)
-- DELETE FROM reserve_table;

INSERT INTO reserve_table (table_name, capacity, category, zone, position_x, position_y, available, description) VALUES
-- ========== KHU VỰC TRONG NHÀ (Indoor) ==========
-- Hàng 1: Bàn đôi cặp cửa sổ
('A1', 2, 'Couple', 'Indoor', 1, 1, TRUE, 'Cạnh cửa sổ, view đẹp'),
('A2', 2, 'Couple', 'Indoor', 2, 1, TRUE, 'Cạnh cửa sổ'),
('A3', 2, 'Couple', 'Indoor', 3, 1, TRUE, 'Cạnh cửa sổ'),
-- Hàng 2: Bàn 4 người trung tâm
('B1', 4, 'Standard', 'Indoor', 1, 2, TRUE, 'Trung tâm nhà hàng'),
('B2', 4, 'Standard', 'Indoor', 2, 2, TRUE, 'Trung tâm nhà hàng'),
('B3', 4, 'Standard', 'Indoor', 3, 2, TRUE, 'Trung tâm nhà hàng'),
-- Hàng 3: Bàn gia đình
('C1', 8, 'Family', 'Indoor', 1, 3, TRUE, 'Góc rộng, bàn tròn lớn'),
('C2', 10, 'Family', 'Indoor', 2, 3, TRUE, 'Bàn lớn nhất trong nhà'),

-- ========== KHU VỰC NGOÀI TRỜI (Outdoor) ==========
('D1', 2, 'Couple', 'Outdoor', 5, 1, TRUE, 'View phố, có ô che'),
('D2', 2, 'Couple', 'Outdoor', 6, 1, TRUE, 'View phố, có ô che'),
('D3', 4, 'Standard', 'Outdoor', 5, 2, TRUE, 'Gần hồ cá'),
('D4', 4, 'Standard', 'Outdoor', 6, 2, TRUE, 'Gần hồ cá'),
('D5', 6, 'Family', 'Outdoor', 5, 3, TRUE, 'Bàn dài, thoáng mát'),

-- ========== KHU VỰC VIP (Private) ==========
('VIP 01', 4, 'VIP', 'Private', 8, 1, TRUE, 'Phòng riêng, máy lạnh, tivi'),
('VIP 02', 6, 'VIP', 'Private', 9, 1, TRUE, 'Phòng riêng cao cấp'),
('VIP 03', 8, 'VIP', 'Private', 8, 2, TRUE, 'Phòng riêng VIP, karaoke'),
('VIP 04', 12, 'VIP', 'Private', 9, 2, TRUE, 'Phòng tiệc VIP lớn'),

-- ========== KHU VỰC BAN CÔNG (Terrace) ==========
('T1', 2, 'Couple', 'Terrace', 11, 1, TRUE, 'Lãng mạn, view thành phố'),
('T2', 2, 'Couple', 'Terrace', 12, 1, TRUE, 'Gió mát, yên tĩnh'),
('T3', 4, 'Standard', 'Terrace', 11, 2, TRUE, 'Ban công tầng 2');
