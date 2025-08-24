package com.moneyplant.engines.ingestion.service.impl;

import com.moneyplant.engines.common.entities.NseIndicesTick;
import com.moneyplant.engines.common.NseIndicesTickDto;
import com.moneyplant.engines.ingestion.service.NseIndicesTickService;
import com.moneyplant.engines.ingestion.repository.NseIndicesTickRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Implementation of NseIndicesTickService for managing NSE indices tick data.
 * Handles database operations including UPSERT operations for real-time data.
 * 
 * NOTE: This service is currently disabled to avoid PostgreSQL ingestion failures.
 * Database operations have been removed from the Kafka subscription flow.
 */
@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Slf4j
@org.springframework.transaction.annotation.Transactional
public class NseIndicesTickServiceImpl implements NseIndicesTickService {

    private final NseIndicesTickRepository nseIndicesTickRepository;

    @Override
    public void upsertTickData(NseIndicesTickDto tickDto) {
        if (tickDto == null || tickDto.getIndices() == null || tickDto.getIndices().length == 0) {
            return;
        }
        // Save or update one row per index in the DTO, keyed by index_symbol (fallback to index_name)
        for (NseIndicesTickDto.IndexTickDataDto idx : tickDto.getIndices()) {
            NseIndicesTickDto single = new NseIndicesTickDto();
            single.setTimestamp(tickDto.getTimestamp());
            single.setSource(tickDto.getSource());
            single.setIngestionTimestamp(tickDto.getIngestionTimestamp() != null ? tickDto.getIngestionTimestamp() : Instant.now());
            single.setMarketStatus(tickDto.getMarketStatus());
            single.setIndices(new NseIndicesTickDto.IndexTickDataDto[]{idx});

            NseIndicesTick incoming = convertDtoToEntity(single);
            if (incoming == null) continue;

            String indexSymbol = incoming.getIndexSymbol();
            String indexName = incoming.getIndexName();

            NseIndicesTick existing = null;
            if (indexSymbol != null && !indexSymbol.isBlank()) {
                existing = nseIndicesTickRepository.findFirstByIndexSymbolOrderByTickTimestampDesc(indexSymbol).orElse(null);
            }
            if (existing == null && indexName != null && !indexName.isBlank()) {
                existing = nseIndicesTickRepository.findFirstByIndexNameOrderByTickTimestampDesc(indexName).orElse(null);
            }

            if (existing != null) {
                // Merge non-null values from incoming into existing (do not overwrite with nulls)
                mergeNonNull(incoming, existing);
                existing.setModifiedBy("System");
                existing.setModifiedOn(Instant.now());
                nseIndicesTickRepository.save(existing);
            } else {
                // Insert new row; timestamps managed by @PrePersist
                nseIndicesTickRepository.save(incoming);
            }
        }
    }

