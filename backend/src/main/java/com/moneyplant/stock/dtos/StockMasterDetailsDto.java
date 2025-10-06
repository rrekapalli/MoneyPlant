package com.moneyplant.stock.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockMasterDetailsDto {
    private String symbol;
    private String companyName;
    private String industry;
    private String pdSectorInd;
    private String isin;
    private String series;
    private String status;
    private String listingDate;
    private String isFnoSec;
    private String isEtfSec;
    private String isSuspended;
    private Float pdSectorPe;
    private Float pdSymbolPe;
}