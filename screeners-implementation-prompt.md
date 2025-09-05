Prompt: Build a Spring Boot REST API for “User Screeners” (CRUD + Runs + Results)

Goal: Implement a production-ready REST API that exposes CRUD endpoints for a frontend to fully implement the screeners feature using the PostgreSQL schema we already have (screener, screener_version, screener_paramset, screener_schedule, screener_alert, screener_run, screener_result, screener_result_diff, screener_star, screener_saved_view, plus symbol and user).
Use Java 21 + Spring Boot 3, Spring Data JPA, Flyway, Bean Validation, MapStruct, Spring Security (JWT), and Springdoc OpenAPI.

Project Setup

Build: Maven (or Gradle OK)

Dependencies: spring-boot-starter-web, spring-boot-starter-data-jpa, spring-boot-starter-validation, spring-boot-starter-security, springdoc-openapi-starter-webmvc-ui, mapstruct, postgresql, flyway-core, lombok, jackson-datatype-jsr310, testcontainers, spring-boot-starter-test.

Java version: 21

Package base: com.acme.screener

Architecture & Conventions

Layers: controller → service → repo → entity

DTOs separate from entities; use MapStruct mappers (componentModel = "spring").

Repositories: Spring Data JPA + custom queries for filters.

Security: JWT auth filter; expose X-User-Id resolved from token to enforce ownership.

RLS note: App enforces ownership at service layer (and can later enable DB-side RLS).

Error handling: @ControllerAdvice with RFC-7807 style Problem+JSON.

Database

Use the existing schema (already applied). Add Flyway baseline script if needed.

Entities map to existing tables; do not change table/column names.

user and symbol are assumed to exist; create minimal JPA entities for FK references.

Entities to Implement (JPA)

Create JPA entities (with @Table(name = "...")):

Screener (screener)

ScreenerVersion (screener_version)

ScreenerParamset (screener_paramset)

ScreenerSchedule (screener_schedule)

ScreenerAlert (screener_alert)

ScreenerRun (screener_run)

ScreenerResult (screener_result) — composite PK (screener_run_id, symbol_id)

ScreenerResultDiff (screener_result_diff) — composite PK (screener_run_id, prev_screener_run_id, symbol_id)

ScreenerStar (screener_star) — composite PK (screener_id, user_id)

ScreenerSavedView (screener_saved_view)

Minimal UserRef (user) with userId; Minimal SymbolRef (symbol) with symbolId

DTOs (Request/Response)

Create request/response DTOs with validation:

ScreenerCreateReq { name@NotBlank, description, isPublic, defaultUniverse }

ScreenerResp { screenerId, ownerUserId, name, description, isPublic, defaultUniverse, createdAt, updatedAt }

ScreenerVersionCreateReq { versionNumber@NotNull, engine@Pattern("sql|dsl|expr"), dslJson:Object?, compiledSql:String?, paramsSchemaJson:Object? }

ScreenerVersionResp { screenerVersionId, screenerId, versionNumber, status, engine, dslJson, compiledSql, paramsSchemaJson, createdAt }

ParamsetCreateReq { name@NotBlank, paramsJson:Object }

ParamsetResp { paramsetId, screenerVersionId, name, paramsJson, createdByUserId, createdAt }

ScheduleCreateReq { cronExpr@NotBlank, timezone@Default("Asia/Kolkata"), isEnabled:Boolean }

ScheduleResp { scheduleId, ... }

AlertCreateReq { conditionJson:Object@NotNull, deliveryChannels:List<String>, isEnabled:Boolean }

AlertResp { alertId, ... }

RunCreateReq { screenerVersionId@NotNull, paramsetId:Long?, paramsJson:Object?, runForTradingDay:LocalDate, universeSymbolIds:List<Long>? }

RunResp { screenerRunId, status, startedAt, finishedAt, totals, errorMessage }

ResultResp { symbolId, matched, score0To1, rankInRun, metricsJson:Object, reasonJson:Object }

ResultDiffResp { symbolId, changeType, prevRank, newRank }

StarToggleReq { starred:Boolean }

SavedViewCreateReq { name@NotBlank, tablePrefs:Object }

Pagination wrappers: PageResp<T> { content, page, size, totalElements, totalPages, sort }

Repositories

Define Spring Data interfaces with needed methods & specifications:

ScreenerRepo, ScreenerVersionRepo, ScreenerParamsetRepo, ScreenerScheduleRepo, ScreenerAlertRepo, ScreenerRunRepo, ScreenerResultRepo, ScreenerResultDiffRepo, ScreenerStarRepo, ScreenerSavedViewRepo

Useful queries:

Find screeners by owner or public with search: findByOwnerUserIdOrIsPublicTrue(...)

Latest successful run per screener

Results by run with paging and optional min score, match=true, symbol filter, sort by rank/score

Services

Implement business logic with ownership checks and validation:

ScreenerService

CRUD: create/update/delete/get screener (owner-only); list mine; list public; search

Star/unstar screener for a user

ScreenerVersionService

Create version (incremental versionNumber uniqueness per screener), archive/activate

CRUD paramsets; resolve params_json defaults vs overrides

ScreenerScheduleService, ScreenerAlertService

CRUD + enable/disable

ScreenerRunService

Create run: persist params_json (resolved), universe_snapshot (list of symbolIds), set status=running

Execute: for now simulate execution by inserting dummy screener_result rows OR call a RunExecutor interface

Finish run: fill finished_at, totals, set status=success|failed

Compute diffs vs previous successful run and populate screener_result_diff

Get runs (paged), get run by id (ownership)

ScreenerResultService

Paged results query (filters: matched, minScore, symbolId, sorting)

Get diffs for a run

SavedViewService

