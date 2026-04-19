# syntax=docker/dockerfile:1.7
# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace

# Leverage Docker layer cache for dependencies
COPY pom.xml ./
RUN mvn -B -q -e -DskipTests dependency:go-offline

# Copy sources and package the application
COPY src/ src/
RUN mvn -B -q -DskipTests package \
 && cp target/skybooker-api-*.jar /workspace/app.jar

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre-alpine AS runtime

# Small helpers for the healthcheck (wget is part of BusyBox, curl is optional)
RUN addgroup -S skybooker && adduser -S skybooker -G skybooker

WORKDIR /app
COPY --from=build /workspace/app.jar /app/app.jar
RUN chown -R skybooker:skybooker /app
USER skybooker

EXPOSE 8080

# The /v3/api-docs endpoint is publicly reachable in dev and is a stable readiness probe;
# swap it for a dedicated /healthz endpoint when Actuator is added (Phase 2+).
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=5 \
    CMD wget -qO- http://localhost:8080/v3/api-docs >/dev/null 2>&1 || exit 1

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
