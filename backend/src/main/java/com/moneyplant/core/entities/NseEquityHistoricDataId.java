package com.moneyplant.core.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

@Getter
@Setter
@Embeddable
public class NseEquityHistoricDataId implements Serializable {
    private static final long serialVersionUID = 197751131785797256L;
    @Column(name = "symbol", length = 50)
    private String symbol;

    @Column(name = "date")
    private LocalDate date;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        NseEquityHistoricDataId entity = (NseEquityHistoricDataId) o;
        return Objects.equals(this.date, entity.date) &&
                Objects.equals(this.symbol, entity.symbol);
    }

    @Override
    public int hashCode() {
        return Objects.hash(date, symbol);
    }

}