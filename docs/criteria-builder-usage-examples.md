# Criteria Builder Usage Examples and Best Practices

## Overview

This document provides practical examples and best practices for using the Criteria Builder API effectively. It covers common use cases, performance optimization, and integration patterns.

## Table of Contents

1. [Basic Examples](#basic-examples)
2. [Advanced Examples](#advanced-examples)
3. [Visual Interface Integration](#visual-interface-integration)
4. [Performance Optimization](#performance-optimization)
5. [Error Handling Patterns](#error-handling-patterns)
6. [Best Practices](#best-practices)

## Basic Examples

### Simple Value Filter

Filter stocks with market capitalization greater than $1 billion:

```javascript
// Frontend JavaScript example
const simpleCriteria = {
  version: "1.0",
  root: {
    operator: "AND",
    children: [
      {
        left: {
          type: "field",
          fieldId: "market_cap"
        },
        operator: ">=",
        right: {
          type: "literal",
          value: 1000000000,
          dataType: "number"
        }
      }
    ]
  }
};

// Validate the criteria
const validationResponse = await fetch('/api/screeners/validate-criteria', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ dsl: simpleCriteria })
});

const validation = await validationResponse.json();

```

### Multiple Conditions with AND

Technology stocks with market cap > $1B AND P/E ratio < 20:

```json
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
}
```

### OR Conditions

Stocks in Technology OR Healthcare sectors:

```json
{
  "version": "1.0",
  "root": {
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
          "fieldId": "sector"
        },
        "operator": "=",
        "right": {
          "type": "literal",
          "value": "Healthcare",
          "dataType": "string"
        }
      }
    ]
  }
}
```

## Advanced Examples

### Nested Groups with Complex Logic

(Technology OR Healthcare) AND (Market Cap > $1B OR P/E < 15):

```json
{
  "version": "1.0",
  "root": {
    "operator": "AND",
    "children": [
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
              "fieldId": "sector"
            },
            "operator": "=",
            "right": {
              "type": "literal",
              "value": "Healthcare",
              "dataType": "string"
            }
          }
        ]
      },
      {
        "operator": "OR",
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
            "left": {
              "type": "field",
              "fieldId": "pe_ratio"
            },
            "operator": "<",
            "right": {
              "type": "literal",
              "value": 15,
              "dataType": "number"
            }
          }
        ]
      }
    ]
  }
}
```

### Technical Analysis with Functions

Golden Cross: 20-day SMA > 50-day SMA:

```json
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
```

### Range Conditions

Stocks with P/E ratio between 10 and 20:

```json
{
  "version": "1.0",
  "root": {
    "operator": "AND",
    "children": [
      {
        "left": {
          "type": "field",
          "fieldId": "pe_ratio"
        },
        "operator": "BETWEEN",
        "right": {
          "type": "literal",
          "value": [10, 20],
          "dataType": "array"
        }
      }
    ]
  }
}
```

### IN Operator for Multiple Values

Stocks in specific sectors:

```json
{
  "version": "1.0",
  "root": {
    "operator": "AND",
    "children": [
      {
        "left": {
          "type": "field",
          "fieldId": "sector"
        },
        "operator": "IN",
        "right": {
          "type": "literal",
          "value": ["Technology", "Healthcare", "Finance"],
          "dataType": "array"
        }
      }
    ]
  }
}
```

## Visual Interface Integration

### Building a Criteria Builder UI

```javascript
class CriteriaBuilder {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.fields = [];
    this.functions = [];
    this.operators = [];
  }

  async initialize() {
    // Load metadata
    this.fields = await this.apiClient.getFields();
    this.functions = await this.apiClient.getFunctions();
    this.operators = await this.apiClient.getOperators();
  }

  async getFieldOperators(fieldId) {
    return await this.apiClient.getFieldOperators(fieldId);
  }

  async getFieldSuggestions(fieldId, query) {
    return await this.apiClient.getFieldSuggestions(fieldId, query);
  }

  async validatePartial(partialDsl) {
    return await this.apiClient.validatePartialCriteria(partialDsl);
  }

  async previewCriteria(dsl) {
    return await this.apiClient.previewCriteria(dsl);
  }
}

// Usage in React component
function CriteriaBuilderComponent() {
  const [criteria, setCriteria] = useState(getEmptyCriteria());
  const [validation, setValidation] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleCriteriaChange = async (newCriteria) => {
    setCriteria(newCriteria);
    
    // Real-time validation
    const validationResult = await criteriaBuilder.validatePartial(newCriteria);
    setValidation(validationResult);
    
    // Generate preview
    if (validationResult.valid) {
      const previewResult = await criteriaBuilder.previewCriteria(newCriteria);
      setPreview(previewResult);
    }
  };

  return (
    <div>
      <CriteriaEditor 
        criteria={criteria}
        onChange={handleCriteriaChange}
        validation={validation}
      />
      {preview && (
        <div className="criteria-preview">
          <h4>Preview</h4>
          <p>{preview.description}</p>
          <p>Estimated results: {preview.estimatedResults}</p>
        </div>
      )}
    </div>
  );
}
```

### Field Dropdown with Suggestions

```javascript
function FieldSelector({ onFieldSelect, selectedFieldId }) {
  const [fields, setFields] = useState([]);
  const [filteredFields, setFilteredFields] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    const fieldsData = await fetch('/api/screeners/fields', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    setFields(fieldsData);
    setFilteredFields(fieldsData);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = fields.filter(field => 
      field.label.toLowerCase().includes(query.toLowerCase()) ||
      field.category.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredFields(filtered);
  };

  return (
    <div className="field-selector">
      <input
        type="text"
        placeholder="Search fields..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <div className="field-list">
        {filteredFields.map(field => (
          <div 
            key={field.id}
            className={`field-item ${selectedFieldId === field.id ? 'selected' : ''}`}
            onClick={() => onFieldSelect(field)}
          >
            <div className="field-label">{field.label}</div>
            <div className="field-category">{field.category}</div>
            <div className="field-description">{field.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Value Input with Suggestions

```javascript
function ValueInput({ fieldId, value, onChange }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = async (inputValue) => {
    onChange(inputValue);
    
    if (inputValue.length >= 2) {
      const suggestionsData = await fetch(
        `/api/screeners/fields/${fieldId}/suggestions?query=${inputValue}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      ).then(r => r.json());
      
      setSuggestions(suggestionsData);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion) => {
    onChange(suggestion.value);
    setShowSuggestions(false);
  };

  return (
    <div className="value-input">
      <input
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => selectSuggestion(suggestion)}
            >
              <div className="suggestion-value">{suggestion.label}</div>
              {suggestion.description && (
                <div className="suggestion-description">{suggestion.description}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Performance Optimization

### Efficient Field Loading

```javascript
// Cache field metadata
class FieldMetadataCache {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  async getFields() {
    const cacheKey = 'fields';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    const fields = await fetch('/api/screeners/fields', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());

    this.cache.set(cacheKey, {
      data: fields,
      timestamp: Date.now()
    });

    return fields;
  }
}
```

### Debounced Validation

```javascript
// Debounce validation calls to avoid excessive API requests
function useDebouncedValidation(criteria, delay = 500) {
  const [validation, setValidation] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    setIsValidating(true);
    
    const timeoutId = setTimeout(async () => {
      try {
        const result = await fetch('/api/screeners/validate-partial-criteria', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ partialDsl: criteria })
        }).then(r => r.json());
        
        setValidation(result);
      } catch (error) {
        console.error('Validation error:', error);
      } finally {
        setIsValidating(false);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [criteria, delay]);

  return { validation, isValidating };
}
```

### Optimized Criteria Structure

```javascript
// Prefer flat structures over deep nesting
const optimizedCriteria = {
  version: "1.0",
  root: {
    operator: "AND",
    children: [
      // Multiple conditions at same level
      { /* condition 1 */ },
      { /* condition 2 */ },
      { /* condition 3 */ }
    ]
  }
};

// Avoid deep nesting (performance impact)
const inefficientCriteria = {
  version: "1.0",
  root: {
    operator: "AND",
    children: [
      {
        operator: "AND",
        children: [
          {
            operator: "AND",
            children: [
              { /* deeply nested condition */ }
            ]
          }
        ]
      }
    ]
  }
};
```

## Error Handling Patterns

### Comprehensive Error Handling

```javascript
class CriteriaApiClient {
  async validateCriteria(dsl) {
    try {
      const response = await fetch('/api/screeners/validate-criteria', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dsl })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        } else if (response.status === 403) {
          throw new Error('Access denied to field or function');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      return await response.json();
    } catch (error) {
      console.error('Validation request failed:', error);
      throw error;
    }
  }

  async handleValidationErrors(validation) {
    if (!validation.valid) {
      const errorsByType = validation.errors.reduce((acc, error) => {
        acc[error.code] = acc[error.code] || [];
        acc[error.code].push(error);
        return acc;
      }, {});

      // Handle specific error types
      if (errorsByType.INVALID_FIELD_REFERENCE) {
        await this.refreshFieldMetadata();
      }

      if (errorsByType.INVALID_FUNCTION_REFERENCE) {
        await this.refreshFunctionMetadata();
      }

      return errorsByType;
    }

    return null;
  }
}
```

### User-Friendly Error Messages

```javascript
function getErrorMessage(error) {
  const errorMessages = {
    'INVALID_FIELD_REFERENCE': 'The selected field is not available. Please choose a different field.',
    'INVALID_FUNCTION_REFERENCE': 'The selected function is not available. Please choose a different function.',
    'OPERATOR_TYPE_MISMATCH': 'The selected operator is not compatible with this field type.',
    'INVALID_PARAMETER_COUNT': 'The function requires a different number of parameters.',
    'MAX_DEPTH_EXCEEDED': 'The criteria is too complex. Please simplify the structure.',
    'MAX_CONDITIONS_EXCEEDED': 'Too many conditions. Please reduce the number of conditions.'
  };

  return errorMessages[error.code] || error.message;
}

function ErrorDisplay({ validation }) {
  if (!validation || validation.valid) {
    return null;
  }

  return (
    <div className="error-display">
      <h4>Validation Errors</h4>
      {validation.errors.map((error, index) => (
        <div key={index} className="error-item">
          <div className="error-message">{getErrorMessage(error)}</div>
          <div className="error-path">Location: {error.path}</div>
        </div>
      ))}
    </div>
  );
}
```

## Best Practices

### 1. Progressive Enhancement

Start with simple criteria and add complexity gradually:

```javascript
// Start simple
let criteria = {
  version: "1.0",
  root: {
    operator: "AND",
    children: []
  }
};

// Add conditions incrementally
function addCondition(criteria, condition) {
  const newCriteria = { ...criteria };
  newCriteria.root.children.push(condition);
  return newCriteria;
}

// Validate after each addition
async function buildCriteriaIncrementally(conditions) {
  let criteria = getEmptyCriteria();
  
  for (const condition of conditions) {
    const newCriteria = addCondition(criteria, condition);
    const validation = await validateCriteria(newCriteria);
    
    if (validation.valid) {
      criteria = newCriteria;
    } else {
      console.warn('Skipping invalid condition:', condition);
      break;
    }
  }
  
  return criteria;
}
```

### 2. Metadata Caching

Cache field and function metadata for better performance:

```javascript
class MetadataManager {
  constructor() {
    this.fieldsCache = null;
    this.functionsCache = null;
    this.operatorsCache = null;
    this.cacheExpiry = 10 * 60 * 1000; // 10 minutes
  }

  async getFields(forceRefresh = false) {
    if (!this.fieldsCache || forceRefresh || this.isCacheExpired(this.fieldsCache)) {
      const fields = await this.apiClient.getFields();
      this.fieldsCache = {
        data: fields,
        timestamp: Date.now()
      };
    }
    return this.fieldsCache.data;
  }

  isCacheExpired(cache) {
    return Date.now() - cache.timestamp > this.cacheExpiry;
  }
}
```

### 3. Validation Strategy

Implement multi-level validation:

```javascript
class ValidationStrategy {
  async validateCriteria(dsl) {
    // 1. Client-side structural validation
    const structuralErrors = this.validateStructure(dsl);
    if (structuralErrors.length > 0) {
      return { valid: false, errors: structuralErrors };
    }

    // 2. Server-side semantic validation
    const serverValidation = await this.apiClient.validateCriteria(dsl);
    if (!serverValidation.valid) {
      return serverValidation;
    }

    // 3. Performance validation
    const performanceWarnings = this.validatePerformance(dsl);
    
    return {
      valid: true,
      errors: [],
      warnings: performanceWarnings
    };
  }

  validateStructure(dsl) {
    const errors = [];
    
    // Check required fields
    if (!dsl.version) {
      errors.push({ code: 'MISSING_VERSION', message: 'DSL version is required' });
    }
    
    if (!dsl.root) {
      errors.push({ code: 'MISSING_ROOT', message: 'Root group is required' });
    }
    
    // Check nesting depth
    const depth = this.calculateDepth(dsl.root);
    if (depth > 5) {
      errors.push({ code: 'MAX_DEPTH_EXCEEDED', message: 'Maximum nesting depth exceeded' });
    }
    
    return errors;
  }

  validatePerformance(dsl) {
    const warnings = [];
    
    const conditionCount = this.countConditions(dsl.root);
    if (conditionCount > 50) {
      warnings.push({
        code: 'PERFORMANCE_CONCERN',
        message: 'Large number of conditions may impact performance'
      });
    }
    
    return warnings;
  }
}
```

### 4. State Management

Use proper state management for complex criteria:

```javascript
// Redux-style state management for criteria
const criteriaReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_CONDITION':
      return {
        ...state,
        criteria: addConditionToCriteria(state.criteria, action.payload)
      };
      
    case 'UPDATE_CONDITION':
      return {
        ...state,
        criteria: updateConditionInCriteria(state.criteria, action.payload)
      };
      
    case 'REMOVE_CONDITION':
      return {
        ...state,
        criteria: removeConditionFromCriteria(state.criteria, action.payload)
      };
      
    case 'SET_VALIDATION':
      return {
        ...state,
        validation: action.payload
      };
      
    default:
      return state;
  }
};
```

### 5. Testing Strategy

Implement comprehensive testing:

```javascript
// Unit tests for criteria building
describe('Criteria Builder', () => {
  test('should create valid simple criteria', () => {
    const criteria = createSimpleCriteria('market_cap', '>=', 1000000000);
    expect(criteria.version).toBe('1.0');
    expect(criteria.root.operator).toBe('AND');
    expect(criteria.root.children).toHaveLength(1);
  });

  test('should validate criteria structure', () => {
    const invalidCriteria = { version: '1.0' }; // missing root
    const errors = validateStructure(invalidCriteria);
    expect(errors).toContain(expect.objectContaining({
      code: 'MISSING_ROOT'
    }));
  });

  test('should handle nested groups correctly', () => {
    const nestedCriteria = createNestedCriteria();
    const depth = calculateDepth(nestedCriteria.root);
    expect(depth).toBeLessThanOrEqual(5);
  });
});

// Integration tests
describe('Criteria API Integration', () => {
  test('should validate criteria via API', async () => {
    const criteria = createValidCriteria();
    const validation = await apiClient.validateCriteria(criteria);
    expect(validation.valid).toBe(true);
  });

  test('should generate SQL from criteria', async () => {
    const criteria = createValidCriteria();
    const sqlResult = await apiClient.generateSql(criteria);
    expect(sqlResult.sql).toBeDefined();
    expect(sqlResult.parameters).toBeDefined();
  });
});
```

This comprehensive guide provides practical examples and patterns for effectively using the Criteria Builder API in real-world applications.