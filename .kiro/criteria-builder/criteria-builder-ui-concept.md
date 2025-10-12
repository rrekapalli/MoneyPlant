
# Prompt — Build an Angular v20 library: `@acme/criteria-builder` (PrimeNG v20, TypeScript only)

**Short goal:**  
Create an Angular **library** `./frontend/projects/criteria-builder` (should be accessible with @projects/criteria-builder) that exports a single angular form control `<mp-criteria-builder>` implementing `ControlValueAccessor`. It should let users compose human-readable criteria sentences (simple and advanced) and produce an internal JSON DSL and a safe parameterized SQL `WHERE` clause suitable for persistence and server execution. The UI uses PrimeNG v20 components and must be TypeScript only (no AngularJS/templates outside Angular). Deliver tests, docs, and storybook examples.

---

## High-level requirements

1. **Angular & Dependencies**
   - Angular v20
   - PrimeNG v20 (for controls + layout)
   - RxJS (standard)
   - No JQuery or other UI libs.
   - Use `ng-packagr` compatible library structure.

2. **Main deliverable**
   - Library package `@acme/criteria-builder` exporting:
     - `AcCriteriaBuilderModule`
     - `AcCriteriaBuilderComponent` — the ControlValueAccessor component
     - `CriteriaSerializerService` — JSON ↔ SQL serializer (and param builder)
     - Type definitions (interfaces / types)
     - Unit tests (Jest or Karma+Jasmine), Storybook stories
     - README with usage examples + SQL generation rules

3. **Control API / Integration**
   - `<mp-criteria-builder [fields]="fields" [functions]="functions" [config]="config" (validityChange)="...">`
   - Implements `ControlValueAccessor` so it integrates with Reactive Forms:
     - `.value` is the internal JSON DSL (see schema below)
   - Accepts:
     - `fields: FieldMeta[]` — metadata about available fields (name, type, db_column, suggestions, allowed ops)
     - `functions: FunctionMeta[]` — available named functions (name, params, return type, SQL mapping)
     - `config: BuilderConfig` — UI config: allowGrouping, maxDepth, enableAdvancedFunctions, autoSave, locale
   - Emits:
     - `(validityChange: boolean)` whenever the built criteria becomes valid/invalid
     - Optional `(sqlPreviewChange: {sql: string, params: Record<string,any>})` for preview updates

4. **UX Summary**
   - Default view: a readable sentence builder (like “Price (close) > 200 AND (RSI(14) < 30 OR MACD_histogram > 0.02)”).
   - Provide two editing modes:
     - **Simple Mode**: drop-down based rows: Field – Operator – Value (value editor adapts to field type)
     - **Advanced Mode**: function editor / expression composer where functions with parameters can be inserted (e.g., `EMA(close, 20) > SMA(close, 50)`).
   - Support grouping (parentheses), nested groups with AND/OR/NOT.
   - Drag to reorder conditions and groups.
   - Inline preview of SQL and parameter keys (click to copy).
   - Validation: fields typed, operator compatible, value type checking, min/max bounds, reserved function param types.

---

## Data models / Types (TypeScript interfaces)

```ts
export type FieldType = 'number'|'integer'|'string'|'date'|'boolean'|'enum'|'percent'|'currency';

export interface FieldMeta {
  id: string;
  label: string;
  dbColumn: string;
  dataType: FieldType;
  allowedOps?: string[];
  suggestionsApi?: string;
  formatter?: (v:any)=>string;
  example?: string;
  nullable?: boolean;
}

export interface FunctionParam {
  name: string;
  label?: string;
  type: FieldType;
  optional?: boolean;
  default?: any;
}

export interface FunctionMeta {
  id: string;
  label: string;
  returnType: FieldType;
  params: FunctionParam[];
  sqlTemplate?: string;
  description?: string;
}

export type Operator =
  '='|'!='|'>'|'>='|'<'|'<='|'in'|'not in'|'between'|'like'|'is null'|'is not null'|'contains';

export interface Condition {
  id: string;
  left: FieldRef | FunctionCall;
  op: Operator;
  right?: Literal | FunctionCall | (Literal[]);
}

export interface Group {
  id: string;
  operator: 'AND'|'OR'|'NOT';
  children: (Condition | Group)[];
}

export interface FunctionCall {
  functionId: string;
  args: (FieldRef | Literal | FunctionCall)[];
}

export interface FieldRef {
  fieldId: string;
}

export interface Literal {
  type: FieldType;
  value: any;
}

export interface CriteriaDSL {
  root: Group;
  meta?: { name?: string, description?: string, version?: number, createdBy?: string, createdAt?: string };
}
```

