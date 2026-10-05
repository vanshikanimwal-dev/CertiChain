package com.certichain.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI certichainOpenApi() {
        return new OpenAPI().info(new Info()
                .title("CertiChain API")
                .version("0.1.0")
                .description("Demo University certificate API. All records are synthetic."));
    }
}
