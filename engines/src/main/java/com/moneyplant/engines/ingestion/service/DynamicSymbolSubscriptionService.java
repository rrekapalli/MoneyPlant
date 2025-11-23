package com.moneyplant.engines.ingestion.service;

import com.moneyplant.engines.ingestion.model.UniverseChangeEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * Service for managing dynamic symbol subscriptions without requiring application restart.
 * Allows adding/removing symbols and publishes universe change events to Kafka.
 * 
 * Requirements: 7.4, 7.5, 7.7
 */
@Service
@Slf4j
public class DynamicSymbolSubscriptionService {
    
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final SymbolUniverseService universeService;
    
    // Active subscriptions: universe name -> set of symbols
    private final ConcurrentHashMap<String, Set<String>> activeSubscriptions = new ConcurrentHashMap<>();
    
    // Listeners for subscription changes
    private final Set<SubscriptionChangeListener> listeners = new CopyOnWriteArraySet<>();
    
    @Value("${kafka.topics.symbol-universe-updates:symbol-universe-updates}")
    private String universeUpdatesTopic;
    
    public DynamicSymbolSubscriptionService(
            KafkaTemplate<String, Object> kafkaTemplate,
            SymbolUniverseService universeService) {
        this.kafkaTemplate = kafkaTemplate;
        this.universeService = universeService;
        log.info("DynamicSymbolSubscriptionService initialized");
    }
    
    /**
     * Subscribe to a universe by name.
     * Adds all symbols from the universe to active subscriptions.
     * 
     * @param universeName the universe name
     * @return Mono containing the set of subscribed symbols
     * 
     * Requirements: 7.4, 7.5
     */
    public Mono<Set<String>> subscribeToUniverse(String universeName) {
        return universeService.getUniverse(universeName)
                .flatMap(universe -> {
                    Set<String> symbols = universe.getSymbols();
                    Set<String> currentSymbols = activeSubscriptions.computeIfAbsent(
                            universeName, k -> new CopyOnWriteArraySet<>());
                    
                    Set<String> newSymbols = new HashSet<>(symbols);
                    newSymbols.removeAll(currentSymbols);
                    
                    if (!newSymbols.isEmpty()) {
                        currentSymbols.addAll(newSymbols);
                        
                        log.info("Subscribed to universe '{}' with {} symbols ({} new)", 
                                universeName, symbols.size(), newSymbols.size());
                        
                        // Notify listeners
                        notifyListeners(universeName, newSymbols, Set.of());
                        
                        // Publish event to Kafka
                        return publishUniverseChangeEvent(
                                UniverseChangeEvent.builder()
                                        .universeName(universeName)
                                        .changeType(UniverseChangeEvent.ChangeType.UPDATED)
                                        .addedSymbols(newSymbols)
                                        .removedSymbols(Set.of())
                                        .totalSymbols(currentSymbols.size())
                                        .timestamp(Instant.now())
                                        .description("Subscribed to universe")
                                        .build()
                        ).thenReturn(symbols);
                    }
                    
                    return Mono.just(symbols);
                })
                .doOnError(error -> log.error("Failed to subscribe to universe '{}'", universeName, error));
    }
    
    /**
     * Unsubscribe from a universe.
     * Removes all symbols from the universe from active subscriptions.
     * 
     * @param universeName the universe name
     * @return Mono that completes when unsubscribed
     * 
     * Requirements: 7.4, 7.5
     */
    public Mono<Void> unsubscribeFromUniverse(String universeName) {
        return Mono.fromRunnable(() -> {
            Set<String> symbols = activeSubscriptions.remove(universeName);
            
            if (symbols != null && !symbols.isEmpty()) {
                log.info("Unsubscribed from universe '{}' with {} symbols", universeName, symbols.size());
                
                // Notify listeners
                notifyListeners(universeName, Set.of(), symbols);
                
                // Publish event to Kafka
                publishUniverseChangeEvent(
                        UniverseChangeEvent.builder()
                                .universeName(universeName)
                                .changeType(UniverseChangeEvent.ChangeType.DELETED)
                                .addedSymbols(Set.of())
                                .removedSymbols(symbols)
                                .totalSymbols(0)
                                .timestamp(Instant.now())
                                .description("Unsubscribed from universe")
                                .build()
                ).subscribe();
            }
        })
        .subscribeOn(Schedulers.boundedElastic())
        .then();
    }
    
