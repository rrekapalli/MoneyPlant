package com.moneyplant.transaction.repositories;

import com.moneyplant.transaction.entities.Transaction;
import com.moneyplant.transaction.entities.TransactionStatus;
import com.moneyplant.transaction.entities.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for Transaction entity.
 * Provides methods to interact with the transactions table in the database.
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {

    /**
     * Find all transactions for a specific user.
     *
     * @param userId the ID of the user
     * @return a list of transactions
     */
    List<Transaction> findByUserId(String userId);

    /**
     * Find all transactions for a specific portfolio.
     *
     * @param portfolioId the ID of the portfolio
     * @return a list of transactions
     */
    List<Transaction> findByPortfolioId(String portfolioId);

    /**
     * Find all transactions for a specific stock symbol.
     *
     * @param stockSymbol the stock symbol
     * @return a list of transactions
     */
    List<Transaction> findByStockSymbol(String stockSymbol);

    /**
     * Find all transactions of a specific type.
     *
     * @param type the transaction type
     * @return a list of transactions
     */
    List<Transaction> findByType(TransactionType type);

    /**
     * Find all transactions with a specific status.
     *
     * @param status the transaction status
     * @return a list of transactions
     */
    List<Transaction> findByStatus(TransactionStatus status);

    /**
     * Find all transactions for a specific user with pagination.
     *
     * @param userId the ID of the user
     * @param pageable pagination information
     * @return a page of transactions
     */
    Page<Transaction> findByUserId(String userId, Pageable pageable);

    /**
     * Find all transactions for a specific portfolio with pagination.
     *
     * @param portfolioId the ID of the portfolio
     * @param pageable pagination information
     * @return a page of transactions
     */
    Page<Transaction> findByPortfolioId(String portfolioId, Pageable pageable);

    /**
     * Find all transactions between two dates.
     *
     * @param startDate the start date
     * @param endDate the end date
     * @return a list of transactions
     */
    List<Transaction> findByTransactionDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find all transactions for a specific user and portfolio.
     *
     * @param userId the ID of the user
     * @param portfolioId the ID of the portfolio
     * @return a list of transactions
     */
    List<Transaction> findByUserIdAndPortfolioId(String userId, String portfolioId);

    /**
     * Find all transactions for a specific user and stock symbol.
     *
     * @param userId the ID of the user
     * @param stockSymbol the stock symbol
     * @return a list of transactions
     */
    List<Transaction> findByUserIdAndStockSymbol(String userId, String stockSymbol);

    /**
     * Find all transactions for a specific portfolio and stock symbol.
     *
     * @param portfolioId the ID of the portfolio
     * @param stockSymbol the stock symbol
     * @return a list of transactions
     */
    List<Transaction> findByPortfolioIdAndStockSymbol(String portfolioId, String stockSymbol);

    /**
     * Search for transactions by various criteria.
     *
     * @param userId the ID of the user (optional)
     * @param portfolioId the ID of the portfolio (optional)
     * @param stockSymbol the stock symbol (optional)
     * @param type the transaction type (optional)
     * @param status the transaction status (optional)
     * @param startDate the start date (optional)
     * @param endDate the end date (optional)
     * @param pageable pagination information
     * @return a page of transactions
     */
    @Query("SELECT t FROM Transaction t WHERE " +
            "(:userId IS NULL OR t.userId = :userId) AND " +
            "(:portfolioId IS NULL OR t.portfolioId = :portfolioId) AND " +
            "(:stockSymbol IS NULL OR t.stockSymbol = :stockSymbol) AND " +
            "(:type IS NULL OR t.type = :type) AND " +
            "(:status IS NULL OR t.status = :status) AND " +
            "(:startDate IS NULL OR t.transactionDate >= :startDate) AND " +
            "(:endDate IS NULL OR t.transactionDate <= :endDate)")
    Page<Transaction> searchTransactions(
            @Param("userId") String userId,
            @Param("portfolioId") String portfolioId,
            @Param("stockSymbol") String stockSymbol,
            @Param("type") TransactionType type,
            @Param("status") TransactionStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);
}