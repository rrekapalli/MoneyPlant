package com.moneyplant.screener.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.examples.Example;
import io.swagger.v3.oas.models.media.ArraySchema;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

/**
 * OpenAPI configuration for Criteria Builder API.
 * Defines comprehensive schema definitions, examples, and documentation
 * for all criteria-related endpoints and data structures.
 */
@Configuration
public class CriteriaOpenApiConfig {

    @Bean
    public OpenAPI criteriaOpenApiCustomization() {
        return new OpenAPI()
                .components(new Components()
                        .schemas(createCriteriaSchemas())
                        .examples(createCriteriaExamples())
                        .responses(createCriteriaResponses())
                );
    }

    private Map<String, Schema> createCriteriaSchemas() {
        Map<String, Schema> schemas = new HashMap<>();
        schemas.put("CriteriaDSL", createCriteriaDSLSchema());
        schemas.put("Group", createGroupSchema());
        schemas.put("Condition", createConditionSchema());
        schemas.put("Expression", createExpressionSchema());
        schemas.put("FieldRef", createFieldRefSchema());
        schemas.put("FunctionCall", createFunctionCallSchema());
        schemas.put("Literal", createLiteralSchema());
        schemas.put("FieldMetadata", createFieldMetadataSchema());
        schemas.put("FunctionMetadata", createFunctionMetadataSchema());
        schemas.put("ValidationRules", createValidationRulesSchema());
        schemas.put("OperatorInfo", createOperatorInfoSchema());
        return schemas;
    }

    private Schema createCriteriaDSLSchema() {
        return new Schema<>()
                .type("object")
                .description("Complete criteria DSL structure for building complex database queries")
                .addProperty("version", new Schema<>()
                        .type("string")
                        .description("DSL version for compatibility")
                        .example("1.0"))
                .addProperty("root", new Schema<>()
                        .$ref("#/components/schemas/Group")
                        .description("Root group containing all criteria conditions"))
                .addProperty("metadata", new Schema<>()
                        .type("object")
                        .description("Optional metadata about the criteria")
                        .additionalProperties(true))
                .required(java.util.List.of("version", "root"));
    }

    private Schema createGroupSchema() {
        return new Schema<>()
                .type("object")
                .description("Logical group of conditions with AND/OR/NOT operators")
                .addProperty("operator", new Schema<>()
                        .type("string")
                        .description("Logical operator for combining children")

                        .example("AND"))
                .addProperty("children", new ArraySchema()
                        .items(new Schema<>()
                                .oneOf(java.util.List.of(
                                        new Schema<>().$ref("#/components/schemas/Group"),
                                        new Schema<>().$ref("#/components/schemas/Condition")
                                )))
                        .description("Child groups and conditions"))
                .required(java.util.List.of("operator", "children"));
    }

    private Schema createConditionSchema() {
        return new Schema<>()
                .type("object")
                .description("Individual condition comparing left and right expressions")
                .addProperty("left", new Schema<>()
                        .$ref("#/components/schemas/Expression")
                        .description("Left side expression (field or function)"))
                .addProperty("operator", new Schema<>()
                        .type("string")
                        .description("Comparison operator")

                        .example(">="))
                .addProperty("right", new Schema<>()
                        .$ref("#/components/schemas/Expression")
                        .description("Right side expression (value, field, or function)"))
                .required(java.util.List.of("left", "operator"));
    }

    private Schema createExpressionSchema() {
        return new Schema<>()
                .description("Expression that can be a field reference, function call, or literal value")
                .oneOf(java.util.List.of(
                        new Schema<>().$ref("#/components/schemas/FieldRef"),
                        new Schema<>().$ref("#/components/schemas/FunctionCall"),
                        new Schema<>().$ref("#/components/schemas/Literal")
                ));
    }

    private Schema createFieldRefSchema() {
        return new Schema<>()
                .type("object")
                .description("Reference to a database field")
                .addProperty("type", new Schema<>()
                        .type("string")

                        .example("field"))
                .addProperty("fieldId", new Schema<>()
                        .type("string")
                        .description("Unique identifier for the field")
                        .example("market_cap"))
                .required(java.util.List.of("type", "fieldId"));
    }

