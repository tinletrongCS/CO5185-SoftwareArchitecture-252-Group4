package com.irms.ordering_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
