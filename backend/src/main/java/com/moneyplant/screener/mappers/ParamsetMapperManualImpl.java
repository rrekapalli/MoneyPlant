package com.moneyplant.screener.mappers;

import com.moneyplant.screener.dtos.ParamsetCreateReq;
import com.moneyplant.screener.dtos.ParamsetResp;
import com.moneyplant.screener.entities.ScreenerParamset;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

/**
 * Hand-written fallback implementation of ParamsetMapper to avoid runtime
 * dependency on MapStruct code generation. Marked @Primary to prefer this
 * bean if a MapStruct-generated Spring bean also exists.
 */
@Component
@Primary
public class ParamsetMapperManualImpl implements ParamsetMapper {

    @Override
    public ScreenerParamset toEntity(ParamsetCreateReq request) {
        if (request == null) return null;
        ScreenerParamset entity = new ScreenerParamset();
        entity.setName(request.getName());
        entity.setParamsJson(request.getParamsJson());
        // screenerVersion, createdByUserId, runs, paramsetId are handled elsewhere
        return entity;
    }

    @Override
    public ParamsetResp toResponse(ScreenerParamset entity) {
        if (entity == null) return null;
        ParamsetResp resp = new ParamsetResp();
        resp.setParamsetId(entity.getParamsetId());
        resp.setScreenerVersionId(entity.getScreenerVersion() != null ? entity.getScreenerVersion().getScreenerVersionId() : null);
        resp.setName(entity.getName());
        resp.setParamsJson(entity.getParamsJson());
        resp.setCreatedByUserId(entity.getCreatedByUserId());
        resp.setCreatedAt(entity.getCreatedAt());
        return resp;
    }

    @Override
    public void updateEntity(ParamsetCreateReq request, ScreenerParamset entity) {
        if (request == null || entity == null) return;
        if (request.getName() != null) {
            entity.setName(request.getName());
        }
        if (request.getParamsJson() != null) {
            entity.setParamsJson(request.getParamsJson());
        }
    }
}
