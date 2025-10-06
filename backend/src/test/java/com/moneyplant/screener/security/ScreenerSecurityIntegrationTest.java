package com.moneyplant.screener.security;

import com.moneyplant.screener.services.CriteriaAuditService;
import com.moneyplant.screener.services.CurrentUserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockFilterChain;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Integration tests for screener security infrastructure.
 * Verifies that security components work together correctly.
 */
@ExtendWith(MockitoExtension.class)
class ScreenerSecurityIntegrationTest {

    @Mock
    private CriteriaAuditService auditService;

    @Mock
    private CurrentUserService currentUserService;

    @Test
    void testSecurityHeadersFilter() throws Exception {
        // Given
        ScreenerSecurityHeadersFilter filter = new ScreenerSecurityHeadersFilter();
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/screeners/fields");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        // When
        filter.doFilter(request, response, filterChain);

        // Then
        assertEquals("nosniff", response.getHeader("X-Content-Type-Options"));
        assertEquals("DENY", response.getHeader("X-Frame-Options"));
        assertEquals("1; mode=block", response.getHeader("X-XSS-Protection"));
        assertEquals("no-cache, no-store, must-revalidate", response.getHeader("Cache-Control"));
        assertEquals("true", response.getHeader("X-Screener-API"));
    }

    @Test
    void testSecurityHeadersFilterSkipsNonScreenerPaths() throws Exception {
        // Given
        ScreenerSecurityHeadersFilter filter = new ScreenerSecurityHeadersFilter();
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/other/endpoint");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        // When
        filter.doFilter(request, response, filterChain);

        // Then
        assertNull(response.getHeader("X-Screener-API"));
    }

    @Test
    void testRateLimitingFilterWithNoUser() throws Exception {
        // Given
        ScreenerRateLimitingFilter filter = new ScreenerRateLimitingFilter(auditService, currentUserService);
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        when(currentUserService.getCurrentUserId()).thenReturn(null);

        // When
        filter.doFilter(request, response, filterChain);

        // Then
        assertEquals(200, response.getStatus()); // Should pass through without rate limiting
        verify(auditService, never()).logSecurityEvent(anyString(), anyString());
    }

    @Test
    void testRateLimitingFilterWithUser() throws Exception {
        // Given
        ScreenerRateLimitingFilter filter = new ScreenerRateLimitingFilter(auditService, currentUserService);
        filter.setEnabled(true);
        filter.setMaxRequestsPerMinute(100);
        
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        when(currentUserService.getCurrentUserId()).thenReturn(123L);

        // When
        filter.doFilter(request, response, filterChain);

        // Then
        assertEquals(200, response.getStatus()); // Should pass through for first request
        assertNotNull(response.getHeader("X-RateLimit-Limit-Minute"));
        assertEquals("100", response.getHeader("X-RateLimit-Limit-Minute"));
    }

    @Test
    void testAuditServiceConfiguration() {
        // Given
        CriteriaAuditService auditService = new CriteriaAuditService(currentUserService);
        
        // When
        auditService.setEnabled(true);
        auditService.setLogValidationEvents(true);
        auditService.setLogSecurityEvents(true);

        // Then
        assertTrue(auditService.isEnabled());
        assertTrue(auditService.isLogValidationEvents());
        assertTrue(auditService.isLogSecurityEvents());
    }

    @Test
    void testAuditServiceDisabled() {
        // Given
        CriteriaAuditService auditService = new CriteriaAuditService(currentUserService);
        auditService.setEnabled(false);

        // When - should not log when disabled
        auditService.logValidationEvent("hash123", true, 0, 0);
        auditService.logSecurityEvent("TEST_EVENT", "Test details");

        // Then - verify no exceptions thrown and service handles disabled state gracefully
        assertFalse(auditService.isEnabled());
    }
}