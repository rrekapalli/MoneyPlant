package com.moneyplant.engines.screener.api;

import com.moneyplant.engines.screener.dto.ScreenerSpec;
import com.moneyplant.engines.screener.service.ScreenerEngineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for pattern screening operations
 */
@RestController
@RequestMapping("/engines/api/screener")
public class ScreenerController {
    private final ScreenerEngineService engineService;

    public ScreenerController(ScreenerEngineService engineService) {
        this.engineService = engineService;
    }

    @PostMapping("/run")
    public ResponseEntity<com.moneyplant.engines.screener.dto.ScreenerDtos.ScreenerResultDto> runScreener(@RequestBody com.moneyplant.engines.screener.dto.ScreenerDtos.ScreenerRunRequest req) throws Exception {
        var spec = req.getSpec();
        List<java.util.Map<String,Object>> rows = engineService.run(spec);
        var dto = new com.moneyplant.engines.screener.dto.ScreenerDtos.ScreenerResultDto();
        dto.setRows(rows);
        dto.setPage(spec.getPage() == null ? 0 : spec.getPage());
        dto.setSize(spec.getSize() == null ? 50 : spec.getSize());
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/run-all")
    public ResponseEntity<com.moneyplant.engines.screener.dto.ScreenerDtos.ScreenerResultDto> runScreenerForAllSymbols(@RequestBody com.moneyplant.engines.screener.dto.ScreenerDtos.ScreenerRunRequest req) throws Exception {
        var spec = req.getSpec();
        List<java.util.Map<String,Object>> rows = engineService.run(spec);
        var dto = new com.moneyplant.engines.screener.dto.ScreenerDtos.ScreenerResultDto();
        dto.setRows(rows);
        dto.setPage(spec.getPage() == null ? 0 : spec.getPage());
        dto.setSize(spec.getSize() == null ? 50 : spec.getSize());
        return ResponseEntity.ok(dto);
    }
    
    @GetMapping("/fields")
    public ResponseEntity<List<java.util.Map<String, Object>>> fields(com.moneyplant.engines.screener.service.IndicatorFieldCatalog catalog) {
        return ResponseEntity.ok(catalog.getFields());
    }

    @GetMapping("/sectors")
    public ResponseEntity<List<String>> sectors() {
        // Minimal static sectors set; ideally query from master table via Trino
        return ResponseEntity.ok(java.util.List.of("IT","FINANCIALS","HEALTHCARE","ENERGY","INDUSTRIALS","CONSUMER"));
    }

    @GetMapping("/snapshot/{symbol}")
    public ResponseEntity<java.util.Map<String,Object>> snapshot(@PathVariable String symbol) throws Exception {
        var spec = new ScreenerSpec();
        spec.setSelect(java.util.List.of("em.symbol","em.company_name","em.sector","lh.close","li.rsi_14","li.macd_line","li.macd_signal","li.sma_50","li.sma_200"));
        var f = new com.moneyplant.engines.screener.dto.ScreenerFilterCondition();
        f.setField("symbol"); f.setSource("master"); f.setOp(com.moneyplant.engines.screener.dto.ScreenerFilterCondition.Op.EQ); f.setValues(java.util.List.of(symbol));
        spec.setFilters(java.util.List.of(f));
        spec.setPage(0); spec.setSize(1);
        var rows = engineService.run(spec);
        if (rows.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(rows.get(0));
    }

    // Simple in-memory rules registry with typed DTOs
    private final java.util.Map<String, com.moneyplant.engines.screener.dto.ScreenerDtos.RuleDto> rules = new java.util.concurrent.ConcurrentHashMap<>();

    @PostMapping("/rules")
    public ResponseEntity<com.moneyplant.engines.screener.dto.ScreenerDtos.RuleDto> addScreenerRule(@RequestBody com.moneyplant.engines.screener.dto.ScreenerDtos.RuleSaveRequest req) {
        String id = req.getId() != null ? req.getId() : java.util.UUID.randomUUID().toString();
        var dto = new com.moneyplant.engines.screener.dto.ScreenerDtos.RuleDto();
        dto.setId(id);
        dto.setName(req.getName());
        dto.setDescription(req.getDescription());
        dto.setSpec(req.getSpec());
        rules.put(id, dto);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/rules")
    public ResponseEntity<List<com.moneyplant.engines.screener.dto.ScreenerDtos.RuleDto>> getScreenerRules() {
        return ResponseEntity.ok(new java.util.ArrayList<>(rules.values()));
    }

    @GetMapping("/rules/{id}")
    public ResponseEntity<com.moneyplant.engines.screener.dto.ScreenerDtos.RuleDto> getRule(@PathVariable("id") String id) {
        return ResponseEntity.of(java.util.Optional.ofNullable(rules.get(id)));
    }

    @DeleteMapping("/rules/{ruleId}")
    public ResponseEntity<String> deleteScreenerRule(@PathVariable String ruleId) {
        rules.remove(ruleId);
        return ResponseEntity.ok("deleted");
    }

    @PostMapping("/rules/{id}/run")
    public ResponseEntity<com.moneyplant.engines.screener.dto.ScreenerDtos.ScreenerResultDto> runRule(@PathVariable("id") String id, @RequestBody(required = false) com.moneyplant.engines.screener.dto.ScreenerDtos.RuleRunOverrideRequest override) throws Exception {
        var rule = rules.get(id);
        if (rule == null) return ResponseEntity.notFound().build();
        var spec = rule.getSpec();
        if (override != null && override.getOverrides() != null) {
            // very simple override: replace page/size/sort/select/sectors if present
            var ov = override.getOverrides();
            if (ov.getPage() != null) spec.setPage(ov.getPage());
            if (ov.getSize() != null) spec.setSize(ov.getSize());
            if (ov.getSort() != null) spec.setSort(ov.getSort());
            if (ov.getSelect() != null) spec.setSelect(ov.getSelect());
            if (ov.getSectors() != null) spec.setSectors(ov.getSectors());
        }
        List<java.util.Map<String,Object>> rows = engineService.run(spec);
        var dto = new com.moneyplant.engines.screener.dto.ScreenerDtos.ScreenerResultDto();
        dto.setRows(rows);
        dto.setPage(spec.getPage() == null ? 0 : spec.getPage());
        dto.setSize(spec.getSize() == null ? 50 : spec.getSize());
        return ResponseEntity.ok(dto);
    }
}
