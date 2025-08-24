package com.moneyplant.core.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

@Getter
@Setter
@Embeddable
public class NseEqIndicatorId implements Serializable {
    private static final long serialVersionUID = 137409287646691711L;
    @NotNull
    @Column(name = "symbol", nullable = false, length = Integer.MAX_VALUE)
    private String symbol;

    @NotNull
    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        NseEqIndicatorId entity = (NseEqIndicatorId) o;
        return Objects.equals(this.date, entity.date) &&
                Objects.equals(this.symbol, entity.symbol);
    }

    @Override
    public int hashCode() {
        return Objects.hash(date, symbol);
    }

}