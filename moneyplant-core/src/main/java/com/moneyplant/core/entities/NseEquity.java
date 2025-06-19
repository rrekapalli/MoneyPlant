package com.moneyplant.core.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.jpa.domain.AbstractAuditable;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "nse_equities", schema = "public")
public class NseEquity extends AbstractAuditable {
    @Id
    @Column(name = "symbol", length = 50)
    private String symbol;

    @Column(name = "name_of_company", length = Integer.MAX_VALUE)
    private String nameOfCompany;

    @Column(name = "series", length = 50)
    private String series;

    @Column(name = "date_of_listing")
    private LocalDate dateOfListing;

    @Column(name = "paid_up_value")
    private Float paidUpValue;

    @Column(name = "market_lot")
    private Float marketLot;

    @Column(name = "isin_number", length = 50)
    private String isinNumber;

    @Column(name = "face_value")
    private Float faceValue;

}