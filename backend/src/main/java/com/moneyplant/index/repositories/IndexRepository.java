package com.moneyplant.index.repositories;

import com.moneyplant.core.entities.Index;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IndexRepository extends JpaRepository<Index, Integer> {
    Optional<Index> findByIndexSymbolIgnoreCase(String indexSymbol);
    Optional<Index> findByIndexNameIgnoreCase(String indexName);
    Optional<Index> findByKeyCategoryIgnoreCase(String keyCategory);
}