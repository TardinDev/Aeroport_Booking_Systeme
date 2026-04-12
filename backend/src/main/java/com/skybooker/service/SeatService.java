package com.skybooker.service;

import com.skybooker.dto.response.SeatResponse;
import com.skybooker.entity.Seat;
import com.skybooker.enums.SeatStatus;
import com.skybooker.exception.ResourceNotFoundException;
import com.skybooker.exception.SeatAlreadyBookedException;
import com.skybooker.mapper.SeatMapper;
import com.skybooker.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeatService {

    private final SeatRepository seatRepository;
    private final SeatMapper seatMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String SEAT_LOCK_PREFIX = "seat:lock:";
    private static final Duration SEAT_LOCK_TTL = Duration.ofMinutes(10);

    @Transactional(readOnly = true)
    public List<SeatResponse> getAvailableSeats(UUID flightId) {
        List<Seat> seats = seatRepository.findByFlightIdAndStatus(flightId, SeatStatus.AVAILABLE);
        return seatMapper.toResponseList(seats);
    }

    @Transactional
    public SeatResponse selectSeat(UUID seatId, UUID userId) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new ResourceNotFoundException("Seat", "id", seatId));

        if (seat.getStatus() != SeatStatus.AVAILABLE) {
            throw new SeatAlreadyBookedException("Seat " + seat.getRow() + seat.getSeatColumn() + " is not available");
        }

        // Lock the seat in Redis with TTL
        String lockKey = SEAT_LOCK_PREFIX + seatId;
        Boolean locked = redisTemplate.opsForValue().setIfAbsent(lockKey, userId.toString(), SEAT_LOCK_TTL);

        if (Boolean.FALSE.equals(locked)) {
            throw new SeatAlreadyBookedException("Seat is currently being held by another user");
        }

        seat.setStatus(SeatStatus.SELECTED);
        seat = seatRepository.save(seat);

        log.info("Seat {} selected by user {}", seatId, userId);
        return seatMapper.toResponse(seat);
    }

    @Transactional
    public void releaseSeat(UUID seatId) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new ResourceNotFoundException("Seat", "id", seatId));

        if (seat.getStatus() == SeatStatus.SELECTED) {
            seat.setStatus(SeatStatus.AVAILABLE);
            seatRepository.save(seat);

            String lockKey = SEAT_LOCK_PREFIX + seatId;
            redisTemplate.delete(lockKey);

            log.info("Seat {} released", seatId);
        }
    }
}
