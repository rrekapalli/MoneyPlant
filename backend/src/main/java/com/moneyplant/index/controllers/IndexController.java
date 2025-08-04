package com.moneyplant.index.controllers;

import com.moneyplant.index.dtos.IndexDto;
import com.moneyplant.index.dtos.IndexResponseDto;
import com.moneyplant.core.exceptions.ResourceNotFoundException;
import com.moneyplant.index.services.IndexService;
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
@RequestMapping("api/v1/index")
@RequiredArgsConstructor
@Tag(name = "Index", description = "Index management API")
public class IndexController {

    private final IndexService indexService;

    /**
     * Creates a new index
     * 
     * @param indexToCreate The validated index data to create
     * @return The created index response
     */
    @Operation(summary = "Create a new index", description = "Creates a new index with the provided information")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Index created successfully",
                content = @Content(schema = @Schema(implementation = IndexResponseDto.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IndexResponseDto createIndex(
            @Parameter(description = "Index data to create", required = true)
            @Valid @RequestBody IndexDto indexToCreate){
        return indexService.createIndex(indexToCreate);
    }

    /**
     * Gets all indices
     * 
     * @return List of index responses
     */
    @Operation(summary = "Get all indices", description = "Retrieves a list of all indices")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved indices"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<IndexResponseDto> getAllIndices(){
        return indexService.getAllIndices();
    }

    /**
     * Gets an index by ID
     * 
     * @param id The ID of the index to retrieve
     * @return The index response
     * @throws ResourceNotFoundException if the index is not found
     */
    @Operation(summary = "Get an index by ID", description = "Retrieves an index by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved index"),
        @ApiResponse(responseCode = "404", description = "Index not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public IndexResponseDto getIndexById(
            @Parameter(description = "ID of the index to retrieve", required = true)
            @PathVariable Integer id){
        return indexService.getIndexById(id);
    }

    /**
     * Gets an index by symbol
     * 
     * @param symbol The symbol of the index to retrieve
     * @return The index response
     * @throws ResourceNotFoundException if the index is not found
     */
    @Operation(summary = "Get an index by symbol", description = "Retrieves an index by its symbol")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved index"),
        @ApiResponse(responseCode = "404", description = "Index not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/symbol/{symbol}")
    @ResponseStatus(HttpStatus.OK)
    public IndexResponseDto getIndexBySymbol(
            @Parameter(description = "Symbol of the index to retrieve", required = true)
            @PathVariable String symbol){
        return indexService.getIndexBySymbol(symbol);
    }

    /**
     * Gets an index by name
     * 
     * @param name The name of the index to retrieve
     * @return The index response
     * @throws ResourceNotFoundException if the index is not found
     */
    @Operation(summary = "Get an index by name", description = "Retrieves an index by its name")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved index"),
        @ApiResponse(responseCode = "404", description = "Index not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/name/{name}")
    @ResponseStatus(HttpStatus.OK)
    public IndexResponseDto getIndexByName(
            @Parameter(description = "Name of the index to retrieve", required = true)
            @PathVariable String name){
        return indexService.getIndexByName(name);
    }

    /**
     * Gets an index by key category
     * 
     * @param category The key category of the index to retrieve
     * @return The index response
     * @throws ResourceNotFoundException if the index is not found
     */
    @Operation(summary = "Get an index by key category", description = "Retrieves an index by its key category")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved index"),
        @ApiResponse(responseCode = "404", description = "Index not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/category/{category}")
    @ResponseStatus(HttpStatus.OK)
    public IndexResponseDto getIndexByKeyCategory(
            @Parameter(description = "Key category of the index to retrieve", required = true)
            @PathVariable String category){
        return indexService.getIndexByKeyCategory(category);
    }

}