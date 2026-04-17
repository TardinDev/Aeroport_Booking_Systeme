package com.skybooker.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "skybooker.integrations")
public class IntegrationsProperties {

    private final Amadeus amadeus = new Amadeus();
    private final Ai ai = new Ai();
    private final Unsplash unsplash = new Unsplash();
    private final Ticketmaster ticketmaster = new Ticketmaster();
    private final OpenTripMap opentripmap = new OpenTripMap();
    private final Wikipedia wikipedia = new Wikipedia();

    public Amadeus getAmadeus() { return amadeus; }
    public Ai getAi() { return ai; }
    public Unsplash getUnsplash() { return unsplash; }
    public Ticketmaster getTicketmaster() { return ticketmaster; }
    public OpenTripMap getOpentripmap() { return opentripmap; }
    public Wikipedia getWikipedia() { return wikipedia; }

    public static class Amadeus {
        private boolean enabled = false;
        private String baseUrl = "https://test.api.amadeus.com";
        private String apiKey = "";
        private String apiSecret = "";

        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
        public String getBaseUrl() { return baseUrl; }
        public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }
        public String getApiKey() { return apiKey; }
        public void setApiKey(String apiKey) { this.apiKey = apiKey; }
        public String getApiSecret() { return apiSecret; }
        public void setApiSecret(String apiSecret) { this.apiSecret = apiSecret; }
    }

    public static class Ai {
        private boolean enabled = false;
        private String baseUrl = "https://api.anthropic.com";
        private String apiKey = "";
        private String model = "claude-sonnet-4-6";
        private int maxTokens = 1200;

        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
        public String getBaseUrl() { return baseUrl; }
        public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }
        public String getApiKey() { return apiKey; }
        public void setApiKey(String apiKey) { this.apiKey = apiKey; }
        public String getModel() { return model; }
        public void setModel(String model) { this.model = model; }
        public int getMaxTokens() { return maxTokens; }
        public void setMaxTokens(int maxTokens) { this.maxTokens = maxTokens; }
    }

    public static class Unsplash {
        private boolean enabled = false;
        private String baseUrl = "https://api.unsplash.com";
        private String accessKey = "";

        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
        public String getBaseUrl() { return baseUrl; }
        public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }
        public String getAccessKey() { return accessKey; }
        public void setAccessKey(String accessKey) { this.accessKey = accessKey; }
    }

    public static class Ticketmaster {
        private boolean enabled = false;
        private String baseUrl = "https://app.ticketmaster.com/discovery/v2";
        private String apiKey = "";

        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
        public String getBaseUrl() { return baseUrl; }
        public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }
        public String getApiKey() { return apiKey; }
        public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    }

    public static class OpenTripMap {
        private boolean enabled = false;
        private String baseUrl = "https://api.opentripmap.com/0.1";
        private String apiKey = "";

        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
        public String getBaseUrl() { return baseUrl; }
        public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }
        public String getApiKey() { return apiKey; }
        public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    }

    /** Wikipedia REST API — no key needed, enabled by default. */
    public static class Wikipedia {
        private boolean enabled = true;
        private String baseUrl = "https://{lang}.wikipedia.org/api/rest_v1";

        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
        public String getBaseUrl() { return baseUrl; }
        public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }
    }
}
