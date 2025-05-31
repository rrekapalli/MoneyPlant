package com.moneyplant.transactionservice.services;

import com.moneyplant.transactionservice.dtos.CreateTransactionDTO;
import com.moneyplant.transactionservice.dtos.TransactionDTO;
import com.moneyplant.transactionservice.entities.TransactionStatus;
import com.moneyplant.transactionservice.entities.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service interface for managing transactions.
 */
public interface TransactionService {

    /**
     * Create a new transaction.
     *
     * @param createTransactionDTO the DTO containing transaction data
     * @return the created transaction
     */
    TransactionDTO createTransaction(CreateTransactionDTO createTransactionDTO);

    /**
     * Get a transaction by ID.
     *
     * @param id the transaction ID
     * @return the transaction
     */
    TransactionDTO getTransactionById(String id);

    /**
     * Update an existing transaction.
     *
     * @param id the transaction ID
     * @param createTransactionDTO the DTO containing updated transaction data
     * @return the updated transaction
     */
    TransactionDTO updateTransaction(String id, CreateTransactionDTO createTransactionDTO);

    /**
     * Delete a transaction by ID.
     *
     * @param id the transaction ID
     */
    void deleteTransaction(String id);

    /**
     * Get all transactions.
     *
     * @return a list of all transactions
     */
    List<TransactionDTO> getAllTransactions();

    /**
     * Get all transactions with pagination.
     *
     * @param pageable pagination information
     * @return a page of transactions
     */
    Page<TransactionDTO> getAllTransactions(Pageable pageable);

    /**
     * Get transactions for a specific user.
     *
     * @param userId the user ID
     * @return a list of transactions
     */
    List<TransactionDTO> getTransactionsByUserId(String userId);

    /**
     * Get transactions for a specific user with pagination.
     *
     * @param userId the user ID
     * @param pageable pagination information
     * @return a page of transactions
     */
    Page<TransactionDTO> getTransactionsByUserId(String userId, Pageable pageable);

    /**
     * Get transactions for a specific portfolio.
     *
     * @param portfolioId the portfolio ID
     * @return a list of transactions
     */
    List<TransactionDTO> getTransactionsByPortfolioId(String portfolioId);

    /**
     * Get transactions for a specific portfolio with pagination.
     *
     * @param portfolioId the portfolio ID
     * @param pageable pagination information
     * @return a page of transactions
     */
    Page<TransactionDTO> getTransactionsByPortfolioId(String portfolioId, Pageable pageable);

    /**
     * Get transactions for a specific stock symbol.
     *
     * @param stockSymbol the stock symbol
     * @return a list of transactions
     */
    List<TransactionDTO> getTransactionsByStockSymbol(String stockSymbol);

    /**
     * Get transactions of a specific type.
     *
     * @param type the transaction type
     * @return a list of transactions
     */
    List<TransactionDTO> getTransactionsByType(TransactionType type);

    /**
     * Get transactions with a specific status.
     *
     * @param status the transaction status
     * @return a list of transactions
     */
    List<TransactionDTO> getTransactionsByStatus(TransactionStatus status);

    /**
     * Get transactions between two dates.
     *
     * @param startDate the start date
     * @param endDate the end date
     * @return a list of transactions
     */
    List<TransactionDTO> getTransactionsBetweenDates(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Update the status of a transaction.
     *
     * @param id the transaction ID
     * @param status the new status
     * @return the updated transaction
     */
    TransactionDTO updateTransactionStatus(String id, TransactionStatus status);

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
     * @return a page of transactions
     */
    Page<TransactionDTO> searchTransactions(
            String userId,
            String portfolioId,
            String stockSymbol,
            TransactionType type,
            TransactionStatus status,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable);
}