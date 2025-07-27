package com.moneyplant.transaction.controllers;

import com.moneyplant.transaction.dtos.CreateTransactionDTO;
import com.moneyplant.transaction.dtos.TransactionDTO;
import com.moneyplant.transaction.entities.TransactionStatus;
import com.moneyplant.transaction.entities.TransactionType;
import com.moneyplant.transaction.services.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * REST controller for managing transactions.
 */
@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Transaction", description = "Transaction management APIs")
public class TransactionController {

    private final TransactionService transactionService;

    /**
     * Create a new transaction.
     *
     * @param createTransactionDTO the transaction to create
     * @return the created transaction
     */
    @PostMapping
    @Operation(summary = "Create a new transaction")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Transaction created",
                    content = @Content(schema = @Schema(implementation = TransactionDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    public ResponseEntity<TransactionDTO> createTransaction(
            @Valid @RequestBody CreateTransactionDTO createTransactionDTO) {
        log.info("REST request to create Transaction : {}", createTransactionDTO);
        TransactionDTO result = transactionService.createTransaction(createTransactionDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    /**
     * Get a transaction by ID.
     *
     * @param id the ID of the transaction to retrieve
     * @return the transaction
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get a transaction by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Transaction found",
                    content = @Content(schema = @Schema(implementation = TransactionDTO.class))),
            @ApiResponse(responseCode = "404", description = "Transaction not found")
    })
    public ResponseEntity<TransactionDTO> getTransaction(
            @Parameter(description = "ID of the transaction to be obtained")
            @PathVariable String id) {
        log.info("REST request to get Transaction : {}", id);
        TransactionDTO transactionDTO = transactionService.getTransactionById(id);
        return ResponseEntity.ok(transactionDTO);
    }

    /**
     * Update an existing transaction.
     *
     * @param id the ID of the transaction to update
     * @param createTransactionDTO the transaction data to update
     * @return the updated transaction
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update an existing transaction")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Transaction updated",
                    content = @Content(schema = @Schema(implementation = TransactionDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "404", description = "Transaction not found")
    })
    public ResponseEntity<TransactionDTO> updateTransaction(
            @Parameter(description = "ID of the transaction to be updated")
            @PathVariable String id,
            @Valid @RequestBody CreateTransactionDTO createTransactionDTO) {
        log.info("REST request to update Transaction : {}, {}", id, createTransactionDTO);
        TransactionDTO result = transactionService.updateTransaction(id, createTransactionDTO);
        return ResponseEntity.ok(result);
    }

    /**
     * Delete a transaction.
     *
     * @param id the ID of the transaction to delete
     * @return no content
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a transaction")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Transaction deleted"),
            @ApiResponse(responseCode = "404", description = "Transaction not found")
    })
    public ResponseEntity<Void> deleteTransaction(
            @Parameter(description = "ID of the transaction to be deleted")
            @PathVariable String id) {
        log.info("REST request to delete Transaction : {}", id);
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get all transactions.
     *
     * @return the list of transactions
     */
    @GetMapping
    @Operation(summary = "Get all transactions")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of transactions",
                    content = @Content(schema = @Schema(implementation = TransactionDTO.class)))
    })
    public ResponseEntity<List<TransactionDTO>> getAllTransactions() {
        log.info("REST request to get all Transactions");
        List<TransactionDTO> transactions = transactionService.getAllTransactions();
        return ResponseEntity.ok(transactions);
    }

    /**
     * Get all transactions with pagination.
     *
     * @param pageable pagination information
     * @return the page of transactions
     */
    @GetMapping("/paged")
    @Operation(summary = "Get all transactions with pagination")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Page of transactions",
                    content = @Content(schema = @Schema(implementation = Page.class)))
    })
    public ResponseEntity<Page<TransactionDTO>> getAllTransactionsPaged(Pageable pageable) {
        log.info("REST request to get a page of Transactions");
        Page<TransactionDTO> page = transactionService.getAllTransactions(pageable);
        return ResponseEntity.ok(page);
    }

    /**
     * Get transactions for a specific user.
     *
     * @param userId the user ID
     * @return the list of transactions
     */
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get transactions for a specific user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of transactions",
                    content = @Content(schema = @Schema(implementation = TransactionDTO.class)))
    })
    public ResponseEntity<List<TransactionDTO>> getTransactionsByUserId(
            @Parameter(description = "ID of the user")
            @PathVariable String userId) {
        log.info("REST request to get Transactions for user : {}", userId);
        List<TransactionDTO> transactions = transactionService.getTransactionsByUserId(userId);
        return ResponseEntity.ok(transactions);
    }

    /**
     * Get transactions for a specific user with pagination.
     *
     * @param userId the user ID
     * @param pageable pagination information
     * @return the page of transactions
     */
    @GetMapping("/user/{userId}/paged")
    @Operation(summary = "Get transactions for a specific user with pagination")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Page of transactions",
                    content = @Content(schema = @Schema(implementation = Page.class)))
    })
    public ResponseEntity<Page<TransactionDTO>> getTransactionsByUserIdPaged(
            @Parameter(description = "ID of the user")
            @PathVariable String userId,
            Pageable pageable) {
        log.info("REST request to get a page of Transactions for user : {}", userId);
        Page<TransactionDTO> page = transactionService.getTransactionsByUserId(userId, pageable);
        return ResponseEntity.ok(page);
    }

    /**
     * Get transactions for a specific portfolio.
     *
     * @param portfolioId the portfolio ID
     * @return the list of transactions
     */
    @GetMapping("/portfolio/{portfolioId}")
    @Operation(summary = "Get transactions for a specific portfolio")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of transactions",
                    content = @Content(schema = @Schema(implementation = TransactionDTO.class)))
    })
    public ResponseEntity<List<TransactionDTO>> getTransactionsByPortfolioId(
            @Parameter(description = "ID of the portfolio")
            @PathVariable String portfolioId) {
        log.info("REST request to get Transactions for portfolio : {}", portfolioId);
        List<TransactionDTO> transactions = transactionService.getTransactionsByPortfolioId(portfolioId);
        return ResponseEntity.ok(transactions);
    }

    /**
     * Get transactions for a specific portfolio with pagination.
     *
     * @param portfolioId the portfolio ID
     * @param pageable pagination information
     * @return the page of transactions
     */
    @GetMapping("/portfolio/{portfolioId}/paged")
    @Operation(summary = "Get transactions for a specific portfolio with pagination")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Page of transactions",
                    content = @Content(schema = @Schema(implementation = Page.class)))
    })
    public ResponseEntity<Page<TransactionDTO>> getTransactionsByPortfolioIdPaged(
            @Parameter(description = "ID of the portfolio")
            @PathVariable String portfolioId,
            Pageable pageable) {
        log.info("REST request to get a page of Transactions for portfolio : {}", portfolioId);
        Page<TransactionDTO> page = transactionService.getTransactionsByPortfolioId(portfolioId, pageable);
        return ResponseEntity.ok(page);
    }

    /**
     * Get transactions for a specific stock symbol.
     *
     * @param stockSymbol the stock symbol
     * @return the list of transactions
     */
    @GetMapping("/stock/{stockSymbol}")
    @Operation(summary = "Get transactions for a specific stock symbol")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of transactions",
                    content = @Content(schema = @Schema(implementation = TransactionDTO.class)))
    })
    public ResponseEntity<List<TransactionDTO>> getTransactionsByStockSymbol(
            @Parameter(description = "Stock symbol")
            @PathVariable String stockSymbol) {
        log.info("REST request to get Transactions for stock : {}", stockSymbol);
        List<TransactionDTO> transactions = transactionService.getTransactionsByStockSymbol(stockSymbol);
        return ResponseEntity.ok(transactions);
    }

    /**
     * Get transactions of a specific type.
     *
     * @param type the transaction type
     * @return the list of transactions
     */
    @GetMapping("/type/{type}")
    @Operation(summary = "Get transactions of a specific type")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of transactions",
                    content = @Content(schema = @Schema(implementation = TransactionDTO.class)))
    })
    public ResponseEntity<List<TransactionDTO>> getTransactionsByType(
            @Parameter(description = "Transaction type")
            @PathVariable TransactionType type) {
        log.info("REST request to get Transactions of type : {}", type);
        List<TransactionDTO> transactions = transactionService.getTransactionsByType(type);
        return ResponseEntity.ok(transactions);
    }

    /**
     * Get transactions with a specific status.
     *
     * @param status the transaction status
     * @return the list of transactions
     */
    @GetMapping("/status/{status}")
    @Operation(summary = "Get transactions with a specific status")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of transactions",
                    content = @Content(schema = @Schema(implementation = TransactionDTO.class)))
    })
    public ResponseEntity<List<TransactionDTO>> getTransactionsByStatus(
            @Parameter(description = "Transaction status")
            @PathVariable TransactionStatus status) {
        log.info("REST request to get Transactions with status : {}", status);
        List<TransactionDTO> transactions = transactionService.getTransactionsByStatus(status);
        return ResponseEntity.ok(transactions);
    }

    /**
     * Get transactions between two dates.
     *
     * @param startDate the start date
     * @param endDate the end date
     * @return the list of transactions
     */
    @GetMapping("/date-range")
    @Operation(summary = "Get transactions between two dates")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of transactions",
                    content = @Content(schema = @Schema(implementation = TransactionDTO.class)))
    })
    public ResponseEntity<List<TransactionDTO>> getTransactionsBetweenDates(
            @Parameter(description = "Start date (ISO format)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "End date (ISO format)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.info("REST request to get Transactions between dates : {} and {}", startDate, endDate);
        List<TransactionDTO> transactions = transactionService.getTransactionsBetweenDates(startDate, endDate);
        return ResponseEntity.ok(transactions);
    }

    /**
     * Update the status of a transaction.
     *
     * @param id the transaction ID
     * @param status the new status
     * @return the updated transaction
     */
    @PatchMapping("/{id}/status/{status}")
    @Operation(summary = "Update the status of a transaction")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Transaction status updated",
                    content = @Content(schema = @Schema(implementation = TransactionDTO.class))),
            @ApiResponse(responseCode = "404", description = "Transaction not found")
    })
    public ResponseEntity<TransactionDTO> updateTransactionStatus(
            @Parameter(description = "ID of the transaction")
            @PathVariable String id,
            @Parameter(description = "New transaction status")
            @PathVariable TransactionStatus status) {
        log.info("REST request to update status of Transaction : {} to {}", id, status);
        TransactionDTO result = transactionService.updateTransactionStatus(id, status);
        return ResponseEntity.ok(result);
    }

    /**
     * Search for transactions by various criteria.
     *
     * @param userId the user ID (optional)
     * @param portfolioId the portfolio ID (optional)
     * @param stockSymbol the stock symbol (optional)
     * @param type the transaction type (optional)
     * @param status the transaction status (optional)
     * @param startDate the start date (optional)
     * @param endDate the end date (optional)
     * @param pageable pagination information
     * @return the page of transactions
     */
    @GetMapping("/search")
    @Operation(summary = "Search for transactions by various criteria")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Page of transactions",
                    content = @Content(schema = @Schema(implementation = Page.class)))
    })
    public ResponseEntity<Page<TransactionDTO>> searchTransactions(
            @Parameter(description = "User ID")
            @RequestParam(required = false) String userId,
            @Parameter(description = "Portfolio ID")
            @RequestParam(required = false) String portfolioId,
            @Parameter(description = "Stock symbol")
            @RequestParam(required = false) String stockSymbol,
            @Parameter(description = "Transaction type")
            @RequestParam(required = false) TransactionType type,
            @Parameter(description = "Transaction status")
            @RequestParam(required = false) TransactionStatus status,
            @Parameter(description = "Start date (ISO format)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "End date (ISO format)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Pageable pageable) {
        log.info("REST request to search Transactions with criteria: userId={}, portfolioId={}, stockSymbol={}, type={}, status={}, startDate={}, endDate={}",
                userId, portfolioId, stockSymbol, type, status, startDate, endDate);
        Page<TransactionDTO> page = transactionService.searchTransactions(
                userId, portfolioId, stockSymbol, type, status, startDate, endDate, pageable);
        return ResponseEntity.ok(page);
    }
}
