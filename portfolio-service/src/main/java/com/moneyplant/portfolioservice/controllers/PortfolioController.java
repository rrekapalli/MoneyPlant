package com.moneyplant.portfolioservice.controllers;

import com.moneyplant.portfolioservice.dtos.PortfolioDto;
import com.moneyplant.portfolioservice.dtos.PortfolioResponseDto;
import com.moneyplant.portfolioservice.exceptions.ResourceNotFoundException;
import com.moneyplant.portfolioservice.services.PortfolioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/portfolio")
@RequiredArgsConstructor
@Tag(name = "Portfolio", description = "Portfolio management API")
public class PortfolioController {
    private final PortfolioService portfolioService;

    /**
     * Creates a new portfolio
     * 
     * @param portfolioToCreate The validated portfolio data to create
     * @return The created portfolio response
     */
    @Operation(summary = "Create a new portfolio", description = "Creates a new portfolio with the provided information")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Portfolio created successfully",
                content = @Content(schema = @Schema(implementation = PortfolioResponseDto.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PortfolioResponseDto createPortfolio(
            @Parameter(description = "Portfolio data to create", required = true)
            @Valid @RequestBody PortfolioDto portfolioToCreate){
        return portfolioService.createPortfolio(portfolioToCreate);
    }

    /**
     * Gets all portfolios
     * 
     * @return List of portfolio responses
     */
    @Operation(summary = "Get all portfolios", description = "Retrieves a list of all portfolios")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved portfolios"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<PortfolioResponseDto> getAllPortfolios(){
        return portfolioService.getAllPortfolios();
    }

    /**
     * Gets a portfolio by ID
     * 
     * @param id The ID of the portfolio to retrieve
     * @return The portfolio response
     * @throws ResourceNotFoundException if the portfolio is not found
     */
    @Operation(summary = "Get a portfolio by ID", description = "Retrieves a portfolio by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved portfolio"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public PortfolioResponseDto getPortfolioById(
            @Parameter(description = "ID of the portfolio to retrieve", required = true)
            @PathVariable String id){
        return portfolioService.getPortfolioById(id);
    }
}
