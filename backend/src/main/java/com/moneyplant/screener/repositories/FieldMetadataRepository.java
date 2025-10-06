package com.moneyplant.screener.repositories;

import com.moneyplant.screener.entities.FieldMetadata;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for FieldMetadata entity with custom queries for user-based field access and role filtering.
 */
@Repository
public interface FieldMetadataRepository extends JpaRepository<FieldMetadata, Long> {

    /**
     * Finds active field metadata ordered by category and sort order.
     */
    @Query("SELECT f FROM FieldMetadata f WHERE f.isActive = true ORDER BY f.category ASC, f.sortOrder ASC, f.displayName ASC")
    List<FieldMetadata> findActiveFieldsOrderedByCategoryAndSort();

    /**
     * Finds field metadata by field name and active status.
     */
    Optional<FieldMetadata> findByFieldNameAndIsActiveTrue(String fieldName);

    /**
     * Finds field metadata by category and active status.
     */
    @Query("SELECT f FROM FieldMetadata f WHERE f.category = :category AND f.isActive = true ORDER BY f.sortOrder ASC, f.displayName ASC")
    List<FieldMetadata> findByCategoryAndIsActiveTrueOrderBySortOrder(@Param("category") String category);

    /**
     * Finds distinct categories for active fields.
     */
    @Query("SELECT DISTINCT f.category FROM FieldMetadata f WHERE f.isActive = true AND f.category IS NOT NULL ORDER BY f.category")
    List<String> findDistinctCategoriesByIsActiveTrue();

    /**
     * Searches field metadata by display name or field name with active status.
     */
    @Query("SELECT f FROM FieldMetadata f WHERE f.isActive = true AND " +
           "(LOWER(f.displayName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.fieldName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY f.category ASC, f.sortOrder ASC, f.displayName ASC")
    List<FieldMetadata> searchActiveFields(@Param("search") String search);

    /**
     * Finds field metadata by data type and active status.
     */
    @Query("SELECT f FROM FieldMetadata f WHERE f.dataType = :dataType AND f.isActive = true ORDER BY f.displayName ASC")
    List<FieldMetadata> findByDataTypeAndIsActiveTrueOrderByDisplayName(@Param("dataType") String dataType);

    /**
     * Finds field metadata with pagination and search.
     */
    @Query("SELECT f FROM FieldMetadata f WHERE f.isActive = true AND " +
           "(:search IS NULL OR " +
           "LOWER(f.displayName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.fieldName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY f.category ASC, f.sortOrder ASC, f.displayName ASC")
    Page<FieldMetadata> findActiveFieldsWithSearch(@Param("search") String search, Pageable pageable);

    /**
     * Checks if field name exists and is active.
     */
    boolean existsByFieldNameAndIsActiveTrue(String fieldName);

    /**
     * Counts active fields by category.
     */
    @Query("SELECT COUNT(f) FROM FieldMetadata f WHERE f.category = :category AND f.isActive = true")
    long countByCategoryAndIsActiveTrue(@Param("category") String category);

    /**
     * Finds fields by multiple data types and active status.
     */
    @Query("SELECT f FROM FieldMetadata f WHERE f.dataType IN :dataTypes AND f.isActive = true ORDER BY f.displayName ASC")
    List<FieldMetadata> findByDataTypeInAndIsActiveTrueOrderByDisplayName(@Param("dataTypes") List<String> dataTypes);

    /**
     * Finds fields that have validation rules defined.
     */
    @Query("SELECT f FROM FieldMetadata f WHERE f.isActive = true AND f.validationRules IS NOT NULL ORDER BY f.displayName ASC")
    List<FieldMetadata> findActiveFieldsWithValidationRules();

    /**
     * Finds fields by category with search functionality.
     */
    @Query("SELECT f FROM FieldMetadata f WHERE f.category = :category AND f.isActive = true AND " +
           "(:search IS NULL OR " +
           "LOWER(f.displayName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.fieldName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY f.sortOrder ASC, f.displayName ASC")
    List<FieldMetadata> findByCategoryAndSearchActiveFields(@Param("category") String category, @Param("search") String search);
}