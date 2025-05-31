package com.moneyplant.portfolioservice.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyplant.portfolioservice.dtos.PortfolioDto;
import com.moneyplant.portfolioservice.dtos.PortfolioResponseDto;
import com.moneyplant.portfolioservice.exceptions.ResourceNotFoundException;
import com.moneyplant.portfolioservice.services.PortfolioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PortfolioController.class)
class PortfolioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PortfolioService portfolioService;

    private PortfolioDto portfolioDto;
    private PortfolioResponseDto portfolioResponseDto;
    private List<PortfolioResponseDto> portfolioResponseDtoList;

    @BeforeEach
    void setUp() {
        // Setup test data
        portfolioDto = new PortfolioDto();
        portfolioDto.setName("Test Portfolio");
        portfolioDto.setDescription("Test Description");

        portfolioResponseDto = new PortfolioResponseDto();
        portfolioResponseDto.setId("test-id");
        portfolioResponseDto.setName("Test Portfolio");
        portfolioResponseDto.setDescription("Test Description");

        portfolioResponseDtoList = Arrays.asList(portfolioResponseDto);
    }

    @Test
    void createPortfolio_Success() throws Exception {
        // Arrange
        when(portfolioService.createPortfolio(any(PortfolioDto.class))).thenReturn(portfolioResponseDto);

        // Act & Assert
        mockMvc.perform(post("/api/v1/portfolio")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(portfolioDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is("test-id")))
                .andExpect(jsonPath("$.name", is("Test Portfolio")))
                .andExpect(jsonPath("$.description", is("Test Description")));
    }

    @Test
    void createPortfolio_BadRequest_WhenInvalidInput() throws Exception {
        // Arrange
        PortfolioDto invalidDto = new PortfolioDto();
        // Name and description are null, which violates @NotBlank constraints

        // Act & Assert
        mockMvc.perform(post("/api/v1/portfolio")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getAllPortfolios_Success() throws Exception {
        // Arrange
        when(portfolioService.getAllPortfolios()).thenReturn(portfolioResponseDtoList);

        // Act & Assert
        mockMvc.perform(get("/api/v1/portfolio"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is("test-id")))
                .andExpect(jsonPath("$[0].name", is("Test Portfolio")))
                .andExpect(jsonPath("$[0].description", is("Test Description")));
    }

    @Test
    void getPortfolioById_Success() throws Exception {
        // Arrange
        when(portfolioService.getPortfolioById("test-id")).thenReturn(portfolioResponseDto);

        // Act & Assert
        mockMvc.perform(get("/api/v1/portfolio/test-id"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is("test-id")))
                .andExpect(jsonPath("$.name", is("Test Portfolio")))
                .andExpect(jsonPath("$.description", is("Test Description")));
    }

    @Test
    void getPortfolioById_NotFound_WhenPortfolioDoesNotExist() throws Exception {
        // Arrange
        when(portfolioService.getPortfolioById("non-existent-id"))
                .thenThrow(new ResourceNotFoundException("Portfolio not found with id: non-existent-id"));

        // Act & Assert
        mockMvc.perform(get("/api/v1/portfolio/non-existent-id"))
                .andExpect(status().isNotFound());
    }
}