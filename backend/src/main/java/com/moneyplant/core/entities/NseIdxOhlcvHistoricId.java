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
public class NseIdxOhlcvHistoricId implements Serializable {
    private static final long serialVersionUID = 743786751190465974L;
    @NotNull
    @Column(name = "index_name", nullable = false, length = Integer.MAX_VALUE)
    private String indexName;

    @NotNull
    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        NseIdxOhlcvHistoricId entity = (NseIdxOhlcvHistoricId) o;
        return Objects.equals(this.date, entity.date) &&
                Objects.equals(this.indexName, entity.indexName);
    }

    @Override
    public int hashCode() {
        return Objects.hash(date, indexName);
    }

}