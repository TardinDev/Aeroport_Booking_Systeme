package com.skybooker.service;

import com.skybooker.dto.request.TaxiRequest;
import com.skybooker.entity.Booking;
import com.skybooker.entity.TaxiReservation;
import com.skybooker.enums.TaxiStatus;
import com.skybooker.exception.ResourceNotFoundException;
import com.skybooker.repository.BookingRepository;
import com.skybooker.repository.TaxiReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaxiService {

    private final TaxiReservationRepository taxiReservationRepository;
    private final BookingRepository bookingRepository;

    @Transactional
    public TaxiReservation bookTaxi(TaxiRequest request) {
        Booking booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", request.bookingId()));

        TaxiReservation reservation = TaxiReservation.builder()
                .booking(booking)
                .pickupAddress(request.pickupAddress())
                .pickupLat(request.pickupLat())
                .pickupLng(request.pickupLng())
                .pickupTime(request.pickupTime())
                .estimatedPrice(BigDecimal.valueOf(25.00)) // Placeholder estimation
                .estimatedDuration(30) // Placeholder in minutes
                .status(TaxiStatus.PENDING)
                .build();

        reservation = taxiReservationRepository.save(reservation);
        log.info("Taxi reservation created for booking: {}", booking.getBookingReference());
        return reservation;
    }

    @Transactional(readOnly = true)
    public List<TaxiReservation> getTaxiByBooking(UUID bookingId) {
        return taxiReservationRepository.findByBookingId(bookingId);
    }
}
