package com.skybooker.mapper;

import com.skybooker.dto.response.AirportResponse;
import com.skybooker.entity.Airport;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AirportMapper {

    AirportResponse toResponse(Airport airport);
}
