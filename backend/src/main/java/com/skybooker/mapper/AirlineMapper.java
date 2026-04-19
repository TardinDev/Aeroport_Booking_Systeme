package com.skybooker.mapper;

import com.skybooker.dto.response.AirlineResponse;
import com.skybooker.entity.Airline;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AirlineMapper {

    AirlineResponse toResponse(Airline airline);
}
