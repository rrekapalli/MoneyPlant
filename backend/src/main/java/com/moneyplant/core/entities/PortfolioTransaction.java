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
@Table(name = "portfolio_transactions", schema = "public")
public class PortfolioTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "symbol")
    private NseEquityMaster symbol;

    @NotNull
    @Column(name = "trade_date", nullable = false)
    private LocalDate tradeDate;

    @Column(name = "trade_time")
    private OffsetDateTime tradeTime;

    @Size(max = 20)
    @NotNull
    @Column(name = "txn_type", nullable = false, length = 20)
    private String txnType;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "quantity", nullable = false, precision = 20, scale = 6)
    private BigDecimal quantity;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "price", nullable = false, precision = 20, scale = 6)
    private BigDecimal price;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "fees", nullable = false, precision = 20, scale = 6)
    private BigDecimal fees;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "taxes", nullable = false, precision = 20, scale = 6)
    private BigDecimal taxes;

    @Column(name = "notes", length = Integer.MAX_VALUE)
    private String notes;

    @NotNull
    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @NotNull
    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

}