package com.moneyplant.core.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@Embeddable
public class NseEqSectorIndexId implements Serializable {
    private static final long serialVersionUID = 3256456668771048964L;
    @Size(max = 50)
    @NotNull
    @Column(name = "symbol", nullable = false, length = 50)
    private String symbol;

    @Size(max = 100)
    @NotNull
    @Column(name = "pd_sector_index", nullable = false, length = 100)
    private String pdSectorIndex;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        NseEqSectorIndexId entity = (NseEqSectorIndexId) o;
        return Objects.equals(this.symbol, entity.symbol) &&
                Objects.equals(this.pdSectorIndex, entity.pdSectorIndex);
    }

    @Override
    public int hashCode() {
        return Objects.hash(symbol, pdSectorIndex);
    }

}