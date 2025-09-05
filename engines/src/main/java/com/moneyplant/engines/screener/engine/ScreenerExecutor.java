package com.moneyplant.engines.screener.engine;

import com.moneyplant.engines.screener.dto.ScreenerSpec;
import java.util.List;
import java.util.Map;

public interface ScreenerExecutor {
    List<Map<String, Object>> execute(ScreenerSpec spec) throws Exception;
}