---

## Operators & Type mapping
Provide default allowed operators by FieldType:
  - number/integer/percent/currency: =, !=, >, >=, <, <=, between, in
  - string: =, !=, like, contains, in
  - date: =, !=, >, >=, <, <=, between
  - boolean: =, !=, is null, is not null
  - enum: =, !=, in, not in
Operators should be configurable per field via FieldMeta.allowedOps.

---

## UI Components & layout (files)
/lib/ inside package:
- mp-criteria-builder.component.ts — top-level control; ControlValueAccessor & exposes API/outputs
- builder-toolbar.component.ts — mode switch, save/load presets, import/export JSON
- group-editor.component.ts — renders a Group (AND/OR/NOT), supports add condition, add subgroup
- condition-row.component.ts — renders a condition row (left, op, right) with dynamic editors
- field-selector.component.ts — searchable dropdown for fields (with autocomplete)
- operator-selector.component.ts — picks valid operators for the selected field
- value-editor.directive.ts — dynamic sub-component loader that renders:
  - numeric input, date picker, multi-select, chip list, string text input, pattern/regex input, percentage input
  - function-argument editor (if argument is a function call)
- function-editor.component.ts — UI for selecting & filling function parameters; supports nested function calls
- sql-preview.component.ts — shows generated parameterized SQL + parameters
- expression-help.component.ts — glossary of available functions/fields/operators
- drag-reorder behaviors integrated via HTML5 Drag and Drop or CDK DragDrop (optional)
- error-banner.component.ts — displays validation errors
All components use PrimeNG primitives: p-dropdown, p-inputText, p-calendar, p-chips, p-button, p-panel, p-toggleButton, p-dialog, p-table (for results preview), and p-toast for messages.

---

## Form & State management
- Use FormArray / FormGroup for each Group and Condition.
- Each Condition maps to a FormGroup with controls: leftType (field|function), left, operator, right (or rightArr for between/in).
- The Component implements ControlValueAccessor:
  - writeValue(dsl: CriteriaDSL), registerOnChange, registerOnTouched.
  - All changes propagate to onChange(currentDsl) with debounced updates (200ms).
Use RxJS BehaviorSubject to maintain latest DSL and SQL preview.

---

## SQL Serializer Rules

1. Parameterized queries using named parameters (:p1, :p2, ...)
2. Field validation via `FieldMeta`
3. Function SQL templates use token replacement (`{{col}}`, `{{period}}`)
4. SQL safe (no injection risk)
5. Supports nested groups and recursive function calls

Example DSL:

```json
{
  "root": {
    "operator": "AND",
    "children": [
      {"id": "c1", "left": {"fieldId": "close"}, "op": ">", "right": {"type": "number", "value": 200}},
      {"id": "g1", "operator": "OR", "children": [
        {"id": "c2", "left": {"functionId": "RSI", "args": [{"fieldId": "close"}, {"type": "integer", "value": 14}]}, "op": "<", "right": {"type": "number", "value": 30}},
        {"id": "c3", "left": {"fieldId": "macd_histogram"}, "op": ">", "right": {"type": "number", "value": 0.02}}
      ]}
    ]
  }
}
```

SQL Output:
```sql
( close > :p1 ) AND ( rsi(close, :p2) < :p3 OR macd_histogram > :p4 )
-- params: { p1: 200, p2: 14, p3: 30, p4: 0.02 }
```

---

