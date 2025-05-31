package com.moneyplant.portfolioservice.contracts;

import com.moneyplant.portfolioservice.controllers.PortfolioController;
import com.moneyplant.portfolioservice.dtos.PortfolioDto;
import com.moneyplant.portfolioservice.dtos.PortfolioResponseDto;
import com.moneyplant.portfolioservice.services.PortfolioService;
import io.restassured.module.mockmvc.RestAssuredMockMvc;
import org.junit.jupiter.api.BeforeEach;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cloud.contract.verifier.messaging.boot.AutoConfigureMessageVerifier;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.test.web.servlet.setup.StandaloneMockMvcBuilder;

import java.util.Arrays;
import java.util.List;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMessageVerifier
public abstract class BaseContractTest {

    @Autowired
    private PortfolioController portfolioController;

    @MockBean
    private PortfolioService portfolioService;

    @BeforeEach
    public void setup() {
        StandaloneMockMvcBuilder standaloneMockMvcBuilder = MockMvcBuilders.standaloneSetup(portfolioController);
        RestAssuredMockMvc.standaloneSetup(standaloneMockMvcBuilder);

        // Setup mock responses
        PortfolioResponseDto portfolioResponseDto = new PortfolioResponseDto();
        portfolioResponseDto.setId("test-id");
        portfolioResponseDto.setName("Test Portfolio");
        portfolioResponseDto.setDescription("Test Description");

        List<PortfolioResponseDto> portfolioResponseDtoList = Arrays.asList(portfolioResponseDto);

        // Mock service methods
        Mockito.when(portfolioService.createPortfolio(Mockito.any(PortfolioDto.class)))
                .thenReturn(portfolioResponseDto);
        Mockito.when(portfolioService.getAllPortfolios())
                .thenReturn(portfolioResponseDtoList);
        Mockito.when(portfolioService.getPortfolioById("test-id"))
                .thenReturn(portfolioResponseDto);
    }
}