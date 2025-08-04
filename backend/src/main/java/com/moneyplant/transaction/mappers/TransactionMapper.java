package com.moneyplant.transaction.mappers;

import com.moneyplant.transaction.dtos.CreateTransactionDTO;
import com.moneyplant.transaction.dtos.TransactionDTO;
import com.moneyplant.transaction.entities.Transaction;
import com.moneyplant.transaction.entities.TransactionStatus;
import org.mapstruct.*;

import java.util.List;

/**
 * Mapper interface for converting between Transaction entities and DTOs.
 * This interface is implemented by MapStruct.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TransactionMapper {

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
    @Mapping(target = "status", constant = "PENDING")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "totalValue", ignore = true)
    @Mapping(target = "createdOn", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "modifiedOn", ignore = true)
    @Mapping(target = "modifiedBy", ignore = true)
    Transaction toEntity(CreateTransactionDTO createTransactionDTO);

    /**
     * Update a Transaction entity from a CreateTransactionDTO.
     *
     * @param createTransactionDTO the CreateTransactionDTO
     * @param transaction the Transaction entity to update
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "totalValue", ignore = true)
    @Mapping(target = "createdOn", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "modifiedOn", ignore = true)
    @Mapping(target = "modifiedBy", ignore = true)
    void updateEntityFromDto(CreateTransactionDTO createTransactionDTO, @MappingTarget Transaction transaction);
}
