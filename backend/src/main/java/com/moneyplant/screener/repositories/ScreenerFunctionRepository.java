package com.moneyplant.screener.repositories;

import com.moneyplant.screener.entities.ScreenerFunction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for ScreenerFunction entity with active function filtering, category-based queries, and soft deletion support.
 */
@Repository
public interface ScreenerFunctionRepository extends JpaRepository<ScreenerFunction, Long> {

    /**
     * Finds active screener functions ordered by category and sort order.
     */
    @Query("SELECT f FROM ScreenerFunction f WHERE f.isActive = true ORDER BY f.category ASC, f.sortOrder ASC, f.displayName ASC")
    List<ScreenerFunction> findActiveFunctionsOrderedByCategoryAndSort();

    /**
     * Finds screener function by function name and active status.
     */
    Optional<ScreenerFunction> findByFunctionNameAndIsActiveTrue(String functionName);

    /**
     * Finds screener functions by category and active status.
     */
    @Query("SELECT f FROM ScreenerFunction f WHERE f.category = :category AND f.isActive = true ORDER BY f.sortOrder ASC, f.displayName ASC")
    List<ScreenerFunction> findByCategoryAndIsActiveTrueOrderBySortOrder(@Param("category") String category);

    /**
     * Finds distinct categories for active functions.
     */
    @Query("SELECT DISTINCT f.category FROM ScreenerFunction f WHERE f.isActive = true AND f.category IS NOT NULL ORDER BY f.category")
    List<String> findDistinctCategoriesByIsActiveTrue();

    /**
     * Searches screener functions by display name or function name with active status.
     */
    @Query("SELECT f FROM ScreenerFunction f WHERE f.isActive = true AND " +
           "(LOWER(f.displayName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.functionName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY f.category ASC, f.sortOrder ASC, f.displayName ASC")
    List<ScreenerFunction> searchActiveFunctions(@Param("search") String search);

    /**
     * Finds screener functions by return type and active status.
     */
    @Query("SELECT f FROM ScreenerFunction f WHERE f.returnType = :returnType AND f.isActive = true ORDER BY f.displayName ASC")
    List<ScreenerFunction> findByReturnTypeAndIsActiveTrueOrderByDisplayName(@Param("returnType") String returnType);

    /**
     * Finds screener functions with pagination and search.
     */
    @Query("SELECT f FROM ScreenerFunction f WHERE f.isActive = true AND " +
           "(:search IS NULL OR " +
           "LOWER(f.displayName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.functionName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY f.category ASC, f.sortOrder ASC, f.displayName ASC")
    Page<ScreenerFunction> findActiveFunctionsWithSearch(@Param("search") String search, Pageable pageable);

    /**
     * Checks if function name exists and is active.
     */
    boolean existsByFunctionNameAndIsActiveTrue(String functionName);

    /**
     * Counts active functions by category.
     */
    @Query("SELECT COUNT(f) FROM ScreenerFunction f WHERE f.category = :category AND f.isActive = true")
    long countByCategoryAndIsActiveTrue(@Param("category") String category);

    /**
     * Finds functions by multiple return types and active status.
     */
    @Query("SELECT f FROM ScreenerFunction f WHERE f.returnType IN :returnTypes AND f.isActive = true ORDER BY f.displayName ASC")
    List<ScreenerFunction> findByReturnTypeInAndIsActiveTrueOrderByDisplayName(@Param("returnTypes") List<String> returnTypes);

    /**
     * Finds functions that have examples defined.
     */
    @Query("SELECT f FROM ScreenerFunction f WHERE f.isActive = true AND f.examples IS NOT NULL ORDER BY f.displayName ASC")
    List<ScreenerFunction> findActiveFunctionsWithExamples();

    /**
     * Finds functions by category with search functionality.
     */
    @Query("SELECT f FROM ScreenerFunction f WHERE f.category = :category AND f.isActive = true AND " +
           "(:search IS NULL OR " +
           "LOWER(f.displayName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.functionName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY f.sortOrder ASC, f.displayName ASC")
    List<ScreenerFunction> findByCategoryAndSearchActiveFunctions(@Param("category") String category, @Param("search") String search);

    /**
     * Soft delete function by setting isActive to false.
     */
    @Modifying
    @Query("UPDATE ScreenerFunction f SET f.isActive = false WHERE f.functionId = :functionId")
    void softDeleteFunction(@Param("functionId") Long functionId);

    /**
     * Reactivate function by setting isActive to true.
     */
    @Modifying
    @Query("UPDATE ScreenerFunction f SET f.isActive = true WHERE f.functionId = :functionId")
    void reactivateFunction(@Param("functionId") Long functionId);

    /**
     * Finds functions with their parameters using join fetch for efficient loading.
     */
    @Query("SELECT DISTINCT f FROM ScreenerFunction f LEFT JOIN FETCH f.parameters p WHERE f.isActive = true ORDER BY f.category ASC, f.sortOrder ASC, f.displayName ASC")
    List<ScreenerFunction> findActiveFunctionsWithParameters();

    /**
     * Finds function with parameters by function name.
     */
    @Query("SELECT f FROM ScreenerFunction f LEFT JOIN FETCH f.parameters p WHERE f.functionName = :functionName AND f.isActive = true")
    Optional<ScreenerFunction> findByFunctionNameWithParameters(@Param("functionName") String functionName);

    /**
     * Counts total active functions.
     */
    @Query("SELECT COUNT(f) FROM ScreenerFunction f WHERE f.isActive = true")
    long countActiveFunctions();
}