    /**
     * Add specific symbols to subscriptions without restart.
     * 
     * @param universeName the universe name
     * @param symbols the symbols to add
     * @return Mono that completes when symbols are added
     * 
     * Requirements: 7.4, 7.5
     */
    public Mono<Void> addSymbols(String universeName, Set<String> symbols) {
        return Mono.fromRunnable(() -> {
            if (symbols == null || symbols.isEmpty()) {
                return;
            }
            
            Set<String> currentSymbols = activeSubscriptions.computeIfAbsent(
                    universeName, k -> new CopyOnWriteArraySet<>());
            
            Set<String> newSymbols = new HashSet<>(symbols);
            newSymbols.removeAll(currentSymbols);
            
            if (!newSymbols.isEmpty()) {
                currentSymbols.addAll(newSymbols);
                
                log.info("Added {} symbols to universe '{}'", newSymbols.size(), universeName);
                
                // Notify listeners
                notifyListeners(universeName, newSymbols, Set.of());
                
                // Publish event to Kafka
                publishUniverseChangeEvent(
                        UniverseChangeEvent.builder()
                                .universeName(universeName)
                                .changeType(UniverseChangeEvent.ChangeType.UPDATED)
                                .addedSymbols(newSymbols)
                                .removedSymbols(Set.of())
                                .totalSymbols(currentSymbols.size())
                                .timestamp(Instant.now())
                                .description("Added symbols to universe")
                                .build()
                ).subscribe();
            }
        })
        .subscribeOn(Schedulers.boundedElastic())
        .then();
    }
    
    /**
     * Remove specific symbols from subscriptions without restart.
     * 
     * @param universeName the universe name
     * @param symbols the symbols to remove
     * @return Mono that completes when symbols are removed
     * 
     * Requirements: 7.4, 7.5
     */
    public Mono<Void> removeSymbols(String universeName, Set<String> symbols) {
        return Mono.fromRunnable(() -> {
            if (symbols == null || symbols.isEmpty()) {
                return;
            }
            
            Set<String> currentSymbols = activeSubscriptions.get(universeName);
            
            if (currentSymbols != null) {
                Set<String> removedSymbols = new HashSet<>(symbols);
                removedSymbols.retainAll(currentSymbols);
                
                if (!removedSymbols.isEmpty()) {
                    currentSymbols.removeAll(removedSymbols);
                    
                    log.info("Removed {} symbols from universe '{}'", removedSymbols.size(), universeName);
                    
                    // Notify listeners
                    notifyListeners(universeName, Set.of(), removedSymbols);
                    
                    // Publish event to Kafka
                    publishUniverseChangeEvent(
                            UniverseChangeEvent.builder()
                                    .universeName(universeName)
                                    .changeType(UniverseChangeEvent.ChangeType.UPDATED)
                                    .addedSymbols(Set.of())
                                    .removedSymbols(removedSymbols)
                                    .totalSymbols(currentSymbols.size())
                                    .timestamp(Instant.now())
                                    .description("Removed symbols from universe")
                                    .build()
                    ).subscribe();
                }
            }
        })
        .subscribeOn(Schedulers.boundedElastic())
        .then();
    }
    
    /**
     * Refresh a universe subscription by fetching latest symbols from the universe service.
     * Detects added and removed symbols and updates subscriptions accordingly.
     * 
     * @param universeName the universe name
     * @return Mono that completes when universe is refreshed
     * 
     * Requirements: 7.4, 7.5
     */
    public Mono<Void> refreshUniverse(String universeName) {
        return universeService.getUniverse(universeName)
                .flatMap(universe -> {
                    Set<String> newSymbols = universe.getSymbols();
                    Set<String> currentSymbols = activeSubscriptions.get(universeName);
                    
                    if (currentSymbols == null) {
                        // Not currently subscribed, just subscribe
                        return subscribeToUniverse(universeName).then();
                    }
                    
                    // Calculate differences
                    Set<String> added = new HashSet<>(newSymbols);
                    added.removeAll(currentSymbols);
                    
                    Set<String> removed = new HashSet<>(currentSymbols);
                    removed.removeAll(newSymbols);
                    
                    if (!added.isEmpty() || !removed.isEmpty()) {
                        // Update subscriptions
                        currentSymbols.clear();
                        currentSymbols.addAll(newSymbols);
                        
                        log.info("Refreshed universe '{}': {} added, {} removed, {} total",
                                universeName, added.size(), removed.size(), newSymbols.size());
                        
                        // Notify listeners
                        notifyListeners(universeName, added, removed);
                        
                        // Publish event to Kafka
                        return publishUniverseChangeEvent(
                                UniverseChangeEvent.builder()
                                        .universeName(universeName)
                                        .changeType(UniverseChangeEvent.ChangeType.REFRESHED)
                                        .addedSymbols(added)
                                        .removedSymbols(removed)
                                        .totalSymbols(newSymbols.size())
                                        .timestamp(Instant.now())
                                        .description("Refreshed universe from source")
                                        .build()
                        );
                    }
                    
                    return Mono.empty();
                })
                .then()
                .doOnError(error -> log.error("Failed to refresh universe '{}'", universeName, error));
    }
    
