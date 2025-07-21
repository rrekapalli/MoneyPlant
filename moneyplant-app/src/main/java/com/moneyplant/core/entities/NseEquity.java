package com.moneyplant.core.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "nse_equities", schema = "public")
public class NseEquity implements Serializable {
    @Id
    @Column(name = "symbol", length = 50)
    private String symbol;

    @Column(name = "name_of_company", length = Integer.MAX_VALUE)
    private String nameOfCompany;

    @Column(name = "series", length = 50)
    private String series;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "date_of_listing")
    private Timestamp dateOfListing;

    @Column(name = "paid_up_value")
    private Float paidUpValue;

    @Column(name = "market_lot")
    private Float marketLot;

    @Column(name = "isin_number", length = 50)
    private String isinNumber;

    @Column(name = "face_value")
    private Float faceValue;

}
