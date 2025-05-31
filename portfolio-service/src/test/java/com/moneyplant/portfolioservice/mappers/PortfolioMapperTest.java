package com.moneyplant.portfolioservice.mappers;

import com.moneyplant.portfolioservice.dtos.PortfolioDto;
import com.moneyplant.portfolioservice.dtos.PortfolioResponseDto;
import com.moneyplant.portfolioservice.entities.Portfolio;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import static org.junit.jupiter.api.Assertions.*;

class PortfolioMapperTest {

    private final PortfolioMapper portfolioMapper = Mappers.getMapper(PortfolioMapper.class);

    @Test
    void toEntity_ShouldMapDtoToEntity() {
        // Arrange
        PortfolioDto dto = new PortfolioDto();
        dto.setName("Test Portfolio");
        dto.setDescription("Test Description");

        // Act
        Portfolio entity = portfolioMapper.toEntity(dto);

        // Assert
        assertNotNull(entity);
        assertEquals("Test Portfolio", entity.getName());
        assertEquals("Test Description", entity.getDescription());
    }

    @Test
    void toResponseDto_ShouldMapEntityToResponseDto() {
        // Arrange
        Portfolio entity = new Portfolio();
        entity.setId("test-id");
        entity.setName("Test Portfolio");
        entity.setDescription("Test Description");

        // Act
        PortfolioResponseDto responseDto = portfolioMapper.toResponseDto(entity);

        // Assert
        assertNotNull(responseDto);
        assertEquals("test-id", responseDto.getId());
        assertEquals("Test Portfolio", responseDto.getName());
        assertEquals("Test Description", responseDto.getDescription());
    }

    @Test
    void updateEntityFromDto_ShouldUpdateEntityWithDtoValues() {
        // Arrange
        PortfolioDto dto = new PortfolioDto();
        dto.setName("Updated Portfolio");
        dto.setDescription("Updated Description");

        Portfolio entity = new Portfolio();
        entity.setId("test-id");
        entity.setName("Original Portfolio");
        entity.setDescription("Original Description");

        // Act
        Portfolio updatedEntity = portfolioMapper.updateEntityFromDto(dto, entity);

        // Assert
        assertNotNull(updatedEntity);
        assertEquals("test-id", updatedEntity.getId()); // ID should not change
        assertEquals("Updated Portfolio", updatedEntity.getName());
        assertEquals("Updated Description", updatedEntity.getDescription());
    }

    @Test
    void toEntity_ShouldHandleNullDto() {
        // Act & Assert
        assertNull(portfolioMapper.toEntity(null));
    }

    @Test
    void toResponseDto_ShouldHandleNullEntity() {
        // Act & Assert
        assertNull(portfolioMapper.toResponseDto(null));
    }
}