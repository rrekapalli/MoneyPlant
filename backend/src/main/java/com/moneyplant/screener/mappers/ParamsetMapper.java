package com.moneyplant.screener.mappers;

import com.moneyplant.screener.dtos.ParamsetCreateReq;
import com.moneyplant.screener.dtos.ParamsetResp;
import com.moneyplant.screener.entities.ScreenerParamset;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

/**
 * MapStruct mapper for ScreenerParamset entity and DTOs.
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ParamsetMapper {

    /**
     * Maps ParamsetCreateReq to ScreenerParamset entity.
     */
    @Mapping(target = "paramsetId", ignore = true)
    @Mapping(target = "screenerVersion", ignore = true)
    @Mapping(target = "createdByUserId", ignore = true)
    @Mapping(target = "runs", ignore = true)
    ScreenerParamset toEntity(ParamsetCreateReq request);

    /**
     * Maps ScreenerParamset entity to ParamsetResp.
     */
    @Mapping(source = "screenerVersion.screenerVersionId", target = "screenerVersionId")
    ParamsetResp toResponse(ScreenerParamset entity);

    /**
     * Updates ScreenerParamset entity from ParamsetCreateReq.
     */
    @Mapping(target = "paramsetId", ignore = true)
    @Mapping(target = "screenerVersion", ignore = true)
    @Mapping(target = "createdByUserId", ignore = true)
    @Mapping(target = "runs", ignore = true)
    void updateEntity(ParamsetCreateReq request, @MappingTarget ScreenerParamset entity);
}
