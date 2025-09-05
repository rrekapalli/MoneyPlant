package com.moneyplant.engines.screener.dto;

import java.util.List;
import java.util.Map;

public class ScreenerSpec {
    private List<String> sources;
    private List<ScreenerFilterCondition> filters;
    private String logic; // AND/OR
    private WindowSpec window;
    private List<ComputeSpec> compute;
    private List<SortSpec> sort;
    private Integer page;
    private Integer size;
    private List<String> select;
    private List<String> sectors;
    private String asOfDate;

    // getters/setters
    public List<String> getSources() { return sources; }
    public void setSources(List<String> sources) { this.sources = sources; }
    public List<ScreenerFilterCondition> getFilters() { return filters; }
    public void setFilters(List<ScreenerFilterCondition> filters) { this.filters = filters; }
    public String getLogic() { return logic; }
    public void setLogic(String logic) { this.logic = logic; }
    public WindowSpec getWindow() { return window; }
    public void setWindow(WindowSpec window) { this.window = window; }
    public List<ComputeSpec> getCompute() { return compute; }
    public void setCompute(List<ComputeSpec> compute) { this.compute = compute; }
    public List<SortSpec> getSort() { return sort; }
    public void setSort(List<SortSpec> sort) { this.sort = sort; }
    public Integer getPage() { return page; }
    public void setPage(Integer page) { this.page = page; }
    public Integer getSize() { return size; }
    public void setSize(Integer size) { this.size = size; }
    public List<String> getSelect() { return select; }
    public void setSelect(List<String> select) { this.select = select; }
    public List<String> getSectors() { return sectors; }
    public void setSectors(List<String> sectors) { this.sectors = sectors; }
    public String getAsOfDate() { return asOfDate; }
    public void setAsOfDate(String asOfDate) { this.asOfDate = asOfDate; }

    public static class WindowSpec {
        private String symbol;
        private String dateField;
        private String range; // e.g., 180d
        public String getSymbol() { return symbol; }
        public void setSymbol(String symbol) { this.symbol = symbol; }
        public String getDateField() { return dateField; }
        public void setDateField(String dateField) { this.dateField = dateField; }
        public String getRange() { return range; }
        public void setRange(String range) { this.range = range; }
    }

    public static class ComputeSpec {
        private String name;
        private String expr;
        private List<String> dependsOn;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getExpr() { return expr; }
        public void setExpr(String expr) { this.expr = expr; }
        public List<String> getDependsOn() { return dependsOn; }
        public void setDependsOn(List<String> dependsOn) { this.dependsOn = dependsOn; }
    }

    public static class SortSpec {
        private String field;
        private String direction; // ASC/DESC
        public String getField() { return field; }
        public void setField(String field) { this.field = field; }
        public String getDirection() { return direction; }
        public void setDirection(String direction) { this.direction = direction; }
    }
}
