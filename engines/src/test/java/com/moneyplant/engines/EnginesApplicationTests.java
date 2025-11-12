package com.moneyplant.engines;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.apache.spark.sql.SparkSession;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.beans.factory.annotation.Qualifier;

/**
 * Basic test class for MoneyPlant Engines application
 */
@SpringBootTest(properties = {
    "spring.kafka.enabled=false",
    "ingestion.auto-start.enabled=false",
    "nse.websocket.enabled=false",
    "nse.auto-start.enabled=false"
})
@ActiveProfiles("test")
class EnginesApplicationTests {

    @MockBean
    private SparkSession sparkSession;

    @MockBean
    @Qualifier("avroKafkaTemplate")
    private KafkaTemplate<String, Object> avroKafkaTemplate;

    @MockBean
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Test
    void contextLoads() {
        // This test verifies that the Spring context loads successfully
    }
}
