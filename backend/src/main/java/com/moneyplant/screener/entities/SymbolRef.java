package com.moneyplant.screener.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Minimal reference entity for Symbol.
 * Used for foreign key references in screener entities.
 */
@Entity
@Table(name = "nse_eq_master")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SymbolRef {

    @Id
    @Column(name = "symbol")
    private String symbolId;
}
