package com.moneyplant.core.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.jpa.domain.AbstractAuditable;

import java.time.LocalDate;
import java.util.Map;

@Getter
@Setter
@Entity
@Table(name = "nse_quote_equity", schema = "public")
public class NseQuoteEquity extends AbstractAuditable {
    @Id
    @Column(name = "symbol", length = 50)
    private String symbol;

    @Column(name = "api_response")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> apiResponse;

    @Column(name = "created_on")
    private LocalDate createdOn;

}