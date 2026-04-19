package com.skybooker.mapper;

import com.skybooker.dto.response.BookingResponse;
import com.skybooker.dto.response.PassengerResponse;
import com.skybooker.entity.Booking;
import com.skybooker.entity.Passenger;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = FlightMapper.class)
public interface BookingMapper {

    BookingResponse toResponse(Booking booking);

    PassengerResponse toPassengerResponse(Passenger passenger);
}
