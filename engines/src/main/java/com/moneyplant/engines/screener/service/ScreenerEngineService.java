package com.moneyplant.engines.screener.service;

import com.moneyplant.engines.screener.dto.ScreenerSpec;

import java.util.List;
import java.util.Map;

public interface ScreenerEngineService {
    List<Map<String, Object>> run(ScreenerSpec spec) throws Exception;
}
