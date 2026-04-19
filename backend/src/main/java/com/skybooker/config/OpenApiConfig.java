package com.skybooker.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI skyBookerOpenAPI() {
        final String bearerScheme = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("SkyBooker API")
                        .version("0.1.0-MVP")
                        .description("""
                                SkyBooker MVP (Phase 1) — REST API for a flight-booking demo application.

                                Implemented in v0.1.0:
                                  • JWT authentication (register, login, refresh)
                                  • Flight search, seat map
                                  • Booking CRUD, cancellation, PDF ticket download

                                Stripe, OAuth2, 2FA, WebSocket, Amadeus and ancillary services (taxi, baggage)
                                are NOT in Phase 1 — see README roadmap.
                                """)
                        .contact(new Contact().name("SkyBooker").url("https://github.com/TardinDev/Aeroport_Booking_Systeme"))
                        .license(new License().name("MIT").url("https://opensource.org/licenses/MIT")))
                .servers(List.of(new Server().url("http://localhost:8080").description("Local dev server")))
                .components(new Components().addSecuritySchemes(bearerScheme,
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Paste the access token obtained from /api/v1/auth/login")))
                .addSecurityItem(new SecurityRequirement().addList(bearerScheme));
    }
}
