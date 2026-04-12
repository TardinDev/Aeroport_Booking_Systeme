package com.skybooker.audit;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditRepository auditRepository;

    @Async
    @Transactional
    public void logAction(String action, String entityType, String entityId, UUID userId, String details, String ipAddress) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .userId(userId)
                    .details(details)
                    .ipAddress(ipAddress)
                    .build();
            auditRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to save audit log: action={}, entityType={}, entityId={}", action, entityType, entityId, e);
        }
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditRepository.findAllByOrderByTimestampDesc(pageable);
    }
}
