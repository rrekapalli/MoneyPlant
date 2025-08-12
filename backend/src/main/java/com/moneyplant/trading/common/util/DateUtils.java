package com.moneyplant.trading.common.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateUtils {
    
    private static final DateTimeFormatter DEFAULT_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    public static String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DEFAULT_FORMATTER) : null;
    }
    
    public static LocalDateTime parseDateTime(String dateTimeString) {
        return dateTimeString != null ? LocalDateTime.parse(dateTimeString, DEFAULT_FORMATTER) : null;
    }
    
    public static boolean isWithinTimeRange(LocalDateTime dateTime, LocalDateTime start, LocalDateTime end) {
        return dateTime != null && start != null && end != null && 
               !dateTime.isBefore(start) && !dateTime.isAfter(end);
    }
}
