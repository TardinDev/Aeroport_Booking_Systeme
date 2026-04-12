package com.skybooker.mapper;

import com.skybooker.dto.response.FlightResponse;
import com.skybooker.entity.Flight;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface FlightMapper {

    @Mapping(source = "airline.name", target = "airlineName")
    @Mapping(source = "airline.code", target = "airlineCode")
    @Mapping(source = "airline.logoUrl", target = "airlineLogo")
    FlightResponse toResponse(Flight flight);

    List<FlightResponse> toResponseList(List<Flight> flights);
}
