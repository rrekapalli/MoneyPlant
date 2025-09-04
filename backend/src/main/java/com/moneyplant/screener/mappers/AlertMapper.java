package com.moneyplant.screener.mappers;

import com.moneyplant.screener.dtos.AlertCreateReq;
import com.moneyplant.screener.dtos.AlertResp;
import com.moneyplant.screener.entities.ScreenerAlert;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

/**
 * MapStruct mapper for ScreenerAlert entity and DTOs.
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface AlertMapper {

    /**
     * Maps AlertCreateReq to ScreenerAlert entity.
     */
    @Mapping(target = "alertId", ignore = true)
    @Mapping(target = "screener", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ScreenerAlert toEntity(AlertCreateReq request);

    /**
     * Maps ScreenerAlert entity to AlertResp.
     */
    @Mapping(source = "screener.screenerId", target = "screenerId")
    AlertResp toResponse(ScreenerAlert entity);

    /**
     * Updates ScreenerAlert entity from AlertCreateReq.
     */
    @Mapping(target = "alertId", ignore = true)
    @Mapping(target = "screener", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(AlertCreateReq request, @MappingTarget ScreenerAlert entity);
}
