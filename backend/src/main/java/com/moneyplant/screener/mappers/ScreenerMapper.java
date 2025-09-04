package com.moneyplant.screener.mappers;

import com.moneyplant.screener.dtos.ScreenerCreateReq;
import com.moneyplant.screener.dtos.ScreenerResp;
import com.moneyplant.screener.entities.Screener;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

/**
 * MapStruct mapper for Screener entity and DTOs.
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ScreenerMapper {

    /**
     * Maps ScreenerCreateReq to Screener entity.
     */
    @Mapping(target = "screenerId", ignore = true)
    @Mapping(target = "ownerUserId", ignore = true)
    @Mapping(target = "versions", ignore = true)
    @Mapping(target = "schedules", ignore = true)
    @Mapping(target = "alerts", ignore = true)
    @Mapping(target = "runs", ignore = true)
    @Mapping(target = "stars", ignore = true)
    @Mapping(target = "savedViews", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Screener toEntity(ScreenerCreateReq request);

    /**
     * Maps Screener entity to ScreenerResp.
     */
    ScreenerResp toResponse(Screener entity);

    /**
     * Updates Screener entity from ScreenerCreateReq.
     */
    @Mapping(target = "screenerId", ignore = true)
    @Mapping(target = "ownerUserId", ignore = true)
    @Mapping(target = "versions", ignore = true)
    @Mapping(target = "schedules", ignore = true)
    @Mapping(target = "alerts", ignore = true)
    @Mapping(target = "runs", ignore = true)
    @Mapping(target = "stars", ignore = true)
    @Mapping(target = "savedViews", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(ScreenerCreateReq request, @MappingTarget Screener entity);
}
