package com.moneyplant.screener.mappers;

import com.moneyplant.screener.dtos.ScreenerVersionCreateReq;
import com.moneyplant.screener.dtos.ScreenerVersionResp;
import com.moneyplant.screener.entities.ScreenerVersion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

/**
 * MapStruct mapper for ScreenerVersion entity and DTOs.
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ScreenerVersionMapper {

    /**
     * Maps ScreenerVersionCreateReq to ScreenerVersion entity.
     */
    @Mapping(target = "screenerVersionId", ignore = true)
    @Mapping(target = "screener", ignore = true)
    @Mapping(target = "paramsets", ignore = true)
    @Mapping(target = "runs", ignore = true)
    ScreenerVersion toEntity(ScreenerVersionCreateReq request);

    /**
     * Maps ScreenerVersion entity to ScreenerVersionResp.
     */
    @Mapping(source = "screener.screenerId", target = "screenerId")
    ScreenerVersionResp toResponse(ScreenerVersion entity);

    /**
     * Updates ScreenerVersion entity from ScreenerVersionCreateReq.
     */
    @Mapping(target = "screenerVersionId", ignore = true)
    @Mapping(target = "screener", ignore = true)
    @Mapping(target = "paramsets", ignore = true)
    @Mapping(target = "runs", ignore = true)
    void updateEntity(ScreenerVersionCreateReq request, @MappingTarget ScreenerVersion entity);
}
