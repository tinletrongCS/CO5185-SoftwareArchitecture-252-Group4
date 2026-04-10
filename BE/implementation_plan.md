# Tạo Inventory Service

Tạo một Spring Boot microservice mới (`inventory_service`) chạy ở port **8084**, quản lý danh sách món ăn (menu) cho nhà hàng. Service này cung cấp API để khách hàng xem menu, và các thao tác CRUD cho admin.

## Proposed Changes

### 1. Tạo mới `inventory_service` (Spring Boot project)

Cấu trúc thư mục sẽ giống hệt `ordering_service`:

```
BE/inventory_service/
├── pom.xml
├── Dockerfile
├── mvnw / mvnw.cmd
├── src/main/java/com/irms/inventory_service/
│   ├── InventoryServiceApplication.java
│   ├── entity/
│   │   └── InventoryItem.java           [NEW] Bảng inventory
│   ├── repository/
│   │   └── InventoryRepository.java     [NEW]
│   ├── dto/
│   │   ├── InventoryItemRequestDTO.java  [NEW]
│   │   └── InventoryItemResponseDTO.java [NEW]
│   ├── service/
│   │   ├── InventoryService.java         [NEW] Interface
│   │   └── InventoryServiceImpl.java     [NEW]
│   └── controller/
│       └── InventoryController.java      [NEW]
└── src/main/resources/
    └── application.properties
```

### 2. Entity `InventoryItem`

| Column | Type | Ghi chú |
|--------|------|---------|
| `id` | Long (PK, auto-increment) | |
| `name` | String | Tên món |
| `category` | String | Ví dụ: `do_nuoc`, `mon_kho`, `trang_miem`, `khai_vi` |
| `description` | String | Mô tả món |
| `price` | Float | Giá |
| `quantity` | Integer | Số lượng còn lại |
| `available` | Boolean | Có thể đặt không |
| `imageUrl` | String | Ảnh minh họa |

### 3. APIs

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/inventory/menu` | Lấy toàn bộ menu (chỉ items available) | Public |
| `GET` | `/api/inventory/menu/{category}` | Lọc menu theo category | Public |
| `GET` | `/api/inventory/items` | Lấy tất cả items (kể cả unavailable) | Admin |
| `GET` | `/api/inventory/items/{id}` | Lấy 1 item theo ID | Public |
| `POST` | `/api/inventory/items` | Thêm item mới | Admin |
| `PUT` | `/api/inventory/items/{id}` | Cập nhật item | Admin |
| `DELETE` | `/api/inventory/items/{id}` | Xóa item | Admin |
| `PATCH` | `/api/inventory/items/{id}/quantity` | Cập nhật số lượng (dùng cho ordering-service gọi khi đặt món) | Internal |

### 4. Cập nhật `docker-compose.yml`

Thêm service `inventory-service` chạy port 8084.

### 5. Gateway đã được cấu hình sẵn

Gateway đã có route:
```yaml
- id: inventory-service
  uri: http://inventory-service:8084
  predicates:
    - Path=/inventory/**
  filters:
    - StripPrefix=1
```

## Open Questions

> [!IMPORTANT]
> **Database**: Có dùng cùng Supabase PostgreSQL như ordering-service không, hay muốn một DB riêng?

> [!NOTE]
> **RabbitMQ**: Inventory service có cần tích hợp RabbitMQ để notify khi hết hàng không? Hiện tại plan là không tích hợp (chỉ REST API thuần).

## Verification Plan

- Build project với `mvnw spring-boot:run`
- Test các API với Postman / curl
- Kiểm tra gateway routing `/inventory/**`
