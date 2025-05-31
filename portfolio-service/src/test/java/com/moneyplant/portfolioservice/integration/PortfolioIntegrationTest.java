package com.moneyplant.portfolioservice.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyplant.portfolioservice.config.TestContainersConfig;
import com.moneyplant.portfolioservice.dtos.PortfolioDto;
import com.moneyplant.portfolioservice.entities.Portfolio;
import com.moneyplant.portfolioservice.repositories.PortfolioRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestContainersConfig.class)
@Testcontainers
class PortfolioIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PortfolioRepository portfolioRepository;

    private Portfolio testPortfolio;

    @BeforeEach
    void setUp() {
        // Create a test portfolio directly in the repository
        testPortfolio = new Portfolio();
        testPortfolio.setId(UUID.randomUUID().toString());
        testPortfolio.setName("Test Portfolio");
        testPortfolio.setDescription("Test Description");
        portfolioRepository.save(testPortfolio);
    }

    @AfterEach
    void tearDown() {
        // Clean up the database after each test
        portfolioRepository.deleteAll();
    }

    @Test
    void createPortfolio_Success() throws Exception {
        // Arrange
        PortfolioDto portfolioDto = new PortfolioDto();
        portfolioDto.setName("New Portfolio");
        portfolioDto.setDescription("New Description");

        // Act & Assert
        mockMvc.perform(post("/api/v1/portfolio")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(portfolioDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("New Portfolio")))
                .andExpect(jsonPath("$.description", is("New Description")));
    }

    @Test
    void getAllPortfolios_Success() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/portfolio"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(testPortfolio.getId())))
                .andExpect(jsonPath("$[0].name", is("Test Portfolio")))
                .andExpect(jsonPath("$[0].description", is("Test Description")));
    }

    @Test
    void getPortfolioById_Success() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/portfolio/" + testPortfolio.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(testPortfolio.getId())))
                .andExpect(jsonPath("$.name", is("Test Portfolio")))
                .andExpect(jsonPath("$.description", is("Test Description")));
    }

    @Test
    void getPortfolioById_NotFound_WhenPortfolioDoesNotExist() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/portfolio/non-existent-id"))
                .andExpect(status().isNotFound());
    }
}