    private Schema createFunctionCallSchema() {
        return new Schema<>()
                .type("object")
                .description("Function call with arguments")
                .addProperty("type", new Schema<>()
                        .type("string")

                        .example("function"))
                .addProperty("functionId", new Schema<>()
                        .type("string")
                        .description("Unique identifier for the function")
                        .example("sma"))
                .addProperty("args", new ArraySchema()
                        .items(new Schema<>().$ref("#/components/schemas/Expression"))
                        .description("Function arguments"))
                .required(java.util.List.of("type", "functionId", "args"));
    }

    private Schema createLiteralSchema() {
        return new Schema<>()
                .type("object")
                .description("Literal value (number, string, boolean, etc.)")
                .addProperty("type", new Schema<>()
                        .type("string")

                        .example("literal"))
                .addProperty("value", new Schema<>()
                        .description("The literal value")
                        .example(1000000000))
                .addProperty("dataType", new Schema<>()
                        .type("string")
                        .description("Data type of the literal")
                        .example("number"))
                .required(java.util.List.of("type", "value"));
    }

    private Schema createFieldMetadataSchema() {
        return new Schema<>()
                .type("object")
                .description("Metadata for a database field available in criteria building")
                .addProperty("id", new Schema<>()
                        .type("string")
                        .description("Unique field identifier")
                        .example("market_cap"))
                .addProperty("label", new Schema<>()
                        .type("string")
                        .description("Human-readable field name")
                        .example("Market Capitalization"))
                .addProperty("dbColumn", new Schema<>()
                        .type("string")
                        .description("Database column name")
                        .example("market_cap"))
                .addProperty("dataType", new Schema<>()
                        .type("string")
                        .description("Field data type")
                        .example("currency"))
                .addProperty("allowedOps", new ArraySchema()
                        .items(new Schema<>().type("string"))
                        .description("Operators allowed for this field")
                        .example(java.util.List.of("=", "!=", "<", "<=", ">", ">=")))
                .addProperty("category", new Schema<>()
                        .type("string")
                        .description("Field category for grouping")
                        .example("Financial"))
                .addProperty("description", new Schema<>()
                        .type("string")
                        .description("Field description")
                        .example("Total market value of company shares"))
                .addProperty("example", new Schema<>()
                        .type("string")
                        .description("Example value")
                        .example("1.5B"))
                .required(java.util.List.of("id", "label", "dbColumn", "dataType", "allowedOps"));
    }

    private Schema createFunctionMetadataSchema() {
        return new Schema<>()
                .type("object")
                .description("Metadata for a function available in criteria building")
                .addProperty("id", new Schema<>()
                        .type("string")
                        .description("Unique function identifier")
                        .example("sma"))
                .addProperty("label", new Schema<>()
                        .type("string")
                        .description("Human-readable function name")
                        .example("Simple Moving Average"))
                .addProperty("returnType", new Schema<>()
                        .type("string")
                        .description("Function return type")
                        .example("number"))
                .addProperty("parameters", new ArraySchema()
                        .items(new Schema<>()
                                .type("object")
                                .addProperty("name", new Schema<>().type("string").example("period"))
                                .addProperty("type", new Schema<>().type("string").example("integer"))
                                .addProperty("required", new Schema<>().type("boolean").example(true))
                                .addProperty("description", new Schema<>().type("string").example("Number of periods for moving average")))
                        .description("Function parameters"))
                .addProperty("category", new Schema<>()
                        .type("string")
                        .description("Function category")
                        .example("Technical Analysis"))
                .addProperty("description", new Schema<>()
                        .type("string")
                        .description("Function description")
                        .example("Calculates simple moving average over specified periods"))
                .addProperty("examples", new ArraySchema()
                        .items(new Schema<>().type("string"))
                        .description("Usage examples")
                        .example(java.util.List.of("SMA(close, 20)", "SMA(volume, 10)")))
                .required(java.util.List.of("id", "label", "returnType", "parameters"));
    }