    private void mergeNonNull(NseIndicesTick src, NseIndicesTick dst) {
        if (src.getIndexName() != null) dst.setIndexName(src.getIndexName());
        if (src.getIndexSymbol() != null) dst.setIndexSymbol(src.getIndexSymbol());
        if (src.getLastPrice() != null) dst.setLastPrice(src.getLastPrice());
        if (src.getVariation() != null) dst.setVariation(src.getVariation());
        if (src.getPercentChange() != null) dst.setPercentChange(src.getPercentChange());
        if (src.getOpenPrice() != null) dst.setOpenPrice(src.getOpenPrice());
        if (src.getDayHigh() != null) dst.setDayHigh(src.getDayHigh());
        if (src.getDayLow() != null) dst.setDayLow(src.getDayLow());
        if (src.getPreviousClose() != null) dst.setPreviousClose(src.getPreviousClose());
        if (src.getYearHigh() != null) dst.setYearHigh(src.getYearHigh());
        if (src.getYearLow() != null) dst.setYearLow(src.getYearLow());
        if (src.getIndicativeClose() != null) dst.setIndicativeClose(src.getIndicativeClose());
        if (src.getPeRatio() != null) dst.setPeRatio(src.getPeRatio());
        if (src.getPbRatio() != null) dst.setPbRatio(src.getPbRatio());
        if (src.getDividendYield() != null) dst.setDividendYield(src.getDividendYield());
        if (src.getDeclines() != null) dst.setDeclines(src.getDeclines());
        if (src.getAdvances() != null) dst.setAdvances(src.getAdvances());
        if (src.getUnchanged() != null) dst.setUnchanged(src.getUnchanged());
        if (src.getPercentChange365d() != null) dst.setPercentChange365d(src.getPercentChange365d());
        if (src.getDate365dAgo() != null) dst.setDate365dAgo(src.getDate365dAgo());
        if (src.getChart365dPath() != null) dst.setChart365dPath(src.getChart365dPath());
        if (src.getDate30dAgo() != null) dst.setDate30dAgo(src.getDate30dAgo());
        if (src.getPercentChange30d() != null) dst.setPercentChange30d(src.getPercentChange30d());
        if (src.getChart30dPath() != null) dst.setChart30dPath(src.getChart30dPath());
        if (src.getChartTodayPath() != null) dst.setChartTodayPath(src.getChartTodayPath());
        if (src.getMarketStatus() != null) dst.setMarketStatus(src.getMarketStatus());
        if (src.getMarketStatusMessage() != null) dst.setMarketStatusMessage(src.getMarketStatusMessage());
        if (src.getTradeDate() != null) dst.setTradeDate(src.getTradeDate());
        if (src.getMarketStatusTime() != null) dst.setMarketStatusTime(src.getMarketStatusTime());
        // For tickTimestamp, we generally want the latest reading; update if provided
        if (src.getTickTimestamp() != null) dst.setTickTimestamp(src.getTickTimestamp());
    }

