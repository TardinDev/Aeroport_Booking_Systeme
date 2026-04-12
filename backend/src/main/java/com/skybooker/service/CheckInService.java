package com.skybooker.service;

import com.skybooker.entity.BoardingPass;
import com.skybooker.entity.Booking;
import com.skybooker.entity.Passenger;
import com.skybooker.enums.BookingStatus;
import com.skybooker.exception.BadRequestException;
import com.skybooker.exception.ResourceNotFoundException;
import com.skybooker.repository.BoardingPassRepository;
import com.skybooker.repository.BookingRepository;
import com.skybooker.repository.PassengerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CheckInService {

    private final BookingRepository bookingRepository;
    private final PassengerRepository passengerRepository;
    private final BoardingPassRepository boardingPassRepository;

    @Transactional
    public List<BoardingPass> checkIn(UUID bookingId) {
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new BadRequestException("Only confirmed bookings can be checked in. Current status: " + booking.getStatus());
        }

        List<Passenger> passengers = passengerRepository.findByBookingId(bookingId);
        if (passengers.isEmpty()) {
            throw new BadRequestException("No passengers found for this booking");
        }

        List<BoardingPass> boardingPasses = new ArrayList<>();
        String[] gates = {"A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2"};
        String gate = gates[(int) (Math.random() * gates.length)];

        int groupCounter = 1;
        for (Passenger passenger : passengers) {
            // Check if boarding pass already exists
            if (boardingPassRepository.findByBookingIdAndPassengerId(bookingId, passenger.getId()).isPresent()) {
                continue;
            }

            String qrCodeData = generateQrCodeData(booking, passenger);

            BoardingPass boardingPass = BoardingPass.builder()
                    .booking(booking)
                    .passenger(passenger)
                    .qrCode(qrCodeData)
                    .gate(gate)
                    .boardingGroup("Group " + groupCounter++)
                    .build();

            boardingPasses.add(boardingPassRepository.save(boardingPass));
        }

        booking.setStatus(BookingStatus.COMPLETED);
        bookingRepository.save(booking);

        log.info("Check-in completed for booking: {}, {} boarding passes generated",
                booking.getBookingReference(), boardingPasses.size());

        return boardingPasses;
    }

    @Transactional(readOnly = true)
    public BoardingPass getBoardingPass(UUID bookingId, UUID passengerId) {
        return boardingPassRepository.findByBookingIdAndPassengerId(bookingId, passengerId)
                .orElseThrow(() -> new ResourceNotFoundException("BoardingPass", "bookingId/passengerId",
                        bookingId + "/" + passengerId));
    }

    private String generateQrCodeData(Booking booking, Passenger passenger) {
        return String.format("SKB|%s|%s|%s %s|%s|%s",
                booking.getBookingReference(),
                booking.getFlight().getFlightNumber(),
                passenger.getFirstName(),
                passenger.getLastName(),
                booking.getFlight().getOriginCode(),
                booking.getFlight().getDestinationCode()
        );
    }
}