    private Schema createValidationRulesSchema() {
        return new Schema<>()
                .type("object")
                .description("Validation rules for field values or function parameters")
                .addProperty("min", new Schema<>()
                        .description("Minimum value")
                        .example(0))
                .addProperty("max", new Schema<>()
                        .description("Maximum value")
                        .example(1000))
                .addProperty("pattern", new Schema<>()
                        .type("string")
                        .description("Regex pattern for string validation")
                        .example("^[A-Z]{1,5}$"))
                .addProperty("enumValues", new ArraySchema()
                        .items(new Schema<>())
                        .description("Allowed enum values"))
                .addProperty("required", new Schema<>()
                        .type("boolean")
                        .description("Whether the value is required")
                        .example(true));
    }

    private Schema createOperatorInfoSchema() {
        return new Schema<>()
                .type("object")
                .description("Information about a comparison operator")
                .addProperty("operator", new Schema<>()
                        .type("string")
                        .description("Operator symbol")
                        .example(">="))
                .addProperty("label", new Schema<>()
                        .type("string")
                        .description("Human-readable operator name")
                        .example("Greater than or equal to"))
                .addProperty("description", new Schema<>()
                        .type("string")
                        .description("Operator description")
                        .example("Checks if left value is greater than or equal to right value"))
                .addProperty("compatibleTypes", new ArraySchema()
                        .items(new Schema<>().type("string"))
                        .description("Data types compatible with this operator")
                        .example(java.util.List.of("number", "integer", "date")))
                .addProperty("requiresRightSide", new Schema<>()
                        .type("boolean")
                        .description("Whether operator requires a right-side value")
                        .example(true))
                .required(java.util.List.of("operator", "label", "compatibleTypes", "requiresRightSide"));
    }

    private Map<String, Example> createCriteriaExamples() {
        Map<String, Example> examples = new HashMap<>();
        examples.put("SimpleCriteria", createSimpleCriteriaExample());
        examples.put("ComplexCriteria", createComplexCriteriaExample());
        examples.put("FunctionCriteria", createFunctionCriteriaExample());
        examples.put("ValidationError", createValidationErrorExample());
        examples.put("FieldMetadata", createFieldMetadataExample());
        examples.put("FunctionMetadata", createFunctionMetadataExample());
        return examples;
    }

    private Example createSimpleCriteriaExample() {
        return new Example()
                .summary("Simple market cap filter")
                .description("Basic criteria filtering stocks by market capitalization")
                .value("""
                        {
                          "version": "1.0",
                          "root": {
                            "operator": "AND",
                            "children": [
                              {
                                "left": {
                                  "type": "field",
                                  "fieldId": "market_cap"
                                },
                                "operator": ">=",
                                "right": {
                                  "type": "literal",
                                  "value": 1000000000,
                                  "dataType": "number"
                                }
                              }
                            ]
                          }
                        }
                        """);
    }

    private Example createComplexCriteriaExample() {
        return new Example()
                .summary("Complex multi-condition criteria")
                .description("Advanced criteria with multiple conditions and nested groups")
                .value("""
                        {
                          "version": "1.0",
                          "root": {
                            "operator": "AND",
                            "children": [
                              {
                                "left": {
                                  "type": "field",
                                  "fieldId": "market_cap"
                                },
                                "operator": ">=",
                                "right": {
                                  "type": "literal",
                                  "value": 1000000000,
                                  "dataType": "number"
                                }
                              },
                              {
                                "operator": "OR",
                                "children": [
                                  {
                                    "left": {
                                      "type": "field",
                                      "fieldId": "sector"
                                    },
                                    "operator": "=",
                                    "right": {
                                      "type": "literal",
                                      "value": "Technology",
                                      "dataType": "string"
                                    }
                                  },
                                  {
                                    "left": {
                                      "type": "field",
                                      "fieldId": "pe_ratio"
                                    },
                                    "operator": "<",
                                    "right": {
                                      "type": "literal",
                                      "value": 20,
                                      "dataType": "number"
                                    }
                                  }
                                ]
                              }
                            ]
                          }
                        }
                        """);
    }

