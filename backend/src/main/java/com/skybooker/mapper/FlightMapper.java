package com.skybooker.mapper;

import com.skybooker.dto.response.FlightResponse;
import com.skybooker.dto.response.SeatResponse;
import com.skybooker.entity.Flight;
import com.skybooker.entity.Seat;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.math.BigDecimal;

@Mapper(componentModel = "spring", uses = {AirlineMapper.class, AirportMapper.class})
public interface FlightMapper {

    FlightResponse toResponse(Flight flight);

    @Mapping(target = "label", expression = "java(seat.label())")
    @Mapping(target = "price", source = "seat", qualifiedByName = "seatPrice")
    SeatResponse toSeatResponse(Seat seat);

    @Named("seatPrice")
    default BigDecimal seatPrice(Seat seat) {
        if (seat == null || seat.getFlight() == null) {
            return BigDecimal.ZERO;
        }
        return seat.getFlight().getBasePrice().multiply(seat.getPriceMultiplier());
    }
}
