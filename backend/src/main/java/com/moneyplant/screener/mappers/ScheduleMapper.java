package com.moneyplant.screener.mappers;

import com.moneyplant.screener.dtos.ScheduleCreateReq;
import com.moneyplant.screener.dtos.ScheduleResp;
import com.moneyplant.screener.entities.ScreenerSchedule;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

/**
 * MapStruct mapper for ScreenerSchedule entity and DTOs.
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ScheduleMapper {

    /**
     * Maps ScheduleCreateReq to ScreenerSchedule entity.
     */
    @Mapping(target = "scheduleId", ignore = true)
    @Mapping(target = "screener", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ScreenerSchedule toEntity(ScheduleCreateReq request);

    /**
     * Maps ScreenerSchedule entity to ScheduleResp.
     */
    @Mapping(source = "screener.screenerId", target = "screenerId")
    ScheduleResp toResponse(ScreenerSchedule entity);

    /**
     * Updates ScreenerSchedule entity from ScheduleCreateReq.
     */
    @Mapping(target = "scheduleId", ignore = true)
    @Mapping(target = "screener", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(ScheduleCreateReq request, @MappingTarget ScreenerSchedule entity);
}
