package com.moneyplant.engines.ingestion.service.impl;

import com.moneyplant.engines.common.entities.NseIndicesTick;
import com.moneyplant.engines.common.dto.NseIndicesTickDto;
import com.moneyplant.engines.ingestion.repository.NseIndicesTickRepository;
import com.moneyplant.engines.ingestion.service.NseIndicesTickService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Implementation of NseIndicesTickService for managing NSE indices tick data.
 * Handles database operations including UPSERT operations for real-time data.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NseIndicesTickServiceImpl implements NseIndicesTickService {

    private final NseIndicesTickRepository nseIndicesTickRepository;

    @Override
    public void upsertTickData(NseIndicesTickDto tickDto) {
        try {
            if (tickDto == null || tickDto.getIndices() == null) {
                log.warn("Invalid tick data received, skipping upsert");
                return;
            }

            log.debug("Upserting tick data for {} indices", tickDto.getIndices().length);
            
            // Convert DTO to entity and upsert
            NseIndicesTick entity = convertDtoToEntity(tickDto);
            nseIndicesTickRepository.upsertTickData(entity);
            
            log.debug("Successfully upserted tick data for index: {}", entity.getIndexName());
            
        } catch (Exception e) {
            log.error("Error upserting tick data: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upsert tick data", e);
        }
    }

    @Override
    public void upsertMultipleTickData(List<NseIndicesTickDto> tickDtos) {
        try {
            if (tickDtos == null || tickDtos.isEmpty()) {
                log.warn("No tick data received for batch upsert");
                return;
            }

            log.debug("Batch upserting {} tick data entries", tickDtos.size());
            
            for (NseIndicesTickDto tickDto : tickDtos) {
                upsertTickData(tickDto);
            }
            
            log.debug("Successfully batch upserted {} tick data entries", tickDtos.size());
            
        } catch (Exception e) {
            log.error("Error in batch upsert of tick data: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to batch upsert tick data", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public NseIndicesTick getLatestTickData(String indexName) {
        try {
            if (indexName == null || indexName.trim().isEmpty()) {
                log.warn("Invalid index name provided for latest tick data retrieval");
                return null;
            }

            Optional<NseIndicesTick> latestTick = nseIndicesTickRepository
                .findFirstByIndexNameOrderByTickTimestampDesc(indexName);
            
            return latestTick.orElse(null);
            
        } catch (Exception e) {
            log.error("Error retrieving latest tick data for index {}: {}", indexName, e.getMessage(), e);
            return null;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<NseIndicesTick> getLatestTicksForAllIndices() {
        try {
            return nseIndicesTickRepository.findLatestTicksForAllIndices();
        } catch (Exception e) {
            log.error("Error retrieving latest ticks for all indices: {}", e.getMessage(), e);
            return List.of();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<NseIndicesTick> getTickDataByIndexAndTimeRange(String indexName, Instant startTime, Instant endTime) {
        try {
            if (indexName == null || startTime == null || endTime == null) {
                log.warn("Invalid parameters provided for time range tick data retrieval");
                return List.of();
            }

            return nseIndicesTickRepository.findByIndexNameAndTickTimestampBetweenOrderByTickTimestampDesc(
                indexName, startTime, endTime);
            
        } catch (Exception e) {
            log.error("Error retrieving tick data for index {} in time range {} to {}: {}", 
                     indexName, startTime, endTime, e.getMessage(), e);
            return List.of();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<NseIndicesTick> getTickDataByTimeRange(Instant startTime, Instant endTime) {
        try {
            if (startTime == null || endTime == null) {
                log.warn("Invalid time range parameters provided for tick data retrieval");
                return List.of();
            }

            return nseIndicesTickRepository.findByTickTimestampBetweenOrderByTickTimestampDesc(startTime, endTime);
            
        } catch (Exception e) {
            log.error("Error retrieving tick data in time range {} to {}: {}", 
                     startTime, endTime, e.getMessage(), e);
            return List.of();
        }
    }

    @Override
    public void cleanupOldTickData(Instant cutoffTime) {
        try {
            if (cutoffTime == null) {
                log.warn("Invalid cutoff time provided for cleanup");
                return;
            }

            log.info("Cleaning up tick data older than: {}", cutoffTime);
            long deletedCount = nseIndicesTickRepository.count();
            
            nseIndicesTickRepository.deleteOldTickData(cutoffTime);
            
            long remainingCount = nseIndicesTickRepository.count();
            long actualDeletedCount = deletedCount - remainingCount;
            
            log.info("Cleanup completed. Deleted {} old tick data records", actualDeletedCount);
            
        } catch (Exception e) {
            log.error("Error during cleanup of old tick data: {}", e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public long getTotalTickDataCount() {
        try {
            return nseIndicesTickRepository.count();
        } catch (Exception e) {
            log.error("Error retrieving total tick data count: {}", e.getMessage(), e);
            return 0;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<NseIndicesTick> getTickDataBySource(String source) {
        try {
            if (source == null || source.trim().isEmpty()) {
                log.warn("Invalid source provided for tick data retrieval");
                return List.of();
            }

            // Since we no longer have a source field, we'll use createdBy instead
            return nseIndicesTickRepository.findByCreatedByOrderByTickTimestampDesc(source);
            
        } catch (Exception e) {
            log.error("Error retrieving tick data by source {}: {}", source, e.getMessage(), e);
            return List.of();
        }
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
