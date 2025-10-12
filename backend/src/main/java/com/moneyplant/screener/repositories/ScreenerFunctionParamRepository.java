package com.moneyplant.screener.repositories;

import com.moneyplant.screener.entities.ScreenerFunctionParam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for ScreenerFunctionParam entity with parameter ordering and function relationship queries.
 */
@Repository
public interface ScreenerFunctionParamRepository extends JpaRepository<ScreenerFunctionParam, Long> {

    /**
     * Finds parameters by function ID ordered by parameter order.
     */
    @Query("SELECT p FROM ScreenerFunctionParam p WHERE p.screenerFunction.functionId = :functionId ORDER BY p.paramOrder ASC")
    List<ScreenerFunctionParam> findByFunctionIdOrderByParamOrder(@Param("functionId") Long functionId);

    /**
     * Finds parameters by function name ordered by parameter order.
     */
    @Query("SELECT p FROM ScreenerFunctionParam p WHERE p.screenerFunction.functionName = :functionName ORDER BY p.paramOrder ASC")
    List<ScreenerFunctionParam> findByFunctionNameOrderByParamOrder(@Param("functionName") String functionName);

    /**
     * Finds parameters for active functions by function name.
     */
    @Query("SELECT p FROM ScreenerFunctionParam p WHERE p.screenerFunction.functionName = :functionName AND p.screenerFunction.isActive = true ORDER BY p.paramOrder ASC")
    List<ScreenerFunctionParam> findActiveParametersByFunctionName(@Param("functionName") String functionName);

    /**
     * Finds parameters for active functions by function ID.
     */
    @Query("SELECT p FROM ScreenerFunctionParam p WHERE p.screenerFunction.functionId = :functionId AND p.screenerFunction.isActive = true ORDER BY p.paramOrder ASC")
    List<ScreenerFunctionParam> findActiveParametersByFunctionId(@Param("functionId") Long functionId);

    /**
     * Finds required parameters by function ID.
     */
    @Query("SELECT p FROM ScreenerFunctionParam p WHERE p.screenerFunction.functionId = :functionId AND p.isRequired = true ORDER BY p.paramOrder ASC")
    List<ScreenerFunctionParam> findRequiredParametersByFunctionId(@Param("functionId") Long functionId);

    /**
     * Finds optional parameters by function ID.
     */
    @Query("SELECT p FROM ScreenerFunctionParam p WHERE p.screenerFunction.functionId = :functionId AND p.isRequired = false ORDER BY p.paramOrder ASC")
    List<ScreenerFunctionParam> findOptionalParametersByFunctionId(@Param("functionId") Long functionId);

    /**
     * Finds parameter by function ID, parameter name.
     */
    @Query("SELECT p FROM ScreenerFunctionParam p WHERE p.screenerFunction.functionId = :functionId AND p.paramName = :paramName")
    Optional<ScreenerFunctionParam> findByFunctionIdAndParamName(@Param("functionId") Long functionId, @Param("paramName") String paramName);

    /**
     * Finds parameter by function name and parameter name.
     */
    @Query("SELECT p FROM ScreenerFunctionParam p WHERE p.screenerFunction.functionName = :functionName AND p.paramName = :paramName")
    Optional<ScreenerFunctionParam> findByFunctionNameAndParamName(@Param("functionName") String functionName, @Param("paramName") String paramName);

    /**
     * Counts parameters by function ID.
     */
    @Query("SELECT COUNT(p) FROM ScreenerFunctionParam p WHERE p.screenerFunction.functionId = :functionId")
    long countByFunctionId(@Param("functionId") Long functionId);

    /**
     * Counts required parameters by function ID.
     */
    @Query("SELECT COUNT(p) FROM ScreenerFunctionParam p WHERE p.screenerFunction.functionId = :functionId AND p.isRequired = true")
    long countRequiredParametersByFunctionId(@Param("functionId") Long functionId);

    /**
     * Finds parameters by data type.
     */
    @Query("SELECT p FROM ScreenerFunctionParam p WHERE p.dataType = :dataType ORDER BY p.screenerFunction.functionName ASC, p.paramOrder ASC")
    List<ScreenerFunctionParam> findByDataTypeOrderByFunctionAndOrder(@Param("dataType") String dataType);

    /**
     * Finds parameters with default values by function ID.
     */
    @Query("SELECT p FROM ScreenerFunctionParam p WHERE p.screenerFunction.functionId = :functionId AND p.defaultValue IS NOT NULL ORDER BY p.paramOrder ASC")
    List<ScreenerFunctionParam> findParametersWithDefaultValuesByFunctionId(@Param("functionId") Long functionId);

    /**
     * Finds parameters with validation rules by function ID.
     */
    @Query("SELECT p FROM ScreenerFunctionParam p WHERE p.screenerFunction.functionId = :functionId AND p.validationRules IS NOT NULL ORDER BY p.paramOrder ASC")
    List<ScreenerFunctionParam> findParametersWithValidationRulesByFunctionId(@Param("functionId") Long functionId);

    /**
     * Finds parameters with help text by function ID.
     */
    @Query("SELECT p FROM ScreenerFunctionParam p WHERE p.screenerFunction.functionId = :functionId AND p.helpText IS NOT NULL ORDER BY p.paramOrder ASC")
    List<ScreenerFunctionParam> findParametersWithHelpTextByFunctionId(@Param("functionId") Long functionId);

    /**
     * Deletes all parameters for a function.
     */
    void deleteByScreenerFunctionFunctionId(Long functionId);

    /**
     * Checks if parameter exists for function with given name.
     */
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM ScreenerFunctionParam p WHERE p.screenerFunction.functionId = :functionId AND p.paramName = :paramName")
    boolean existsByFunctionIdAndParamName(@Param("functionId") Long functionId, @Param("paramName") String paramName);

    /**
     * Finds next parameter order for a function.
     */
    @Query("SELECT COALESCE(MAX(p.paramOrder), 0) + 1 FROM ScreenerFunctionParam p WHERE p.screenerFunction.functionId = :functionId")
    Integer findNextParamOrderByFunctionId(@Param("functionId") Long functionId);

    /**
     * Finds parameters by multiple data types for active functions.
     */
    @Query("SELECT p FROM ScreenerFunctionParam p WHERE p.dataType IN :dataTypes AND p.screenerFunction.isActive = true ORDER BY p.screenerFunction.functionName ASC, p.paramOrder ASC")
    List<ScreenerFunctionParam> findByDataTypeInForActiveFunctions(@Param("dataTypes") List<String> dataTypes);

    /**
     * Finds all parameters for active functions with efficient join.
     */
    @Query("SELECT p FROM ScreenerFunctionParam p JOIN p.screenerFunction f WHERE f.isActive = true ORDER BY f.functionName ASC, p.paramOrder ASC")
    List<ScreenerFunctionParam> findAllParametersForActiveFunctions();
}