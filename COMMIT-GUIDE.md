# Commit Guide for Separated Frontend/Backend Setup

## Overview
This guide helps organize the commits for the separated frontend/backend setup. The changes should be committed in logical groups to maintain a clean git history.

## Commit Structure

### 1. Initial Setup and Configuration Files
**Files to commit:**
- `.gitignore` (root)
- `frontend/.gitignore`
- `backend/.gitignore`
- `frontend/proxy.conf.json`
- `backend/application-dev.properties`
- `backend/java/com/moneyplant/app/config/CorsConfig.java`

**Commit message:**
```
feat: Add separated frontend/backend development setup

- Add comprehensive .gitignore files for frontend and backend
- Add proxy configuration for frontend development
- Add development-specific application properties
- Add CORS configuration for cross-origin requests
```

### 2. Frontend Separation
**Files to commit:**
- `frontend/` directory (all contents)
- `frontend/package.json` (updated scripts)

**Commit message:**
```
feat: Separate frontend into independent Angular application

- Move Angular application to frontend/ directory
- Update package.json with development scripts
- Configure proxy for API calls to backend
- Enable hot reloading for development
```

### 3. Backend Separation
**Files to commit:**
- `backend/` directory (all contents)
- `backend/pom.xml` (simplified for backend-only)

**Commit message:**
```
feat: Separate backend into independent Spring Boot application

- Move Spring Boot application to backend/ directory
- Simplify pom.xml for backend-only development
- Add development profile configuration
- Remove frontend build dependencies
```

### 4. Development Scripts
**Files to commit:**
- `start-frontend.sh`
- `start-backend.sh`
- `build-production.sh`
- `test-setup.sh`

**Commit message:**
```
feat: Add development and build scripts

- Add script to start frontend development server
- Add script to start backend development server
- Add script to build production version
- Add script to test setup configuration
```

### 5. Documentation
**Files to commit:**
- `README-separated-setup.md`
- `MIGRATION-GUIDE.md`
- `COMMIT-GUIDE.md`

**Commit message:**
```
docs: Add comprehensive documentation for separated setup

- Add setup guide for independent development
- Add migration guide for teams
- Add commit organization guide
- Document development workflow and troubleshooting
```

### 6. Docker Support
**Files to commit:**
- `docker-compose.dev.yml`
- `backend/Dockerfile.dev`
- `frontend/Dockerfile.dev`

**Commit message:**
```
feat: Add Docker support for development environment

- Add Docker Compose configuration for development
- Add development Dockerfiles for frontend and backend
- Enable containerized development workflow
```

### 7. Clean Up Original Structure
**Files to commit:**
- Updated `moneyplant-app/pom.xml` (removed frontend plugins)
- Removed `moneyplant-app/src/main/moneyplant-app/` directory

**Commit message:**
```
refactor: Clean up original embedded frontend structure

- Remove embedded frontend from original location
- Update original pom.xml to remove frontend build plugins
- Maintain backward compatibility for production builds
```

## Git Commands

### To stage and commit each group:

```bash
# 1. Configuration files
git add .gitignore frontend/.gitignore backend/.gitignore
git add frontend/proxy.conf.json backend/application-dev.properties
git add backend/java/com/moneyplant/app/config/CorsConfig.java
git commit -m "feat: Add separated frontend/backend development setup"

# 2. Frontend separation
git add frontend/
git commit -m "feat: Separate frontend into independent Angular application"

# 3. Backend separation
git add backend/
git commit -m "feat: Separate backend into independent Spring Boot application"

# 4. Development scripts
git add start-frontend.sh start-backend.sh build-production.sh test-setup.sh
git commit -m "feat: Add development and build scripts"

# 5. Documentation
git add README-separated-setup.md MIGRATION-GUIDE.md COMMIT-GUIDE.md
git commit -m "docs: Add comprehensive documentation for separated setup"

# 6. Docker support
git add docker-compose.dev.yml backend/Dockerfile.dev frontend/Dockerfile.dev
git commit -m "feat: Add Docker support for development environment"

# 7. Clean up
git add moneyplant-app/pom.xml
git rm -r moneyplant-app/src/main/moneyplant-app/
git commit -m "refactor: Clean up original embedded frontend structure"
```

## Verification

After committing, verify the setup:

```bash
# Test the setup
./test-setup.sh

# Check git status
git status

# Verify no unwanted files are tracked
git ls-files | grep -E "(node_modules|target|\.angular|dist)"
```

## Rollback Plan

If issues arise, you can rollback to the previous state:

```bash
# Rollback to before the separation
git reset --hard HEAD~7

# Or rollback individual commits
git revert <commit-hash>
```

## Notes

- All scripts are executable (`chmod +x`)
- .gitignore files prevent committing build artifacts
- Original structure is preserved for production builds
- Documentation provides clear migration path for teams 