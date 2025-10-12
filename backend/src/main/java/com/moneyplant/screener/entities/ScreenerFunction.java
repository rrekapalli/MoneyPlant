package com.moneyplant.screener.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA entity for the screener_functions table.
 * Represents functions available for use in screener criteria with SQL templates.
 */
@Entity
@Table(name = "screener_functions", 
       indexes = {
           @Index(name = "idx_screener_functions_category", columnList = "category"),
           @Index(name = "idx_screener_functions_is_active", columnList = "is_active")
       })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class ScreenerFunction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "function_id")
    private Long functionId;

    @Column(name = "function_name", nullable = false, unique = true, length = 100)
    private String functionName;

    @Column(name = "display_name", nullable = false, length = 200)
    private String displayName;

    @Column(name = "sql_template", nullable = false, columnDefinition = "text")
    private String sqlTemplate;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "examples", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Object examples;

    @Column(name = "return_type", nullable = false, length = 50)
    private String returnType;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "sort_order")
    private Integer sortOrder;

    // Relationships
    @OneToMany(mappedBy = "screenerFunction", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("paramOrder ASC")
    @Builder.Default
    private List<ScreenerFunctionParam> parameters = new ArrayList<>();

    // Audit fields
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}