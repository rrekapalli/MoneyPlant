package com.moneyplant.transaction.entities;

/**
 * Enum representing the types of financial transactions.
 */
public enum TransactionType {
    /**
     * Represents a purchase of stocks
     */
    BUY,
    
    /**
     * Represents a sale of stocks
     */
    SELL,
    
    /**
     * Represents a dividend payment
     */
    DIVIDEND,
    
    /**
     * Represents a stock split
     */
    SPLIT,
    
    /**
     * Represents a deposit of funds
     */
    DEPOSIT,
    
    /**
     * Represents a withdrawal of funds
     */
    WITHDRAWAL
}