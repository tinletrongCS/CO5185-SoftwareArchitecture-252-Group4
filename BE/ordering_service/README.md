
## 🛠 Công nghệ sử dụng (Tech Stack)

* **Ngôn ngữ:** Java (JDK 25)
* **Framework:** Spring Boot 4.0.5
* **Quản lý thư viện:** Maven

---

## 📂 Cấu trúc dự án (Project Structure)

Dự án áp dụng kiến trúc 4 tầng riêng biệt để đảm bảo tính module hóa và dễ bảo trì:

```text
src/main/java/com/irms/orderingservice/
│
├── presentation/      # Tầng 1: Chứa các REST Controller tiếp nhận HTTP Request từ API Gateway/Tablet.
├── service/           # Tầng 2: Chứa Business Logic (Quy tắc nghiệp vụ của hệ thống).
├── persistence/       # Tầng 3: Chứa các Interface giao tiếp dữ liệu (Repository) và DTOs.
├── database/          # Tầng 4: Chứa các Entity (JPA) và triển khai kết nối Database thực tế.
│
└── OrderingServiceApplication.java  # File khởi chạy chính của Spring Boot
```

## Chạy source
./mvnw spring-boot:run

---

## 📖 Ví dụ: Viết API và sử dụng ORM (Spring Data JPA)

Luồng dữ liệu của một API request đi qua 4 tầng:

```
Client (HTTP Request)
  → presentation/ (Controller)   Nhận request, trả response
  → service/ (Service)           Xử lý logic nghiệp vụ
  → persistence/ (Repository)    Giao tiếp với database qua ORM
  → database/ (Entity)           Đại diện cho bảng trong database
```

### Tầng 4 — Entity (Đại diện bảng `orders` trong DB)

```java
// database/OrderEntity.java
@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "table_id", nullable = false)
    private String tableId;

    @Column(name = "items_list", nullable = false, columnDefinition = "TEXT")
    private String itemsList;

    @Column(name = "status", nullable = false)
    private String status;
}
```

**Giải thích annotation:**
- `@Entity` — Đánh dấu class này một bảng trong database
- `@Table(name = "orders")` — Tên bảng trong DB là `orders`
- `@Id` — Đánh dấu field là primary key
- `@GeneratedValue(strategy = GenerationType.IDENTITY)` — DB tự tăng giá trị id
- `@Column` — Tùy chỉnh tên cột và ràng buộc (nullable, columnDefinition)
- `@Data` (Lombok) — Tự sinh getter, setter, toString, equals, hashCode

---

### Tầng 3 — Repository (Giao tiếp DB bằng ORM)

```java
// persistence/OrderRepository.java
@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    // Spring Data JPA tự sinh query từ tên method
    List<OrderEntity> findByStatus(String status);

    List<OrderEntity> findByTableId(String tableId);

    // Viết query JPQL thủ công
    @Query("SELECT o FROM OrderEntity o WHERE o.tableId = :tableId AND o.status = :status")
    List<OrderEntity> findByTableIdAndStatus(@Param("tableId") String tableId,
                                              @Param("status") String status);

    @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.status = :status")
    long countByStatus(@Param("status") String status);
}
```

**Giải thích:**
- `JpaRepository<OrderEntity, Long>` — Kế thừa JpaRepository sẽ có sẵn các method: `findAll()`, `findById()`, `save()`, `deleteById()`, `count()`, v.v.
- `findByStatus(String status)` — Spring Data tự sinh query `SELECT * FROM orders WHERE status = ?`
- `findByTableId(String tableId)` — Tương tự, tự sinh query theo tên method
- `@Query` — Viết JPQL (giống SQL nhưng dùng tên Entity thay tên bảng)

---

### Tầng 3 — DTO (Định dạng dữ liệu request/response)

```java
// persistence/OrderRequestDTO.java — Dữ liệu nhận từ client
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequestDTO {
    private String tableId;
    private String items;
}
```

```java
// persistence/OrderResponseDTO.java — Dữ liệu trả về cho client
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDTO {
    private Long id;
    private String tableId;
    private String items;
    private String status;
}
```

**Tại sao dùng DTO thay vì trả trực tiếp Entity?**
- Ẩn các field nhạy cảm hoặc không cần thiết khỏi response
- Tách biệt format dữ liệu giữa client và database
- Kiểm soát dữ liệu client gửi lên (chỉ nhận field cần thiết)

---

### Tầng 2 — Service (Business Logic)

```java
// service/OrderService.java — Interface định nghĩa các method
public interface OrderService {

    OrderResponseDTO placeOrder(OrderRequestDTO orderRequestDTO);

    List<OrderResponseDTO> getAllOrders();

    OrderResponseDTO getOrderById(Long id);

    List<OrderResponseDTO> getOrdersByStatus(String status);

    OrderResponseDTO updateOrderStatus(Long id, String status);

    void deleteOrder(Long id);
}
```

