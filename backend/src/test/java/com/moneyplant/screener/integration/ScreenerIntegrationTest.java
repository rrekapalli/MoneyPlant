package com.moneyplant.screener.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyplant.screener.config.TestConfig;
import com.moneyplant.screener.dtos.ScreenerCreateReq;
import com.moneyplant.screener.entities.Screener;
import com.moneyplant.screener.repositories.ScreenerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for screener API.
 */
@SpringBootTest
@AutoConfigureWebMvc
@Import(TestConfig.class)
@ActiveProfiles("test")
@Transactional
public class ScreenerIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ScreenerRepository screenerRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    void testCreateScreener() throws Exception {
        ScreenerCreateReq request = ScreenerCreateReq.builder()
                .name("Test Screener")
                .description("Test Description")
                .isPublic(false)
                .defaultUniverse("NSE_500")
                .build();

        mockMvc.perform(post("/api/screeners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Test Screener"))
                .andExpect(jsonPath("$.description").value("Test Description"))
                .andExpect(jsonPath("$.isPublic").value(false))
                .andExpect(jsonPath("$.defaultUniverse").value("NSE_500"));
    }

    @Test
    void testGetScreener() throws Exception {
        // Create a screener first
        Screener screener = Screener.builder()
                .ownerUserId(1L)
                .name("Test Screener")
                .description("Test Description")
                .isPublic(true)
                .defaultUniverse("NSE_500")
                .build();
        Screener savedScreener = screenerRepository.save(screener);

        mockMvc.perform(get("/api/screeners/{id}", savedScreener.getScreenerId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.screenerId").value(savedScreener.getScreenerId()))
                .andExpect(jsonPath("$.name").value("Test Screener"))
                .andExpect(jsonPath("$.description").value("Test Description"))
                .andExpect(jsonPath("$.isPublic").value(true));
    }

    @Test
    void testListScreeners() throws Exception {
        // Create some screeners
        Screener screener1 = Screener.builder()
                .ownerUserId(1L)
                .name("My Screener")
                .description("My Description")
                .isPublic(false)
                .build();
        screenerRepository.save(screener1);

        Screener screener2 = Screener.builder()
                .ownerUserId(2L)
                .name("Public Screener")
                .description("Public Description")
                .isPublic(true)
                .build();
        screenerRepository.save(screener2);

        mockMvc.perform(get("/api/screeners")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10));
    }

    @Test
    void testUpdateScreener() throws Exception {
        // Create a screener first
        Screener screener = Screener.builder()
                .ownerUserId(1L)
                .name("Original Name")
                .description("Original Description")
                .isPublic(false)
                .build();
        Screener savedScreener = screenerRepository.save(screener);

        ScreenerCreateReq updateRequest = ScreenerCreateReq.builder()
                .name("Updated Name")
                .description("Updated Description")
                .isPublic(true)
                .build();

        mockMvc.perform(patch("/api/screeners/{id}", savedScreener.getScreenerId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.description").value("Updated Description"))
                .andExpect(jsonPath("$.isPublic").value(true));
    }

    @Test
    void testDeleteScreener() throws Exception {
        // Create a screener first
        Screener screener = Screener.builder()
                .ownerUserId(1L)
                .name("To Delete")
                .description("Will be deleted")
                .isPublic(false)
                .build();
        Screener savedScreener = screenerRepository.save(screener);

        mockMvc.perform(delete("/api/screeners/{id}", savedScreener.getScreenerId()))
                .andExpect(status().isNoContent());

        // Verify it's deleted
        mockMvc.perform(get("/api/screeners/{id}", savedScreener.getScreenerId()))
                .andExpect(status().isNotFound());
    }

    @Test
    void testCreateScreenerValidation() throws Exception {
        ScreenerCreateReq request = ScreenerCreateReq.builder()
                .name("") // Empty name should fail validation
                .description("Test Description")
                .build();

        mockMvc.perform(post("/api/screeners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validation Error"))
                .andExpect(jsonPath("$.fieldErrors.name").exists());
    }
}
