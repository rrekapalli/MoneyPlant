package com.moneyplant.screener.mappers;

import com.moneyplant.screener.dtos.SavedViewCreateReq;
import com.moneyplant.screener.dtos.SavedViewResp;
import com.moneyplant.screener.entities.ScreenerSavedView;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

/**
 * MapStruct mapper for ScreenerSavedView entity and DTOs.
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface SavedViewMapper {

    /**
     * Maps SavedViewCreateReq to ScreenerSavedView entity.
     */
    @Mapping(target = "savedViewId", ignore = true)
    @Mapping(target = "screener", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ScreenerSavedView toEntity(SavedViewCreateReq request);

    /**
     * Maps ScreenerSavedView entity to SavedViewResp.
     */
    @Mapping(source = "screener.screenerId", target = "screenerId")
    SavedViewResp toResponse(ScreenerSavedView entity);

    /**
     * Updates ScreenerSavedView entity from SavedViewCreateReq.
     */
    @Mapping(target = "savedViewId", ignore = true)
    @Mapping(target = "screener", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(SavedViewCreateReq request, @MappingTarget ScreenerSavedView entity);
}
