package com.moneyplant.stock.mappers;

import com.moneyplant.core.entities.NseStockTick;
import com.moneyplant.stock.dtos.StockTicksDto;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper utility class to convert NseStockTick entities to StockTicksDto.
 * Handles field name differences and structure mapping between entity and DTO.
 */
@Component
public class StockTicksMapper {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Converts a list of NseStockTick entities to StockTicksDto.
     *
     * @param stockTicks the list of NseStockTick entities
     * @param indexName the name of the index
     * @return StockTicksDto containing the mapped data
     */
    public StockTicksDto toStockTicksDto(List<NseStockTick> stockTicks, String indexName) {
//        if (stockTicks == null || stockTicks.isEmpty()) {
//            return createEmptyStockTicksDto(indexName);
//        }

        StockTicksDto dto = new StockTicksDto();
        dto.setTimestamp(LocalDateTime.now().format(DATE_TIME_FORMATTER));
        
//        // Convert entities to StockDataDto list
//        List<StockTicksDto.StockDataDto> stockDataList = stockTicks.stream()
//                .map(this::toStockDataDto)
//                .collect(Collectors.toList());
//
//        dto.setData(stockDataList);
//
//        // Set advance data (summary of market movements)
//        dto.setAdvance(calculateAdvanceData(stockTicks));
//
//        // Set metadata (can be null or populated based on requirements)
//        dto.setMetadata(null);
//        dto.setMarketStatus(null);
        
        return dto;
    }

    /**
     * Converts a single NseStockTick entity to StockDataDto.
     *
     * @param stockTick the NseStockTick entity
     * @return StockDataDto containing the mapped data
     */
    private StockTicksDto toStockDataDto(NseStockTick stockTick) {
        StockTicksDto stockData = new StockTicksDto();

        // Map basic fields
        stockData.setSymbol(stockTick.getId().getSymbol());

        // Map price fields (convert Float to Double)
        stockData.setOpen(stockTick.getOpen() != null ? stockTick.getOpen() : null);
        stockData.setClose(stockTick.getClose() != null ? stockTick.getClose() : null);
        stockData.setHigh(stockTick.getHigh() != null ? stockTick.getHigh() : null);
        stockData.setLow(stockTick.getLow() != null ? stockTick.getLow() : null);
        stockData.setVolume(stockTick.getVolume() != null ? stockTick.getVolume().floatValue() : null);

        return stockData;
    }

//    /**
//     * Converts NseStockTick entity to MetaDto.
//     *
//     * @param stockTick the NseStockTick entity
//     * @return MetaDto containing the mapped metadata
//     */
//    private StockTicksDto.StockDataDto.MetaDto toMetaDto(NseStockTick stockTick) {
//        StockTicksDto.StockDataDto.MetaDto meta = new StockTicksDto.StockDataDto.MetaDto();
//
//        meta.setSymbol(stockTick.getSymbol());
//        meta.setCompanyName(stockTick.getCompanyName());
//        meta.setIndustry(stockTick.getIndustry());
//
//        // Map boolean flags
//        meta.setIsFNOSec(stockTick.getIsFnoSec());
//        meta.setIsCASec(stockTick.getIsCaSec());
//        meta.setIsSLBSec(stockTick.getIsSlbSec());
//        meta.setIsDebtSec(stockTick.getIsDebtSec());
//        meta.setIsSuspended(stockTick.getIsSuspended());
//        meta.setIsETFSec(stockTick.getIsEtfSec());
//        meta.setIsDelisted(stockTick.getIsDelisted());
//        meta.setIsMunicipalBond(stockTick.getIsMunicipalBond());
//        meta.setIsHybridSymbol(stockTick.getIsHybridSymbol());
//
//        // Map ISIN fields
//        meta.setIsin(stockTick.getIsin());
//        meta.setSlbIsin(stockTick.getSlbIsin());
//        meta.setListingDate(stockTick.getListingDate());
//
//        // Map quote pre-open status
//        if (stockTick.getEquityTime() != null || stockTick.getPreOpenTime() != null || stockTick.getQuotePreOpenFlag() != null) {
//            StockTicksDto.StockDataDto.MetaDto.QuotePreOpenStatusDto quoteStatus =
//                new StockTicksDto.StockDataDto.MetaDto.QuotePreOpenStatusDto();
//            quoteStatus.setEquityTime(stockTick.getEquityTime());
//            quoteStatus.setPreOpenTime(stockTick.getPreOpenTime());
//            quoteStatus.setQuotePreOpenFlag(stockTick.getQuotePreOpenFlag());
//            meta.setQuotepreopenstatus(quoteStatus);
//        }
//
//        // Set default values for fields not available in entity
//        meta.setActiveSeries(new ArrayList<>());
//        meta.setDebtSeries(new ArrayList<>());
//        meta.setTempSuspendedSeries(new ArrayList<>());
//
//        return meta;
//    }
//
//    /**
//     * Calculates advance data (market summary) from the list of stock ticks.
//     *
//     * @param stockTicks the list of stock ticks
//     * @return AdvanceDto containing market summary
//     */
//    private StockTicksDto.AdvanceDto calculateAdvanceData(List<NseStockTick> stockTicks) {
//        int advances = 0;
//        int declines = 0;
//        int unchanged = 0;
//
//        for (NseStockTick stock : stockTicks) {
//            if (stock.getPriceChange() != null) {
//                if (stock.getPriceChange() > 0) {
//                    advances++;
//                } else if (stock.getPriceChange() < 0) {
//                    declines++;
//                } else {
//                    unchanged++;
//                }
//            }
//        }
//
//        StockTicksDto.AdvanceDto advance = new StockTicksDto.AdvanceDto();
//        advance.setAdvances(String.valueOf(advances));
//        advance.setDeclines(String.valueOf(declines));
//        advance.setUnchanged(String.valueOf(unchanged));
//
//        return advance;
//    }
//
//    /**
//     * Creates an empty StockTicksDto for cases where no data is available.
//     *
//     * @param indexName the name of the index
//     * @return empty StockTicksDto
//     */
//    private StockTicksDto createEmptyStockTicksDto(String indexName) {
//        StockTicksDto dto = new StockTicksDto();
//        dto.setName(indexName);
//        dto.setTimestamp(LocalDateTime.now().format(DATE_TIME_FORMATTER));
//        dto.setData(new ArrayList<>());
//
//        // Set empty advance data
//        StockTicksDto.AdvanceDto advance = new StockTicksDto.AdvanceDto();
//        advance.setAdvances("0");
//        advance.setDeclines("0");
//        advance.setUnchanged("0");
//        dto.setAdvance(advance);
//
//        return dto;
//    }
}