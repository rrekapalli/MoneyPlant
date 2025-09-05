package com.moneyplant.screener.mappers;

import com.moneyplant.screener.dtos.ResultDiffResp;
import com.moneyplant.screener.dtos.ResultResp;
import com.moneyplant.screener.entities.ScreenerResult;
import com.moneyplant.screener.entities.ScreenerResultDiff;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper for ScreenerResult and ScreenerResultDiff entities and DTOs.
 */
@Mapper(componentModel = "spring")
public interface ResultMapper {

    /**
     * Maps ScreenerResult entity to ResultResp.
     */
    @Mapping(source = "symbol", target = "symbolId")
    ResultResp toResponse(ScreenerResult entity);

    /**
     * Maps ScreenerResultDiff entity to ResultDiffResp.
     */
    @Mapping(source = "symbol", target = "symbolId")
    ResultDiffResp toDiffResponse(ScreenerResultDiff entity);
}
