package com.irms.inventory_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "reserve_table")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "table_name", nullable = false)
    private String tableName;

    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    @Column(name = "category", nullable = false)
    private String category;

    @Column(name = "zone", nullable = false)
    private String zone;

    @Column(name = "position_x")
    private Integer positionX;

    @Column(name = "position_y")
    private Integer positionY;

    @Column(name = "available", nullable = false)
    private Boolean available = true;

    @Column(name = "description")
    private String description;
}
