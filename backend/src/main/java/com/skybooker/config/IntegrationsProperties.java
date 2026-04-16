package com.skybooker.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "skybooker.integrations")
public class IntegrationsProperties {

    private final Amadeus amadeus = new Amadeus();
    private final Ai ai = new Ai();

    public Amadeus getAmadeus() { return amadeus; }
    public Ai getAi() { return ai; }

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
}
