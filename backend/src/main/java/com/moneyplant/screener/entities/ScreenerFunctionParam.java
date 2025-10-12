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

/**
 * JPA entity for the screener_function_params table.
 * Represents parameters for screener functions with validation rules and help text.
 */
@Entity
@Table(name = "screener_function_params",
       indexes = {
           @Index(name = "idx_screener_function_params_function_id", columnList = "function_id"),
           @Index(name = "idx_screener_function_params_param_order", columnList = "function_id, param_order")
       })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class ScreenerFunctionParam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "param_id")
    private Long paramId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "function_id", nullable = false)
    private ScreenerFunction screenerFunction;

    @Column(name = "param_name", nullable = false, length = 100)
    private String paramName;

    @Column(name = "display_name", nullable = false, length = 200)
    private String displayName;

    @Column(name = "data_type", nullable = false, length = 50)
    private String dataType;

    @Column(name = "is_required", nullable = false)
    @Builder.Default
    private Boolean isRequired = true;

    @Column(name = "default_value", length = 500)
    private String defaultValue;

    @Column(name = "param_order", nullable = false)
    private Integer paramOrder;

    @Column(name = "validation_rules", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Object validationRules;

    @Column(name = "help_text", columnDefinition = "text")
    private String helpText;

    @Column(name = "example_value", length = 500)
    private String exampleValue;

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