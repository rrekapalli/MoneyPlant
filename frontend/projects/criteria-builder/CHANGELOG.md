# Changelog

All notable changes to the Criteria Builder UI Library will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of Criteria Builder UI Library
- Visual token-based interface for building complex filtering criteria
- Dynamic API integration for fields, functions, and operators
- Drag & drop reordering with Angular CDK
- Full Angular Reactive Forms integration (ControlValueAccessor)
- Server-side SQL generation with parameterized queries
- Comprehensive import/export functionality with JSON validation
- Preset management with local storage persistence
- Complete accessibility support (WCAG 2.1 AA compliant)
- Real-time validation with detailed error reporting
- Complex nested logic with AND/OR/NOT operators
- Database-driven function library with parameter validation
- High contrast and colorblind-friendly visual modes
- Comprehensive keyboard navigation and shortcuts
- Screen reader support with live announcements
- Security validation for import/export operations
- Comprehensive documentation and examples

### Security
- SQL injection prevention through server-side generation
- Input sanitization and validation
- Content security validation for imports
- Field and function ID validation against server whitelists

## [0.0.1] - 2024-01-01

### Added
- Initial project setup
- Core component structure
- Basic token rendering system
- API service integration
- Form control implementation

---

## Release Notes

### Version 0.0.1 (Initial Release)

This is the initial release of the Criteria Builder UI Library, providing a comprehensive solution for building complex filtering criteria through an intuitive visual interface.

#### Key Features
- **Visual Token Interface**: Interactive tokens for all query elements
- **Dynamic API Integration**: Real-time loading from backend APIs
- **Form Integration**: Full Angular Reactive Forms support
- **Security**: Server-side SQL generation prevents injection attacks
- **Accessibility**: WCAG 2.1 AA compliant with comprehensive support
- **Import/Export**: JSON-based sharing and preset management
- **Validation**: Real-time validation with detailed error reporting

#### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

#### Dependencies
- Angular v20+
- PrimeNG v20+
- Angular CDK v20+
- RxJS 7.8+

#### Breaking Changes
None (initial release)

#### Migration Guide
This is the initial release, no migration required.

#### Known Issues
None at this time.

#### Deprecations
None at this time.

---

## Contributing to Changelog

When contributing changes, please:

1. **Add entries to [Unreleased]** section
2. **Use the following categories:**
   - `Added` for new features
   - `Changed` for changes in existing functionality
   - `Deprecated` for soon-to-be removed features
   - `Removed` for now removed features
   - `Fixed` for any bug fixes
   - `Security` for vulnerability fixes

3. **Follow the format:**
   ```markdown
   ### Added
   - New feature description with reference to issue/PR if applicable
   ```

4. **Include breaking changes** in the `Changed` section with clear migration instructions

5. **Update version numbers** following semantic versioning:
   - MAJOR version for incompatible API changes
   - MINOR version for backwards-compatible functionality additions
   - PATCH version for backwards-compatible bug fixes

## Version History

| Version | Release Date | Angular Version | Major Changes |
|---------|--------------|-----------------|---------------|
| 0.0.1   | 2024-01-01   | 20.x           | Initial release |

## Support Policy

- **Current Version**: Receives active development and support
- **Previous Major Version**: Security updates for 6 months after new major release
- **Angular Compatibility**: Follows Angular LTS support schedule
- **Browser Support**: Last 2 major versions of modern browsers

## Upgrade Guide

### From 0.0.x to 1.0.x (Future)
Upgrade instructions will be provided when version 1.0.0 is released.

## Security Advisories

Security vulnerabilities will be documented here with:
- CVE numbers (if applicable)
- Severity level
- Affected versions
- Mitigation steps
- Fixed in version

No security advisories at this time.