    private Example createFunctionCriteriaExample() {
        return new Example()
                .summary("Technical analysis criteria")
                .description("Criteria using technical analysis functions")
                .value("""
                        {
                          "version": "1.0",
                          "root": {
                            "operator": "AND",
                            "children": [
                              {
                                "left": {
                                  "type": "function",
                                  "functionId": "sma",
                                  "args": [
                                    {
                                      "type": "field",
                                      "fieldId": "close_price"
                                    },
                                    {
                                      "type": "literal",
                                      "value": 20,
                                      "dataType": "integer"
                                    }
                                  ]
                                },
                                "operator": ">",
                                "right": {
                                  "type": "function",
                                  "functionId": "sma",
                                  "args": [
                                    {
                                      "type": "field",
                                      "fieldId": "close_price"
                                    },
                                    {
                                      "type": "literal",
                                      "value": 50,
                                      "dataType": "integer"
                                    }
                                  ]
                                }
                              }
                            ]
                          }
                        }
                        """);
    }

    private Example createValidationErrorExample() {
        return new Example()
                .summary("Validation error response")
                .description("Example of validation error when field doesn't exist")
                .value("""
                        {
                          "valid": false,
                          "errors": [
                            {
                              "code": "INVALID_FIELD_REFERENCE",
                              "message": "Field 'invalid_field' does not exist or is not accessible",
                              "path": "$.root.children[0].left.fieldId"
                            }
                          ],
                          "warnings": [],
                          "validatedAt": "2024-01-15T10:30:00Z",
                          "validatedBy": "12345"
                        }
                        """);
    }

    private Example createFieldMetadataExample() {
        return new Example()
                .summary("Field metadata response")
                .description("Example field metadata for market capitalization")
                .value("""
                        {
                          "id": "market_cap",
                          "label": "Market Capitalization",
                          "dbColumn": "market_cap",
                          "dataType": "currency",
                          "allowedOps": ["=", "!=", "<", "<=", ">", ">="],
                          "category": "Financial",
                          "description": "Total market value of company shares",
                          "example": "1.5B",
                          "suggestionsApi": null
                        }
                        """);
    }

    private Example createFunctionMetadataExample() {
        return new Example()
                .summary("Function metadata response")
                .description("Example function metadata for Simple Moving Average")
                .value("""
                        {
                          "id": "sma",
                          "label": "Simple Moving Average",
                          "returnType": "number",
                          "parameters": [
                            {
                              "name": "field",
                              "type": "field",
                              "required": true,
                              "description": "Field to calculate moving average for"
                            },
                            {
                              "name": "period",
                              "type": "integer",
                              "required": true,
                              "description": "Number of periods for moving average",
                              "validationRules": {
                                "min": 1,
                                "max": 200
                              }
                            }
                          ],
                          "category": "Technical Analysis",
                          "description": "Calculates simple moving average over specified periods",
                          "examples": ["SMA(close, 20)", "SMA(volume, 10)"]
                        }
                        """);
    }

    private Map<String, ApiResponse> createCriteriaResponses() {
        Map<String, ApiResponse> responses = new HashMap<>();
        
        Map<String, Object> errorExample = new HashMap<>();
        errorExample.put("valid", false);
        Map<String, Object> errorDetail = new HashMap<>();
        errorDetail.put("code", "INVALID_FIELD_REFERENCE");
        errorDetail.put("message", "Field does not exist");
        errorDetail.put("path", "$.root.children[0].left.fieldId");
        errorExample.put("errors", java.util.List.of(errorDetail));
        
        responses.put("CriteriaValidationError", new ApiResponse()
                .description("Criteria validation failed")
                .content(new Content()
                        .addMediaType("application/json", new MediaType()
                                .schema(new Schema<>().$ref("#/components/schemas/ValidationResult"))
                                .example(errorExample))));
        
        responses.put("UnauthorizedAccess", new ApiResponse()
                .description("Unauthorized access to criteria resources")
                .content(new Content()
                        .addMediaType("application/json", new MediaType()
                                .schema(new Schema<>()
                                        .type("object")
                                        .addProperty("error", new Schema<>().type("string").example("Unauthorized"))
                                        .addProperty("message", new Schema<>().type("string").example("Access denied to field or function"))))));
        
        return responses;
    }
}