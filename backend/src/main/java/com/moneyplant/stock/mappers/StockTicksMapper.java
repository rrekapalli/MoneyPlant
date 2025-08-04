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
        if (stockTicks == null || stockTicks.isEmpty()) {
            return createEmptyStockTicksDto(indexName);
        }

        StockTicksDto dto = new StockTicksDto();
        dto.setName(indexName);
        dto.setTimestamp(LocalDateTime.now().format(DATE_TIME_FORMATTER));
        
        // Convert entities to StockDataDto list
        List<StockTicksDto.StockDataDto> stockDataList = stockTicks.stream()
                .map(this::toStockDataDto)
                .collect(Collectors.toList());
        
        dto.setData(stockDataList);
        
        // Set advance data (summary of market movements)
        dto.setAdvance(calculateAdvanceData(stockTicks));
        
        // Set metadata (can be null or populated based on requirements)
        dto.setMetadata(null);
        dto.setMarketStatus(null);
        
        // Set historical dates if available from first stock
        if (!stockTicks.isEmpty()) {
            NseStockTick firstStock = stockTicks.get(0);
            dto.setDate30dAgo(firstStock.getDate30dAgo());
            dto.setDate365dAgo(firstStock.getDate365dAgo());
        }

        return dto;
    }

    /**
     * Converts a single NseStockTick entity to StockDataDto.
     *
     * @param stockTick the NseStockTick entity
     * @return StockDataDto containing the mapped data
     */
    private StockTicksDto.StockDataDto toStockDataDto(NseStockTick stockTick) {
        StockTicksDto.StockDataDto stockData = new StockTicksDto.StockDataDto();
        
        // Map basic fields
        stockData.setPriority(stockTick.getPriority());
        stockData.setSymbol(stockTick.getSymbol());
        stockData.setIdentifier(stockTick.getIdentifier());
        stockData.setSeries(stockTick.getSeries());
        
        // Map price fields (convert Float to Double)
        stockData.setOpen(stockTick.getOpenPrice() != null ? stockTick.getOpenPrice().doubleValue() : null);
        stockData.setDayHigh(stockTick.getDayHigh() != null ? stockTick.getDayHigh().doubleValue() : null);
        stockData.setDayLow(stockTick.getDayLow() != null ? stockTick.getDayLow().doubleValue() : null);
        stockData.setLastPrice(stockTick.getLastPrice() != null ? stockTick.getLastPrice().doubleValue() : null);
        stockData.setPreviousClose(stockTick.getPreviousClose() != null ? stockTick.getPreviousClose().doubleValue() : null);
        
        // Map change fields (note: entity uses priceChange/percentChange, DTO uses change/pChange)
        stockData.setChange(stockTick.getPriceChange() != null ? stockTick.getPriceChange().doubleValue() : null);
        stockData.setPChange(stockTick.getPercentChange() != null ? stockTick.getPercentChange().doubleValue() : null);
        
        // Map other price fields
        stockData.setFfmc(stockTick.getFfmc() != null ? stockTick.getFfmc().doubleValue() : null);
        stockData.setYearHigh(stockTick.getYearHigh() != null ? stockTick.getYearHigh().doubleValue() : null);
        stockData.setYearLow(stockTick.getYearLow() != null ? stockTick.getYearLow().doubleValue() : null);
        stockData.setStockIndClosePrice(stockTick.getStockIndClosePrice() != null ? stockTick.getStockIndClosePrice().doubleValue() : null);
        stockData.setTotalTradedValue(stockTick.getTotalTradedValue() != null ? stockTick.getTotalTradedValue().doubleValue() : null);
        
        // Map volume field
        stockData.setTotalTradedVolume(stockTick.getTotalTradedVolume());
        
        // Map week high/low fields (note: entity uses nearWeekHigh/nearWeekLow, DTO uses nearWKH/nearWKL)
        stockData.setNearWKH(stockTick.getNearWeekHigh() != null ? stockTick.getNearWeekHigh().doubleValue() : null);
        stockData.setNearWKL(stockTick.getNearWeekLow() != null ? stockTick.getNearWeekLow().doubleValue() : null);
        
        // Map historical change fields
        stockData.setPerChange365d(stockTick.getPercentChange365d() != null ? stockTick.getPercentChange365d().doubleValue() : null);
        stockData.setDate365dAgo(stockTick.getDate365dAgo());
        stockData.setChart365dPath(stockTick.getChart365dPath());
        stockData.setDate30dAgo(stockTick.getDate30dAgo());
        stockData.setPerChange30d(stockTick.getPercentChange30d() != null ? stockTick.getPercentChange30d().doubleValue() : null);
        stockData.setChart30dPath(stockTick.getChart30dPath());
        stockData.setChartTodayPath(stockTick.getChartTodayPath());
        
        // Set last update time (can be derived from updatedAt)
        if (stockTick.getUpdatedAt() != null) {
            stockData.setLastUpdateTime(stockTick.getUpdatedAt().toString());
        }
        
        // Map meta data
        stockData.setMeta(toMetaDto(stockTick));
        
        return stockData;
    }

    /**
     * Converts NseStockTick entity to MetaDto.
     *
     * @param stockTick the NseStockTick entity
     * @return MetaDto containing the mapped metadata
     */
    private StockTicksDto.StockDataDto.MetaDto toMetaDto(NseStockTick stockTick) {
        StockTicksDto.StockDataDto.MetaDto meta = new StockTicksDto.StockDataDto.MetaDto();
        
        meta.setSymbol(stockTick.getSymbol());
        meta.setCompanyName(stockTick.getCompanyName());
        meta.setIndustry(stockTick.getIndustry());
        
        // Map boolean flags
        meta.setIsFNOSec(stockTick.getIsFnoSec());
        meta.setIsCASec(stockTick.getIsCaSec());
        meta.setIsSLBSec(stockTick.getIsSlbSec());
        meta.setIsDebtSec(stockTick.getIsDebtSec());
        meta.setIsSuspended(stockTick.getIsSuspended());
        meta.setIsETFSec(stockTick.getIsEtfSec());
        meta.setIsDelisted(stockTick.getIsDelisted());
        meta.setIsMunicipalBond(stockTick.getIsMunicipalBond());
        meta.setIsHybridSymbol(stockTick.getIsHybridSymbol());
        
        // Map ISIN fields
        meta.setIsin(stockTick.getIsin());
        meta.setSlbIsin(stockTick.getSlbIsin());
        meta.setListingDate(stockTick.getListingDate());
        
        // Map quote pre-open status
        if (stockTick.getEquityTime() != null || stockTick.getPreOpenTime() != null || stockTick.getQuotePreOpenFlag() != null) {
            StockTicksDto.StockDataDto.MetaDto.QuotePreOpenStatusDto quoteStatus = 
                new StockTicksDto.StockDataDto.MetaDto.QuotePreOpenStatusDto();
            quoteStatus.setEquityTime(stockTick.getEquityTime());
            quoteStatus.setPreOpenTime(stockTick.getPreOpenTime());
            quoteStatus.setQuotePreOpenFlag(stockTick.getQuotePreOpenFlag());
            meta.setQuotepreopenstatus(quoteStatus);
        }
        
        // Set default values for fields not available in entity
        meta.setActiveSeries(new ArrayList<>());
        meta.setDebtSeries(new ArrayList<>());
        meta.setTempSuspendedSeries(new ArrayList<>());
        
        return meta;
    }

    /**
     * Calculates advance data (market summary) from the list of stock ticks.
     *
     * @param stockTicks the list of stock ticks
     * @return AdvanceDto containing market summary
     */
    private StockTicksDto.AdvanceDto calculateAdvanceData(List<NseStockTick> stockTicks) {
        int advances = 0;
        int declines = 0;
        int unchanged = 0;
        
        for (NseStockTick stock : stockTicks) {
            if (stock.getPriceChange() != null) {
                if (stock.getPriceChange() > 0) {
                    advances++;
                } else if (stock.getPriceChange() < 0) {
                    declines++;
                } else {
                    unchanged++;
                }
            }
        }
        
        StockTicksDto.AdvanceDto advance = new StockTicksDto.AdvanceDto();
        advance.setAdvances(String.valueOf(advances));
        advance.setDeclines(String.valueOf(declines));
        advance.setUnchanged(String.valueOf(unchanged));
        
        return advance;
    }

    /**
     * Creates an empty StockTicksDto for cases where no data is available.
     *
     * @param indexName the name of the index
     * @return empty StockTicksDto
     */
    private StockTicksDto createEmptyStockTicksDto(String indexName) {
        StockTicksDto dto = new StockTicksDto();
        dto.setName(indexName);
        dto.setTimestamp(LocalDateTime.now().format(DATE_TIME_FORMATTER));
        dto.setData(new ArrayList<>());
        
        // Set empty advance data
        StockTicksDto.AdvanceDto advance = new StockTicksDto.AdvanceDto();
        advance.setAdvances("0");
        advance.setDeclines("0");
        advance.setUnchanged("0");
        dto.setAdvance(advance);
        
        return dto;
    }
}