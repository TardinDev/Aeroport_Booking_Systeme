package com.skybooker.service;

import com.skybooker.dto.request.BaggageRequest;
import com.skybooker.entity.BaggageDeclaration;
import com.skybooker.entity.Booking;
import com.skybooker.enums.BaggageType;
import com.skybooker.exception.ResourceNotFoundException;
import com.skybooker.repository.BaggageDeclarationRepository;
import com.skybooker.repository.BookingRepository;
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
public class BaggageService {

    private final BaggageDeclarationRepository baggageDeclarationRepository;
    private final BookingRepository bookingRepository;

    private static final double FREE_CABIN_WEIGHT = 10.0;
    private static final double FREE_CHECKED_WEIGHT = 23.0;
    private static final BigDecimal EXTRA_KG_RATE = BigDecimal.valueOf(12.00);
    private static final BigDecimal SPECIAL_BASE_RATE = BigDecimal.valueOf(50.00);

    @Transactional
    public BaggageDeclaration declareBaggage(BaggageRequest request) {
        Booking booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", request.bookingId()));

        BigDecimal extraCharge = calculateExtraCharge(request.type(), request.weight());

        BaggageDeclaration declaration = BaggageDeclaration.builder()
                .booking(booking)
                .type(request.type())
                .weight(request.weight())
                .dimensions(request.dimensions())
                .extraCharge(extraCharge)
                .build();

        declaration = baggageDeclarationRepository.save(declaration);
        log.info("Baggage declared for booking: {}, type: {}, weight: {}kg, charge: {}",
                booking.getBookingReference(), request.type(), request.weight(), extraCharge);
        return declaration;
    }

    @Transactional(readOnly = true)
    public List<BaggageDeclaration> getBaggageByBooking(UUID bookingId) {
        return baggageDeclarationRepository.findByBookingId(bookingId);
    }

    public BigDecimal calculateExtraCharge(BaggageType type, double weight) {
        return switch (type) {
            case CABIN -> {
                if (weight <= FREE_CABIN_WEIGHT) {
                    yield BigDecimal.ZERO;
                }
                yield BigDecimal.valueOf(weight - FREE_CABIN_WEIGHT).multiply(EXTRA_KG_RATE);
            }
            case CHECKED -> {
                if (weight <= FREE_CHECKED_WEIGHT) {
                    yield BigDecimal.ZERO;
                }
                yield BigDecimal.valueOf(weight - FREE_CHECKED_WEIGHT).multiply(EXTRA_KG_RATE);
            }
            case SPECIAL -> SPECIAL_BASE_RATE.add(
                    BigDecimal.valueOf(weight).multiply(BigDecimal.valueOf(5.00))
            );
        };
    }
}
