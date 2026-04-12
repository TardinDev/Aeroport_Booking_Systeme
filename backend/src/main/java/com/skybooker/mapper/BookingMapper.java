package com.skybooker.mapper;

import com.skybooker.dto.response.BookingResponse;
import com.skybooker.entity.Booking;
import com.skybooker.entity.Passenger;
import com.skybooker.entity.Seat;
import com.skybooker.dto.response.SeatResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", uses = {FlightMapper.class, SeatMapper.class}, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BookingMapper {

    @Mapping(source = "flight", target = "flight")
    @Mapping(target = "paymentStatus", ignore = true)
    BookingResponse toResponse(Booking booking);

    @Mapping(source = "seat", target = "seat")
    BookingResponse.PassengerResponse toPassengerResponse(Passenger passenger);

    List<BookingResponse> toResponseList(List<Booking> bookings);
}