## Persistence & Import/Export
  - The ControlValue (the saved format) = CriteriaDSL JSON. Provide exportJSON() / importJSON() APIs.
  - Provide toSQL() and toPreview() methods returning parameterized SQL. The frontend stores the DSL JSON in backend screener_version.compiled_sql or params_json as needed.
  - Provide a compact normalized serialization for DB storage with version (e.g., v:1, dsl: {..}).

---

## Accessibility & Internationalization
  - Keyboard accessible for adding/removing conditions, grouping, toggles.
  - All labels passed via FieldMeta.label and FunctionMeta.label. Support i18n tokens in config.
  - Provide ARIA attributes for all interactive elements.

---

## Tests and Quality
- Unit tests for:
  - Form behavior & ControlValueAccessor contract
  - Condition add/edit/delete, grouping, re-ordering
  - CriteriaSerializerService with many edge cases (nested functions, IN lists, BETWEEN)
  - Security tests: invalid fieldId and function injection must fail
- Integration test: mount component, feed fields + functions, build sample DSL, assert SQL & params map
- Use Jest + @angular-devkit/build-angular or Karma/Jasmine based on your stack.
- Provide Storybook stories showing:
  - Simple mode: 3 rows example
  - Advanced mode: functions with nested args
  - Grouped logic with NOT
  - SQL preview copied to clipboard

---

## Testing & Documentation

- Jest unit tests for SQL serializer
- Storybook stories for UI
- README including examples
- Example integration with Spring Boot backend
- Include security validation guidance

---

## Packaging / Distribution
- Use ng generate library criteria-builder or ng-packagr layout.
- Export module and public APIs in public-api.ts.
- Include styles / PrimeNG themes in library bundle or require host app to include PrimeNG theme.
- Publish-ready: provide package.json with peerDependencies for Angular v20 & PrimeNG v20, and build scripts.

---

## Example usage (Host app, Reactive Form)

<form [formGroup]="form">
  <mp-criteria-builder
    formControlName="criteria"
    [fields]="fields"
    [functions]="functions"
    [config]="{ enableAdvancedFunctions: true }"
    (sqlPreviewChange)="onPreview($event)">
  </mp-criteria-builder>
</form>

this.form = this.fb.group({
  criteria: [null, Validators.required]
});

this.fields = [...];     // load from backend: fieldId, dbColumn, type, allowedOps
this.functions = [...];  // load from backend or use local defaults


To persist:

const dsl: CriteriaDSL = this.form.value.criteria;
await this.api.saveScreenerVersion({ screenerId, compiledDsl: dsl });


To execute on server:

- Server receives DSL JSON, runs the same serializer or trusts client-generated SQL only after server-side validation. Important: always revalidate DSL server-side — never trust client SQL/params.

---

## Security warnings & server contract
- The library must not be the only security gate. Server must:
  - Re-validate fieldIds and functionIds against server whitelist
  - Re-generate SQL (do not accept raw SQL from client unless you re-run serializer server-side)
  - Enforce limits: max conditions, max group depth, size limits
  - Rate-limit runs initiated from UI
- Provide a shared canonical function/field registry JSON that both client and server load to avoid mismatch.

## Docs & Examples to generate
- README with:
  - Quick start
  - Props & events table
  - DSL JSON schema
  - SQL serialization examples
  - Security notes
- Storybook stories & screenshots
- Example host app demonstrating:
  - saving DSL to screener_version
  - loading saved DSL
  - previewing SQL
  - performing a sample request to an endpoint that re-serializes & runs query

## Deliverables (explicit)
1. Full Angular library source, built with ng-packagr, TypeScript-only.
2. All components & service implementations as listed.
3. CriteriaSerializerService fully implemented with unit tests covering edge-cases.
4. Storybook stories and at least 10 unit tests for serializer + 10 for UI (add/edit conditions).
5. README and usage examples with integration notes for Spring Boot backend (how to store DSL into screener_version.compiled_sql).
6. Example host app (minimal) demonstrating usage & CRUD saving.