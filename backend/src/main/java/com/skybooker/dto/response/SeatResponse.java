package com.skybooker.dto.response;

import com.skybooker.enums.SeatClass;
import com.skybooker.enums.SeatStatus;

import java.math.BigDecimal;

public record SeatResponse(
        Long id,
        int rowNumber,
        String seatColumn,
        String label,
        SeatClass seatClass,
        BigDecimal price,
        SeatStatus status
) {}
