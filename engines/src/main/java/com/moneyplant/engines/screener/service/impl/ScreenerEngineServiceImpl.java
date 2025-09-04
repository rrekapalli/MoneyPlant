package com.moneyplant.engines.screener.service.impl;

import com.moneyplant.engines.screener.datasource.TrinoDataSource;
import com.moneyplant.engines.screener.dto.ScreenerSpec;
import com.moneyplant.engines.screener.engine.*;
import com.moneyplant.engines.screener.service.ScreenerEngineService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ScreenerEngineServiceImpl implements ScreenerEngineService {

    private final ScreenerPlanner planner;
    private final TrinoExecutor trinoExecutor;
    private final SparkExecutor sparkExecutor;

    public ScreenerEngineServiceImpl(
            @Value("${spring.datasource-trino.jdbc-url:jdbc:trino://trino:8080?catalog=MoneyPlant&schema=public}") String trinoUrl,
            @Value("${spring.datasource-trino.username:engines}") String trinoUser
    ) {
        this.planner = new ScreenerPlanner();
        TrinoDataSource trinoDs = new TrinoDataSource(trinoUrl, trinoUser);
        this.trinoExecutor = new TrinoExecutor(trinoDs);
        this.sparkExecutor = new SparkExecutor();
    }

    @Override
    public List<Map<String, Object>> run(ScreenerSpec spec) throws Exception {
        ScreenerPlanner.PlanType plan = planner.decide(spec);
        if (plan == ScreenerPlanner.PlanType.TRINO) {
            return trinoExecutor.execute(spec);
        } else {
            return sparkExecutor.execute(spec);
        }
    }
}
