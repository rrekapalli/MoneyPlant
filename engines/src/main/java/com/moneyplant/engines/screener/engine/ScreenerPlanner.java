package com.moneyplant.engines.screener.engine;

import com.moneyplant.engines.screener.dto.ScreenerSpec;

import java.util.List;
import java.util.Optional;

public class ScreenerPlanner {
    public enum PlanType { TRINO, SPARK }

    public PlanType decide(ScreenerSpec spec) {
        boolean hasWindow = spec.getWindow() != null;
        boolean hasCrossOps = Optional.ofNullable(spec.getFilters()).orElse(List.of()).stream()
                .anyMatch(f -> f.getOp() != null && (f.getOp().name().startsWith("CROSS_")));
        boolean hasUdf = Optional.ofNullable(spec.getCompute()).orElse(List.of())
                .stream().anyMatch(c -> c.getExpr() != null && c.getExpr().contains("_udf"));
        boolean simple = !hasWindow && !hasCrossOps && !hasUdf;
        return simple ? PlanType.TRINO : PlanType.SPARK;
    }
}
