package com.skybooker.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skybooker.SkyBookerApplication;
import com.skybooker.repository.FlightRepository;
import com.skybooker.repository.SeatRepository;
import com.skybooker.entity.Flight;
import com.skybooker.entity.Seat;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Testcontainers(disabledWithoutDocker = true)
@SpringBootTest(classes = SkyBookerApplication.class)
@AutoConfigureMockMvc
class BookingIntegrationTest {

    @Container
    @SuppressWarnings("resource")
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("skybooker")
            .withUsername("skybooker")
            .withPassword("skybooker");

    @DynamicPropertySource
    static void registerDatasource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("app.jwt.secret", () -> "integration-test-secret-must-be-at-least-32-bytes-long-12345");
    }

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired FlightRepository flightRepository;
    @Autowired SeatRepository seatRepository;

    @Test
    void endToEnd_registerLoginSearchBookCancel() throws Exception {
        String email = "e2e+" + System.currentTimeMillis() + "@example.com";

        ObjectNode register = objectMapper.createObjectNode()
                .put("email", email)
                .put("password", "Test1234!")
                .put("firstName", "Eve")
                .put("lastName", "Two");

        MvcResult registerResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(register.toString()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").exists())
                .andReturn();

        JsonNode body = objectMapper.readTree(registerResult.getResponse().getContentAsString());
        String accessToken = body.get("accessToken").asText();
        assertThat(accessToken).isNotBlank();

        // Pick any seeded flight directly from DB (seed dates are relative to NOW())
        List<Flight> seededFlights = flightRepository.findAll();
        assertThat(seededFlights).isNotEmpty();
        Flight flight = seededFlights.get(0);
        List<Seat> seats = seatRepository.findByFlightIdOrdered(flight.getId());
        Seat chosenSeat = seats.get(0);

        mockMvc.perform(get("/api/v1/flights/" + flight.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.flightNumber").value(flight.getFlightNumber()));

        ObjectNode bookingReq = objectMapper.createObjectNode();
        bookingReq.put("flightId", flight.getId());
        ArrayNode pax = bookingReq.putArray("passengers");
        pax.add(objectMapper.createObjectNode()
                .put("firstName", "Eve")
                .put("lastName", "Two")
                .put("dateOfBirth", "1995-01-15")
                .put("passportNumber", "FRX999"));
        bookingReq.putArray("seatIds").add(chosenSeat.getId());

        MvcResult createResult = mockMvc.perform(post("/api/v1/bookings")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bookingReq.toString()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.bookingReference").exists())
                .andReturn();
        long bookingId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(get("/api/v1/bookings/my").header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(bookingId));

        mockMvc.perform(get("/api/v1/bookings/" + bookingId + "/ticket.pdf")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(header().string("Content-Disposition",
                        org.hamcrest.Matchers.containsString("ticket-" + bookingId + ".pdf")));

        mockMvc.perform(patch("/api/v1/bookings/" + bookingId + "/cancel")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }
}
