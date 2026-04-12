package com.skybooker.dto.response;

import com.skybooker.enums.SeatClass;
import com.skybooker.enums.SeatStatus;

import java.math.BigDecimal;
import java.util.UUID;

public record SeatResponse(
        UUID id,
        int row,
        String column,
        SeatClass seatClass,
        SeatStatus status,
        BigDecimal price,
        boolean isWindow,
        boolean isAisle,
        boolean isExit
) {}
