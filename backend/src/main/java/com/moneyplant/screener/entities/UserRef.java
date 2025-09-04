package com.moneyplant.screener.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Minimal reference entity for User.
 * Used for foreign key references in screener entities.
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRef {

    @Id
    @Column(name = "id")
    private Long userId;
}
