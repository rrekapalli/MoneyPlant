package com.moneyplant.transactionservice.mappers;

import com.moneyplant.transactionservice.dtos.CreateTransactionDTO;
import com.moneyplant.transactionservice.dtos.TransactionDTO;
import com.moneyplant.transactionservice.entities.Transaction;
import com.moneyplant.transactionservice.entities.TransactionStatus;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import java.util.List;

/**
 * Mapper interface for converting between Transaction entity and DTOs.
 * Uses MapStruct for automatic implementation.
 */
@Mapper(componentModel = "spring")
public interface TransactionMapper {

    TransactionMapper INSTANCE = Mappers.getMapper(TransactionMapper.class);

    /**
     * Convert a Transaction entity to a TransactionDTO.
     *
     * @param transaction the Transaction entity
     * @return the TransactionDTO
     */
    TransactionDTO toDto(Transaction transaction);

    /**
     * Convert a list of Transaction entities to a list of TransactionDTOs.
     *
     * @param transactions the list of Transaction entities
     * @return the list of TransactionDTOs
     */
    List<TransactionDTO> toDtoList(List<Transaction> transactions);

    /**
     * Convert a CreateTransactionDTO to a Transaction entity.
     * Sets the status to PENDING by default.
     *
     * @param createTransactionDTO the CreateTransactionDTO
     * @return the Transaction entity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdOn", ignore = true)
    @Mapping(target = "modifiedBy", ignore = true)
    @Mapping(target = "modifiedOn", ignore = true)
    Transaction toEntity(CreateTransactionDTO createTransactionDTO);

    /**
     * Default implementation for toEntity that sets the status and totalValue fields.
     *
     * @param createTransactionDTO the CreateTransactionDTO
     * @return the Transaction entity
     */
    default Transaction toEntityWithDefaults(CreateTransactionDTO createTransactionDTO) {
        Transaction transaction = toEntity(createTransactionDTO);
        transaction.setStatus(TransactionStatus.PENDING);
        if (createTransactionDTO.getQuantity() != null && createTransactionDTO.getPricePerShare() != null) {
            transaction.setTotalValue(createTransactionDTO.getPricePerShare().multiply(java.math.BigDecimal.valueOf(createTransactionDTO.getQuantity())));
        }
        return transaction;
    }

    /**
     * Update a Transaction entity from a CreateTransactionDTO.
     *
     * @param createTransactionDTO the CreateTransactionDTO
     * @param transaction the Transaction entity to update
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdOn", ignore = true)
    @Mapping(target = "modifiedBy", ignore = true)
    @Mapping(target = "modifiedOn", ignore = true)
    void updateEntityFromDto(CreateTransactionDTO createTransactionDTO, @MappingTarget Transaction transaction);

    /**
     * Default implementation for updateEntityFromDto that sets the totalValue field.
     *
     * @param createTransactionDTO the CreateTransactionDTO
     * @param transaction the Transaction entity to update
     */
    default void updateEntityFromDtoWithDefaults(CreateTransactionDTO createTransactionDTO, Transaction transaction) {
        updateEntityFromDto(createTransactionDTO, transaction);
        if (createTransactionDTO.getQuantity() != null && createTransactionDTO.getPricePerShare() != null) {
            transaction.setTotalValue(createTransactionDTO.getPricePerShare().multiply(java.math.BigDecimal.valueOf(createTransactionDTO.getQuantity())));
        }
    }

}
