package com.moneyplant.portfolioservice.entities;

import com.moneyplant.moneyplantcore.entities.BaseAuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entity representing a user's portfolio.
 * A portfolio contains information about a collection of investments.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Portfolio extends BaseAuditEntity {
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;
}
