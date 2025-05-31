package com.moneyplant.stockservice.mappers;

import com.moneyplant.stockservice.dtos.StockDto;
import com.moneyplant.stockservice.dtos.StockResponseDto;
import com.moneyplant.stockservice.entities.Stock;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

/**
 * Mapper interface for converting between Stock entity and DTOs.
 * Uses MapStruct for automatic implementation.
 */
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface StockMapper {

    /**
     * Converts a StockDto to a Stock entity.
     *
     * @param stockDto The DTO to convert
     * @return The converted Stock entity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "modifiedBy", ignore = true)
    @Mapping(target = "createdOn", ignore = true)
    @Mapping(target = "modifiedOn", ignore = true)
    Stock toEntity(StockDto stockDto);

    /**
     * Converts a Stock entity to a StockResponseDto.
     * Maps the stock entity fields to the response DTO.
     *
     * @param stock The entity to convert
     * @return The converted StockResponseDto
     */
    StockResponseDto toResponseDto(Stock stock);

    /**
     * Updates an existing Stock entity with data from a StockDto.
     * Updates only the name and symbol fields.
     *
     * @param stockDto The DTO containing the new data
     * @param stock The entity to update
     * @return The updated Stock entity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "modifiedBy", ignore = true)
    @Mapping(target = "createdOn", ignore = true)
    @Mapping(target = "modifiedOn", ignore = true)
    Stock updateEntityFromDto(StockDto stockDto, Stock stock);
}