CRUD for user saved views

Provide a RunExecutor SPI bean with two impls:
NoopRunExecutor (default, test) and SqlRunExecutor (later we can implement using the compiled WHERE/SELECT via JDBC to a feature view).

Controllers (REST)

Base path: /api/screeners. Use standard JSON, 2xx/4xx/5xx, Problem+JSON errors.

Screener

POST /api/screeners → create

GET /api/screeners/{id} → get (owner or public)

PATCH /api/screeners/{id} → update (owner)

DELETE /api/screeners/{id} → delete (owner)

GET /api/screeners → list mine + public (query: q, page, size, sort)

Versions

POST /api/screeners/{id}/versions → create version

GET /api/screeners/{id}/versions → list

GET /api/versions/{versionId} → get

PATCH /api/versions/{versionId} → update (status, compiledSql, dslJson)

POST /api/versions/{versionId}/paramsets → create paramset

GET /api/versions/{versionId}/paramsets → list

DELETE /api/paramsets/{paramsetId} → delete

Schedules & Alerts

POST /api/screeners/{id}/schedules / GET / PATCH /{scheduleId} / DELETE /{scheduleId}

POST /api/screeners/{id}/alerts / GET / PATCH /{alertId} / DELETE /{alertId}

Runs

POST /api/screeners/{id}/runs (body: RunCreateReq) → create run (and trigger execution async or sync)

GET /api/screeners/{id}/runs → list runs (paged, latest first)

GET /api/runs/{runId} → get run

POST /api/runs/{runId}:retry → retry failed run

GET /api/runs/{runId}/results → paged results (query: matched, minScore, symbolId, page, size, sort=rank|score)

GET /api/runs/{runId}/diffs → list diffs vs previous run

Stars & Saved Views

PUT /api/screeners/{id}/star (body: { starred: true|false })

GET /api/screeners/{id}/stars → list users who starred (owner-only) or “am I starred”

POST /api/screeners/{id}/saved-views

GET /api/screeners/{id}/saved-views

PATCH /api/saved-views/{savedViewId}

DELETE /api/saved-views/{savedViewId}

Utility

GET /api/screeners/{id}/last-run → last successful run summary

GET /api/screeners/{id}/last-results → results of last run (paged)

GET /api/symbols → minimal endpoint to search symbols by ticker (for filters)

Security

JWT bearer auth. Provide a JwtAuthFilter that loads user and sets SecurityContext.

A CurrentUser component exposes long currentUserId().

Ownership checks in services (throw 403 when non-owner accesses a private screener).

Public screener access allowed (isPublic=true).

Validation & Errors

Use @Valid on all requests; return 400 with field errors list.

Use @ControllerAdvice to map exceptions to Problem+JSON:

400 Validation

401 Unauthorized

403 Forbidden (ownership)

404 Not found

409 Conflict (duplicate version number, unique constraints)

500 Server error

OpenAPI

Auto-generate docs with Springdoc at /swagger-ui.html and /v3/api-docs.

Add summary/description to controllers and DTOs.

Pagination & Sorting

Use page, size, sort query params; wrap responses with PageResp<T>.

Default size=25, max=200, validate bounds.

Sample cURL (generate as tests in README)
# Create screener
curl -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json" \
 -d '{"name":"Value+Momentum","description":"P/E<15, RSI<30","isPublic":false}' \
 POST http://localhost:8080/api/screeners

# Create version
curl -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json" \
 -d '{"versionNumber":1,"engine":"sql","compiledSql":"(rsi_14 < :rsi_max AND pe_ratio < :pe_max AND sma_50 > sma_200)","paramsSchemaJson":{"rsi_max":{"type":"int","default":30},"pe_max":{"type":"decimal","default":15}}}' \
 POST http://localhost:8080/api/screeners/{screenerId}/versions

# Create paramset
curl -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json" \
 -d '{"name":"Conservative","paramsJson":{"rsi_max":35,"pe_max":12}}' \
 POST http://localhost:8080/api/versions/{versionId}/paramsets

# Run screener
curl -H "Authorization: Bearer <JWT)" -H "Content-Type: application/json" \
 -d '{"screenerVersionId":{versionId},"paramsetId":{paramsetId},"runForTradingDay":"2025-09-04","universeSymbolIds":[1,2,3]}' \
 POST http://localhost:8080/api/screeners/{screenerId}/runs

# Get results (top 50 by score)
curl -H "Authorization: Bearer <JWT>" \
 "http://localhost:8080/api/runs/{runId}/results?page=0&size=50&sort=score,DESC"

Testing

Use Testcontainers (PostgreSQL) for repository and controller integration tests.

Mock JWT to inject currentUserId.

Add tests for ownership isolation and pagination.

Non-Functional

Log SQL and request IDs (MDC).

Add rate limiting on runs endpoints (e.g., 1 run/min per screener).

Add graceful error messages for missing FK entities.

Deliverables to generate:

Full Spring Boot project with the above layers and endpoints.

JPA entities, DTOs, MapStruct mappers, repositories, services, controllers.

Security (JWT), exception handler, OpenAPI config.

Sample README with cURL and Swagger link.

Basic integration tests using Testcontainers.

Implement RunExecutor as a pluggable interface. For now, create a simple NoopRunExecutor that, on createRun, inserts a few fake screener_result rows (use provided universeSymbolIds), updates totals, and computes diffs vs previous run so the frontend can be built immediately. Later, we’ll swap it with a SqlRunExecutor that executes the compiled WHERE over a feature view in Postgres/Trino.

Use these exact names and shapes unless conflicts arise. Generate clean, idiomatic code with Java 21 records where appropriate for DTOs, and include thorough Javadoc and method-level OpenAPI annotations.