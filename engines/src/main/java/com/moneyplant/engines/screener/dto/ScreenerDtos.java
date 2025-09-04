package com.moneyplant.engines.screener.dto;

import java.util.List;
import java.util.Map;

/**
 * DTOs for Screener API payloads and responses
 */
public class ScreenerDtos {
    public static class ScreenerRunRequest {
        private ScreenerSpec spec;
        public ScreenerSpec getSpec() { return spec; }
        public void setSpec(ScreenerSpec spec) { this.spec = spec; }
    }

    public static class ScreenerResultDto {
        private List<Map<String,Object>> rows;
        private Integer page;
        private Integer size;
        public List<Map<String, Object>> getRows() { return rows; }
        public void setRows(List<Map<String, Object>> rows) { this.rows = rows; }
        public Integer getPage() { return page; }
        public void setPage(Integer page) { this.page = page; }
        public Integer getSize() { return size; }
        public void setSize(Integer size) { this.size = size; }
    }

    public static class RuleSaveRequest {
        private String id; // optional for update
        private ScreenerSpec spec;
        private String name;
        private String description;
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public ScreenerSpec getSpec() { return spec; }
        public void setSpec(ScreenerSpec spec) { this.spec = spec; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class RuleDto {
        private String id;
        private String name;
        private String description;
        private ScreenerSpec spec;
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public ScreenerSpec getSpec() { return spec; }
        public void setSpec(ScreenerSpec spec) { this.spec = spec; }
    }

    public static class RuleRunOverrideRequest {
        private ScreenerSpec overrides; // optional fields to override spec at runtime
        public ScreenerSpec getOverrides() { return overrides; }
        public void setOverrides(ScreenerSpec overrides) { this.overrides = overrides; }
    }

    public static class FieldMeta {
        private String key;
        private String label;
        private String source; // indicator | ohlcv | master
        private String type;   // NUMBER | STRING | DATE
        private List<String> operators;
        public String getKey() { return key; }
        public void setKey(String key) { this.key = key; }
        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public List<String> getOperators() { return operators; }
        public void setOperators(List<String> operators) { this.operators = operators; }
    }
}
