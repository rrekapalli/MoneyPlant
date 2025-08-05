package com.moneyplant.core.repository;

import com.moneyplant.core.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @Query("SELECT u FROM User u WHERE u.email = :email AND u.provider = :provider")
    Optional<User> findByEmailAndProvider(@Param("email") String email, @Param("provider") User.AuthProvider provider);

    @Query("SELECT u FROM User u WHERE u.providerUserId = :providerUserId AND u.provider = :provider")
    Optional<User> findByProviderUserIdAndProvider(@Param("providerUserId") String providerUserId, @Param("provider") User.AuthProvider provider);

    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmail(@Param("email") String email);

    boolean existsByEmailAndProvider(String email, User.AuthProvider provider);

    boolean existsByProviderUserIdAndProvider(String providerUserId, User.AuthProvider provider);
} 