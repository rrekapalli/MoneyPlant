package com.moneyplant.engines.screener.engine;

import com.moneyplant.engines.screener.dto.ScreenerSpec;

import java.util.List;
import java.util.Map;

public class SparkExecutor implements ScreenerExecutor {
    @Override
    public List<Map<String, Object>> execute(ScreenerSpec spec) throws Exception {
        throw new UnsupportedOperationException("Spark path not yet implemented in this minimal version");
    }
}
