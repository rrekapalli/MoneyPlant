package com.moneyplant.moneyplantcore.security;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;

/**
 * Aspect for logging security events.
 * This aspect logs authentication attempts, access to sensitive endpoints, and security exceptions.
 */
@Aspect
@Component
public class AuditLoggingAspect {

    private static final Logger securityLogger = LoggerFactory.getLogger("SECURITY_AUDIT");
    private static final DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;

    @Value("${audit.logging.enabled:true}")
    private boolean auditLoggingEnabled;

    /**
     * Logs authentication attempts.
     */
    @Before("execution(* org.springframework.security.authentication.AuthenticationManager.authenticate(..))")
    public void logAuthenticationAttempt(JoinPoint joinPoint) {
        if (!auditLoggingEnabled) return;
        
        Object[] args = joinPoint.getArgs();
        if (args.length > 0 && args[0] != null) {
            String username = args[0].toString();
            if (username.contains("username=")) {
                username = username.substring(username.indexOf("username=") + 9);
                username = username.substring(0, username.indexOf(","));
            }
            
            logSecurityEvent("AUTHENTICATION_ATTEMPT", 
                    "Authentication attempt for user: " + username, 
                    getClientIp(), 
                    "ANONYMOUS");
        }
    }

    /**
     * Logs successful authentication.
     */
    @AfterReturning(
            pointcut = "execution(* org.springframework.security.authentication.AuthenticationManager.authenticate(..))",
            returning = "authentication")
    public void logSuccessfulAuthentication(JoinPoint joinPoint, Authentication authentication) {
        if (!auditLoggingEnabled) return;
        
        if (authentication != null && authentication.isAuthenticated()) {
            logSecurityEvent("AUTHENTICATION_SUCCESS", 
                    "User successfully authenticated: " + authentication.getName(), 
                    getClientIp(), 
                    authentication.getName());
        }
    }

    /**
     * Logs authentication failures.
     */
    @AfterThrowing(
            pointcut = "execution(* org.springframework.security.authentication.AuthenticationManager.authenticate(..))",
            throwing = "ex")
    public void logAuthenticationFailure(JoinPoint joinPoint, Exception ex) {
        if (!auditLoggingEnabled) return;
        
        Object[] args = joinPoint.getArgs();
        String username = "unknown";
        if (args.length > 0 && args[0] != null) {
            username = args[0].toString();
            if (username.contains("username=")) {
                username = username.substring(username.indexOf("username=") + 9);
                username = username.substring(0, username.indexOf(","));
            }
        }
        
        logSecurityEvent("AUTHENTICATION_FAILURE", 
                "Authentication failed for user: " + username + ", reason: " + ex.getMessage(), 
                getClientIp(), 
                "ANONYMOUS");
    }

    /**
     * Logs access to sensitive endpoints.
     */
    @Before("@annotation(org.springframework.security.access.prepost.PreAuthorize) || " +
            "@annotation(org.springframework.security.access.annotation.Secured)")
    public void logSensitiveEndpointAccess(JoinPoint joinPoint) {
        if (!auditLoggingEnabled) return;
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication != null ? authentication.getName() : "ANONYMOUS";
        
        logSecurityEvent("SENSITIVE_ENDPOINT_ACCESS", 
                "Access to sensitive endpoint: " + joinPoint.getSignature().toShortString() + 
                ", with args: " + Arrays.toString(joinPoint.getArgs()), 
                getClientIp(), 
                username);
    }

    /**
     * Logs security exceptions.
     */
    @AfterThrowing(
            pointcut = "execution(* com.moneyplant..*.*(..)) && !execution(* com.moneyplant.moneyplantcore.security.AuditLoggingAspect.*(..))",
            throwing = "ex")
    public void logSecurityException(JoinPoint joinPoint, Exception ex) {
        if (!auditLoggingEnabled) return;
        
        if (ex.getClass().getName().contains("security") || 
            ex.getClass().getName().contains("access") || 
            ex.getClass().getName().contains("auth")) {
            
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication != null ? authentication.getName() : "ANONYMOUS";
            
            logSecurityEvent("SECURITY_EXCEPTION", 
                    "Security exception in " + joinPoint.getSignature().toShortString() + 
                    ": " + ex.getClass().getName() + " - " + ex.getMessage(), 
                    getClientIp(), 
                    username);
        }
    }

    /**
     * Logs a security event.
     */
    private void logSecurityEvent(String eventType, String message, String clientIp, String username) {
        String timestamp = LocalDateTime.now().format(formatter);
        securityLogger.info("[{}] [{}] [{}] [{}] {}", 
                timestamp, eventType, username, clientIp, message);
    }

    /**
     * Gets the client IP address from the request.
     */
    private String getClientIp() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String xForwardedFor = request.getHeader("X-Forwarded-For");
                if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                    return xForwardedFor.split(",")[0].trim();
                }
                return request.getRemoteAddr();
            }
        } catch (Exception e) {
            // Ignore
        }
        return "unknown";
    }
}