```java
// service/OrderServiceImpl.java — Triển khai logic
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;

    // Tạo đơn hàng mới
    @Override
    public OrderResponseDTO placeOrder(OrderRequestDTO dto) {
        OrderEntity order = new OrderEntity();
        order.setTableId(dto.getTableId());
        order.setItemsList(dto.getItems());
        order.setStatus("PENDING");

        OrderEntity saved = orderRepository.save(order); // INSERT INTO orders
        return toResponseDTO(saved);
    }

    // Lấy tất cả đơn hàng
    @Override
    public List<OrderResponseDTO> getAllOrders() {
        return orderRepository.findAll()   // SELECT * FROM orders
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // Lấy đơn hàng theo ID
    @Override
    public OrderResponseDTO getOrderById(Long id) {
        OrderEntity order = orderRepository.findById(id)  // SELECT * FROM orders WHERE id = ?
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        return toResponseDTO(order);
    }

    // Lấy đơn hàng theo status (dùng custom query trong Repository)
    @Override
    public List<OrderResponseDTO> getOrdersByStatus(String status) {
        return orderRepository.findByStatus(status)  // SELECT * FROM orders WHERE status = ?
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // Cập nhật trạng thái đơn hàng
    @Override
    public OrderResponseDTO updateOrderStatus(Long id, String status) {
        OrderEntity order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        order.setStatus(status);

        OrderEntity updated = orderRepository.save(order); // UPDATE orders SET status = ? WHERE id = ?
        return toResponseDTO(updated);
    }

    // Xóa đơn hàng
    @Override
    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);  // DELETE FROM orders WHERE id = ?
    }

    // Helper: chuyển Entity → ResponseDTO
    private OrderResponseDTO toResponseDTO(OrderEntity entity) {
        return new OrderResponseDTO(
                entity.getId(),
                entity.getTableId(),
                entity.getItemsList(),
                entity.getStatus()
        );
    }
}
```

**Giải thích:**
- `@Service` — Đánh dấu class này là Spring Bean tầng service
- `@RequiredArgsConstructor` (Lombok) — Tự sinh constructor với các `final` field (Dependency Injection)
- `orderRepository.save()` — Nếu entity có id = null → INSERT, ngược lại → UPDATE
- `orderRepository.findById()` — Trả về `Optional<OrderEntity>`, dùng `orElseThrow()` để xử lý khi không tìm thấy

---

### Tầng 1 — Controller (REST API)

```java
// presentation/OrderController.java
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // POST /api/orders — Tạo đơn hàng mới
    @PostMapping
    public ResponseEntity<OrderResponseDTO> createOrder(@RequestBody OrderRequestDTO dto) {
        OrderResponseDTO order = orderService.placeOrder(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    // GET /api/orders — Lấy tất cả đơn hàng
    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // GET /api/orders/5 — Lấy đơn hàng theo id
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    // GET /api/orders/status?value=PENDING — Lấy đơn hàng theo status
    @GetMapping("/status")
    public ResponseEntity<List<OrderResponseDTO>> getOrdersByStatus(@RequestParam String value) {
        return ResponseEntity.ok(orderService.getOrdersByStatus(value));
    }

    // PUT /api/orders/5/status — Cập nhật trạng thái
    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponseDTO> updateStatus(@PathVariable Long id,
                                                          @RequestParam String value) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, value));
    }

    // DELETE /api/orders/5 — Xóa đơn hàng
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}
```

**Giải thích annotation:**
- `@RestController` = `@Controller` + `@ResponseBody` — Tự chuyển object trả về thành JSON
- `@RequestMapping("/api/orders")` — Đường dẫn gốc cho tất cả endpoint trong controller
- `@PostMapping` / `@GetMapping` / `@PutMapping` / `@DeleteMapping` — Mapping HTTP method
- `@RequestBody` — Tự chuyển JSON request body thành Java object (DTO)
- `@PathVariable` — Lấy giá trị từ URL path (ví dụ: `/orders/{id}` → `id = 5`)
- `@RequestParam` — Lấy giá trị từ query string (ví dụ: `/orders/status?value=PENDING` → `value = "PENDING"`)
- `ResponseEntity` — Kiểm soát HTTP status code và body của response

---

### Tóm tắt: ORM giúp gì?

| Thao tác SQL | Cách dùng ORM (Spring Data JPA) |
|---|---|
| `SELECT * FROM orders` | `orderRepository.findAll()` |
| `SELECT * FROM orders WHERE id = ?` | `orderRepository.findById(id)` |
| `SELECT * FROM orders WHERE status = ?` | `orderRepository.findByStatus(status)` |
| `INSERT INTO orders (...) VALUES (...)` | `orderRepository.save(newEntity)` |
| `UPDATE orders SET ... WHERE id = ?` | `orderRepository.save(existingEntity)` |
| `DELETE FROM orders WHERE id = ?` | `orderRepository.deleteById(id)` |

ORM tự động sinh SQL từ Java code — không cần viết SQL thủ công.
