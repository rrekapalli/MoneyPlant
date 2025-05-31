package com.moneyplant.portfolioservice.mappers;

import com.moneyplant.portfolioservice.dtos.PortfolioDto;
import com.moneyplant.portfolioservice.dtos.PortfolioResponseDto;
import com.moneyplant.portfolioservice.entities.Portfolio;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

/**
 * Mapper interface for converting between Portfolio entity and DTOs.
 * Uses MapStruct for automatic implementation.
 */
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface PortfolioMapper {

    /**
     * Converts a PortfolioDto to a Portfolio entity.
     *
     * @param portfolioDto The DTO to convert
     * @return The converted Portfolio entity
     */
    Portfolio toEntity(PortfolioDto portfolioDto);

    /**
     * Converts a Portfolio entity to a PortfolioResponseDto.
     *
     * @param portfolio The entity to convert
     * @return The converted PortfolioResponseDto
     */
    PortfolioResponseDto toResponseDto(Portfolio portfolio);

    /**
     * Updates an existing Portfolio entity with data from a PortfolioDto.
     *
     * @param portfolioDto The DTO containing the new data
     * @param portfolio The entity to update
     * @return The updated Portfolio entity
     */
    Portfolio updateEntityFromDto(PortfolioDto portfolioDto, Portfolio portfolio);
}