    /**
     * Get all currently subscribed symbols across all universes.
     * 
     * @return Flux of unique symbols
     */
    public Flux<String> getAllSubscribedSymbols() {
        return Flux.fromIterable(activeSubscriptions.values())
                .flatMapIterable(symbols -> symbols)
                .distinct();
    }
    
    /**
     * Get subscribed symbols for a specific universe.
     * 
     * @param universeName the universe name
     * @return Mono containing the set of subscribed symbols
     */
    public Mono<Set<String>> getSubscribedSymbols(String universeName) {
        return Mono.fromCallable(() -> {
            Set<String> symbols = activeSubscriptions.get(universeName);
            return symbols != null ? new HashSet<>(symbols) : Set.<String>of();
        });
    }
    
    /**
     * Get all active universe subscriptions.
     * 
     * @return Flux of universe names
     */
    public Flux<String> getActiveUniverses() {
        return Flux.fromIterable(activeSubscriptions.keySet());
    }
    
    /**
     * Check if a universe is currently subscribed.
     * 
     * @param universeName the universe name
     * @return Mono containing true if subscribed
     */
    public Mono<Boolean> isSubscribed(String universeName) {
        return Mono.just(activeSubscriptions.containsKey(universeName));
    }
    
    /**
     * Publish universe change event to Kafka.
     * 
     * @param event the change event
     * @return Mono that completes when event is published
     * 
     * Requirements: 7.7
     */
    private Mono<Void> publishUniverseChangeEvent(UniverseChangeEvent event) {
        return Mono.fromRunnable(() -> {
            try {
                kafkaTemplate.send(universeUpdatesTopic, event.getUniverseName(), event);
                log.debug("Published universe change event for '{}' to topic '{}'",
                        event.getUniverseName(), universeUpdatesTopic);
            } catch (Exception e) {
                log.error("Failed to publish universe change event for '{}'",
                        event.getUniverseName(), e);
            }
        })
        .subscribeOn(Schedulers.boundedElastic())
        .then();
    }
    
    /**
     * Register a listener for subscription changes.
     * 
     * @param listener the listener to register
     */
    public void addListener(SubscriptionChangeListener listener) {
        listeners.add(listener);
        log.debug("Registered subscription change listener: {}", listener.getClass().getSimpleName());
    }
    
    /**
     * Unregister a listener.
     * 
     * @param listener the listener to unregister
     */
    public void removeListener(SubscriptionChangeListener listener) {
        listeners.remove(listener);
        log.debug("Unregistered subscription change listener: {}", listener.getClass().getSimpleName());
    }
    
    /**
     * Notify all listeners of subscription changes.
     */
    private void notifyListeners(String universeName, Set<String> added, Set<String> removed) {
        for (SubscriptionChangeListener listener : listeners) {
            try {
                listener.onSubscriptionChange(universeName, added, removed);
            } catch (Exception e) {
                log.error("Error notifying listener {}", listener.getClass().getSimpleName(), e);
            }
        }
    }
    
    /**
     * Interface for listening to subscription changes.
     */
    public interface SubscriptionChangeListener {
        /**
         * Called when symbols are added or removed from a universe subscription.
         * 
         * @param universeName the universe name
         * @param addedSymbols symbols that were added
         * @param removedSymbols symbols that were removed
         */
        void onSubscriptionChange(String universeName, Set<String> addedSymbols, Set<String> removedSymbols);
    }
    
    /**
     * Get subscription statistics.
     * 
     * @return Mono containing subscription stats
     */
    public Mono<SubscriptionStats> getStats() {
        return Mono.fromCallable(() -> {
            int totalUniverses = activeSubscriptions.size();
            long totalSymbols = activeSubscriptions.values().stream()
                    .flatMap(Set::stream)
                    .distinct()
                    .count();
            
            return new SubscriptionStats(totalUniverses, (int) totalSymbols);
        });
    }
    
    /**
     * Record class for subscription statistics.
     */
    public record SubscriptionStats(int totalUniverses, int totalUniqueSymbols) {}
}
