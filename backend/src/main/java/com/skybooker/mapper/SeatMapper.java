package com.skybooker.mapper;

import com.skybooker.dto.response.SeatResponse;
import com.skybooker.entity.Seat;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SeatMapper {

    @Mapping(source = "seatColumn", target = "column")
    @Mapping(source = "window", target = "isWindow")
    @Mapping(source = "aisle", target = "isAisle")
    @Mapping(source = "exit", target = "isExit")
    SeatResponse toResponse(Seat seat);

    List<SeatResponse> toResponseList(List<Seat> seats);
}
