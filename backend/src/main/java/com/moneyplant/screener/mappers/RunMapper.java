package com.moneyplant.screener.mappers;

import com.moneyplant.screener.dtos.RunCreateReq;
import com.moneyplant.screener.dtos.RunResp;
import com.moneyplant.screener.entities.ScreenerRun;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

/**
 * MapStruct mapper for ScreenerRun entity and DTOs.
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface RunMapper {

    /**
     * Maps ScreenerRun entity to RunResp.
     */
    @Mapping(source = "screener.screenerId", target = "screenerId")
    @Mapping(source = "screenerVersion.screenerVersionId", target = "screenerVersionId")
    RunResp toResponse(ScreenerRun entity);

    /**
     * Updates ScreenerRun entity from RunCreateReq.
     */
    @Mapping(target = "screenerRunId", ignore = true)
    @Mapping(target = "screener", ignore = true)
    @Mapping(target = "screenerVersion", ignore = true)
    @Mapping(target = "triggeredByUserId", ignore = true)
    @Mapping(target = "paramset", ignore = true)
    @Mapping(target = "universeSnapshot", ignore = true)
    @Mapping(target = "startedAt", ignore = true)
    @Mapping(target = "finishedAt", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "errorMessage", ignore = true)
    @Mapping(target = "totalCandidates", ignore = true)
    @Mapping(target = "totalMatches", ignore = true)
    @Mapping(target = "results", ignore = true)
    @Mapping(target = "resultDiffs", ignore = true)
    void updateEntity(RunCreateReq request, @MappingTarget ScreenerRun entity);
}
