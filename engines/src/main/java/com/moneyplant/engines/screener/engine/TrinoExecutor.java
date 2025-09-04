package com.moneyplant.engines.screener.engine;

import com.moneyplant.engines.screener.datasource.TrinoDataSource;
import com.moneyplant.engines.screener.dto.ScreenerFilterCondition;
import com.moneyplant.engines.screener.dto.ScreenerSpec;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.*;

public class TrinoExecutor implements ScreenerExecutor {
    private final DataSource dataSource;

    public TrinoExecutor(TrinoDataSource trinoDataSource) {
        this.dataSource = trinoDataSource.getDataSource();
    }

    @Override
    public List<Map<String, Object>> execute(ScreenerSpec spec) throws Exception {
        // Minimal SQL generation for latest snapshot from materialized views
        String select = Optional.ofNullable(spec.getSelect()).filter(s -> !s.isEmpty())
                .map(s -> String.join(", ", s)).orElse("em.symbol, em.company_name, em.sector");
        StringBuilder sql = new StringBuilder();
        sql.append("WITH li AS (SELECT * FROM postgres.public.latest_indicators_mv), ")
           .append("lh AS (SELECT * FROM postgres.public.latest_ohlcv_mv) ")
           .append("SELECT ").append(select).append(" FROM postgres.public.nse_eq_master em ")
           .append("LEFT JOIN li ON li.symbol = em.symbol ")
           .append("LEFT JOIN lh ON lh.symbol = em.symbol ");

        List<Object> params = new ArrayList<>();
        List<String> whereClauses = new ArrayList<>();

        if (spec.getSectors() != null && !spec.getSectors().isEmpty()) {
            whereClauses.add("em.sector IN (" + String.join(",", Collections.nCopies(spec.getSectors().size(), "?")) + ")");
            params.addAll(spec.getSectors());
        }

        if (spec.getFilters() != null) {
            for (ScreenerFilterCondition f : spec.getFilters()) {
                String col = resolveColumn(f);
                switch (f.getOp()) {
                    case GT: whereClauses.add(col + " > ?"); params.add(firstValue(f)); break;
                    case GTE: whereClauses.add(col + " >= ?"); params.add(firstValue(f)); break;
                    case LT: whereClauses.add(col + " < ?"); params.add(firstValue(f)); break;
                    case LTE: whereClauses.add(col + " <= ?"); params.add(firstValue(f)); break;
                    case EQ: whereClauses.add(col + " = ?"); params.add(firstValue(f)); break;
                    case NEQ: whereClauses.add(col + " <> ?"); params.add(firstValue(f)); break;
                    case BETWEEN:
                        whereClauses.add(col + " BETWEEN ? AND ?");
                        params.add(f.getValues().get(0)); params.add(f.getValues().get(1));
                        break;
                    case IN:
                        whereClauses.add(col + " IN (" + String.join(",", Collections.nCopies(f.getValues().size(), "?")) + ")");
                        params.addAll(f.getValues());
                        break;
                    case NOT_IN:
                        whereClauses.add(col + " NOT IN (" + String.join(",", Collections.nCopies(f.getValues().size(), "?")) + ")");
                        params.addAll(f.getValues());
                        break;
                    case IS_NULL: whereClauses.add(col + " IS NULL"); break;
                    case IS_NOT_NULL: whereClauses.add(col + " IS NOT NULL"); break;
                    default:
                        throw new IllegalArgumentException("Unsupported operator for Trino path: " + f.getOp());
                }
            }
        }

        if (!whereClauses.isEmpty()) {
            sql.append(" WHERE ").append(String.join(" " + (spec.getLogic() == null ? "AND" : spec.getLogic()) + " ", whereClauses));
        }

        if (spec.getSort() != null && !spec.getSort().isEmpty()) {
            ScreenerSpec.SortSpec s = spec.getSort().get(0);
            sql.append(" ORDER BY ").append(resolveColumn(s.getField())).append(" ").append(s.getDirection() == null ? "ASC" : s.getDirection());
        }
        int page = spec.getPage() == null ? 0 : spec.getPage();
        int size = spec.getSize() == null ? 50 : spec.getSize();
        sql.append(" OFFSET ? LIMIT ?");
        params.add(page * size);
        params.add(size);

        try (Connection c = dataSource.getConnection();
             PreparedStatement ps = c.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }
            try (ResultSet rs = ps.executeQuery()) {
                List<Map<String, Object>> out = new ArrayList<>();
                int cc = rs.getMetaData().getColumnCount();
                while (rs.next()) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    for (int i = 1; i <= cc; i++) {
                        row.put(rs.getMetaData().getColumnLabel(i), rs.getObject(i));
                    }
                    out.add(row);
                }
                return out;
            }
        }
    }

    private Object firstValue(ScreenerFilterCondition f) {
        return f.getValues() == null || f.getValues().isEmpty() ? null : f.getValues().get(0);
    }

    private String resolveColumn(ScreenerFilterCondition f) {
        return resolveColumn(f.getField());
    }

    private String resolveColumn(String field) {
        if (field == null) return null;
        String f = field.trim();
        // If already qualified (contains a dot), trust it
        if (f.contains(".")) return f;
        // Master fields
        java.util.Set<String> master = java.util.Set.of("symbol","company_name","sector","industry");
        if (master.contains(f)) return "em." + f;
        // OHLCV fields
        java.util.Set<String> ohlcv = java.util.Set.of("date","open","high","low","close","volume");
        if (ohlcv.contains(f)) return "lh." + f;
        // Default to indicators
        return "li." + f;
    }
}