    @Override
    public void upsertMultipleTickData(List<NseIndicesTickDto> tickDtos) {
        if (tickDtos == null || tickDtos.isEmpty()) return;
        for (NseIndicesTickDto dto : tickDtos) {
            upsertTickData(dto);
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public NseIndicesTick getLatestTickData(String indexName) {
        if (indexName == null) return null;
        return nseIndicesTickRepository.findFirstByIndexNameOrderByTickTimestampDesc(indexName).orElse(null);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<NseIndicesTick> getLatestTicksForAllIndices() {
        return nseIndicesTickRepository.findLatestTicksForAllIndices();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<NseIndicesTick> getTickDataByIndexAndTimeRange(String indexName, Instant startTime, Instant endTime) {
        if (indexName == null || startTime == null || endTime == null) return List.of();
        return nseIndicesTickRepository.findByIndexNameAndTickTimestampBetweenOrderByTickTimestampDesc(indexName, startTime, endTime);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<NseIndicesTick> getTickDataByTimeRange(Instant startTime, Instant endTime) {
        if (startTime == null || endTime == null) return List.of();
        return nseIndicesTickRepository.findByTickTimestampBetweenOrderByTickTimestampDesc(startTime, endTime);
    }

    @Override
    public void cleanupOldTickData(Instant cutoffTime) {
        if (cutoffTime == null) return;
        nseIndicesTickRepository.deleteOldTickData(cutoffTime);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public long getTotalTickDataCount() {
        return nseIndicesTickRepository.count();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<NseIndicesTick> getTickDataBySource(String source) {
        if (source == null) return List.of();
        return nseIndicesTickRepository.findByCreatedByOrderByTickTimestampDesc(source);
    }

    @Override
    public NseIndicesTick convertDtoToEntity(NseIndicesTickDto dto) {
        if (dto == null || dto.getIndices() == null || dto.getIndices().length == 0) {
            return null;
        }

        // For now, we'll create an entity from the first index in the DTO
        // In a real implementation, you might want to create multiple entities
        NseIndicesTickDto.IndexTickDataDto indexData = dto.getIndices()[0];
        
        NseIndicesTick entity = new NseIndicesTick();
        entity.setIndexName(indexData.getIndexName());
        entity.setIndexSymbol(indexData.getIndexSymbol());
        entity.setLastPrice(indexData.getLastPrice());
        entity.setVariation(indexData.getVariation());
        entity.setPercentChange(indexData.getPercentChange());
        entity.setOpenPrice(indexData.getOpenPrice());
        entity.setDayHigh(indexData.getDayHigh());
        entity.setDayLow(indexData.getDayLow());
        entity.setPreviousClose(indexData.getPreviousClose());
        entity.setYearHigh(indexData.getYearHigh());
        entity.setYearLow(indexData.getYearLow());
        entity.setIndicativeClose(indexData.getIndicativeClose());
        entity.setPeRatio(indexData.getPeRatio());
        entity.setPbRatio(indexData.getPbRatio());
        entity.setDividendYield(indexData.getDividendYield());
        entity.setDeclines(indexData.getDeclines());
        entity.setAdvances(indexData.getAdvances());
        entity.setUnchanged(indexData.getUnchanged());
        entity.setPercentChange365d(indexData.getPercentChange365d());
        entity.setDate365dAgo(indexData.getDate365dAgo());
        entity.setChart365dPath(indexData.getChart365dPath());
        entity.setDate30dAgo(indexData.getDate30dAgo());
        entity.setPercentChange30d(indexData.getPercentChange30d());
        entity.setChart30dPath(indexData.getChart30dPath());
        entity.setChartTodayPath(indexData.getChartTodayPath());
        
        // Set market status if available
        if (dto.getMarketStatus() != null) {
            entity.setMarketStatus(dto.getMarketStatus().getStatus());
            entity.setMarketStatusMessage(dto.getMarketStatus().getMessage());
            entity.setTradeDate(dto.getMarketStatus().getTradeDate());
            entity.setMarketStatusTime(dto.getMarketStatus().getMarketStatusTime());
        }
        
        // Set timestamps
        entity.setTickTimestamp(indexData.getTickTimestamp());
        entity.setCreatedBy("System");
        entity.setModifiedBy("System");
        
        return entity;
    }

    @Override
    public NseIndicesTickDto convertEntityToDto(NseIndicesTick entity) {
        if (entity == null) {
            return null;
        }

        NseIndicesTickDto dto = new NseIndicesTickDto();
        dto.setTimestamp(entity.getTickTimestamp().toString());
        dto.setSource("Database");
        dto.setIngestionTimestamp(entity.getModifiedOn());
        
        // Create index data array
        NseIndicesTickDto.IndexTickDataDto indexData = new NseIndicesTickDto.IndexTickDataDto();
        indexData.setIndexName(entity.getIndexName());
        indexData.setIndexSymbol(entity.getIndexSymbol());
        indexData.setLastPrice(entity.getLastPrice());
        indexData.setVariation(entity.getVariation());
        indexData.setPercentChange(entity.getPercentChange());
        indexData.setOpenPrice(entity.getOpenPrice());
        indexData.setDayHigh(entity.getDayHigh());
        indexData.setDayLow(entity.getDayLow());
        indexData.setPreviousClose(entity.getPreviousClose());
        indexData.setYearHigh(entity.getYearHigh());
        indexData.setYearLow(entity.getYearLow());
        indexData.setIndicativeClose(entity.getIndicativeClose());
        indexData.setPeRatio(entity.getPeRatio());
        indexData.setPbRatio(entity.getPbRatio());
        indexData.setDividendYield(entity.getDividendYield());
        indexData.setDeclines(entity.getDeclines());
        indexData.setAdvances(entity.getAdvances());
        indexData.setUnchanged(entity.getUnchanged());
        indexData.setPercentChange365d(entity.getPercentChange365d());
        indexData.setDate365dAgo(entity.getDate365dAgo());
        indexData.setChart365dPath(entity.getChart365dPath());
        indexData.setDate30dAgo(entity.getDate30dAgo());
        indexData.setPercentChange30d(entity.getPercentChange30d());
        indexData.setChart30dPath(entity.getChart30dPath());
        indexData.setChartTodayPath(entity.getChartTodayPath());
        indexData.setTickTimestamp(entity.getTickTimestamp());
        
        dto.setIndices(new NseIndicesTickDto.IndexTickDataDto[]{indexData});
        
        // Set market status if available
        if (entity.getMarketStatus() != null) {
            NseIndicesTickDto.MarketStatusTickDto marketStatus = new NseIndicesTickDto.MarketStatusTickDto();
            marketStatus.setStatus(entity.getMarketStatus());
            marketStatus.setMessage(entity.getMarketStatusMessage());
            marketStatus.setTradeDate(entity.getTradeDate());
            dto.setMarketStatus(marketStatus);
        }
        
        return dto;
    }
}
