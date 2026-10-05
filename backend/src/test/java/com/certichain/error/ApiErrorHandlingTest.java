package com.certichain.error;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.certichain.config.RequestIdFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class ApiErrorHandlingTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new ProbeController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .addFilters(new RequestIdFilter())
                .build();
    }

    @Test
    void unexpectedErrorsHideInternalsAndEchoTheRequestId() throws Exception {
        mockMvc.perform(get("/boom").header(RequestIdFilter.HEADER, "phase-1-test"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(header().string(RequestIdFilter.HEADER, "phase-1-test"))
                .andExpect(jsonPath("$.title").value("Internal Server Error"))
                .andExpect(jsonPath("$.detail").value("An unexpected error occurred."))
                .andExpect(jsonPath("$.requestId").value("phase-1-test"));
    }

    @Test
    void clientErrorsKeepTheirStatus() throws Exception {
        mockMvc.perform(get("/missing"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Certificate was not found."))
                .andExpect(jsonPath("$.requestId").isNotEmpty());
    }

    @Test
    void unsafeRequestIdsAreReplaced() throws Exception {
        mockMvc.perform(get("/missing").header(RequestIdFilter.HEADER, "bad id\nwith a newline"))
                .andExpect(status().isNotFound())
                .andExpect(header().exists(RequestIdFilter.HEADER))
                .andExpect(header().string(RequestIdFilter.HEADER, org.hamcrest.Matchers.not("bad id\nwith a newline")));
    }

    @RestController
    static class ProbeController {

        @GetMapping("/boom")
        void boom() {
            throw new IllegalStateException("database password leaked");
        }

        @GetMapping("/missing")
        void missing() {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Certificate was not found.");
        }
    }
}
