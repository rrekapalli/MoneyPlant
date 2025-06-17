package com.moneyplant.transactionservice.services;

import com.moneyplant.transactionservice.dtos.CreateTransactionDTO;
import com.moneyplant.transactionservice.dtos.TransactionDTO;
import com.moneyplant.transactionservice.entities.Transaction;
import com.moneyplant.transactionservice.entities.TransactionStatus;
import com.moneyplant.transactionservice.entities.TransactionType;
import com.moneyplant.core.exceptions.ResourceNotFoundException;
import com.moneyplant.transactionservice.mappers.TransactionMapper;
import com.moneyplant.transactionservice.repositories.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

/**
 * Implementation of the TransactionService interface.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;


    @Override
    @Transactional
    public TransactionDTO createTransaction(CreateTransactionDTO createTransactionDTO) {
        log.info("Creating new transaction for user: {}, portfolio: {}, stock: {}",
                createTransactionDTO.getUserId(),
                createTransactionDTO.getPortfolioId(),
                createTransactionDTO.getStockSymbol());

        // Convert DTO to entity using mapper
        Transaction transaction = transactionMapper.toEntity(createTransactionDTO);
        transaction.calculateTotalValue();
        Transaction savedTransaction = transactionRepository.save(transaction);

        log.info("Transaction created with ID: {}", savedTransaction.getId());

        // Convert entity to DTO using mapper
        return transactionMapper.toDto(savedTransaction);
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionDTO getTransactionById(String id) {
        log.info("Fetching transaction with ID: {}", id);

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with ID: " + id));

        return transactionMapper.toDto(transaction);
    }

    @Override
    @Transactional
    public TransactionDTO updateTransaction(String id, CreateTransactionDTO createTransactionDTO) {
        log.info("Updating transaction with ID: {}", id);

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with ID: " + id));

        transactionMapper.updateEntityFromDto(createTransactionDTO, transaction);
        transaction.calculateTotalValue();
        Transaction updatedTransaction = transactionRepository.save(transaction);

        log.info("Transaction updated with ID: {}", updatedTransaction.getId());
        return transactionMapper.toDto(updatedTransaction);
    }

    @Override
    @Transactional
    public void deleteTransaction(String id) {
        log.info("Deleting transaction with ID: {}", id);

        if (!transactionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Transaction not found with ID: " + id);
        }

        transactionRepository.deleteById(id);
        log.info("Transaction deleted with ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionDTO> getAllTransactions() {
        log.info("Fetching all transactions");

        List<Transaction> transactions = transactionRepository.findAll();
        return transactionMapper.toDtoList(transactions);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TransactionDTO> getAllTransactions(Pageable pageable) {
        log.info("Fetching all transactions with pagination");

        Page<Transaction> transactionsPage = transactionRepository.findAll(pageable);
        return transactionsPage.map(transactionMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionDTO> getTransactionsByUserId(String userId) {
        log.info("Fetching transactions for user: {}", userId);

        List<Transaction> transactions = transactionRepository.findByUserId(userId);
        return transactionMapper.toDtoList(transactions);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TransactionDTO> getTransactionsByUserId(String userId, Pageable pageable) {
        log.info("Fetching transactions for user: {} with pagination", userId);

        Page<Transaction> transactionsPage = transactionRepository.findByUserId(userId, pageable);
        return transactionsPage.map(transactionMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionDTO> getTransactionsByPortfolioId(String portfolioId) {
        log.info("Fetching transactions for portfolio: {}", portfolioId);

        List<Transaction> transactions = transactionRepository.findByPortfolioId(portfolioId);
        return transactionMapper.toDtoList(transactions);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TransactionDTO> getTransactionsByPortfolioId(String portfolioId, Pageable pageable) {
        log.info("Fetching transactions for portfolio: {} with pagination", portfolioId);

        Page<Transaction> transactionsPage = transactionRepository.findByPortfolioId(portfolioId, pageable);
        return transactionsPage.map(transactionMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionDTO> getTransactionsByStockSymbol(String stockSymbol) {
        log.info("Fetching transactions for stock: {}", stockSymbol);

        List<Transaction> transactions = transactionRepository.findByStockSymbol(stockSymbol);
        return transactionMapper.toDtoList(transactions);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionDTO> getTransactionsByType(TransactionType type) {
        log.info("Fetching transactions of type: {}", type);

        List<Transaction> transactions = transactionRepository.findByType(type);
        return transactionMapper.toDtoList(transactions);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionDTO> getTransactionsByStatus(TransactionStatus status) {
        log.info("Fetching transactions with status: {}", status);

        List<Transaction> transactions = transactionRepository.findByStatus(status);
        return transactionMapper.toDtoList(transactions);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionDTO> getTransactionsBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Fetching transactions between dates: {} and {}", startDate, endDate);

        List<Transaction> transactions = transactionRepository.findByTransactionDateBetween(startDate, endDate);
        return transactionMapper.toDtoList(transactions);
    }

    @Override
    @Transactional
    public TransactionDTO updateTransactionStatus(String id, TransactionStatus status) {
        log.info("Updating status of transaction with ID: {} to {}", id, status);

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with ID: " + id));

        transaction.setStatus(status);
        Transaction updatedTransaction = transactionRepository.save(transaction);

        log.info("Transaction status updated with ID: {}", updatedTransaction.getId());
        return transactionMapper.toDto(updatedTransaction);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TransactionDTO> searchTransactions(
            String userId,
            String portfolioId,
            String stockSymbol,
            TransactionType type,
            TransactionStatus status,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable) {
        log.info("Searching transactions with criteria: userId={}, portfolioId={}, stockSymbol={}, type={}, status={}, startDate={}, endDate={}",
                userId, portfolioId, stockSymbol, type, status, startDate, endDate);

        Page<Transaction> transactionsPage = transactionRepository.searchTransactions(
                userId, portfolioId, stockSymbol, type, status, startDate, endDate, pageable);

        return transactionsPage.map(transactionMapper::toDto);
    }
}
