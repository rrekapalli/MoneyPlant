package com.moneyplant.core.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "portfolio_cash_flows", schema = "public")
public class PortfolioCashFlow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @NotNull
    @Column(name = "flow_date", nullable = false)
    private LocalDate flowDate;

    @NotNull
    @Column(name = "amount", nullable = false, precision = 20, scale = 6)
    private BigDecimal amount;

    @Size(max = 20)
    @NotNull
    @Column(name = "flow_type", nullable = false, length = 20)
    private String flowType;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "reference_txn_id")
    private PortfolioTransaction referenceTxn;

    @NotNull
    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

}