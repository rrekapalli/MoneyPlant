package com.moneyplant.engines.ingestion.kite.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO for importing instruments from Kite Connect API.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstrumentImportRequest {
    
    /**
     * Optional list of exchanges to filter instruments.
     * If null or empty, all exchanges will be imported.
     * Valid values: NSE, BSE, NFO, BFO, CDS, MCX
     */
    private List<String> exchanges;
}
