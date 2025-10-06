package com.moneyplant.core.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Fixes out-of-sync PostgreSQL sequences for IDENTITY/serial primary keys that can
 * otherwise cause "duplicate key value violates unique constraint ... (id) already exists" errors
 * when Hibernate inserts rows without specifying the id column.
 *
 * This is a defensive runtime fix intended for environments where the database was
 * initialized manually or imported and the underlying sequence wasn't advanced to
 * the current MAX(id). It is safe to run repeatedly at startup.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseSequenceFixer {

    private final JdbcTemplate jdbcTemplate;

    // Allow disabling via property if needed
    @Value("${moneyplant.db.sequence-fix.enabled:true}")
    private boolean enabled;

    @PostConstruct
    public void fixSequences() {
        if (!enabled) {
            log.info("[DB] Sequence fixer is disabled");
            return;
        }
        try {
            // Fix only the affected table for now: public.portfolio_holdings(id)
            // Uses pg_get_serial_sequence to resolve the sequence name reliably.
            String sql = "SELECT setval(pg_get_serial_sequence('public.portfolio_holdings','id'), " +
                    "GREATEST(COALESCE((SELECT MAX(id) FROM public.portfolio_holdings), 0) + 1, 1), false)";
            Long next = jdbcTemplate.queryForObject(sql, Long.class);
            log.info("[DB] Synchronized sequence for public.portfolio_holdings. Next id set to {}", next);
        } catch (Exception ex) {
            log.warn("[DB] Failed to synchronize sequence for public.portfolio_holdings: {}", ex.getMessage());
        }
    }
}
