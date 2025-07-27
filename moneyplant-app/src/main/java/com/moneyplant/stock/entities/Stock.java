package com.moneyplant.stock.entities;

import com.moneyplant.core.entities.BaseAuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entity representing a stock.
 * A stock contains information about a publicly traded company.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Stock extends BaseAuditEntity {
    @Column(nullable = false)
    private String symbol;

    @Column(nullable = false)
    private String name;
}
