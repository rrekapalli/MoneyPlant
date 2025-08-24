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
public class PortfolioBenchmarkId implements Serializable {
    private static final long serialVersionUID = -431172514379681330L;
    @NotNull
    @Column(name = "portfolio_id", nullable = false)
    private Long portfolioId;

    @Size(max = 200)
    @NotNull
    @Column(name = "index_name", nullable = false, length = 200)
    private String indexName;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        PortfolioBenchmarkId entity = (PortfolioBenchmarkId) o;
        return Objects.equals(this.portfolioId, entity.portfolioId) &&
                Objects.equals(this.indexName, entity.indexName);
    }

    @Override
    public int hashCode() {
        return Objects.hash(portfolioId, indexName);
    }

}