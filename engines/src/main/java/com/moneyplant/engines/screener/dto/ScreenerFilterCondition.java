package com.moneyplant.engines.screener.dto;

import java.util.List;

public class ScreenerFilterCondition {
    public enum Op { GT, GTE, LT, LTE, EQ, NEQ, BETWEEN, IN, NOT_IN, IS_NULL, IS_NOT_NULL, CROSS_ABOVE, CROSS_BELOW }
    private String field;
    private String source; // indicator | ohlcv | master | sectorIndex
    private Op op;
    private List<String> values; // keep as strings; parsing happens downstream

    public String getField() { return field; }
    public void setField(String field) { this.field = field; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public Op getOp() { return op; }
    public void setOp(Op op) { this.op = op; }
    public List<String> getValues() { return values; }
    public void setValues(List<String> values) { this.values = values; }
}
