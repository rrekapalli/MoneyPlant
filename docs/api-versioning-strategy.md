# API Versioning Strategy

This document outlines the API versioning strategy for the MoneyPlant microservices.

## Versioning Approach

MoneyPlant uses **URI Path Versioning** for all API endpoints. This approach was chosen for its simplicity, visibility, and widespread adoption.

### Format

All API endpoints follow this format:

```
/api/v{version_number}/{resource}
```

Example:
```
/api/v1/portfolio
/api/v1/stock
```

## Version Lifecycle

### When to Create a New Version

A new API version should be created when:

1. Breaking changes are introduced to an existing endpoint
2. The request or response structure changes in a way that could break existing clients
3. Significant functionality is added that warrants a new version

### Backwards Compatibility

- Older API versions must be maintained for a reasonable deprecation period
- New features should be added to the latest API version
- Bug fixes should be applied to all supported API versions when possible

## Implementation Guidelines

### Controller Structure

For each API version, create a separate controller class:

```java
@RestController
@RequestMapping("api/v1/resource")
public class ResourceV1Controller {
    // V1 endpoints
}

@RestController
@RequestMapping("api/v2/resource")
public class ResourceV2Controller {
    // V2 endpoints
}
```

### Documentation

- All API versions must be documented with OpenAPI annotations
- The documentation should clearly indicate the version and any deprecation notices
- Include examples for request and response bodies

### Testing

- Each API version must have its own set of tests
- Tests for older versions should not be removed until the version is no longer supported

## Deprecation Policy

1. When a new API version is released, the previous version enters a deprecation period
2. The deprecation period is typically 6 months, but may vary based on the significance of the changes
3. During the deprecation period:
   - The API continues to function normally
   - Responses include a deprecation notice header
   - Documentation is updated to indicate deprecation
4. After the deprecation period, the API version may be removed with appropriate notice

## Current API Versions

| Version | Status | Release Date | Deprecation Date | End-of-Life Date |
|---------|--------|--------------|------------------|------------------|
| v1      | Active | 2023-06-01   | N/A              | N/A              |

## Communicating Changes

Changes to the API, including new versions, deprecations, and removals, will be communicated through:

1. Release notes
2. Email notifications to registered API users
3. Deprecation headers in API responses
4. Documentation updates